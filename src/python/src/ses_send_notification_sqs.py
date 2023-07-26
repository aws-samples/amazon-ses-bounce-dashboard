import json
import os

from utils import s3
from utils.dynamo import get_dynamo_client
from utils.logic import value_or_default
from utils.s3 import s3_get_object_string
from utils.ses_client import SesClient

table_email_name = os.environ.get('TABLE_EMAIL_NAME')

dynamo_client = get_dynamo_client()

table = dynamo_client.Table(table_email_name)


def handler(message, context):
    try:
        sqsBody = json.loads(message['Records'][0]['body'])

        id = value_or_default(sqsBody, 'id')

        item = table.get_item(Key={
            'id': id
        })
        item = item['Item']
        destinatarios = value_or_default(sqsBody, 'destinatarios')
        manifiesto = value_or_default(sqsBody, 'manifiesto')
        ConfigurationSetName = value_or_default(sqsBody, 'ConfigurationSetName', 'default')
        respuesta_email = sen_notification_from_manifest(
            destinatarios,
            manifiesto,
            ConfigurationSetName,
            item
        )

        messageId = respuesta_email['MessageId']
        print("MessageId: " + messageId)
        params = {
            'id': id,
        }
        response = table.update_item(
            Key=params,
            UpdateExpression="set messageId = :messageId",
            ExpressionAttributeValues={
                ':messageId': messageId
            },
            ReturnValues="UPDATED_NEW"
        )
        return {
            'statusCode': 200,
            'headers': {}
        }
    except Exception as e:
        print(message)
        print(e)
        raise e


def sen_notification_from_manifest(
        destinatario,
        manifiesto,
        ConfigurationSetName="default",
        item={}
):
    destinatarios = []
    if isinstance(destinatario, list):
        destinatarios = destinatario
    else:
        destinatarios = destinatario.split(',')
    contenido = s3_get_object_string(manifiesto)[0]
    configuracion_manifiesto = json.loads(contenido)
    attachments = []
    adjuntos = value_or_default(configuracion_manifiesto, 'adjuntos', [])
    for adjunto in adjuntos:
        file_path = s3.s3_get_object_file(adjunto['ruta'], adjunto['nombreArchivo'])[0]
        attachments.append({
            'file_name': adjunto['nombreArchivo'],
            'file_path': file_path,
            'subtype': adjunto['mediatype'] + '/' + adjunto['submediatype']
        })

    emailField = pasar_campos_en_manifiesto_a_objeto(configuracion_manifiesto)

    tags = []
    if 'empresa' in item:
        tags.append({'Name': 'empresa', 'Value': item['empresa']})

    client = SesClient(config_set_name=ConfigurationSetName)
    return client.send_email(
        to_addresses=destinatarios,
        sender_email=emailField['from']['value'],
        subject=emailField['subject']['value'],
        body_text=value_or_default(value_or_default(emailField, 'text', {}), 'value', '-'),
        body_html=emailField['html']['value'],
        attachments=attachments,
        tags=tags
    )


def pasar_campos_en_manifiesto_a_objeto(manifiesto):
    output = {}
    for field in manifiesto['campos']:
        output[field['key']] = field
    return output

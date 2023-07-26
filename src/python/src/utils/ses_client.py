import os
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import boto3
from botocore.exceptions import ClientError

from utils.logic import value_or_default

# Specify a configuration set. If you do not want to use a configuration
# set, comment the following variable, and the
# ConfigurationSetName=CONFIGURATION_SET argument below.
CONFIGURATION_SET = "default"
# If necessary, replace us-west-2 with the AWS Region you're using for Amazon SES.
# The character encoding for the email.
CHARSET = "UTF-8"
HEADER_CHARSET = 'ISO-8859-1'


class SesClient(object):
    def __init__(self, config_set_name=CONFIGURATION_SET):
        self.client = boto3.client('ses')
        self.config_set_name = config_set_name

    def send_email(self,
                   *,
                   to_addresses=None,
                   cc_addresses=None,
                   bcc_addresses=None,
                   sender_email=None,
                   subject=None,
                   body_text=None,
                   body_html=None,
                   charset=CHARSET,
                   attachments=[],
                   tags= []
                   ):
        if not attachments or len(attachments) == 0:
            response = self.send_plain_mail(
                bcc_addresses,
                body_html,
                body_text,
                cc_addresses,
                charset,
                sender_email,
                subject,
                to_addresses,
                tags=tags
            )
        else:
            response = self.send_attachments_mail(
                bcc_addresses,
                body_html,
                body_text,
                cc_addresses,
                charset,
                sender_email,
                subject,
                to_addresses,
                attachments,
                tags=tags
            )
        return response

    def send_attachments_mail(
            self,
            bcc_addresses,
            body_html,
            body_text,
            cc_addresses,
            charset,
            sender_email,
            subject,
            to_addresses=[],
            attachments=[],
            tags= []
    ):
        msg = MIMEMultipart('mixed')
        # Add subject, from and to lines.
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = ','.join(to_addresses)
        # Create a multipart/alternative child container.
        msg_body = MIMEMultipart('alternative')

        # Encode the text and HTML content and set the character encoding. This step is
        # necessary if you're sending a message with characters outside the ASCII range.
        textpart = MIMEText(body_text.encode(CHARSET), 'plain', CHARSET)
        htmlpart = MIMEText(body_html.encode(CHARSET), 'html', CHARSET)

        # Add the text and HTML parts to the child container.
        msg_body.attach(textpart)
        msg_body.attach(htmlpart)

        # Attach the multipart/alternative child container to the multipart/mixed
        # parent container.
        msg.attach(msg_body)

        for attachment in attachments:
            file_name = attachment['file_name']
            file_path = attachment['file_path']
            atachment_data = open(file_path, 'rb').read()
            att = MIMEApplication(atachment_data)
            att.add_header('Content-Disposition', 'attachment', filename=file_name)
            if not os.path.exists(file_name):
                print("File exists")
            msg.attach(att)

        try:
            # Provide the contents of the email.
            response = self.client.send_raw_email(
                Source=msg['From'],
                Destinations=to_addresses,
                RawMessage={
                    'Data': msg.as_string(),
                },
                ConfigurationSetName=self.config_set_name,
                Tags=tags
            )
        except ClientError as e:
            raise e
        else:
            return response

    def send_plain_mail(self,
                        bcc_addresses,
                        body_html,
                        body_text,
                        cc_addresses,
                        charset,
                        sender_email,
                        subject,
                        to_addresses,
                        tags= []
                        ):
        try:
            response = self.client.send_email(
                Destination={
                    'ToAddresses': to_addresses if isinstance(to_addresses, list) else [to_addresses],
                    'CcAddresses': cc_addresses if isinstance(cc_addresses, list) and cc_addresses else [
                        cc_addresses] if cc_addresses else [],
                    'BccAddresses': bcc_addresses if isinstance(bcc_addresses, list) and bcc_addresses else [
                        bcc_addresses] if bcc_addresses else [],
                },
                Message={
                    'Body': {
                        'Html': {
                            'Charset': charset,
                            'Data': body_html,
                        },
                        'Text': {
                            'Charset': charset,
                            'Data': body_text,
                        },
                    },
                    'Subject': {
                        'Charset': charset,
                        'Data': subject,
                    },
                },
                Source=sender_email,
                ConfigurationSetName=self.config_set_name,
                Tags=tags
            )
        except ClientError as e:
            print(e.response['Error']['Message'], e.args[0])
        else:
            print("Email sent! Message ID:"),
            print(response['MessageId'])
        return response

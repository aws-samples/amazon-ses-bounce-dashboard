// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'


// Create service client module using ES6 syntax.
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand} from "@aws-sdk/lib-dynamodb";
import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";


import {getBuketAndPath, getFieldFromManifiesto} from "./uitls.js";

const sqsClient = new SQSClient();


const sesClient = new SESClient();
const s3Client = new S3Client();


const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
}

const translateConfig = {marshallOptions, unmarshallOptions};

// Create the DynamoDB Document client.
const ddbClient = new DynamoDBClient(translateConfig);


async function sendEmailFromManifest(destinatario, manifiesto, ConfigurationSetName) {
    let destinatarios = []
    //Check if destinatario is array
    if (Array.isArray(destinatario)) {
        destinatarios = destinatario
    } else {
        destinatarios = destinatario.split(",").map(value => value.trim())
    }
    let {bucket, path} = getBuketAndPath(manifiesto);
    const input = {
        "Bucket": bucket,
        "Key": path,
        //"Range": "bytes=0-9"
    };
    const command = new GetObjectCommand(input);
    const response = await s3Client.send(command);
    const stream = response.Body;
    const manifest = JSON.parse(Buffer.concat(await stream.toArray()));
    const emailField = getFieldFromManifiesto(manifest)

    let params = {
        Destination: {
            BccAddresses: [],
            CcAddresses: [],
            ToAddresses: destinatarios
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: emailField.html.value
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "example"
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: emailField.subject.value
            }
        },
        // ReplyToAddresses: [],
        Source: emailField.from.value,
        ConfigurationSetName: ConfigurationSetName
    };
    const sendEmailComand = new SendEmailCommand(params)
    let responseSes = await sesClient.send(sendEmailComand);
    return responseSes;
}

export const handler = async (event, context) => {
    const timestamp = new Date().toISOString();
    const requestId = context.awsRequestId
    try {
        const {
            id = requestId,
            documentoId,
            pais,
            ambiente,
            dominio,
            manifiesto,
            empresa = '0',
            aplicacion = 'FEB',
            ConfigurationSetName = "default"
        } = event;
        // let responseSes = await sendEmailFromManifest(destinatario, manifiesto, ConfigurationSetName);
        const saveData = {
            id: id,
            // messageId: responseSes.MessageId,
            documentoId,
            pais,
            stage: ambiente,
            domain: dominio,
            manifiesto,
            empresa,
            application: aplicacion,
            timestamp: timestamp
        }

        const params = {
            // MessageAttributes: {
            // Author: {
            //     DataType: "String",
            //     StringValue: "Preeti",
            // }
            // },
            MessageDeduplicationId: id,
            MessageGroupId: requestId,
            MessageBody: JSON.stringify(saveData),
            QueueUrl: process.env.SQS_URL
        };
        let response;
        const data = await sqsClient.send(new SendMessageCommand(params));
        if (data) {
            console.log("Success, message sent. MessageID:", data.MessageId);
            response = {
                statusCode: 200,
                body: saveData
            };
        } else {
            response = {
                statusCode: 500,
                body: {
                    message: 'Some error occured !!'
                }
            };
        }
        const putParams = {
            TableName: process.env.TABLE_NAME,
            Item: saveData
        };
        ddbClient.send(new PutCommand(putParams));
        return response
    } catch (err) {
        err.requestId = requestId;
        console.warn(event)
        console.log("Error in writing data to the DynamoDB table : ", err.message)
        throw err
    }
}






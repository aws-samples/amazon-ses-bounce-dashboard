// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'
// Create service client module using ES6 syntax.
import {dynamoPutItem, sqsSendMessage} from "./utils/index.js";


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
        const data = await sqsSendMessage(params);
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
        dynamoPutItem(putParams)
        return response
    } catch (err) {
        err.requestId = requestId;
        console.warn(event)
        console.log("Error in writing data to the DynamoDB table : ", err.message)
        throw err
    }
}






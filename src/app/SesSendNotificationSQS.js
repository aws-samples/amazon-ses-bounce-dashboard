// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'
// Create service client module using ES6 syntax.


import {dynamoUpdateItem, sendEmailFromManifest} from "./utils/index.js";

export const handler = async (event, context) => {
    const requestId = context.awsRequestId
    try {
        const record = event.Records[0]
        const sqsBody = JSON.parse(record.body)
        const {
            id,
            destinatarios,
            manifiesto,
            ConfigurationSetName = "default"
        } = sqsBody
        let responseSes = await sendEmailFromManifest({
            destinatario:destinatarios,
            manifiesto,
            ConfigurationSetName
        });
        const messageId = responseSes.MessageId;
        await dynamoUpdateItem({
            TableName: process.env.TABLE_EMAIL_NAME,
            Key: {
                id: id
            },
            UpdateExpression: "set messageId = :messageId",
            ExpressionAttributeValues: {
                ":messageId": messageId,
            }
        })
        return {
            statusCode: 200
        };
    } catch (err) {
        err.requestId = requestId;
        console.warn(event)
        console.log("Error in writing data to the DynamoDB table : ", err.message)
        throw err
    }
}






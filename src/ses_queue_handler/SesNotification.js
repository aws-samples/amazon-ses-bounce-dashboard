// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'


// Create service client module using ES6 syntax.
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand} from "@aws-sdk/lib-dynamodb";

// Create the DynamoDB Document client.
const ddbClient = new DynamoDBClient({region: process.env.AWS_REGION});


export const handler = async (event, context) => {
    const record = event.Records[0]

    const sqsBody = JSON.parse(record.body)

    const timestamp = sqsBody.Timestamp
    const message = JSON.parse(sqsBody.Message)
    // All event definition. For more information, see
    // https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-examples.html
    const type = message.eventType
    const mail = message.mail
    const messageId = message.mail.messageId
    const event_detail = message[type.toLowerCase()] || {}

    const putParams = {
        TableName: process.env.TABLE_NAME,
        Item: {
            id: messageId,
            timestamp: timestamp,
            type: type,
            recipient: destination,
            event:event_detail,
            mail
        }
    };
    try {
        const data = await ddbClient.send(new PutCommand(putParams));
        // console.log(data);
    } catch (err) {
        console.log("Error in writing data to the DynamoDB table : ", err.message)
        throw err
    }
}






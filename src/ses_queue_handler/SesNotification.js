// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'


// Create service client module using ES6 syntax.
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand} from "@aws-sdk/lib-dynamodb";


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

const translateConfig = { marshallOptions, unmarshallOptions };

// Create the DynamoDB Document client.
const ddbClient = new DynamoDBClient(translateConfig);


export const handler = async (event, context) => {
    try {
        const record = event.Records[0]
        const sqsBody = JSON.parse(record.body)

        const message = JSON.parse(sqsBody.Message || "null") || sqsBody
        // All event definition. For more information, see
        // https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-examples.html
        const type = message.eventType
        const mail = message.mail
        const messageId = message.mail.messageId
        const event_detail = message[type.toLowerCase()] || {}
        const timestamp =  event_detail.timestamp || new Date().toISOString();

        const putParams = {
            TableName: process.env.TABLE_NAME,
            Item: {
                id: messageId,
                timestamp: timestamp,
                type: type,
                event: event_detail,
                mail
            }
        };
        const data = await ddbClient.send(new PutCommand(putParams));
        // console.log(data);
    } catch (err) {
        console.warn(event)
        console.log("Error in writing data to the DynamoDB table : ", err.message)
        throw err
    }
}






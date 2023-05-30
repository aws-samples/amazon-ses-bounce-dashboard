// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'


// Create service client module using ES6 syntax.
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand} from "@aws-sdk/lib-dynamodb";

// Create the DynamoDB Document client.
const ddbClient = new DynamoDBClient({region: process.env.AWS_REGION});


export const handler = async (event, context) => {
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    //console.info(event);
    const record = event.Records[0]

    const sqsBody = JSON.parse(record.body)
    // console.log(body)

    const timestamp = sqsBody.Timestamp
    const id = sqsBody.MessageId

    const message = JSON.parse(sqsBody.Message)
    // All event definition. For more information, see
    // https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-examples.html
    const type = message.eventType
    const destination = message.mail.destination
    const source = message.mail.source
    const messageId = message.mail.messageId
    const detail = message[type.toLowerCase()] || {}
    // console.log("Params")

    const putParams = {
        TableName: process.env.TABLE_NAME,
        Item: {
            id: messageId,
            timestamp: timestamp,
            type: type,
            from: source,
            recipient: destination,
            detail: detail
        }
    };
    // console.log(putParams)
    try {
        const data = await ddbClient.send(new PutCommand(putParams));
        // console.log(data);
    } catch (err) {
        console.log("Error in writing data to the DynamoDB table : ", err.message)
    }
}






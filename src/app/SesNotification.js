// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'

import {dynamoPutItem} from "./utils/index.js";

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
        const timestamp = event_detail.timestamp || new Date().toISOString();
        dynamoPutItem({
            TableName: process.env.TABLE_EMAIL_NAME,
            Item: {
                id: messageId,
                timestamp: timestamp,
                type: type,
                event: event_detail,
                mail
            }
        })
    } catch (err) {
        console.warn(event)
        console.log("Error in writing data to the DynamoDB table : ", err.message)
        throw err
    }
}






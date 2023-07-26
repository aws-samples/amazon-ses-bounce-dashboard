// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'

import {dynamoPutItem} from "./utils/index.js";

const TABLE_EMAIL_SUPPRESSION_NAME = process.env.TABLE_EMAIL_SUPPRESSION_NAME;
const TABLE_EVENT_NAME = process.env.TABLE_EVENT_NAME


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
        const data = {
            id: messageId, timestamp: timestamp, type: type, event: event_detail, mail
        };
        await dynamoPutItem({
            TableName: TABLE_EVENT_NAME, Item: data
        })
        await procesarEventosSuppression({type, event_detail, mail, timestamp, messageId})
    } catch (err) {
        console.warn(event)
        console.log("Error in writing data to the DynamoDB table : ", err.message)
        throw err
    }
}

async function procesarEventosSuppression({type, event_detail, mail, timestamp, messageId}) {
    if (type === 'Bounce') {
        const recipents = event_detail.bouncedRecipients
        for (let recipent of recipents) {
            const {
                emailAddress,  diagnosticCode
            } = recipent;
            await dynamoPutItem({
                TableName: TABLE_EMAIL_SUPPRESSION_NAME, Item: {
                    id: emailAddress,
                    timestamp,
                    type,
                    message: diagnosticCode,
                    messageId
                }
            })
        }
    } else if (type === 'Reject') {
        const {
            reason
        } = event_detail;
        for (let destinationElement of mail.destination) {
            await dynamoPutItem({
                TableName: TABLE_EMAIL_SUPPRESSION_NAME, Item: {
                    id: destinationElement,
                    timestamp,
                    type,
                    message: reason,
                    messageId
                }
            })
        }
    } else if (type === 'Complaint') {
        const recipents = event_detail.complainedRecipients
        for (let recipent of recipents) {
            const {
                emailAddress
            } = recipent;
            const diagnosticCode = event_detail.complaintFeedbackType
            await dynamoPutItem({
                TableName: TABLE_EMAIL_SUPPRESSION_NAME, Item: {
                    id: emailAddress,
                    timestamp,
                    type,
                    message: diagnosticCode,
                    messageId
                }
            })
        }
    }
}




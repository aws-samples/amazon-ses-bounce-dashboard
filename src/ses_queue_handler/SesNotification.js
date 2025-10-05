// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    console.info('Processing SES notification:', JSON.stringify(event));
    
    try {
        const record = event.Records[0];
        const body = JSON.parse(record.body);
        const message = JSON.parse(body.Message);
        
        const { eventType, mail } = message;
        
        if (!['Bounce', 'Complaint'].includes(eventType)) {
            console.log(`Skipping event type: ${eventType}`);
            return { statusCode: 200, body: 'Event type not processed' };
        }

        if (!mail?.destination?.[0] || !mail?.source) {
            throw new Error('Missing required mail fields');
        }

        const item = {
            id: body.MessageId,
            timestamp: body.Timestamp,
            type: eventType,
            from: mail.source,
            recipient: mail.destination[0],
            Error: eventType === 'Bounce' ? 'Message has bounced' : 'A complaint has been received'
        };

        await ddbClient.send(new PutCommand({
            TableName: process.env.TABLE_NAME,
            Item: item
        }));

        console.log('Successfully stored event:', item.id);
        return { statusCode: 200, body: 'Success' };
        
    } catch (err) {
        console.error('Processing failed:', err);
        throw err; // Trigger SQS retry
    }
}






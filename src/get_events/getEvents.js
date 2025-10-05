// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: `Method ${event.httpMethod} not allowed` })
        };
    }
    
    console.info('Received request:', event);
    
    const { limit = '50', lastKey } = event.queryStringParameters || {};
    
    const params = {
        TableName: process.env.TABLE_NAME,
        Limit: parseInt(limit),
        ...(lastKey && { ExclusiveStartKey: JSON.parse(decodeURIComponent(lastKey)) })
    };

    try {
        const data = await ddbClient.send(new ScanCommand(params));
        const items = data.Items.map(item => unmarshall(item));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET"
            },
            body: JSON.stringify({
                items,
                count: items.length,
                lastKey: data.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(data.LastEvaluatedKey)) : null
            })
        };
        
    } catch (err) {
        console.error('Query failed:', err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET"
            },
            body: JSON.stringify({ error: 'Failed to retrieve events' })
        };
    }
}
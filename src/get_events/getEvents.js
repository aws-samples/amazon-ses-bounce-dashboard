// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'



// Create service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import {  unmarshall } from "@aws-sdk/util-dynamodb";

// Create the DynamoDB Document client.
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION  });


export const handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`This API only accept GET method, you tried: ${event.httpMethod}`);
    }
    
    console.info('received:', event);
    let data = {}
    let items = {}
    
    let params = {
        TableName : process.env.TABLE_NAME,
        ExclusiveStartKey: null
    };


    try {
        data = await ddbClient.send(new ScanCommand(params));    // Retrieve the data from the DynamoDB table
        items = data.Items.map( (item) => {                      // The data will be in the format  { "S" : "Bounce"}, so unmarshall it to remove
            return unmarshall(item);                             // the "S"
        });

    } catch (err) {
        console.log("Error in retrieving data from the DynamoDB table : ", err.message)
    }

    // Return the items to client with status code: 200
    const response =  {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere 
            "Access-Control-Allow-Methods": "GET" // Allow only GET request 
        },
        body: JSON.stringify(items)
    };
    return response;
}
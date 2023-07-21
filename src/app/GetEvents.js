// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'


// Create service client module using ES6 syntax.
import {DynamoDBClient, ScanCommand} from "@aws-sdk/client-dynamodb";
import {unmarshall} from "@aws-sdk/util-dynamodb";

// Create the DynamoDB Document client.
const ddbClient = new DynamoDBClient({region: process.env.AWS_REGION});

const posiblesValues = {
    "id": "S",
    "mail": {
        "destination": "S"
    }
}
const prepareRequest = (parameter, configuration = posiblesValues) => {
    let filter = {
        "ExpressionAttributeNames": {},
        "ExpressionAttributeValues": {},
        "FilterExpression": [],
    }
    const condicion = "AND"
    let index = 0
    for (const key in parameter) {
        if (key.indexOf(".") >= 0) {
            console.log('key', key)
            const partes = key.split(".")
            const subKey = partes[0]
            const newKey = partes.slice(1).join(".")
            //TODO: Ver como buscar sub objetos
        } else if (configuration[key]) {
            const type = configuration[key]
            filter["ExpressionAttributeNames"]["#n" + index] = key
            filter["ExpressionAttributeValues"][":v" + index] = {
                [type]: parameter[key].join()
            }
            filter["FilterExpression"].push(`#n${index} = :v${index}`)

            index++
        }
    }

    return {
        ...filter,
        "FilterExpression": filter["FilterExpression"].join(` ${condicion} `)
    }
}
export const handler = async (event, context) => {

    let data = {}
    let items = {}

    let params = {
        TableName: process.env.TABLE_NAME,
        ExclusiveStartKey: null,
        ...prepareRequest(event)
    };

    try {
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/scancommand.html
        data = await ddbClient.send(new ScanCommand(params));    // Retrieve the data from the DynamoDB table
        items = data.Items.map((item) => {                      // The data will be in the format  { "S" : "Bounce"}, so unmarshall it to remove
            return unmarshall(item);                             // the "S"
        });
    } catch (err) {
        console.log("Error in retrieving data from the DynamoDB table : ", err.message)
    }
    // Return the items to client with status code: 200
    return items;
}

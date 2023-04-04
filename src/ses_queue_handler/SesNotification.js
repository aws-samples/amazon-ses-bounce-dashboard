// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict'


// Create service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

// Create the DynamoDB Document client.
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION  });




export const handler = async (event, context) => {
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.info(event);
    const record = event.Records[0]
  
    const body = JSON.parse(record.body)
    console.log(body)
  
  
    const timestamp = body.Timestamp
    const id = body.MessageId
  
    const message = JSON.parse(body.Message)
    console.log(message)
  
    const destination = message.mail.destination[0]
    const type = message.eventType
    const source = message.mail.source
  
    var errorMsg = null
    if(type == "Bounce") {   
        errorMsg = "Message has bounced"
    } else if (type=="Complaint") {
        errorMsg = "A complaint has been received"
    } else {
        console.log("Notification is not a bounce or complaint.")
        return
    }
  
    console.log("Params")
    
    const putParams = {
        TableName: process.env.TABLE_NAME,
        Item: {
          id: id,
          timestamp: timestamp,
          type: type,
          from: source,
          recipient: destination,
          Error: errorMsg

        }
    };

    console.log(putParams)

    try {
        const data = await ddbClient.send(new PutCommand(putParams));
        console.log(data);
    } catch (err) {
        console.log("Error in writing data to the DynamoDB table : ", err.message)
    }
}






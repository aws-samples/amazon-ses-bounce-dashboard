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

const translateConfig = {marshallOptions, unmarshallOptions};

// Create the DynamoDB Document client.
const ddbClient = new DynamoDBClient(translateConfig);
export function dynamoPutItem(putParams){
    return ddbClient.send(new PutCommand(putParams));
}
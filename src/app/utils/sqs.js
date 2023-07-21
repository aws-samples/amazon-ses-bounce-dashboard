import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient();


export function sqsSendMessage(params){
    return sqsClient.send(new SendMessageCommand(params));
}
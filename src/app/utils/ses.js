import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";
const sesClient = new SESClient();


export function  sesSendEmailComand(params){
    const sendEmailComand = new SendEmailCommand(params)
    return sesClient.send(sendEmailComand);
}
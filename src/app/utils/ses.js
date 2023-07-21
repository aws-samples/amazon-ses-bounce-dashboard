import {SendEmailCommand, SendRawEmailCommand, SESClient} from "@aws-sdk/client-ses";

import * as mimemessage from 'mimemessage';


const sesClient = new SESClient();


export function sesSendEmailComand(params = {
    Destination,
    Message,
    Source,
    ConfigurationSetName: "default"
}) {
    if (true) {
        const sendEmailComand = new SendEmailCommand(params)
        return sesClient.send(sendEmailComand);
    }
    var mailContent = mimemessage.factory({
        contentType: 'multipart/mixed',
        body: []
    });

    const rawEmailCommand = new SendRawEmailCommand(params)
    return sesClient.send(rawEmailCommand);
}
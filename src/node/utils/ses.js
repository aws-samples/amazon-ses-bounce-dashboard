import nodemailer from 'nodemailer'

import * as fs from 'fs';

import * as aws from "@aws-sdk/client-ses";
import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";


const sesClient = new SESClient();

const ses = new aws.SES();
const transport = nodemailer.createTransport({
    SES: {ses, aws}
});

export async function sesSendEmailComand(params = {
                                             Destination: [],
                                             Message,
                                             Source,
                                             ConfigurationSetName: "default"
                                         },
                                         adjuntos = []
) {
    if (!adjuntos || adjuntos.length == 0 ) {
        const sendEmailComand = new SendEmailCommand(params)
        return sesClient.send(sendEmailComand);
    }
    let attachments = []
    /*
        {
            filename: 'a.xml',
            contentType: 'application/xml',
            encoding: 'base64',
            content: attachment
        }
     */
    for (let adjunto of adjuntos) {
        var attachment = {
            filename: adjunto.filename,
            contentType: adjunto.contentType,
            encoding: 'base64',
            content: await fs.readFileSync(adjunto.content)
        }
        attachments.push(attachment)
    }
    const data = {
        from: params.Source,
        to: params.Destination.ToAddresses.join(","),
        subject: params.Message.Subject.Data,
        text: params.Message.Body.Text.Data,
        html: params.Message.Body.Html.Data,
        attachments
    };

    let info = await transport.sendMail(data);
    return {
        MessageId: info.response
    }
}

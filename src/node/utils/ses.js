import * as fs from 'fs';

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

    mailContent.header('From', 'Test <informacion@informacion.febos.cl>');
    mailContent.header('To', 'claudio@febos.cl');
    mailContent.header('Subject', 'Customer service contact info');

    var alternateEntity = mimemessage.factory({
        contentType: 'multipart/alternate',
        body: []
    });

    var htmlEntity = mimemessage.factory({
        contentType: 'text/html;charset=utf-8',
        body: '   <html>  ' +
            '   <head></head>  ' +
            '   <body>  ' +
            '   <h1>Hello!</h1>  ' +
            '   <p>Please see the attached file for a list of    customers to contact.</p>  ' +
            '   </body>  ' +
            '  </html>  '
    });

    var plainEntity = mimemessage.factory({
        body: 'Please see the attached file for a list of    customers to contact.'
    });

    alternateEntity.body.push(htmlEntity);
    alternateEntity.body.push(plainEntity);

    var data = fs.readFileSync('a.xml');

    var attachmentEntity = mimemessage.factory({
        contentType: 'application/xml',
        contentTransferEncoding: 'base64',
        body: data
    });

    attachmentEntity.header('Content-Disposition', 'attachment ;filename="a.xml"');
    // mailContent.body.push(attachmentEntity);


    const raw = {
        RawMessage: {Data: mailContent}
    }

    const rawEmailCommand = new SendRawEmailCommand(raw)
    return sesClient.send(rawEmailCommand);
}


sesSendEmailComand({})
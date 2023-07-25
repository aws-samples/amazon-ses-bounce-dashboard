import {sesSendEmailComand} from "./ses.js";
import {getFileAsJSON} from "./s3.js";


export function getFieldFromManifiesto(manifiestoArray) {
    const campos = manifiestoArray.campos.reduce((acc, item) => {
        return {
            ...acc,
            ...{[item.key]: item}
        }
    }, {});
    return campos
}

export async function sendEmailFromManifest({destinatario, manifiesto, ConfigurationSetName = 'default'}) {
    let destinatarios = []
    //Check if destinatario is array
    if (Array.isArray(destinatario)) {
        destinatarios = destinatario
    } else {
        destinatarios = destinatario.split(",").map(value => value.trim())
    }
    const manifest = await getFileAsJSON(manifiesto);
    const emailField = getFieldFromManifiesto(manifest)

    let params = {
        Destination: {
            BccAddresses: [],
            CcAddresses: [],
            ToAddresses: destinatarios
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: emailField.html.value
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "example"
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: emailField.subject.value
            }
        },
        Source: emailField.from.value,
        ConfigurationSetName: ConfigurationSetName
    };
    return await sesSendEmailComand(params);
}
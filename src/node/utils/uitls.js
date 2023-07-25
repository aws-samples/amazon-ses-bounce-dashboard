import {sesSendEmailComand} from "./ses.js";
import {downloadS3AsFile, getFileAsJSON} from "./s3.js";


export function getFieldFromManifiesto(manifiestoArray) {
    const campos = manifiestoArray.campos.reduce((acc, item) => {
        return {
            ...acc,
            ...{[item.key]: item}
        }
    }, {});
    return campos
}

async function pasFileToSES({
                                nombreArchivo,
                                nombre,
                                ruta,
                                mediatype,
                                submediatype
                            }) {
    const file = await downloadS3AsFile({
        s3Path: ruta,
        name: nombreArchivo
    });
    return {
        filename: nombreArchivo,
        nombre,
        content: file,
        contentType: mediatype + '/' + submediatype
    }
}

export async function sendEmailFromManifest({
                                                destinatario,
                                                manifiesto,
                                                ConfigurationSetName = 'default'
                                            }) {
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

    let adjuntos = manifest.adjuntos || [];
    adjuntos = (await Promise.all(adjuntos.map(pasFileToSES))).map(adjunto => adjunto)
    return await sesSendEmailComand(params, adjuntos);
}


const info = await sendEmailFromManifest({
    destinatario: ["claudio@febos.cl"],
    manifiesto: "/febos-io/chile/desarrollo/email/31a14ff528ee1247b0289b72ffe75481625d/31a14ff528ee1247b0289b72ffe75481625d.json"
})
console.log('info', JSON.stringify(info))
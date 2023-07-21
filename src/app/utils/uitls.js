import {sesSendEmailComand} from "./ses.js";

export function getBuketAndPath(manifiesto) {
    let rutaManifiesto = manifiesto.replace("//", "/");
    // Verificar si la ruta inicia con una barra "/"
    let iniciaConBarra = rutaManifiesto.startsWith('/');
    // Eliminar la barra inicial si existe
    if (iniciaConBarra) {
        rutaManifiesto = rutaManifiesto.substring(1);
    }
    // Obtener el índice de la primera barra "/"
    let indiceBarra = rutaManifiesto.indexOf('/');
    // Extraer la primera parte de la ruta en la letiable "bucket"
    let bucket = rutaManifiesto.substring(0, indiceBarra);
    // Extraer el resto de la ruta en la letiable "path"
    let path = rutaManifiesto.substring(indiceBarra);
    path = path.startsWith('/') ? path.substring(1) : path;
    return {bucket, path};
}

export function getFieldFromManifiesto(manifiestoArray) {
    const campos = manifiestoArray.campos.reduce((acc, item) => {
        return {
            ...acc,
            ...{[item.key]: item}
        }
    }, {});
    return campos
}


async function sendEmailFromManifest(destinatario, manifiesto, ConfigurationSetName) {
    let destinatarios = []
    //Check if destinatario is array
    if (Array.isArray(destinatario)) {
        destinatarios = destinatario
    } else {
        destinatarios = destinatario.split(",").map(value => value.trim())
    }
    let {bucket, path} = getBuketAndPath(manifiesto);
    const input = {
        "Bucket": bucket,
        "Key": path,
        //"Range": "bytes=0-9"
    };
    const command = new GetObjectCommand(input);
    const response = await s3Client.send(command);
    const stream = response.Body;
    const manifest = JSON.parse(Buffer.concat(await stream.toArray()));
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
        // ReplyToAddresses: [],
        Source: emailField.from.value,
        ConfigurationSetName: ConfigurationSetName
    };
    return await sesSendEmailComand(params);
}
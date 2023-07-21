import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";

const s3Client = new S3Client();

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

export async function getFileAsString(s3Path) {
    let {bucket, path} = getBuketAndPath(s3Path);
    const input = {
        "Bucket": bucket,
        "Key": path
    };
    const command = new GetObjectCommand(input);
    const response = await s3Client.send(command);
    const stream = response.Body;
    return Buffer.concat(await stream.toArray());
}

export async function getFileAsJSON(s3Path) {
    return JSON.parse(await getFileAsString(s3Path));
}
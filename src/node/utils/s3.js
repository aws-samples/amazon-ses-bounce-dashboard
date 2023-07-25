import * as fs from 'fs';
import * as path from "path";


import AWS from "aws-sdk";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";


var s3 = new AWS.S3();

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
    return await stream.transformToString()

}


export async function downloadS3AsFile({s3Path, name, dirName = '/tmp'}) {
    const filePath = path.join(dirName, name);
    const {bucket, path: objectPath} = getBuketAndPath(s3Path);
    const params = {
        "Bucket": bucket,
        "Key": objectPath
    };

    let file = fs.createWriteStream(filePath)

    const promise = await new Promise((resolve, reject) => {
        s3.getObject(params).createReadStream()
            .on('end', () => {
                return resolve();
            })
            .on('error', (error) => {
                return reject(error);
            }).pipe(file)
    })
    return filePath;
}

export async function getFileAsJSON(s3Path) {
    return JSON.parse(await getFileAsString(s3Path));
}

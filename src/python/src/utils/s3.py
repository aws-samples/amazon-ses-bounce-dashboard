import re

import boto3

from utils.files import byte_to_file

_s3 = boto3.client('s3')


def s3_normalizar_url(url: str):
    nuevaUrl = re.sub(".s3.amazonaws.com", "", url)
    nuevaUrl = re.sub("http:/", "/", nuevaUrl)
    nuevaUrl = re.sub("https:/", "/", nuevaUrl)
    nuevaUrl = re.sub(r"/{2,4}", "/", nuevaUrl)
    nuevaUrl = str(nuevaUrl).split("?")[0]
    if nuevaUrl.startswith("/"):
        nuevaUrl = nuevaUrl[1:]
    return nuevaUrl


def s3_obtener_buket_desde_ruta(url: str):
    return url.split("/")[0]


def s3_obtener_key_desde_ruta(url: str):
    return re.match("^(.*?)/(.*)$", url)[2]


def s3_get_object_file(ruta: str, name=None) -> ():
    salida = s3_get_object_bytes(ruta)
    nombre = ruta if name is None else name
    return (byte_to_file(salida[0], nombre=ruta), salida[1])


def s3_get_object_string(ruta: str, encode="utf-8") -> ():
    salida = s3_get_object_bytes(ruta)
    return (str(salida[0], encode), salida[1], salida[2])


def s3_get_object_bytes(ruta: str) -> ():
    ruta = s3_normalizar_url(ruta)
    response = _s3.get_object(Bucket=s3_obtener_buket_desde_ruta(ruta), Key=s3_obtener_key_desde_ruta(ruta))
    return (response['Body'].read(), response['Metadata'], response['ResponseMetadata'])

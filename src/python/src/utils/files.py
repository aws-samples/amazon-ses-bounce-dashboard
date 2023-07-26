import errno
import os
import re
from uuid import uuid4


def crear_directorio(filename: str = None):
    if not os.path.exists(os.path.dirname(filename)):
        try:
            os.makedirs(os.path.dirname(filename), exist_ok=True)
        except OSError as exc:
            if exc.errno != errno.EEXIST:
                raise


def byte_to_file(contenido, nombre: str = None, extencion: str = None, filepath: str = '/tmp/'):
    if nombre is None:
        nombre = str(uuid4())
    if extencion is not None:
        nombre = nombre + str(extencion)
    filepath = filepath + nombre
    filepath = re.sub(r"/{2,4}", "/", filepath)
    modo = "w"
    if isinstance(contenido, (bytes, bytearray)):
        modo = "wb"
    crear_directorio(filepath)
    with open(filepath, modo) as f:
        f.write(contenido)

    return filepath

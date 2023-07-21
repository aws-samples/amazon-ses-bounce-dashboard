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
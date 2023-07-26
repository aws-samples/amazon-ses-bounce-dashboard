def value_or_default(object, key, default=None):
    if key in object and object[key] != '':
        return object[key]
    return default
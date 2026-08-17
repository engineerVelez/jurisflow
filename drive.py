import hashlib
import io
import json
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload

CARPETA_PRINCIPAL_ID = "1m_yHvLo0XKpBavojbHTOw0z2nduzjT7k"
CARPETA_ARCHIVOS_BASE_NOMBRE = "ARCHIVOS_BASE"
REGISTRO_BASE_FILENAME = "documentos_base.json"

def obtener_carpeta_archivos_base(service):
    carpeta = buscar_carpeta(service, CARPETA_ARCHIVOS_BASE_NOMBRE)
    if carpeta:
        return carpeta
    return crear_carpeta(service, CARPETA_ARCHIVOS_BASE_NOMBRE, CARPETA_PRINCIPAL_ID)

def leer_registro_documentos_base(service):
    carpeta_id = obtener_carpeta_archivos_base(service)
    registro = leer_json(service, carpeta_id, REGISTRO_BASE_FILENAME)
    if not registro or "documentos" not in registro:
        return {"documentos": []}
    return registro

def guardar_registro_documentos_base(service, registro):
    carpeta_id = obtener_carpeta_archivos_base(service)
    subir_o_actualizar_json(service, carpeta_id, REGISTRO_BASE_FILENAME, registro)

def buscar_archivo_en_carpeta(service, nombre, carpeta_id):
    query = f"name = '{nombre}' and '{carpeta_id}' in parents and trashed = false"
    results = service.files().list(q=query, fields="files(id)").execute()
    items = results.get("files", [])
    return items[0]["id"] if items else None

def subir_archivo_a_carpeta(service, carpeta_id, filename, file_bytes, mimetype):
    file_id = buscar_archivo_en_carpeta(service, filename, carpeta_id)
    archivo = io.BytesIO(file_bytes)
    media = MediaIoBaseUpload(archivo, mimetype=mimetype)
    if file_id:
        service.files().update(fileId=file_id, media_body=media).execute()
        return file_id
    metadata = {"name": filename, "parents": [carpeta_id]}
    created = service.files().create(body=metadata, media_body=media, fields="id").execute()
    return created["id"]

def descargar_archivo_de_carpeta(service, carpeta_id, filename):
    file_id = buscar_archivo_en_carpeta(service, filename, carpeta_id)
    if not file_id:
        return None
    request = service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    return fh.getvalue()

def eliminar_archivo_de_carpeta(service, carpeta_id, filename):
    file_id = buscar_archivo_en_carpeta(service, filename, carpeta_id)
    if file_id:
        service.files().delete(fileId=file_id).execute()

def eliminar_carpeta_completa(service, carpeta_id):
    query = f"'{carpeta_id}' in parents and trashed = false"
    results = service.files().list(q=query, fields="files(id), mimeType").execute()
    for item in results.get("files", []):
        if item.get("mimeType") == "application/vnd.google-apps.folder":
            eliminar_carpeta_completa(service, item["id"])
        else:
            service.files().delete(fileId=item["id"]).execute()
    service.files().delete(fileId=carpeta_id).execute()

def buscar_carpeta_en(service, nombre, parent_id):
    query = f"name = '{nombre}' and '{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = service.files().list(q=query, fields="files(id)").execute()
    items = results.get("files", [])
    return items[0]["id"] if items else None

def subir_documento_base(service, doc_id, file_bytes, filename):
    carpeta_base = obtener_carpeta_archivos_base(service)
    carpeta_doc = obtener_o_crear_carpeta(service, doc_id, carpeta_base)
    mimetype = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return subir_archivo_a_carpeta(service, carpeta_doc, filename, file_bytes, mimetype)

def guardar_datos_documento_base(service, doc_id, datos):
    carpeta_base = obtener_carpeta_archivos_base(service)
    carpeta_doc = obtener_o_crear_carpeta(service, doc_id, carpeta_base)
    subir_o_actualizar_json(service, carpeta_doc, "datos.json", datos)

def leer_datos_documento_base(service, doc_id):
    carpeta_base = obtener_carpeta_archivos_base(service)
    carpeta_doc = buscar_carpeta_en(service, doc_id, carpeta_base)
    if not carpeta_doc:
        return None
    return leer_json(service, carpeta_doc, "datos.json")

def eliminar_documento_base_completo(service, doc_id):
    carpeta_base = obtener_carpeta_archivos_base(service)
    carpeta_doc = buscar_carpeta_en(service, doc_id, carpeta_base)
    if carpeta_doc:
        eliminar_carpeta_completa(service, carpeta_doc)

def guardar_config_documento_base(service, doc_id, config):
    carpeta_base = obtener_carpeta_archivos_base(service)
    carpeta_doc = buscar_carpeta_en(service, doc_id, carpeta_base)
    if not carpeta_doc:
        carpeta_doc = crear_carpeta(service, doc_id, carpeta_base)
    subir_o_actualizar_json(service, carpeta_doc, "config.json", config)
    return carpeta_doc

def leer_config_documento_base(service, doc_id):
    carpeta_base = obtener_carpeta_archivos_base(service)
    carpeta_doc = buscar_carpeta_en(service, doc_id, carpeta_base)
    if not carpeta_doc:
        return None
    return leer_json(service, carpeta_doc, "config.json")

# 🔥 HASH
def generar_hash(texto):
    return hashlib.md5(texto.encode()).hexdigest()


# 🔍 BUSCAR CARPETA
def buscar_carpeta(service, nombre):
    query = f"name = '{nombre}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = service.files().list(q=query, fields="files(id)").execute()
    items = results.get('files', [])
    return items[0]['id'] if items else None


# 📁 CREAR CARPETA
def crear_carpeta(service, nombre, parent_id=None):
    metadata = {
        'name': nombre,
        'mimeType': 'application/vnd.google-apps.folder'
    }

    if parent_id:
        metadata['parents'] = [parent_id]

    carpeta = service.files().create(body=metadata, fields='id').execute()
    return carpeta['id']


# 🔥 OBTENER O CREAR
def obtener_o_crear_carpeta(service, hash_doc, parent_id):
    carpeta_id = buscar_carpeta(service, hash_doc)

    if carpeta_id:
        print("✔ CARPETA EXISTE")
        return carpeta_id

    print("📁 CREANDO CARPETA NUEVA")
    return crear_carpeta(service, hash_doc, parent_id)


# 🔍 VER SI ARCHIVO EXISTE
def archivo_existe(service, nombre, carpeta_id):
    query = f"name = '{nombre}' and '{carpeta_id}' in parents and trashed = false"
    results = service.files().list(q=query, fields="files(id)").execute()
    return len(results.get('files', [])) > 0


# 💾 SUBIR JSON
def subir_json(service, carpeta_id, nombre, data):

    contenido = json.dumps(data, ensure_ascii=False).encode("utf-8")
    archivo = io.BytesIO(contenido)

    media = MediaIoBaseUpload(archivo, mimetype="application/json")

    file_metadata = {
        'name': nombre,
        'parents': [carpeta_id]
    }

    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()

    print("🔥 JSON SUBIDO:", file.get('id'))

    return file.get('id')



def leer_json(service, carpeta_id, nombre):

    query = f"name = '{nombre}' and '{carpeta_id}' in parents and trashed = false"
    results = service.files().list(q=query, fields="files(id)").execute()
    items = results.get('files', [])

    if not items:
        return None

    file_id = items[0]['id']

    request = service.files().get_media(fileId=file_id)

    import io
    fh = io.BytesIO()

    from googleapiclient.http import MediaIoBaseDownload
    downloader = MediaIoBaseDownload(fh, request)

    done = False
    while not done:
        status, done = downloader.next_chunk()

    fh.seek(0)

    import json
    return json.loads(fh.read().decode("utf-8"))

def subir_o_actualizar_json(service, carpeta_id, nombre, data):

    import json, io
    from googleapiclient.http import MediaIoBaseUpload

    contenido = json.dumps(data, ensure_ascii=False).encode("utf-8")
    archivo = io.BytesIO(contenido)

    media = MediaIoBaseUpload(archivo, mimetype="application/json")

    # 🔍 buscar si existe
    query = f"name = '{nombre}' and '{carpeta_id}' in parents and trashed = false"
    results = service.files().list(q=query, fields="files(id)").execute()
    items = results.get("files", [])

    if items:
        file_id = items[0]["id"]

        # 🔥 ACTUALIZAR
        service.files().update(
            fileId=file_id,
            media_body=media
        ).execute()

        print("♻️ JSON ACTUALIZADO")
        return file_id

    else:
        # 🆕 CREAR
        file_metadata = {
            "name": nombre,
            "parents": [carpeta_id]
        }

        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id"
        ).execute()

        print("🆕 JSON CREADO")
        return file.get("id")
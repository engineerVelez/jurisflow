import hashlib
import io
import json
from googleapiclient.http import MediaIoBaseUpload

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
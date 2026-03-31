from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import shutil
from drive import generar_hash, obtener_o_crear_carpeta, archivo_existe
from drive_auth import get_service
from docx_utils import leer_docx, convertir_doc_a_docx, convertir_pdf_a_docx
from ia import analizar_con_ia, calcular_confianza, chatear_con_ia, PROMPT_VERSION
from fastapi import Form
from fastapi import Body
from fastapi.responses import FileResponse
from docx import Document
import os
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# 🔐 LOGIN
security = HTTPBasic()

def verificar(credentials: HTTPBasicCredentials = Depends(security)):
    if credentials.username != "ursula" or credentials.password != "1121":
        raise HTTPException(status_code=401)
    return credentials.username

# 🏠 HOME
@app.get("/", response_class=HTMLResponse)
def home(user: str = Depends(verificar)):
    with open("templates/index.html", "r", encoding="utf-8") as f:
        return f.read()

# 🔧 FIX: un análisis guardado se considera COMPLETO solo si trae la
# estructura actual de la IA (actor/demandado como diccionarios y los
# campos planos de los 5 testigos). Si falta algo, se re-analiza.
def datos_incompletos(datos):
    if not isinstance(datos, dict):
        return True
    # el actor/demandado puede venir como dict (análisis de la IA:
    # {"nombre": ...}) o como texto plano (guardado manual del cliente:
    # "NOMBRE APELLIDO"). Ambos son válidos para reutilizar el archivo.
    if not isinstance(datos.get("actor"), (dict, str)) or not isinstance(datos.get("demandado"), (dict, str)):
        return True
    for i in range(1, 6):
        if datos.get(f"nombre_testigo{i}") is None:
            return True
    return False


# 📂 UPLOAD
@app.post("/upload")
def upload(
    file: UploadFile = File(...),
    prompt: str = Form("")
):
    print("🔥 BACKEND FUNCIONA")  # 👈 AGREGA ESTO

    ruta = f"temp_{file.filename}"

    with open(ruta, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🔧 NUEVO: soporte .doc (formato antiguo) convirtiendo con Word al subir
    nombre_min = file.filename.lower()
    if nombre_min.endswith(".doc") and not nombre_min.endswith(".docx"):
        ruta = convertir_doc_a_docx(ruta)
        if not ruta:
            raise HTTPException(
                status_code=400,
                detail="No se pudo leer el archivo .doc (Word no pudo convertirlo)."
            )

    # 🔧 NUEVO: soporte .pdf convirtiendo a .docx con Word al subir
    if nombre_min.endswith(".pdf"):
        ruta = convertir_pdf_a_docx(ruta)
        if not ruta:
            raise HTTPException(
                status_code=400,
                detail="No se pudo leer el archivo PDF (Word no pudo convertirlo)."
            )

    texto = leer_docx(ruta)

    # 🔧 FIX: el prompt del usuario (Configurar IA) debe SIEMPRE aplicarse.
    # Si el archivo ya estaba analizado con OTRO prompt o con una versión
    # vieja del prompt del servidor, la caché de Drive se ignora y se
    # vuelve a analizar.
    prompt_usuario = (prompt or "").strip()

    # 🔥 1. GENERAR HASH
    hash_doc = generar_hash(file.filename)

    # 🔥 2. CONECTAR DRIVE
    service = get_service()
    CARPETA_PRINCIPAL = "1m_yHvLo0XKpBavojbHTOw0z2nduzjT7k"

    # 🔥 3. CREAR O BUSCAR
    carpeta_id = obtener_o_crear_carpeta(service, hash_doc, CARPETA_PRINCIPAL)

    # 🔥 4. VER SI YA EXISTE
    if archivo_existe(service, "datos.json", carpeta_id):

        from drive import leer_json

        datos_guardados = leer_json(service, carpeta_id, "datos.json")

        # 🔥 VALIDAR SI EL JSON SIRVE
        if datos_guardados and datos_guardados.get("texto"):

            datos_guardados_datos = datos_guardados.get("datos", {})

            # 🔧 FIX: si el análisis guardado está incompleto (falta el
            # actor o los campos de testigos), se vuelve a analizar con
            # la IA y se actualiza el caché en Drive.
            if not datos_incompletos(datos_guardados_datos):

                # 🔧 FIX: la caché SOLO sirve si se generó con el MISMO
                # prompt del usuario, la MISMA versión del prompt del
                # servidor Y el MISMO contenido del archivo. La carpeta de
                # Drive se crea con el hash del NOMBRE del archivo: dos
                # documentos con el mismo nombre pero distinto contenido
                # comparten carpeta. Si el texto guardado no coincide con
                # el del archivo actual, la caché es de OTRO documento y
                # se vuelve a analizar (si no, el Entry mostraría valores
                # del documento anterior, no del actual).
                cache_vigente = (
                    datos_guardados.get("texto") == texto
                    and datos_guardados.get("prompt_usado", "") == prompt_usuario
                    and datos_guardados.get("prompt_version") == PROMPT_VERSION
                )

                if cache_vigente:

                    print("✔ YA EXISTE → CARGAR")

                    porcentaje, mensaje = calcular_confianza(datos_guardados_datos)

                    return {
                        "mensaje": "Cargado desde Drive",
                        "documento_id": hash_doc,
                        "datos": datos_guardados_datos,
                        "texto": datos_guardados.get("texto", ""),
                        "porcentaje": porcentaje,
                        "mensaje_confianza": mensaje
                    }

                print("⚠️ PROMPT/VERSIÓN CAMBIÓ → RE-ANALIZAR CON IA")

            print("⚠️ JSON INCOMPLETO → RE-ANALIZAR CON IA")

        else:
            print("⚠️ JSON VACÍO → USAR IA")

    # ===============================
    # 🟢 USAR IA (NUEVO O JSON INCOMPLETO)
    # ===============================

    print("📁 NUEVO O INCOMPLETO → USAR IA")

    datos = analizar_con_ia(texto, prompt_usuario)

    from drive import subir_o_actualizar_json

    subir_o_actualizar_json(service, carpeta_id, "datos.json", {
        "texto": texto,
        "datos": datos,
        "prompt_usado": prompt_usuario,
        "prompt_version": PROMPT_VERSION
    })

    porcentaje, mensaje_confianza = calcular_confianza(datos)

    if len(texto) > 120000:
        mensaje_confianza += " El documento es largo: la IA solo revisó la primera parte del texto."

    return {
        "mensaje": "Archivo procesado",
        "documento_id": hash_doc,
        "datos": datos,
        "texto": texto,
        "porcentaje": porcentaje,
        "mensaje_confianza": mensaje_confianza
    }
@app.post("/chat-ia")
def chat_ia(data: dict = Body(...)):

    mensaje = data.get("mensaje", "")
    historial = data.get("historial", [])

    if not mensaje or not mensaje.strip():
        raise HTTPException(status_code=400, detail="Mensaje vacío")

    if not isinstance(historial, list):
        historial = []

    respuesta = chatear_con_ia(mensaje.strip(), historial)

    return {"respuesta": respuesta}


@app.post("/exportar-docx")
def exportar_docx(data: dict = Body(...)):

    texto = data.get("texto", "")

    doc = Document()

    for linea in texto.split("\n"):
        doc.add_paragraph(linea)

    ruta = "documento_generado.docx"
    doc.save(ruta)

    return FileResponse(
        ruta,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="documento_editado.docx"
    )

@app.post("/guardar-html")
def guardar_html(data: dict = Body(...)):

    texto = data.get("texto", "")                    # HTML con resaltados (copia local)
    texto_plano = data.get("texto_plano", texto)     # texto limpio para Drive/reúso
    nombre = data.get("nombre", "documento")
    datos = data.get("datos", {})
    documento_id = data.get("documento_id", "")

    # 🔥 GUARDAR LOCAL (opcional)
    ruta = f"guardados/{nombre}.html"
    os.makedirs("guardados", exist_ok=True)

    with open(ruta, "w", encoding="utf-8") as f:
        f.write(texto)

    # 🔥 GUARDAR EN DRIVE
    from drive import obtener_o_crear_carpeta, subir_o_actualizar_json

    service = get_service()

    # 🔧 FIX: el hash del documento lo envía el frontend (documento_id),
    # el mismo que usó /upload para crear la carpeta en Drive. Antes se
    # usaba "file.filename" que NO existe aquí (daba NameError y el
    # guardado manual en Drive NUNCA funcionaba).
    hash_doc = documento_id or generar_hash(nombre)
    CARPETA_PRINCIPAL = "1m_yHvLo0XKpBavojbHTOw0z2nduzjT7k"

    carpeta_id = obtener_o_crear_carpeta(service, hash_doc, CARPETA_PRINCIPAL)

    subir_o_actualizar_json(service, carpeta_id, "datos.json", {
        "texto": texto_plano,
        "datos": datos,
        "prompt_usado": "",
        "prompt_version": PROMPT_VERSION
    })

    print("🔥 GUARDADO EN DRIVE")

    return {"ok": True}

@app.get("/cargar-html/{nombre}")
def cargar_html(nombre: str):
    ruta = f"guardados/{nombre}.html"

    if os.path.exists(ruta):
        with open(ruta, "r", encoding="utf-8") as f:
            return {"html": f.read()}

    return {"html": None}
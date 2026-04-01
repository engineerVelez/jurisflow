from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import shutil

from docx_utils import leer_docx
from ia import analizar_con_ia
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

# 📂 UPLOAD
@app.post("/upload")
def upload(
    file: UploadFile = File(...),
    prompt: str = Form("")
):

    ruta = f"temp_{file.filename}"

    with open(ruta, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    texto = leer_docx(ruta)

    datos = analizar_con_ia(texto)

    return {
        "mensaje": "Archivo procesado",
        "datos": datos,
        "texto": texto
    }

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
    texto = data.get("texto", "")
    nombre = data.get("nombre", "documento")

    ruta = f"guardados/{nombre}.html"

    os.makedirs("guardados", exist_ok=True)

    with open(ruta, "w", encoding="utf-8") as f:
        f.write(texto)

    return {"ok": True}

@app.get("/cargar-html/{nombre}")
def cargar_html(nombre: str):
    ruta = f"guardados/{nombre}.html"

    if os.path.exists(ruta):
        with open(ruta, "r", encoding="utf-8") as f:
            return {"html": f.read()}

    return {"html": None}

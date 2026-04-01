from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form, Request
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import shutil

from docx_utils import leer_docx
from ia import analizar_con_ia

app = FastAPI()

# 📁 STATIC FILES
app.mount("/static", StaticFiles(directory="static"), name="static")

# 📄 TEMPLATES
templates = Jinja2Templates(directory="templates")

# 🔐 LOGIN
security = HTTPBasic()

def verificar(credentials: HTTPBasicCredentials = Depends(security)):
    if credentials.username != "ursula" or credentials.password != "1121":
        raise HTTPException(status_code=401)
    return credentials.username

# 🏠 HOME (CORREGIDO PARA RENDER)
@app.get("/", response_class=HTMLResponse)
def home(request: Request, user: str = Depends(verificar)):
    return templates.TemplateResponse("index.html", {"request": request})

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

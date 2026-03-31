from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import shutil

from docx_utils import leer_docx
from ia import analizar_con_ia
from fastapi import Form
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
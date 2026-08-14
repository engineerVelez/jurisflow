from docx import Document
import os
import subprocess


def leer_docx(ruta):
    """
    Lee un archivo .docx y devuelve todo su texto.

    Funciona tanto en Windows como en Linux/Render.
    No necesita Microsoft Word.
    """
    doc = Document(ruta)
    texto = []

    for p in doc.paragraphs:
        texto.append(p.text)

    return "\n".join(texto)


def _pids_winword():
    """
    Devuelve los PID de WINWORD.EXE activos.

    Solo funciona en Windows.
    En Linux/Render devuelve un conjunto vacío.
    """
    if os.name != "nt":
        return set()

    pids = set()

    try:
        out = subprocess.run(
            [
                "tasklist",
                "/fi",
                "IMAGENAME eq WINWORD.EXE",
                "/fo",
                "csv",
                "/nh",
            ],
            capture_output=True,
            text=True,
            timeout=15,
        )

        for linea in out.stdout.strip().splitlines():
            partes = linea.split('","')

            if len(partes) > 1:
                pid = partes[1].replace('"', "")

                if pid.isdigit():
                    pids.add(pid)

    except Exception:
        pass

    return pids


def convertir_doc_a_docx(ruta_doc):
    """
    Convierte .doc a .docx.

    Windows:
        Utiliza Microsoft Word mediante COM.

    Linux/Render:
        No intenta utilizar Word y devuelve None.
    """
    if os.name != "nt":
        print("⚠️ Conversión .doc → .docx no disponible en Linux/Render.")
        return None

    ruta_docx = os.path.splitext(ruta_doc)[0] + ".docx"

    return _convertir_con_word(ruta_doc, ruta_docx)


def convertir_pdf_a_docx(ruta_pdf):
    """
    Convierte .pdf a .docx.

    Windows:
        Utiliza Microsoft Word mediante COM.

    Linux/Render:
        No intenta utilizar Word y devuelve None.
    """
    if os.name != "nt":
        print("⚠️ Conversión PDF → DOCX no disponible en Linux/Render.")
        return None

    ruta_docx = os.path.splitext(ruta_pdf)[0] + ".docx"

    return _convertir_con_word(ruta_pdf, ruta_docx)


def _convertir_con_word(ruta_orig, ruta_docx):
    """
    Convierte un archivo a DOCX utilizando Microsoft Word.

    Esta función SOLO debe ejecutarse en Windows.
    """

    if os.name != "nt":
        print("⚠️ Microsoft Word/COM no está disponible en este sistema.")
        return None

    ruta_orig = os.path.abspath(ruta_orig)
    ruta_docx = os.path.abspath(ruta_docx)

    word = None
    pids_antes = _pids_winword()

    try:
        import pythoncom
        import win32com.client as win32

        pythoncom.CoInitialize()

        word = win32.DispatchEx("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0

        if os.path.exists(ruta_docx):
            os.remove(ruta_docx)

        doc = word.Documents.Open(
            ruta_orig,
            ConfirmConversions=False,
            ReadOnly=True,
            AddToRecentFiles=False,
        )

        doc.SaveAs2(
            ruta_docx,
            FileFormat=12,
        )

        doc.Close(False)

        if os.path.exists(ruta_docx):
            return ruta_docx

        return None

    except Exception as e:
        print("❌ Error convirtiendo con Word:", e)
        return None

    finally:

        try:
            if word is not None:
                word.Quit()
        except Exception:
            pass

        try:
            import pythoncom
            pythoncom.CoUninitialize()
        except Exception:
            pass

        # Solo limpiar procesos WINWORD creados por esta conversión.
        for pid in _pids_winword() - pids_antes:
            try:
                subprocess.run(
                    ["taskkill", "/f", "/pid", pid],
                    capture_output=True,
                    timeout=10,
                )
            except Exception:
                pass
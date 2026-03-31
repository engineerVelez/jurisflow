from docx import Document
import os
import subprocess


def leer_docx(ruta):
    doc = Document(ruta)
    texto = []

    for p in doc.paragraphs:
        texto.append(p.text)

    return "\n".join(texto)


def _pids_winword():
    """Devuelve los PID de los procesos WINWORD.EXE activos."""
    pids = set()
    try:
        out = subprocess.run(
            ["tasklist", "/fi", "IMAGENAME eq WINWORD.EXE", "/fo", "csv", "/nh"],
            capture_output=True, text=True, timeout=15
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
    """Convierte un .doc a .docx usando Word (COM).

    Devuelve la ruta del .docx convertido o None si falló.
    Solo mata los procesos de Word que creó esta conversión.
    """
    ruta_docx = os.path.splitext(ruta_doc)[0] + ".docx"
    return _convertir_con_word(ruta_doc, ruta_docx)


def convertir_pdf_a_docx(ruta_pdf):
    """Convierte un .pdf a .docx usando Word (COM).

    Word (2013+) abre el PDF y lo reflowea a un documento editable.
    Devuelve la ruta del .docx convertido o None si falló.
    """
    ruta_docx = os.path.splitext(ruta_pdf)[0] + ".docx"
    return _convertir_con_word(ruta_pdf, ruta_docx)


def _convertir_con_word(ruta_orig, ruta_docx):
    """Abre ruta_orig con Word y la guarda como .docx (COM).

    Devuelve la ruta del .docx o None si falló. Solo mata los procesos
    de Word que creó esta conversión.
    """
    import pythoncom

    # Word (proceso COM) no resuelve rutas relativas contra la carpeta
    # del proyecto, sino contra C:\Windows\system32. Siempre rutas absolutas.
    ruta_orig = os.path.abspath(ruta_orig)
    ruta_docx = os.path.abspath(ruta_docx)

    word = None
    pids_antes = _pids_winword()

    pythoncom.CoInitialize()
    try:
        import win32com.client as win32

        word = win32.DispatchEx("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0  # wdAlertsNone

        if os.path.exists(ruta_docx):
            os.remove(ruta_docx)

        doc = word.Documents.Open(
            ruta_orig,
            ConfirmConversions=False,
            ReadOnly=True,
            AddToRecentFiles=False
        )
        doc.SaveAs2(ruta_docx, FileFormat=12)  # wdFormatXMLDocument
        doc.Close(False)

        return ruta_docx if os.path.exists(ruta_docx) else None

    except Exception as e:
        print("❌ Error convirtiendo con Word:", e)
        return None
    finally:
        try:
            if word is not None:
                word.Quit()
        except Exception:
            pass
        pythoncom.CoUninitialize()

        # limpiar SOLO los procesos Word nuevos de esta conversión
        for pid in _pids_winword() - pids_antes:
            try:
                subprocess.run(["taskkill", "/f", "/pid", pid],
                               capture_output=True, timeout=10)
            except Exception:
                pass
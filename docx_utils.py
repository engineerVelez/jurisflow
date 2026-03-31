from docx import Document

def leer_docx(ruta):
    doc = Document(ruta)
    texto = []

    for p in doc.paragraphs:
        texto.append(p.text)

    return "\n".join(texto)
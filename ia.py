from openai import OpenAI
import json
import os

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key = os.getenv("GROQ_API_KEY")
)


def analizar_con_ia(texto, prompt_usuario=""):

    base_prompt = """
Extrae información de un documento legal ecuatoriano.

Devuelve SOLO JSON válido, sin explicaciones, con esta estructura EXACTA:

{
  "tipo_juicio": "",

  "actor": {
    "nombre": "",
    "cedula": "",
    "edad": "",
    "estado_civil": "",
    "profesion": "",
    "ciudadania": "",
    "email": "",
    "telefono": "",
    "direccion": {
      "parroquia": "",
      "barrio": "",
      "calle_principal": "",
      "calle_secundaria": "",
      "numero_casa": "",
      "codigo_postal": ""
    }
  },

  "demandado": {
    "nombre": "",
    "cedula": "",
    "email": "",
    "telefono": "",
    "direccion": {
      "parroquia": "",
      "barrio": "",
      "calle_principal": "",
      "calle_secundaria": "",
      "numero_casa": "",
      "codigo_postal": ""
    }
  }
}

Reglas:
- No mezclar datos del actor con el demandado
- Si un dato no existe, devolver ""
- Mantener nombres completos
- Extraer direcciones lo más completas posible
"""

    prompt = f"""
{base_prompt}

{prompt_usuario}

TEXTO:
\"\"\"
{texto[:2000]}
\"\"\"
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    contenido = response.choices[0].message.content.strip()

    # 🔥 limpiar markdown
    if contenido.startswith("```"):
        contenido = contenido.replace("```json", "").replace("```", "").strip()

    # 🔥 fallback seguro
    try:
        return json.loads(contenido)
    except Exception as e:
        print("ERROR IA:", contenido)
        return {}
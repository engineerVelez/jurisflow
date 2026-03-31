from openai import OpenAI
import json
import os

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key = os.getenv("GROQ_API_KEY")
)

def analizar_con_ia(texto, prompt_usuario=""):

    base_prompt = """
Extrae la siguiente información de este texto legal ecuatoriano.

Devuelve SOLO JSON válido, sin texto adicional:

{
  "actor": null,
  "cedula": null,
  "age": null,
  "civil": null,
  "profesion": null,
  "ciudadania": null,
  "email": null,
  "telefono_actor": null,
  "parroquia_actor": null,
  "barrio_actor": null,
  "calle_principal_actor": null,
  "calle_secundaria_actor": null,
  "numero_casa_actor": null,
  "codigo_postal_actor": null,
  "tipo_juicio": null
}
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
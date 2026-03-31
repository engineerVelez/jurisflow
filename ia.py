from openai import OpenAI
import json
import os


# =========================================================
# CONFIGURACIÓN GROQ
# =========================================================

# La API key debe estar guardada en la variable:
# GROQ_API_KEY
#
# NO pongas aquí la clave real.
#
# En PowerShell puedes configurarla temporalmente con:
#
# $env:GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
#
# =========================================================
# GROQ API
# =========================================================

API_KEY = os.environ.get("GROQ_API_KEY")

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=API_KEY
)


# =========================================================
# ANÁLISIS DEL DOCUMENTO
# =========================================================

# =========================================================
# PROMPT PRINCIPAL (PROTEGIDO)
# =========================================================
# Este es el prompt base del análisis de documentos. Vive SOLO en el
# servidor: nunca se envía al navegador, por lo que los usuarios
# externos NO pueden modificarlo. Las "instrucciones adicionales" del
# panel Configurar IA solo se SUMA a este prompt; nunca lo reemplaza.

PROMPT_PRINCIPAL = """
Eres un asistente especializado en analizar documentos jurídicos ecuatorianos
(demandas, escritos judiciales, etc.).
 
Tu tarea NO es simplemente buscar nombres. Debes entender el ROL JURÍDICO de
cada persona que aparece en el documento, usando el contexto.
 
==================================================
CÓMO IDENTIFICAR EL ROL DE CADA PERSONA
==================================================
 
ACTOR (persona que presenta la demanda / accionante):
Suele aparecer cerca de expresiones como:
"comparece el señor/la señora...", "en calidad de actor", "parte actora",
"accionante", justo antes de sus datos personales (cédula, edad, estado
civil, profesión, domicilio).
 
DEMANDADO (persona contra quien se dirige la demanda):
Suele aparecer cerca de expresiones como:
"demandado/a", "parte demandada", "en contra de", "se demanda a".
 
⚠️ CASO ESPECIAL MUY IMPORTANTE — CONTESTACIÓN A LA DEMANDA:
Si el documento es una CONTESTACIÓN (frases como "comparezco y doy
contestación a la demanda", "doy contestación", "fui citado con la
demanda interpuesta por..."), entonces la persona que HABLA/COMPARECE
en primera persona ("yo", "mi", "me") y está respondiendo es el
DEMANDADO, aunque hable en primera persona y aparezca primero en el
texto. La persona mencionada como quien "interpuso la demanda", quien
"sigue" el proceso "en mi contra", o la "parte actora", es el ACTOR,
aunque su nombre aparezca después en el documento.
Ejemplo: si el texto dice "...que sigue la señora GABRIELA... en mi
contra... comparezco y doy contestación a la demanda" y más abajo
"fui citado con la demanda interpuesta por la Sra. GABRIELA...", eso
significa GABRIELA es la ACTORA (ella demandó) y la persona que firma
el escrito (identificada por su cédula/domicilio al inicio del
documento) es el DEMANDADO (él responde). NO asumas que la primera
persona nombrada en el documento es automáticamente el actor: lee el
verbo de la acción (quién demandó vs. quién responde).
 
NO SON EL ACTOR NI EL DEMANDADO (ignóralos para esos roles, aunque tengan
nombre, cédula, correo o dirección propios):
- Abogados, defensores públicos o privados ("mi defensor/a", "abogado
  patrocinador", "Dr./Dra./Ab.").
- Jueces, secretarios judiciales, notarios, peritos.
- Cualquier persona mencionada solo como referencia (testigos SÍ cuentan,
  pero van en su propia sección "testigos", nunca como actor/demandado).
 
Un dato (cédula, email, teléfono, dirección) pertenece a la persona junto a
la cual aparece descrito en el texto. NO mezcles el email de un abogado con
el del actor, ni la cédula del demandado con la del actor.
 
==================================================
TESTIGOS (condicional)
==================================================
 
Incluye en el arreglo "testigos" SOLO a las personas que el documento
identifica explícitamente como testigos. Si el documento menciona 2
testigos, el arreglo debe tener exactamente 2 elementos. Si no menciona
ninguno, el arreglo debe ser [].
NUNCA completes testigos que no están explícitamente en el texto.
 
==================================================
REGLA GENERAL: NO INVENTAR
==================================================
 
- Solo reporta un dato si aparece explícitamente en el texto.
- Si un dato no aparece, devuelve "" (cadena vacía) para ese campo.
- NO copies, asumas ni repitas información de otros documentos o ejemplos.
- NO completes campos "por lógica" o "porque suele ser así".
- Mantén los nombres completos, exactamente como aparecen en el texto.
 
==================================================
FORMATO DE RESPUESTA
==================================================
 
Devuelve SOLO JSON válido, sin explicaciones, sin markdown, con esta
estructura EXACTA (usa "" para cualquier campo que no encuentres, y []
para testigos si no hay ninguno):

NÚMERO DE JUICIO: es el número del proceso judicial, suele aparecer al
inicio del documento junto a "Juicio", "Causa", "Proceso" o "Número de
juicio" (p.ej. "17230-2024-04265"). Si el documento no muestra ningún
número de proceso, deja el campo en "".

TIPO DE JUICIO: describe BREVEMENTE el asunto concreto del proceso usando
las palabras del propio documento (p.ej. "Alimentos", "Tenencia",
"Divorcio", "Inventario de bienes sucesorios", "Pago de honorarios
profesionales", "Privación de la patria potestad", "Unión de hecho",
"Desalojo", "Contrato de trabajo"). NO uses solo la palabra de la
materia del juzgado ("civil", "familia", "laboral", "penal"): describe
el asunto concreto. Si el documento no deja claro el asunto, usa "".

{
  "numero_juicio": "",
 
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
  },
 
  "testigos": [
    {
      "nombre": "",
      "cedula": "",
      "direccion": "",
      "parroquia": "",
      "ciudad": "",
      "email": "",
      "objeto": ""
    }
  ]
}
"""

# =========================================================
# VERSIÓN DEL PROMPT
# =========================================================
# Cada vez que cambie PROMPT_PRINCIPAL (p.ej. la guía de tipo de
# juicio), se INCREMENTA este número. Se guarda junto al análisis en
# Drive: si la versión guardada no coincide con la actual, el archivo
# se vuelve a analizar con la IA (para no usar análisis viejos con
# instrucciones desactualizadas).
PROMPT_VERSION = 2

def analizar_con_ia(texto, prompt_usuario=""):

    prompt = f"""
{PROMPT_PRINCIPAL}

==================================================
INSTRUCCIÓN ADICIONAL
==================================================

{prompt_usuario}

==================================================
DOCUMENTO ACTUAL
==================================================

Analiza SOLO este documento:

\"\"\"
{texto[:120000]}
\"\"\"
"""

    try:

        resultado = None

        # 🔧 REINTENTO: si la respuesta no es JSON válido o no trae ni
        # actor ni demandado con nombre, se llama a GROQ una vez más
        # (máx. 2 intentos) antes de darse por vencido. El prompt y la
        # regla "NO INVENTAR" no se tocan: solo se reintenta la llamada.
        for intento in range(1, 3):

            try:

                print("\n======================================")
                print(f"🤖 ANALIZANDO DOCUMENTO CON GROQ (intento {intento}/2)")
                print("======================================")

                response = client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0
                )

                contenido = response.choices[0].message.content.strip()

                print("\n========== RESPUESTA IA ==========")
                print(contenido)
                print("==================================")

                # =========================================
                # LIMPIAR MARKDOWN
                # =========================================

                if contenido.startswith("```"):

                    contenido = (
                        contenido
                        .replace("```json", "")
                        .replace("```", "")
                        .strip()
                    )

                # =========================================
                # CONVERTIR A JSON
                # =========================================

                resultado = json.loads(contenido)

                if not isinstance(resultado, dict):
                    resultado = None

            except Exception as e:

                print("\n❌ ERROR IA:", type(e).__name__, "-", e)
                print("==================================")
                resultado = None

            # si la respuesta es válida y ya identificó actor y demandado
            # con nombre, no hace falta reintentar
            actor_ok = (
                isinstance(resultado.get("actor"), dict)
                and bool(resultado.get("actor", {}).get("nombre"))
            )
            demandado_ok = (
                isinstance(resultado.get("demandado"), dict)
                and bool(resultado.get("demandado", {}).get("nombre"))
            )

            if actor_ok and demandado_ok:
                break

            resultado = None

        if resultado is None:
            return {}

        # =========================================
        # NORMALIZACIÓN
        # =========================================

        resultado.setdefault("numero_juicio", "")
        resultado.setdefault("tipo_juicio", "")
        resultado.setdefault("actor", {})
        resultado.setdefault("demandado", {})
        resultado.setdefault("testigos", [])

        if not isinstance(resultado["actor"], dict):
            resultado["actor"] = {}

        if not isinstance(resultado["demandado"], dict):
            resultado["demandado"] = {}

        if not isinstance(resultado["testigos"], list):
            resultado["testigos"] = []

        # =========================================
        # NORMALIZAR ACTOR
        # =========================================

        actor = resultado["actor"]

        actor.setdefault("nombre", "")
        actor.setdefault("cedula", "")
        actor.setdefault("edad", "")
        actor.setdefault("estado_civil", "")
        actor.setdefault("profesion", "")
        actor.setdefault("ciudadania", "")
        actor.setdefault("email", "")
        actor.setdefault("telefono", "")
        actor.setdefault("direccion", {})

        if not isinstance(actor["direccion"], dict):
            actor["direccion"] = {}

        actor["direccion"].setdefault("parroquia", "")
        actor["direccion"].setdefault("barrio", "")
        actor["direccion"].setdefault("calle_principal", "")
        actor["direccion"].setdefault("calle_secundaria", "")
        actor["direccion"].setdefault("numero_casa", "")
        actor["direccion"].setdefault("codigo_postal", "")

        # =========================================
        # NORMALIZAR DEMANDADO
        # =========================================

        demandado = resultado["demandado"]

        demandado.setdefault("nombre", "")
        demandado.setdefault("cedula", "")
        demandado.setdefault("email", "")
        demandado.setdefault("telefono", "")
        demandado.setdefault("direccion", {})

        if not isinstance(demandado["direccion"], dict):
            demandado["direccion"] = {}

        demandado["direccion"].setdefault("parroquia", "")
        demandado["direccion"].setdefault("barrio", "")
        demandado["direccion"].setdefault("calle_principal", "")
        demandado["direccion"].setdefault("calle_secundaria", "")
        demandado["direccion"].setdefault("numero_casa", "")
        demandado["direccion"].setdefault("codigo_postal", "")

        # =========================================
        # NORMALIZAR TESTIGOS
        # =========================================

        testigos = []

        for testigo in resultado["testigos"][:5]:

            if not isinstance(testigo, dict):
                continue

            testigo.setdefault("nombre", "")
            testigo.setdefault("cedula", "")
            testigo.setdefault("direccion", "")
            testigo.setdefault("parroquia", "")
            testigo.setdefault("ciudad", "")
            testigo.setdefault("email", "")
            testigo.setdefault("objeto", "")

            # Solo conservar testigos que realmente tengan
            # información.
            if any([
                testigo["nombre"],
                testigo["cedula"],
                testigo["direccion"],
                testigo["parroquia"],
                testigo["ciudad"],
                testigo["email"],
                testigo["objeto"]
            ]):

                testigos.append(testigo)

        resultado["testigos"] = testigos

        # =========================================
        # CAMPOS PLANOS PARA EL FRONTEND
        # =========================================

        # Primero limpiar todos los testigos
        for i in range(1, 6):

            resultado[f"nombre_testigo{i}"] = ""
            resultado[f"cedula_testigo{i}"] = ""
            resultado[f"direccion_testigo{i}"] = ""
            resultado[f"parroquia_testigo{i}"] = ""
            resultado[f"ciudad_testigo{i}"] = ""
            resultado[f"email_testigo{i}"] = ""
            resultado[f"objeto_testigo{i}"] = ""

        # Luego cargar solamente los encontrados
        for i, testigo in enumerate(testigos, start=1):

            if i > 5:
                break

            resultado[f"nombre_testigo{i}"] = testigo.get(
                "nombre", ""
            )

            resultado[f"cedula_testigo{i}"] = testigo.get(
                "cedula", ""
            )

            resultado[f"direccion_testigo{i}"] = testigo.get(
                "direccion", ""
            )

            resultado[f"parroquia_testigo{i}"] = testigo.get(
                "parroquia", ""
            )

            resultado[f"ciudad_testigo{i}"] = testigo.get(
                "ciudad", ""
            )

            resultado[f"email_testigo{i}"] = testigo.get(
                "email", ""
            )

            resultado[f"objeto_testigo{i}"] = testigo.get(
                "objeto", ""
            )

        # =========================================
        # MOSTRAR RESULTADO FINAL
        # =========================================

        print("\n========== JSON FINAL ==========")
        print(
            json.dumps(
                resultado,
                ensure_ascii=False,
                indent=2
            )
        )
        print("================================")

        return resultado

    except Exception as e:

        print("\n❌ ERROR AL LLAMAR A GROQ")
        print(type(e).__name__, ":", e)
        print("================================")

        return {}


# =========================================================
# CONFIANZA DEL ANÁLISIS
# =========================================================
# Calcula qué porcentaje de los datos del documento identificó
# la IA (según los campos que devolvió llenos). No cambia el
# prompt ni la regla "NO INVENTAR": solo mide el resultado.

def _campo_lleno(valor):
    if isinstance(valor, str):
        return bool(valor.strip())
    if isinstance(valor, dict):
        return any(_campo_lleno(v) for v in valor.values())
    return bool(valor)


def calcular_confianza(datos):
    """Devuelve (porcentaje, mensaje) según cuántos campos identificó la IA.

    Acepta el formato anidado de la IA (actor/demandado como dict) y el
    formato plano del guardado manual (actor/demandado como texto).
    Pesos: nombres 50%, cédulas 30%, testigos 10%, datos extra 10%.
    """
    if not isinstance(datos, dict):
        return 0, "No se pudo interpretar la respuesta de la IA. Revisa el documento manualmente."

    actor = datos.get("actor")
    dem = datos.get("demandado")

    if not isinstance(actor, dict):
        actor = {}
    if not isinstance(dem, dict):
        dem = {}

    def _texto(valor_anidado, clave_plana):
        v = valor_anidado
        if not isinstance(v, str) or not v.strip():
            plano = datos.get(clave_plana)
            if isinstance(plano, str):
                v = plano
        return v.strip() if isinstance(v, str) else ""

    def _lleno(valor):
        return isinstance(valor, str) and bool(valor.strip())

    actor_nombre = _texto(actor.get("nombre"), "actor")
    dem_nombre = _texto(dem.get("nombre"), "demandado")

    pct = 0
    if actor_nombre:
        pct += 25
    if dem_nombre:
        pct += 25

    actor_ced = _texto(actor.get("cedula"), "cedula")
    dem_ced = _texto(dem.get("cedula"), "cedula_demandado")
    if _lleno(actor_ced):
        pct += 15
    if _lleno(dem_ced):
        pct += 15

    testigos = 0
    for i in range(1, 6):
        if _lleno(datos.get(f"nombre_testigo{i}")):
            testigos += 1
    pct += min(testigos, 2) * 5

    extras = 0
    if _lleno(_texto(actor.get("email"), "email")):
        extras += 2.5
    if _lleno(_texto(dem.get("email"), "email_demandado")):
        extras += 2.5
    if _lleno(_texto(actor.get("telefono"), "telefono_actor")):
        extras += 2.5
    if _lleno(_texto(dem.get("telefono"), "telefono_demandado")):
        extras += 2.5
    if _campo_lleno(actor.get("direccion")) or _lleno(datos.get("calle_principal_actor")):
        extras += 2.5
    if _campo_lleno(dem.get("direccion")) or _lleno(datos.get("calle_principal_demandado")):
        extras += 2.5
    pct += min(extras, 10)

    pct = round(min(pct, 100))

    if not actor_nombre and not dem_nombre:
        mensaje = (
            "No se pudieron identificar los datos principales. "
            "El documento puede ser largo o complejo; edítalo manualmente."
        )
    elif pct >= 70:
        mensaje = f"Se identificó el {pct}% de los datos del documento."
    elif pct >= 40:
        mensaje = f"Solo se identificó el {pct}% de los datos. Revisa los campos."
    else:
        mensaje = f"Se identificó solo el {pct}% de los datos. Corrige manualmente."

    return pct, mensaje


# =========================================================
# CHAT CON LA IA (PANEL "CONFIGURAR IA")
# =========================================================
# El usuario puede hablar con la IA y aplicar sus correcciones a los
# análisis. Usa el MISMO PROMPT_PRINCIPAL (protegido) como base y le
# agrega un modo conversacional (también fijo en el servidor).

MODO_CHAT = """

==================================================
MODO CHAT (agregado automáticamente por el servidor)
==================================================
Ahora estás en modo conversación con el usuario (no analizando un
documento). Responde en español, de forma clara y breve.

Cuando el usuario te pida corregir o ajustar el análisis de
documentos, redacta una instrucción corta, concreta y en imperativo,
que comience EXACTAMENTE con la línea:

INSTRUCCIÓN PARA ANÁLISIS:

y después escribe la instrucción. Esa instrucción será añadida a
futuros análisis de documentos.
"""


def chatear_con_ia(mensaje, historial=None):
    """Devuelve la respuesta conversacional de la IA.

    historial: lista de dicts {"rol": "usuario"|"ia", "contenido": "..."}
    """

    mensajes = [
        {
            "role": "system",
            "content": PROMPT_PRINCIPAL + MODO_CHAT
        }
    ]

    for h in (historial or []):
        rol = "user" if h.get("rol") == "usuario" else "assistant"
        contenido = h.get("contenido", "")
        if contenido:
            mensajes.append({"role": rol, "content": contenido})

    mensajes.append({"role": "user", "content": mensaje})

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=mensajes,
            temperature=0
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("❌ ERROR CHAT IA:", type(e).__name__, "-", e)
        return "Lo siento, hubo un error al hablar con la IA. Intenta de nuevo."


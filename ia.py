from openai import OpenAI
import json
import os
import sys

# 🔧 FIX: la consola de Windows (cp1252) no puede imprimir emojis y un
# crash de print() devolvía {} a la IA (parecía que "no funcionaba").
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


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

# 🔧 FIX: se prefiere la variable de entorno GROQ_API_KEY; si no está
# definida, se usa la clave de respaldo escrita aquí. (Si la clave vence
# y Groq devuelve 401, hay que reemplazarla en esta línea o en la
# variable de entorno y reiniciar el servidor.)
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
PRIORIDAD ESPECIAL — IDENTIFICACIÓN DE TODAS LAS VARIABLES
==================================================

El documento puede ser un documento jurídico real o un DOCUMENTO
FORMATO preparado para ser completado posteriormente.

Tu función es identificar TODAS las variables existentes en el
documento, no solamente nombres de personas.

Una VARIABLE es cualquier información que pueda cambiar entre un
caso jurídico y otro.

Ejemplos:

[NOMBRE]
[NOMBRE DEL ACTOR 1]
[NOMBRE DEL ACTOR 2]
[CÉDULA]
[EDAD]
[ESTADO CIVIL]
[PROFESIÓN / OCUPACIÓN]
[DIRECCIÓN]
[CORREO ELECTRÓNICO]
[CASILLERO JUDICIAL]
[NÚMERO DE JUICIO]
[UNIDAD JUDICIAL]
[JUZGADOR]
[CIUDAD]
[PROVINCIA]
[CANTÓN]
[PARROQUIA]
[BARRIO]
[CÓDIGO POSTAL]
[FECHA]
[VALOR]
[CUANTÍA]
[DESCRIPCIÓN]
[HECHOS]
[PRUEBA]
[TESTIGO]
etc.

REGLA PRINCIPAL

DEBES ANALIZAR EL DOCUMENTO COMPLETO Y DETECTAR TODAS LAS
VARIABLES.

NO debes limitarte a buscar:

- actor
- demandado
- testigos
- cédulas

Debes revisar TODAS las secciones del documento.

VARIABLES DE IDENTIFICACIÓN DEL PROCESO

Detecta, cuando existan:

- tipo de juicio
- número de juicio
- número de causa
- número de proceso
- unidad judicial
- juzgado
- juzgador
- juez
- ciudad
- provincia
- cantón
- parroquia
- fecha
- procedimiento
- cuantía

Si alguno aparece como campo de plantilla, conserva el marcador.

Ejemplo:

"UNIDAD JUDICIAL: [UNIDAD JUDICIAL]"

debe identificarse como:

unidad_judicial = "[UNIDAD JUDICIAL]"

VARIABLES DE LOS ACTORES

Detecta TODOS los actores.

NO asumas que solamente existe un actor.

Para cada actor identifica:

- nombre completo
- cédula
- edad
- estado civil
- profesión
- ocupación
- ciudadanía
- correo electrónico
- teléfono
- dirección
- parroquia
- barrio
- calle principal
- calle secundaria
- número de casa
- código postal
- casillero judicial
- casillero electrónico
- domicilio judicial
- cualquier otro dato personal expresamente incluido

Si existen:

ACTOR 1
ACTOR 2
ACTOR 3
ACTOR 4

debes identificarlos individualmente.

NO mezcles los datos de un actor con otro.

VARIABLES DEL DEMANDADO

Detecta TODOS los demandados.

Para cada demandado identifica:

- nombre completo
- cédula
- edad
- estado civil
- profesión
- ocupación
- ciudadanía
- correo electrónico
- teléfono
- dirección para citación
- parroquia
- barrio
- calle principal
- calle secundaria
- número de casa
- código postal
- cualquier otro dato expresamente incluido

Si existen varios demandados, identifica:

DEMANDADO 1
DEMANDADO 2
DEMANDADO 3
etc.

NO combines información de diferentes demandados.

VARIABLES DE ABOGADOS Y PATROCINADORES

Los abogados NO deben confundirse con actores ni demandados.

Sin embargo, si el documento contiene sus datos como variables,
también deben identificarse.

Detecta:

- nombre del abogado
- cédula del abogado
- matrícula profesional
- número de foro
- casillero judicial
- casillero electrónico
- correo electrónico
- teléfono
- domicilio profesional

VARIABLES DE TESTIGOS

Detecta TODOS los testigos que aparezcan explícitamente.

Para cada testigo identifica:

- nombre completo
- cédula
- ciudad
- provincia
- cantón
- parroquia
- barrio
- dirección
- correo electrónico
- teléfono
- hechos sobre los que declarará
- objeto de su testimonio
- cualquier otro dato expresamente incluido

Si el documento contiene:

TESTIGO 1
TESTIGO 2
TESTIGO 3

debes mantenerlos separados.

NO inventes testigos.

VARIABLES DE PRUEBA DOCUMENTAL

Identifica los campos variables relacionados con prueba documental.

Por ejemplo:

- documento 1
- documento 2
- documento 3
- escritura
- certificado
- certificado de gravámenes
- certificado catastral
- contrato
- fotografías
- planos
- informes
- anexos
- descripción de documento
- número de documento
- fecha del documento
- autoridad que emitió el documento

Si el documento contiene un marcador como:

[DESCRIPCIÓN DE LA PRUEBA DOCUMENTAL]

debes identificarlo como variable.

VARIABLES DE INSPECCIÓN JUDICIAL

Identifica cualquier variable relacionada con:

- lugar de inspección
- inmueble
- dirección
- objeto de inspección
- hechos que deben verificarse
- descripción de la inspección
- fecha
- cualquier otro dato variable

VARIABLES DE PRUEBA PERICIAL

Identifica:

- tipo de perito
- especialidad
- nombre del perito
- objeto de la pericia
- descripción de la pericia
- inmueble
- ubicación
- puntos que debe determinar el perito
- cualquier otro campo variable

VARIABLES DE PRETENSIONES

Si las pretensiones contienen información variable, identifícala.

Ejemplos:

- declaración solicitada
- valor solicitado
- inmueble involucrado
- obligación solicitada
- porcentaje
- fecha
- plazo
- cantidad
- descripción

NO modifiques una pretensión jurídica fija solamente porque no
contenga variables.

VARIABLES DE FUNDAMENTOS DE DERECHO

Si existe información variable dentro de los fundamentos jurídicos,
identifícala.

Por ejemplo:

- número de artículo
- norma
- ley
- código
- resolución
- autoridad
- fecha

Si la norma está redactada como contenido fijo, NO la conviertas
innecesariamente en variable.

VARIABLES DE ACCESO JUDICIAL A LA PRUEBA

Identifica:

- solicitud
- institución
- documento solicitado
- autoridad
- dependencia
- información solicitada
- motivo de la solicitud

VARIABLES DE CUANTÍA

Identifica:

- cuantía
- valor
- monto
- porcentaje
- valor reclamado
- valor estimado
- moneda

VARIABLES DEL PROCEDIMIENTO

Identifica:

- procedimiento
- vía procesal
- trámite
- tipo de procedimiento

Si el procedimiento está fijo en el documento, mantenlo como
contenido fijo.

Si aparece:

[PROCEDIMIENTO]

identifícalo como variable.

VARIABLES DE FIRMAS

Detecta:

- nombre del actor que firma
- nombre del abogado
- matrícula
- foro
- firma
- fecha
- ciudad
- cualquier otro dato de firma

REGLA PARA CAMPOS ENTRE CORCHETES

Todo texto entre corchetes debe analizarse como posible variable.

Ejemplo:

[NOMBRE DEL ACTOR]

[NOMBRE DEL DEMANDADO]

[CÉDULA]

[FECHA]

[VALOR]

[DIRECCIÓN]

Sin embargo, NO debes asumir automáticamente que todos los textos
entre corchetes tienen la misma categoría.

Debes determinar su significado según el contexto jurídico.

REGLA PARA CAMPOS SIN CORCHETES

También debes identificar variables aunque NO estén entre corchetes.

Ejemplo:

"NÚMERO DE JUICIO: pendiente"

"Nombre: __________________"

"Fecha: __________"

"Ciudad: Quito"

El formato puede utilizar diferentes formas para representar
variables.

Debes reconocerlas por su contexto.

DATOS REALES VS VARIABLES

Debes diferenciar cuidadosamente:

1. DATO REAL

Ejemplo:
"Juan Pérez"

2. VARIABLE DE PLANTILLA

Ejemplo:
"[NOMBRE DEL ACTOR 1]"

3. DATO NO ENCONTRADO

Ejemplo:
""

Nunca confundas estas tres situaciones.

REGLA DE CONSERVACIÓN

Cuando identifiques una variable de plantilla:

NO la borres.

NO la reemplaces.

NO la completes.

NO inventes información.

Conserva exactamente el texto del marcador.

Ejemplo:

[NOMBRE DEL ACTOR 1]

debe mantenerse como:

[NOMBRE DEL ACTOR 1]

REGLA DE CONTEXTO

La IA debe utilizar:

1. El texto de la oración.
2. El título de la sección.
3. El encabezado.
4. La posición dentro del documento.
5. El rol jurídico.
6. Las palabras que rodean al campo.

para determinar qué representa cada variable.

Ejemplo:

"Nosotros: [NOMBRE DEL ACTOR 1]..."

→ actor 1.

"La demanda se dirige en contra de [NOMBRE DEL DEMANDADO]..."

→ demandado.

"Se receptará el testimonio de [NOMBRE DEL TESTIGO]..."

→ testigo.

REGLA DE PRIORIDAD

ORDEN OBLIGATORIO DE ANÁLISIS:

1. Analiza primero el documento completo.
2. Identifica datos reales.
3. Identifica variables de plantilla.
4. Determina el significado jurídico de cada variable.
5. Relaciona cada variable con su sección.
6. Mantén separadas las personas.
7. Mantén separados los diferentes tipos de datos.
8. Si un dato no existe, devuelve "".
9. Si existe como variable de plantilla, conserva el marcador.
10. Nunca inventes información.

REGLA ABSOLUTA

NO BORRES información existente solamente porque no contiene un
nombre real.

Un documento sin nombres puede seguir siendo un documento
perfectamente válido como FORMATO.

La ausencia de datos reales NO significa que el documento esté
vacío.

Tu trabajo es identificar la estructura y las variables que
deberán completarse posteriormente.

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
PROMPT_VERSION = 3

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
                isinstance(resultado, dict)
                and isinstance(resultado.get("actor"), dict)
                and bool(resultado.get("actor", {}).get("nombre"))
            )
            demandado_ok = (
                isinstance(resultado, dict)
                and isinstance(resultado.get("demandado"), dict)
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
MODO ASISTENTE JURÍDICO — JURISFLOW v148
==================================================

Eres un asistente jurídico inteligente integrado al editor de documentos
de JurisFlow. Puedes conversar, crear documentos, modificar entries,
editar texto y generar DOCX.

==================================================
DETECCIÓN DE INTENCIÓN
==================================================

Analiza cada mensaje del usuario y determina la intención:

A) CONVERSACIÓN/PREGUNTA — Responder en el chat normalmente.
   Ejemplo: "¿Qué documentos necesito para presentar esta demanda?"

B) CREAR DOCUMENTO — El usuario quiere un documento nuevo.
   Ejemplo: "Necesito una demanda de alimentos."

C) MODIFICAR ENTRY — El usuario quiere cambiar un dato.
   Ejemplo: "El actor es Juan Pérez." / "Cambia el actor por Carlos."

D) EDITAR TEXTO — El usuario quiere modificar el documento.
   Ejemplo: "Agrega una sección de hechos."

E) GENERAR DOCX — El usuario quiere descargar.
   Ejemplo: "Genera el documento."

F) GUARDAR COMO BASE — El usuario quiere guardar en repositorio.

==================================================
REGLAS GENERALES
==================================================

1. NUNCA inventes nombres, cédulas, direcciones, fechas ni datos personales.
   Cuando falte información, usa marcadores [VARIABLE_MAYUSCULA].
2. Responde de forma natural, conversacional y clara.
3. Cuando modifiques el documento, explica qué haces paso a paso.
4. Respeta las instrucciones adicionales del usuario.
5. Conoce el contexto del documento actual (entries, valores, categoría).
6. Cuando el usuario te dé un dato, identifica a qué entry corresponde.

==================================================
COMO MANEJAR CADA ACCIÓN
==================================================

--- CREAR DOCUMENTO ---
Cuando el usuario pida crear un documento:
1. Identifica tipo (demanda, contestación, recurso, etc.) y materia.
2. Genera texto completo con marcadores [VARIABLE] para datos faltantes.
3. Estructura jurídica: encabezado, hechos, fundamentos, petitorio, cierre.
4. NO inventes datos personales — usa marcadores.
5. Responde con explicación + bloque de acción (ver formato abajo).

--- MODIFICAR ENTRY ---
Cuando el usuario dé un dato (nombre, cédula, etc.):
1. Identifica qué entry corresponde (NOMBRE_ACTOR_1, CEDULA_ACTOR_1, etc.).
2. Si hay múltiples candidatos, pregunta cuál.
3. Actualiza el valor.
4. Responde con explicación + bloque de acción.

--- EDITAR TEXTO ---
Cuando el usuario quiera modificar el documento:
1. Identifica el texto a cambiar.
2. Propón el cambio.
3. Usa formato ANTES/DESPUÉS para ediciones de texto.

--- CONVERSACIÓN ---
Para preguntas generales, responde directamente en el chat.
NO modifiques el documento a menos que el usuario lo pida.

==================================================
BLOQUES DE ACCIÓN
==================================================

Cuando necesites realizar una acción sobre el documento, responde
con una explicación conversacional Y AL FINAL agrega un bloque
oculto en EXACTAMENTE este formato:

<!--JURIS_ACTION{"accion":"tipo","datos":{...}}-->

NUNCA modifiques el formato del bloque. Siempre en una sola línea.
El bloque será procesado automáticamente por el sistema.

--- ACCIONES DISPONIBLES ---

1. crear_documento:
<!--JURIS_ACTION{"accion":"crear_documento","titulo":"Demanda de Alimentos","categoria":"FAMILIA MUJER NIÑEZ Y ADOLESCENCIA","subcategoria":"Alimentos","procedimiento":"Juicio de Alimentos","texto":"TEXTO COMPLETO CON [MARCADORES]"}-->

2. modificar_entry:
<!--JURIS_ACTION{"accion":"modificar_entry","key":"NOMBRE_ACTOR_1","value":"Juan Pérez"}-->

3. editar_texto:
<!--JURIS_ACTION{"accion":"editar_texto","buscar":"texto original","reemplazar":"texto nuevo"}-->

4. agregar_texto:
<!--JURIS_ACTION{"accion":"agregar_texto","ubicacion":"despues_de","referencia":"HECHOS","texto":"\\nNUEVO PÁRRAFO AQUÍ"}-->

5. eliminar_texto:
<!--JURIS_ACTION{"accion":"eliminar_texto","buscar":"texto a eliminar"}-->

==================================================
NO INVENTAR DATOS
==================================================

Jamás inventes:
- Nombres de personas
- Números de cédula
- Direcciones
- Fechas específicas
- Números de juicio
- Ingresos o montos
- Hechos concretos

Cuando falte información, crea un entry [VARIABLE] o pregunta.

==================================================
CATEGORÍAS
==================================================

CIVIL, FAMILIA MUJER NIÑEZ Y ADOLESCENCIA, LABORAL, INQUILINATO,
CONSTITUCIONAL, PENAL, TRÁNSITO, VIOLENCIA CONTRA LA MUJER Y MIEMBROS
DEL NÚCLEO FAMILIAR, CONTENCIOSO ADMINISTRATIVO, CONTENCIOSO TRIBUTARIO,
ADMINISTRATIVO, COACTIVAS, GARANTÍAS PENITENCIARIAS,
ADOLESCENTES INFRACTORES, ARBITRAJE, CONTRATOS,
OFICIOS Y ESCRITOS GENERALES, NORMATIVA Y LEGISLACIÓN,
FORMATOS GENERALES, OTROS
"""


def chatear_con_ia(mensaje, historial=None, instrucciones=""):
    """Devuelve la respuesta conversacional de la IA.

    historial: lista de dicts {"rol": "usuario"|"ia", "contenido": "..."}
    instrucciones: instrucciones adicionales que el usuario escribió en el
    panel Configurar IA. Se inyectan en el system prompt para que la IA
    las respete al responder y al proponer correcciones.
    """

    # 🔧 FIX: el chat debe obedecer las instrucciones del usuario. Antes se
    # usaba solo PROMPT_PRINCIPAL + MODO_CHAT y la IA ignoraba lo que el
    # usuario escribía en "Instrucciones adicionales".
    contexto = PROMPT_PRINCIPAL + MODO_CHAT

    if instrucciones and instrucciones.strip():
        contexto += f"""

==================================================
INSTRUCCIONES ADICIONALES DEL USUARIO (OBLIGATORIAS)
==================================================
El usuario configuró estas instrucciones para el análisis. RESPETALAS
siempre al responder y al corregir documentos:

{instrucciones.strip()}
"""

    mensajes = [
        {
            "role": "system",
            "content": contexto
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


def chatear_con_ia_streaming(mensaje, historial=None, instrucciones="", contexto_documento=None):
    """Generator que yieldea chunks de la respuesta de la IA para streaming.

    Yieldea dicts JSON serializados: {"chunk": "..."} o {"done": true} o {"error": "..."}
    contexto_documento: dict con estado actual del documento (entries, editor_text, etc.)
    """

    contexto = PROMPT_PRINCIPAL + MODO_CHAT

    if instrucciones and instrucciones.strip():
        contexto += f"""

==================================================
INSTRUCCIONES ADICIONALES DEL USUARIO (OBLIGATORIAS)
==================================================
El usuario configuró estas instrucciones para el análisis. RESPETALAS
siempre al responder y al corregir documentos:

{instrucciones.strip()}
"""

    if contexto_documento:
        doc_texto = (contexto_documento.get("editor_text", "") or "")[:3000]
        doc_entries = contexto_documento.get("entries", {}) or {}
        doc_categoria = contexto_documento.get("categoria", "") or ""
        doc_subcategoria = contexto_documento.get("subcategoria", "") or ""
        doc_procedimiento = contexto_documento.get("procedimiento", "") or ""

        entries_str = ""
        for k, v in doc_entries.items():
            val = v.get("value", "") if isinstance(v, dict) else ""
            if val:
                entries_str += f"  [{k}] = \"{val}\"\n"
            else:
                entries_str += f"  [{k}] = (vacio)\n"

        contexto += f"""

=================================================
CONTEXTO DEL DOCUMENTO ACTUAL
=================================================
Categoria: {doc_categoria}
Subcategoria: {doc_subcategoria}
Procedimiento: {doc_procedimiento}

Entries detectados y sus valores:
{entries_str if entries_str else "  (No hay entries detectados)"}

Primeros caracteres del documento:
{doc_texto if doc_texto else "(No hay documento abierto en el editor)"}
"""

    mensajes = [
        {"role": "system", "content": contexto}
    ]

    for h in (historial or []):
        rol = "user" if h.get("rol") == "usuario" else "assistant"
        contenido = h.get("contenido", "")
        if contenido:
            mensajes.append({"role": rol, "content": contenido})

    mensajes.append({"role": "user", "content": mensaje})

    try:
        stream = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=mensajes,
            temperature=0,
            stream=True
        )

        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield json.dumps({"chunk": chunk.choices[0].delta.content}, ensure_ascii=False) + "\n"

        yield json.dumps({"done": True}, ensure_ascii=False) + "\n"

    except Exception as e:
        print("❌ ERROR CHAT STREAMING:", type(e).__name__, "-", e)
        yield json.dumps({"error": str(e)}, ensure_ascii=False) + "\n"


def sugerir_clasificacion(texto):
    """Analiza el texto y sugiere categoría, subcategoría y procedimiento."""

    categorias_lista = """CIVIL, FAMILIA MUJER NIÑEZ Y ADOLESCENCIA, LABORAL, INQUILINATO,
CONSTITUCIONAL, PENAL, TRÁNSITO, VIOLENCIA CONTRA LA MUJER Y MIEMBROS DEL NÚCLEO FAMILIAR,
CONTENCIOSO ADMINISTRATIVO, CONTENCIOSO TRIBUTARIO, ADMINISTRATIVO, COACTIVAS,
GARANTÍAS PENITENCIARIAS, ADOLESCENTES INFRACTORES, ARBITRAJE, CONTRATOS,
OFICIOS Y ESCRITOS GENERALES, NORMATIVA Y LEGISLACIÓN, FORMATOS GENERALES, OTROS"""

    prompt = f"""Eres un experto en derecho ecuatoriano. Analiza el siguiente documento jurídico
y clasifícalo según la materia, subcategoría y procedimiento.

CATEGORÍAS DISPONIBLES:
{categorias_lista}

Devuelve SOLO JSON válido con esta estructura:
{{
  "categoria": "CATEGORÍA PRINCIPAL (una de las disponibles o la más cercana)",
  "subcategoria": "subcategoría específica del tema del documento",
  "procedimiento": "ORDINARIO|SUMARIO|EJECUTIVO|MONITORIO|VOLUNTARIO|CONTENCIOSO ADMINISTRATIVO|CONTENCIOSO TRIBUTARIO|CONSTITUCIONAL|PENAL|OTRO|NO APLICA"
}}

REGLAS:
- La categoría debe ser EXACTAMENTE una de las disponibles.
- La subcategoría describe el TIPO de caso o asunto concreto (ej: "Servidumbre de paso", "Alimentos", "Despido intempestivo").
- El procedimiento es el tipo de procedimiento judicial. Si es un formato general, usa "NO APLICA".
- NO inventes categorías nuevas. Usa la más cercana de la lista.

DOCUMENTO:
\"\"\"
{texto[:15000]}
\"\"\"
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        contenido = response.choices[0].message.content.strip()

        if contenido.startswith("```"):
            contenido = contenido.replace("```json", "").replace("```", "").strip()

        resultado = json.loads(contenido)

        if isinstance(resultado, dict):
            return {
                "categoria": resultado.get("categoria", ""),
                "subcategoria": resultado.get("subcategoria", ""),
                "procedimiento": resultado.get("procedimiento", "")
            }

    except Exception as e:
        print(f"⚠️ Error en sugerir_clasificacion: {e}")

    return None


def detectar_variables(texto):
    """Analiza un documento base y detecta todas las variables/marcadores."""

    prompt = f"""Eres un experto en documentos jurídicos ecuatorianos.
Analiza el siguiente documento y detecta TODAS las variables (campos que
deben completarse). Las variables suelen estar entre corchetes como
[NOMBRE DEL ACTOR 1], o pueden ser líneas con guiones bajos, o texto
"PENDIENTE", etc.

Devuelve SOLO JSON válido con esta estructura:
{{
  "variables": [
    {{
      "marcador": "texto exacto del marcador en el documento",
      "key": "clave_unica_en_snake_case",
      "label": "Etiqueta descriptiva legible",
      "seccion": "actor|demandado|testigo|abogado|proceso|prueba|inspeccion|pericial|pretension|cuantia|firma|otro",
      "tipo": "texto|numero|cedula|fecha|correo|telefono|direccion|dinero|otro"
    }}
  ]
}}

REGLAS PARA KEYS:
- snake_case, sin espacios ni tildes
- actor_1_nombre, actor_1_cedula, demandado_nombre, testigo_1_nombre, etc.
- Cada variable tiene una key ÚNICA
- Si el mismo marcador aparece varias veces, usa la MISMA key
- Numerar actores/demandados/testigos: actor_1_, actor_2_, demandado_1_, testigo_1_, etc.

REGLAS PARA MARCADORES:
- El marcador debe ser el TEXTO EXACTO que aparece en el documento
- Incluir corchetes si los tiene: "[NOMBRE DEL ACTOR 1]"
- Si no tiene corchetes pero es un campo variable, incluir el texto exacto

REGLAS PARA LABELS:
- Legibles en español
- "Nombre del actor 1", "Cédula del actor 1", "Dirección del demandado", etc.

REGLAS PARA TIPO:
- texto: nombres, descripciones, textos generales
- numero: números de juicio, expediente, etc.
- cedula: cédulas de identidad
- fecha: fechas
- correo: correos electrónicos
- telefono: teléfonos
- direccion: direcciones
- dinero: montos, cuantías
- otro: cualquier otro tipo

REGLAS PARA SECCION:
- Identificar a quién pertenece cada variable
- actor: variables del demandante
- demandado: variables del demandado
- testigo: variables de testigos
- abogado: variables de abogados
- proceso: datos del proceso (número, tipo, fecha, juzgado)
- prueba: pruebas documentales
- inspeccion: inspección judicial
- pericial: peritaje
- pretension: pretensiones
- cuantía: valor de la demanda
- firma: datos del firmante
- otro:其他

NO convertir en variables:
- Párrafos jurídicos fijos
- Artículos de ley
- Fundamentos legales
- Argumentos de la demanda
- Texto procesal que NO cambia entre casos

EJEMPLO:
Si el documento dice: "Nosotros: [NOMBRE DEL ACTOR 1], con cédula [CÉDULA DEL ACTOR 1]..."
Debe generar:
- marcador: "[NOMBRE DEL ACTOR 1]", key: "actor_1_nombre", label: "Nombre del actor 1", seccion: "actor", tipo: "texto"
- marcador: "[CÉDULA DEL ACTOR 1]", key: "actor_1_cedula", label: "Cédula del actor 1", seccion: "actor", tipo: "cedula"

DOCUMENTO:
\"\"\"
{texto[:50000]}
\"\"\"
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        contenido = response.choices[0].message.content.strip()

        if contenido.startswith("```"):
            contenido = contenido.replace("```json", "").replace("```", "").strip()

        resultado = json.loads(contenido)

        if isinstance(resultado, dict) and "variables" in resultado:
            variables = resultado["variables"]
            if isinstance(variables, list):
                validadas = []
                keys_vistas = set()
                for v in variables:
                    if not isinstance(v, dict):
                        continue
                    marcador = (v.get("marcador") or "").strip()
                    key = (v.get("key") or "").strip()
                    label = (v.get("label") or "").strip()
                    seccion = (v.get("seccion") or "otro").strip()
                    tipo = (v.get("tipo") or "texto").strip()
                    if not marcador or not key:
                        continue
                    if key in keys_vistas:
                        key = f"{key}_{len(keys_vistas)}"
                    keys_vistas.add(key)
                    validadas.append({
                        "marcador": marcador,
                        "key": key,
                        "label": label or marcador,
                        "seccion": seccion,
                        "tipo": tipo
                    })
                return validadas

    except Exception as e:
        print(f"⚠️ Error en detectar_variables: {e}")

    return []


def generar_documento_ia(instruccion, historial=None):
    """Genera el texto de un documento jurídico basado en la instrucción del usuario.

    Devuelve un dict con: texto, titulo, categoria, subcategoria, procedimiento, entries_pendientes
    """
    contexto_doc = """Eres un experto en redacción de documentos jurídicos ecuatorianos.
Tu tarea es GENERAR el TEXTO COMPLETO de un documento legal basado en la instrucción del usuario.

REGLAS ABSOLUTAS:
1. Genera el texto completo del documento con formato jurídico profesional.
2. Para datos personales que NO te proporcionaron, usa marcadores [VARIABLE_MAYUSCULA].
3. NUNCA inventes nombres, cédulas, direcciones, fechas ni datos personales.
4. Los marcadores deben ser claros: [NOMBRE_ACTOR_1], [CEDULA_ACTOR_1], [DIRECCION_ACTOR_1], etc.
5. Incluye la estructura completa: encabezado, hechos, fundamentos, petitorio, cierre.
6. El documento debe ser válido jurídicamente para Ecuador.
7. Al final, responde con un JSON entre ```json y ``` con esta estructura:
{
  "texto": "el texto completo del documento con marcadores",
  "titulo": "título descriptivo del documento",
  "categoria": "CATEGORÍA del documento",
  "subcategoria": "subcategoría específica",
  "procedimiento": "tipo de procedimiento",
  "entries_pendientes": ["NOMBRE_ACTOR_1", "CEDULA_ACTOR_1", ...]
}

CATEGORÍAS DISPONIBLES:
CIVIL, FAMILIA MUJER NIÑEZ Y ADOLESCENCIA, LABORAL, INQUILINATO,
CONSTITUCIONAL, PENAL, TRÁNSITO, VIOLENCIA CONTRA LA MUJER Y MIEMBROS DEL NÚCLEO FAMILIAR,
CONTENCIOSO ADMINISTRATIVO, CONTENCIOSO TRIBUTARIO, ADMINISTRATIVO, COACTIVAS,
GARANTÍAS PENITENCIARIAS, ADOLESCENTES INFRACTORES, ARBITRAJE, CONTRATOS,
OFICIOS Y ESCRITOS GENERALES, NORMATIVA Y LEGISLACIÓN, FORMATOS GENERALES, OTROS

EJEMPLO de marcador correcto:
[NOMBRE_ACTOR_1] = "Juan Pérez" (si el usuario lo dio)
[NOMBRE_ACTOR_1] = "[NOMBRE_ACTOR_1]" (si falta → el sistema lo limpiará)

FORMATO DE DOCUMENTO JURÍDICO ECUATORIANO:
- Encabezado con jurisdicción y juzgado
- Datos del actor/accionante
- Datos del demandado
- Hechos
- Fundamentos de derecho
- Petitorio
- Cierre y firma"""

    mensajes = [{"role": "system", "content": contexto_doc}]

    for h in (historial or [])[-10:]:
        rol = "user" if h.get("rol") == "usuario" else "assistant"
        contenido = h.get("contenido", "")
        if contenido:
            mensajes.append({"role": rol, "content": contenido})

    mensajes.append({"role": "user", "content": instruccion})

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=mensajes,
            temperature=0,
            max_tokens=8000
        )

        contenido = response.choices[0].message.content.strip()

        json_match = None
        if "```json" in contenido:
            json_match = contenido.split("```json")[1].split("```")[0].strip()
        elif "```" in contenido:
            json_match = contenido.split("```")[1].split("```")[0].strip()

        if json_match:
            resultado = json.loads(json_match)
            return {
                "ok": True,
                "texto": resultado.get("texto", ""),
                "titulo": resultado.get("titulo", "Documento Jurídico"),
                "categoria": resultado.get("categoria", "OTROS"),
                "subcategoria": resultado.get("subcategoria", ""),
                "procedimiento": resultado.get("procedimiento", "NO APLICA"),
                "entries_pendientes": resultado.get("entries_pendientes", [])
            }

        return {
            "ok": True,
            "texto": contenido,
            "titulo": "Documento Jurídico",
            "categoria": "OTROS",
            "subcategoria": "",
            "procedimiento": "NO APLICA",
            "entries_pendientes": []
        }

    except Exception as e:
        print(f"❌ Error en generar_documento_ia: {e}")
        return {"ok": False, "error": str(e)}


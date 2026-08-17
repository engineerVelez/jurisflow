const VERSION_SCRIPT = 137;
console.log("🔥 VERSION NUEVA 🔥 v" + VERSION_SCRIPT);

document.addEventListener("DOMContentLoaded", () => {
    const b = document.getElementById("version-badge");
    if (b) b.textContent = "v" + VERSION_SCRIPT;
});

console.log("SCRIPT NUEVO CARGADO");
let textoBase = "";
let documentoRestaurado = false;
let archivoActual = "";
let documentoId = ""; // 🔧 NUEVO: id estable que devuelve el backend (/upload)

let documentoBaseId = "";
let casoId = "";
let documentosBaseCache = [];
let repoCategoriaActual = "TODOS";
let docBaseSeleccionado = null;
let configuracionActual = null;

// ============================================================
// 📚 CLASIFICACIÓN JURÍDICA ECUATORIANA
// ============================================================

const CATEGORIAS_PRINCIPALES = [
    "CIVIL",
    "FAMILIA, MUJER, NIÑEZ Y ADOLESCENCIA",
    "LABORAL",
    "INQUILINATO",
    "CONSTITUCIONAL",
    "PENAL",
    "TRÁNSITO",
    "VIOLENCIA CONTRA LA MUJER Y MIEMBROS DEL NÚCLEO FAMILIAR",
    "CONTENCIOSO ADMINISTRATIVO",
    "CONTENCIOSO TRIBUTARIO",
    "ADMINISTRATIVO",
    "COACTIVAS",
    "GARANTÍAS PENITENCIARIAS",
    "ADOLESCENTES INFRACTORES",
    "ARBITRAJE",
    "CONTRATOS",
    "OFICIOS Y ESCRITOS GENERALES",
    "NORMATIVA Y LEGISLACIÓN",
    "FORMATOS GENERALES",
    "OTROS"
];

const SUBCATEGORIAS = {
    "CIVIL": [
        "Servidumbre de paso",
        "Reivindicación",
        "Prescripción adquisitiva de dominio",
        "Posesión",
        "Desalojo",
        "Incumplimiento de contrato",
        "Cumplimiento de contrato",
        "Resolución de contrato",
        "Daños y perjuicios",
        "Obligaciones",
        "Propiedad",
        "Derechos reales",
        "Linderos",
        "Interdictos",
        "Medidas cautelares",
        "Otros"
    ],
    "FAMILIA, MUJER, NIÑEZ Y ADOLESCENCIA": [
        "Alimentos",
        "Divorcio",
        "Unión de hecho",
        "Tenencia",
        "Régimen de visitas",
        "Patria potestad",
        "Impugnación de paternidad",
        "Declaración de paternidad",
        "Curaduría",
        "Tutela",
        "Adopción",
        "Otros"
    ],
    "LABORAL": [
        "Despido intempestivo",
        "Despido ineficaz",
        "Haberes laborales",
        "Indemnización laboral",
        "Utilidades",
        "Desahucio",
        "Contrato laboral",
        "Otros"
    ],
    "INQUILINATO": [
        "Desalojo",
        "Terminación de contrato de arrendamiento",
        "Incumplimiento de arrendamiento",
        "Cobro de cánones",
        "Otros"
    ],
    "CONSTITUCIONAL": [
        "Acción de protección",
        "Hábeas corpus",
        "Hábeas data",
        "Acceso a la información pública",
        "Acción por incumplimiento",
        "Otros"
    ],
    "PENAL": [
        "Denuncia",
        "Querella",
        "Escritos penales",
        "Fiscalía",
        "Medidas de protección",
        "Otros"
    ],
    "TRÁNSITO": [
        "Contravenciones",
        "Accidentes de tránsito",
        "Impugnaciones",
        "Otros"
    ],
    "VIOLENCIA CONTRA LA MUJER Y MIEMBROS DEL NÚCLEO FAMILIAR": [
        "Medidas de protección",
        "Denuncia",
        "Orden de alejamiento",
        "Otros"
    ],
    "CONTENCIOSO ADMINISTRATIVO": [
        "Impugnación de actos administrativos",
        "Demandas contencioso administrativas",
        "Otros"
    ],
    "CONTENCIOSO TRIBUTARIO": [
        "Impugnación tributaria",
        "Reclamos tributarios",
        "Otros"
    ],
    "ADMINISTRATIVO": [
        "Peticiones",
        "Recursos",
        "Solicitudes",
        "Otros"
    ],
    "COACTIVAS": [
        "Mandato de ejecución",
        "Embargo",
        "Remate",
        "Otros"
    ],
    "GARANTÍAS PENITENCIARIAS": [
        "Libertad condicional",
        "Redención de pena",
        "Hábeas corpus penitenciario",
        "Otros"
    ],
    "ADOLESCENTES INFRACTORES": [
        "Medidas socioeducativas",
        "Internamiento",
        " Libertad asistida",
        "Otros"
    ],
    "ARBITRAJE": [
        "Demanda arbitral",
        "Contestación",
        "Escritos",
        "Prueba",
        "Alegatos",
        "Otros"
    ],
    "CONTRATOS": [
        "Compraventa",
        "Arrendamiento",
        "Prestación de servicios",
        "Contrato laboral",
        "Contratos civiles",
        "Contratos mercantiles",
        "Otros"
    ],
    "NORMATIVA Y LEGISLACIÓN": [
        "COGEP",
        "Código Civil",
        "Código del Trabajo",
        "COIP",
        "Constitución",
        "Leyes",
        "Reglamentos",
        "Jurisprudencia"
    ],
    "OFICIOS Y ESCRITOS GENERALES": [
        "Oficio",
        "Solicitud",
        "Petición",
        "Escrito",
        "Contestación",
        "Aclaración",
        "Otros"
    ],
    "FORMATOS GENERALES": [
        "Formato de demanda",
        "Formato de contestación",
        "Formato de recurso",
        "Formato de solicitud",
        "Formato de poder",
        "Otros"
    ],
    "OTROS": [
        "Otros"
    ]
};

const PROCEDIMIENTOS = [
    "ORDINARIO",
    "SUMARIO",
    "EJECUTIVO",
    "MONITORIO",
    "VOLUNTARIO",
    "CONTENCIOSO ADMINISTRATIVO",
    "CONTENCIOSO TRIBUTARIO",
    "CONSTITUCIONAL",
    "PENAL",
    "OTRO",
    "NO APLICA"
];

let memoriaDocs = {
    documentos: {}
};

// ============================================================
// 🔙 DESHACER (Ctrl+Z)
// El editor es contenteditable y la app reemplaza innerHTML con
// frecuencia (blur, resaltado, toggle), lo que borra el historial
// nativo del navegador. Aquí se mantiene un historial PROPIO de
// "antes de" cada cambio: ráfagas de tipeo + re-renderizados.
// ============================================================
let historialUndo = [];
const MAX_UNDO = 50;
let editandoEnEditor = false;
let estadoAntesEdicion = null;
let timerFinEdicion = null;
let timerResaltarTipo = null;
// 🔧 último valor del Entry de tipo de juicio que se aplicó al documento:
// sirve para NO tocar el texto del documento cuando el Entry no cambió.
let ultimoValorTipo = "";

function capturarEstadoUndo() {
    const editor = document.getElementById("editor");
    const estado = {
        html: editor.innerHTML,
        resaltadoActivo: resaltadoActivo,
        textoBase: textoBase,
        textoConResaltado: textoConResaltado,
        entradas: {}
    };
    document.querySelectorAll(".entry-input").forEach(inp => {
        estado.entradas[inp.id] = inp.value;
    });
    return estado;
}

function igualEstado(a, b) {
    if (!a || !b) return false;
    if (a.html !== b.html) return false;
    if (a.resaltadoActivo !== b.resaltadoActivo) return false;
    return JSON.stringify(a.entradas) === JSON.stringify(b.entradas);
}

function empujarUndo(estado) {
    const ultimo = historialUndo[historialUndo.length - 1];
    if (ultimo && igualEstado(ultimo, estado)) return;
    historialUndo.push(estado);
    if (historialUndo.length > MAX_UNDO) historialUndo.shift();
}

function comprometerEdicion() {
    // cierra la ráfaga de tipeo pendiente: empuja el estado previo a
    // escribir (una sola "edición" agrupa todo el tipeo seguido)
    if (timerFinEdicion) {
        clearTimeout(timerFinEdicion);
        timerFinEdicion = null;
    }
    if (editandoEnEditor && estadoAntesEdicion) {
        empujarUndo(estadoAntesEdicion);
        editandoEnEditor = false;
        estadoAntesEdicion = null;
    }
}

function guardarUndo() {
    // guarda el estado ACTUAL como "antes de" la próxima acción discreta
    // (se llama en blur, btn-rojo, re-render) ANTES de aplicar el cambio
    empujarUndo(capturarEstadoUndo());
}

function deshacerUndo() {
    comprometerEdicion();
    const estado = historialUndo.pop();
    if (!estado) return;

    const editor = document.getElementById("editor");
    editor.innerHTML = estado.html;
    resaltadoActivo = estado.resaltadoActivo;
    textoBase = estado.textoBase;
    textoConResaltado = estado.textoConResaltado;

    Object.entries(estado.entradas).forEach(([key, valor]) => {
        const inp = document.getElementById(key);
        if (inp) inp.value = valor;
    });

    const id = idMemoria();
    if (id && memoriaDocs.documentos[id]) {
        memoriaDocs.documentos[id].campos = { ...estado.entradas };
    }

    guardarEstado();
    guardarEstadoEditor();
    guardarMemoriaDocs();
}

function normalizarTextoParaHash(texto) {
    return texto
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\w\s]/g, "")
        .trim();
}

function generarID(texto) {
    const limpio = normalizarTextoParaHash(texto);
    return btoa(limpio).slice(0, 50);
}

// 🔧 NUEVO: id único por CADA aparición resaltada de un nombre.
// Permite tener varias apariciones distintas del mismo actor sin
// depender solo de data-key, y editar/reemplazar solo las que
// corresponden.
let instanceCounter = 0;
function generarInstanceId() {
    instanceCounter += 1;
    return `inst-${Date.now()}-${instanceCounter}`;
}
function cargarMemoriaDocs() {
    const data = localStorage.getItem("memoria_docs");
    if (data) memoriaDocs = JSON.parse(data);
}

function guardarMemoriaDocs() {
    localStorage.setItem("memoria_docs", JSON.stringify(memoriaDocs));
}


document.addEventListener("DOMContentLoaded", () => {
    cargarMemoriaDocs();

    const editor = document.getElementById("editor");

    editor.addEventListener("input", () => {
        // 🔙 DESHACER: la primera tecla de una ráfaga guarda el estado
        // previo; 800ms sin escribir empuja ese estado al historial
        // (toda la ráfaga = una sola edición deshacible).
        if (!editandoEnEditor) {
            editandoEnEditor = true;
            estadoAntesEdicion = capturarEstadoUndo();
        }
        if (timerFinEdicion) clearTimeout(timerFinEdicion);
        timerFinEdicion = setTimeout(() => {
            timerFinEdicion = null;
            if (editandoEnEditor) {
                empujarUndo(estadoAntesEdicion);
                editandoEnEditor = false;
                estadoAntesEdicion = null;
            }
        }, 800);

        guardarEstadoEditor();
        programarGuardado();
        guardarEstado();
    });

    document.addEventListener("keydown", (e) => {
        // 🔙 DESHACER con Ctrl+Z (Ctrl mayúscula incluida)
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === "z" || e.key === "Z")) {
            e.preventDefault();
            deshacerUndo();
        }
    });

});

function dividirPartes(texto) {

    const partes = texto.split(/demandado|demandada/i);

    return {
        actor: partes[0] || "",
        demandado: partes[1] || ""
    };
}

// 🔧 NUEVO: llena TODOS los Entry a partir de los datos de la IA para
// el documento actual. Se usa tanto para documentos nuevos como como
// PRIMER PASO al restaurar un documento existente (así ningún campo
// se queda con basura de una sesión anterior con otro documento;
// después, si corresponde, se superponen encima las correcciones
// manuales guardadas para ESE documento).
function setValor(id, valor) {
    const el = document.getElementById(id);
    if (el) el.value = valor || "";
}

function llenarEntriesDesdeIA(datosIA) {
    datosIA = datosIA || {};

    // Soporta DOS formatos de "datos":
    //  - IA (anidado): actor: {nombre, cedula, direccion:{...}}, demandado: {...}
    //  - manual (plano): actor: "NOMBRE", cedula: "131...", calle_principal_actor: ...
    const esObj = v => v && typeof v === "object" && !Array.isArray(v);
    const actorDict = esObj(datosIA.actor) ? datosIA.actor : null;
    const demandadoDict = esObj(datosIA.demandado) ? datosIA.demandado : null;
    const actorTexto = typeof datosIA.actor === "string" ? datosIA.actor : "";
    const demandadoTexto = typeof datosIA.demandado === "string" ? datosIA.demandado : "";

    // 🔧 FIX: preferir el valor que trae la IA, pero si está VACÍO usar el
    // detectado por regex (datos fusionados). Antes el valor regex quedaba
    // descartado y campos como calles/cédulas quedaban vacíos cuando la IA
    // no los devolvía.
    const mejor = (v1, v2) => (v1 && String(v1).trim()) ? v1 : (v2 || "");

    for (let i = 1; i <= 5; i++) {
        setValor(`nombre_testigo${i}`, limpiarNombre(datosIA[`nombre_testigo${i}`]));
        setValor(`cedula_testigo${i}`, datosIA[`cedula_testigo${i}`]);
        setValor(`direccion_testigo${i}`, datosIA[`direccion_testigo${i}`]);
        setValor(`parroquia_testigo${i}`, datosIA[`parroquia_testigo${i}`]);
        setValor(`ciudad_testigo${i}`, datosIA[`ciudad_testigo${i}`]);
        setValor(`email_testigo${i}`, datosIA[`email_testigo${i}`]);
        setValor(`objeto_testigo${i}`, datosIA[`objeto_testigo${i}`]);
    }

    setValor("actor", limpiarNombre(mejor(actorDict && actorDict.nombre, actorTexto)));
    setValor("cedula", mejor(actorDict && actorDict.cedula, datosIA.cedula));
    setValor("age", mejor(actorDict && actorDict.edad, datosIA.age));
    setValor("civil", mejor(actorDict && actorDict.estado_civil, datosIA.civil));
    setValor("profesion", mejor(actorDict && actorDict.profesion, datosIA.profesion));
    setValor("ciudadania", mejor(actorDict && actorDict.ciudadania, datosIA.ciudadania));
    setValor("email", mejor(actorDict && actorDict.email, datosIA.email));
    setValor("telefono_actor", mejor(actorDict && actorDict.telefono, datosIA.telefono_actor));

    const ad = actorDict ? actorDict.direccion : null;
    setValor("parroquia_actor", mejor(ad && ad.parroquia, datosIA.parroquia_actor));
    setValor("barrio_actor", mejor(ad && ad.barrio, datosIA.barrio_actor));
    setValor("calle_principal_actor", mejor(ad && ad.calle_principal, datosIA.calle_principal_actor));
    setValor("calle_secundaria_actor", mejor(ad && ad.calle_secundaria, datosIA.calle_secundaria_actor));
    setValor("numero_casa_actor", mejor(ad && ad.numero_casa, datosIA.numero_casa_actor));
    setValor("codigo_postal_actor", mejor(ad && ad.codigo_postal, datosIA.codigo_postal_actor));

    setValor("nombre_demandado", limpiarNombre(mejor(demandadoDict && demandadoDict.nombre, demandadoTexto || datosIA.nombre_demandado)));
    setValor("cedula_demandado", mejor(demandadoDict && demandadoDict.cedula, datosIA.cedula_demandado));
    setValor("email_demandado", mejor(demandadoDict && demandadoDict.email, datosIA.email_demandado));
    setValor("telefono_demandado", mejor(demandadoDict && demandadoDict.telefono, datosIA.telefono_demandado));

    const dd = demandadoDict ? demandadoDict.direccion : null;
    setValor("parroquia_demandado", mejor(dd && dd.parroquia, datosIA.parroquia_demandado));
    setValor("barrio_demandado", mejor(dd && dd.barrio, datosIA.barrio_demandado));
    setValor("calle_principal_demandado", mejor(dd && dd.calle_principal, datosIA.calle_principal_demandado));
    setValor("calle_secundaria_demandado", mejor(dd && dd.calle_secundaria, datosIA.calle_secundaria_demandado));
    setValor("numero_casa_demandado", mejor(dd && dd.numero_casa, datosIA.numero_casa_demandado));
    setValor("codigo_postal_demandado", mejor(dd && dd.codigo_postal, datosIA.codigo_postal_demandado));

    setValor("numero_juicio", datosIA.numero_juicio);
    setValor("tipo_juicio", datosIA.tipo_juicio);
}


function detectarCampos(texto) {
    const datos = {};

    const cedula = texto.match(/\b\d{10}\b/);
    if (cedula) datos.cedula = cedula[0];

    const edad = texto.match(/(\d{2})\s*años/);
    if (edad) datos.age = edad[1];

    const civil = texto.match(/(soltero|casado|divorciado|viudo)/i);
    if (civil) datos.civil = civil[0];

    const email = texto.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
    if (email) datos.email = email[0];

    const tel = texto.match(/\b09\d{8}\b/);
    if (tel) datos.telefono_actor = tel[0];

    const parroquia = texto.match(/parroquia\s+([a-zA-Záéíóúñ\s]+)/i);
    if (parroquia) datos.parroquia_actor = parroquia[1].trim();

    const barrio = texto.match(/barrio\s+([a-zA-Záéíóúñ\s]+)/i);
    if (barrio) datos.barrio_actor = barrio[1].trim();

    const calle1 = texto.match(/calle\s+principal\s+([a-zA-Z0-9\s]+)/i);
    if (calle1) datos.calle_principal_actor = calle1[1].trim();

    const calle2 = texto.match(/calle\s+secundaria\s+([a-zA-Z0-9\s]+)/i);
    if (calle2) datos.calle_secundaria_actor = calle2[1].trim();

    const numero = texto.match(/n[uú]mero\s+(\w+)/i);
    if (numero) datos.numero_casa_actor = numero[1];

    const cp = texto.match(/c[oó]digo\s+postal\s+(\d{5,6})/i);
    if (cp) datos.codigo_postal_actor = cp[0];

    return datos;
}

function detectarCamposDemandado(texto) {
    const datos = {};

    const cedula = texto.match(/\b\d{10}\b/);
    if (cedula) datos.cedula_demandado = cedula[0];

    const email = texto.match(/[^\s]+@[^\s]+\.[^\s]+/);
    if (email) datos.email_demandado = email[0];

    const tel = texto.match(/\b09\d{8}\b/);
    if (tel) datos.telefono_demandado = tel[0];

    const barrio = texto.match(/barrio\s+([a-zA-Záéíóúñ\s]+)/i);
    if (barrio) datos.barrio_demandado = barrio[1].trim();

    const calle1 = texto.match(/calle\s+principal\s+([a-zA-Z0-9\s]+)/i);
    if (calle1) datos.calle_principal_demandado = calle1[1].trim();

    const calle2 = texto.match(/calle\s+secundaria\s+([a-zA-Z0-9\s]+)/i);
    if (calle2) datos.calle_secundaria_demandado = calle2[1].trim();

    const numero = texto.match(/n[uú]mero\s+(\w+)/i);
    if (numero) datos.numero_casa_demandado = numero[1];

    const cp = texto.match(/c[oó]digo\s+postal\s+(\d{5,6})/i);
    if (cp) datos.codigo_postal_demandado = cp[0];

    return datos;
}

function limpiarSpans(html) {
    return html.replace(/<span[^>]*>(.*?)<\/span>/gi, "$1");
}


function limpiarNombre(nombre) {
    if (!nombre) return "";

    return nombre
        .toLowerCase()
        .replace(/[^a-záéíóúñ\s]/gi, "")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// ============================================================
// 🔧 Detección INICIAL de nombres (solo se usa cuando el key
// todavía no tiene ninguna aparición marcada en el editor).
// RESALTADO INTELIGENTE: se generan TODAS las combinaciones de
// palabras del nombre (SALTANDO palabras intermedias), de 2
// palabras hacia arriba más el nombre completo, en orden normal
// e invertido. Así "MARIA CAROLINA CASTAÑEDA CRUZ" también se
// resalta si aparece como "MARIA CASTAÑEDA", "Carolina Castañeda
// Cruz" o "CASTAÑEDA CRUZ MARIA CAROLINA", y un nombre INCOMPLETO
// que devuelva la IA (p.ej. "Maria castañeda") sigue resaltando la
// mención completa del documento.
// La búsqueda NO distingue tildes ni mayúsculas (Castañeda ==
// CASTANEDA), y SI incluye títulos que van antes del nombre
// (SR., SRA., DR., ING., AB., LCDO., etc.).
// NO agarra:
//   - correos electrónicos (se excluye solo el email, no el nodo)
//   - nombres precedidos de contexto de dirección (calle, av.,
//     avenida, pasaje, ciudadela, etc.)
//   - palabras sueltas (siempre 2+ palabras juntas)
// Cada aparición encontrada se marca con data-instance-id único,
// para poder distinguir apariciones individuales del mismo key.
// ============================================================
function resaltarNombrePorPalabras(key, valorCompleto) {
    const editor = document.getElementById("editor");
    if (!editor || !valorCompleto || !valorCompleto.trim()) return;

    const color = obtenerColor(key);

    const palabras = valorCompleto.trim().split(/\s+/).filter(p => p.length > 0);
    if (palabras.length === 0) return;

    // combinaciones de palabras en orden (PERMITIENDO saltos): así
    // "MARIA CAROLINA CASTAÑEDA CRUZ" genera "MARIA CASTAÑEDA",
    // "MARIA CASTAÑEDA CRUZ", "CAROLINA CRUZ", "CASTAÑEDA CRUZ",
    // el nombre completo, etc., no solo las sub-secuencias contiguas.
    const secuencias = new Set();
    const n = palabras.length;
    const combos = [];
    function comb(start, actual) {
        if (actual.length >= 2) combos.push(actual.slice());
        for (let i = start; i < n; i++) {
            actual.push(i);
            comb(i + 1, actual);
            actual.pop();
        }
    }
    comb(0, []);
    // garantiza el nombre completo (necesario si el nombre es de 1 palabra)
    combos.push(palabras.map((_, i) => i));

    combos.forEach(idx => {
        secuencias.add(idx.map(i => palabras[i]).join(" "));
    });
    combos.forEach(idx => {
        secuencias.add([...idx].reverse().map(i => palabras[i]).join(" "));
    });

    // las secuencias con más palabras primero: el nombre completo gana
    // cuando comparte posición con una sub-secuencia suya
    const patrones = [...secuencias]
        .map(p => p.split(" "))
        .sort((a, b) => b.length - a.length);

    // quita tildes y pasa a minúsculas: "Castañeda" == "CASTANEDA"
    function normalizarTexto(t) {
        return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    // contexto de dirección: si antes del nombre hay "calle ", "av ",
    // "avenida ", "pasaje ", "ciudadela ", etc. (seguido de hasta 3
    // palabras) es una dirección, NO el nombre de la persona. Así
    // "Calle Los Ríos", "Av. 10 de Agosto" o "Pasaje José Pérez"
    // no se resaltan aunque coincidan con el nombre del actor.
    const reContextoCalle = /\b(?:calle|calzada|av|avenida|avda|pasaje|ciudadela|conjunto|urbanizacion|sector|edificio|via|callejon|manzana|kilometro|km|carretera|autopista|entrada|paso|vereda|camino)\b\.?(?:\s+\S+){0,3}\s*$/i;

    // títulos/tratamientos que suelen ir ANTES del nombre (SR., SRA.,
    // DR., ING., AB., LCDO., etc.). Se incluyen en el resaltado para que
    // el cliente vea la mención completa en el documento y pueda editarla
    // desde el Entry (texto ya normalizado: sin tildes, minúsculas).
    const reTitulo = /\b(?:senor|senora|senorita|sr|sra|srta|srt|srita|dr|dra|drc|doctor(?:a)?|doct|ing|inga|inge|ingen|ingenier(?:o|a|os)?|ab|abg|abgdo|abgda|abog|abogad(?:o|a)?|lic|licdo|licda|licen|lcd|lcdo|lcda|licenciad(?:o|a)?|arq|arquit|arqta|arquitect(?:o|a)?|ec|econ|economist(?:a)?|mgs|msc|magister|procurador(?:a)?|contador(?:a)?)\b\.?\s+$/i;

    // texto normalizado + mapa de índice normalizado -> índice original
    function normalizarConMapa(texto) {
        let norm = "";
        const mapa = [];
        for (let i = 0; i < texto.length; i++) {
            const base = texto[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            for (let k = 0; k < base.length; k++) {
                norm += base[k];
                mapa.push(i);
            }
        }
        return { norm: norm.toLowerCase(), mapa };
    }

    const walker = document.createTreeWalker(
        editor,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (nodo) => {
                if (nodo.parentNode.closest("span[data-key], span[data-protegido]")) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (!nodo.nodeValue || !nodo.nodeValue.trim()) {
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    );

    const nodosTexto = [];
    let nodo;
    while ((nodo = walker.nextNode())) nodosTexto.push(nodo);

    nodosTexto.forEach(textNode => {
        const texto = textNode.nodeValue;
        const { norm, mapa } = normalizarConMapa(texto);

        // solo se excluye el RANGO del email, nunca el nodo entero
        const emailRanges = [];
        const reEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi;
        let em;
        while ((em = reEmail.exec(norm)) !== null) {
            emailRanges.push([em.index, em.index + em[0].length]);
        }

        function sobreponeEmail(start, end) {
            for (const [s, e] of emailRanges) {
                if (start < e && end > s) return true;
            }
            return false;
        }

        function esContextoCalle(start) {
            const antes = norm.slice(Math.max(0, start - 40), start);
            return reContextoCalle.test(antes);
        }

        // si justo antes del nombre hay un título (SR., DR., ING., ...)
        // se incluye en la marca: "SR. VICENTE PALADINES" se resalta completo
        function extenderTitulo(start) {
            let s = start;
            for (let i = 0; i < 5; i++) {
                const antes = norm.slice(Math.max(0, s - 25), s);
                const m = reTitulo.exec(antes);
                if (!m) break;
                s -= m[0].length;
            }
            return s;
        }

        const matches = [];

        patrones.forEach(patron => {
            // entre palabra y palabra se permiten hasta 2 palabras
            // desconocidas: así un nombre incompleto de la IA como
            // "MARIA CASTAÑEDA" igual resalta "MARIA CAROLINA CASTAÑEDA CRUZ"
            const cuerpo = patron
                .map(normalizarTexto)
                .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('(?:\\s+\\S+){0,2}\\s+');
            const regex = new RegExp(
                `(?<![\\p{L}\\p{N}_])${cuerpo}(?![\\p{L}\\p{N}_])`,
                'giu'
            );
            let m;
            while ((m = regex.exec(norm)) !== null) {
                const start = m.index;
                const end = m.index + m[0].length;
                if (!sobreponeEmail(start, end)) {
                    // se incluye el título anterior y se vuelve a verificar
                    // el contexto de dirección con la marca ya extendida
                    const extStart = extenderTitulo(start);
                    if (!esContextoCalle(extStart)) {
                        matches.push({
                            start: extStart,
                            end,
                            origStart: mapa[extStart],
                            origEnd: mapa[end - 1] + 1,
                            text: texto.slice(mapa[extStart], mapa[end - 1] + 1)
                        });
                    }
                }
                if (m.index === regex.lastIndex) regex.lastIndex++;
            }
        });

        if (matches.length === 0) return;

        // primero por posición y, dentro de la misma posición, el más largo
        matches.sort((a, b) => a.start - b.start || b.end - a.end);
        const filtradas = [];
        let lastEnd = -1;
        for (const m of matches) {
            if (m.start >= lastEnd) {
                filtradas.push(m);
                lastEnd = m.end;
            }
        }

        const fragment = document.createDocumentFragment();
        let cursor = 0;
        filtradas.forEach(m => {
            if (m.origStart > cursor) {
                fragment.appendChild(document.createTextNode(texto.slice(cursor, m.origStart)));
            }
            const span = document.createElement("span");
            span.className = "var";
            span.dataset.key = key;
            span.dataset.instanceId = generarInstanceId();
            span.style.background = color;
            span.textContent = m.text;
            fragment.appendChild(span);
            cursor = m.origEnd;
        });
        if (cursor < texto.length) {
            fragment.appendChild(document.createTextNode(texto.slice(cursor)));
        }

        textNode.parentNode.replaceChild(fragment, textNode);
    });
}

// 🔧 FIX (prioridad de datos): la llave real de memoriaDocs debe ser el
// documento_id (hash del CONTENIDO, calculado en el backend), NO el
// nombre del archivo. Dos documentos distintos pueden compartir/repetir
// nombre de archivo, y eso hacía que se cargaran datos de un documento
// viejo sobre uno nuevo. Se mantiene archivoActual como fallback SOLO
// por si por algún motivo el backend no devolviera documento_id.
function idMemoria() {
    return documentoId || archivoActual;
}

function guardarCampoEnMemoria(key, valor) {
    const id = idMemoria();
    if (!id) return;

    if (!memoriaDocs.documentos[id]) {
        memoriaDocs.documentos[id] = {
            campos: {},
            resaltados: []
        };
    }

    memoriaDocs.documentos[id].campos[key] = valor;
    guardarMemoriaDocs();
}

async function extraerDireccionConIA(texto) {
    const response = await fetch("/ia-direccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto })
    });

    const data = await response.json();
    return data;
}


// 🔥 RESALTADO DOM SEGURO (campos normales: cédula, dirección, etc.)
function resaltarCoincidenciasDOM(key, valor, color) {

    const editor = document.getElementById("editor");
    if (!valor) return;

    const palabras = normalizar(valor).split(" ");

    const walker = document.createTreeWalker(
        editor,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let nodo;

    while ((nodo = walker.nextNode())) {

        if (nodo.parentNode.closest("span[data-key], span[data-protegido]")) continue;

        const textoOriginal = nodo.nodeValue;
        const textoNormalizado = normalizar(textoOriginal);

        let hayMatch = false;

        for (let p of palabras) {
            if (p.length >= 3 && textoNormalizado.includes(p)) {
                hayMatch = true;
                break;
            }
        }

        if (!hayMatch) continue;

        let partesFinales = [textoOriginal];

        palabras.forEach(p => {
            if (p.length < 3) return;

            const nuevasPartes = [];

            partesFinales.forEach(parte => {

                if (typeof parte !== "string") {
                    nuevasPartes.push(parte);
                    return;
                }

                // 🔧 límite de palabra (\b) para no resaltar fragmentos accidentales
                const regex = new RegExp(`\\b(${p})\\b`, "gi");

                if (!regex.test(normalizar(parte))) {
                    nuevasPartes.push(parte);
                    return;
                }

                const split = parte.split(regex);

                split.forEach(s => {
                    if (normalizar(s) === p) {

                        const span = document.createElement("span");
                        span.className = "var";
                        span.dataset.key = key;
                        span.style.background = color;
                        span.textContent = s;

                        nuevasPartes.push(span);

                    } else {
                        nuevasPartes.push(s);
                    }
                });
            });

            partesFinales = nuevasPartes;
        });

        const fragment = document.createDocumentFragment();

        partesFinales.forEach(parte => {
            if (typeof parte === "string") {
                fragment.appendChild(document.createTextNode(parte));
            } else {
                fragment.appendChild(parte);
            }
        });

        nodo.parentNode.replaceChild(fragment, nodo);
    }
}
document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Selecciona un archivo");
        return;
    }

    archivoActual = file.name;

    // 🔙 DESHACER: documento nuevo -> historial limpio
    historialUndo = [];

    // 🔧 LIMPIAR AL INSTANTE: cada archivo nuevo empieza SIN los datos
    // del anterior. Se borran TODOS los Entry de inmediato (no se espera
    // a la IA), así si el análisis no encuentra un campo, queda vacío y
    // nunca se muestra ni se guarda el valor del archivo anterior.
    document.querySelectorAll(".entry-input").forEach(input => {
        input.value = "";
    });
    ultimoValorTipo = "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", document.getElementById("promptIA")?.value || localStorage.getItem("promptIA") || "");

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            let detalle = "Error en servidor";
            try {
                const err = await response.json();
                if (err.detail) detalle = err.detail;
            } catch (e) {}
            throw new Error(detalle);
        }

        const data = await response.json();

        // 🔧 FIX (re-analizar desde el chat): se reutiliza la misma lógica
        // que aplica los datos de la IA al editor (entries, resaltado, etc.)
        aplicarDatosIA(data);

    } catch (error) {
        console.error(error);
        alert("Error al procesar el archivo: " + (error.message || "intenta de nuevo"));
    }
});

// 🔧 NUEVO: aplica la respuesta de la IA (upload o re-analizar) al editor:
// llena los Entry, pinta el texto, resalta los nombres y guarda estado.
// Se extrajo del submit para reutilizarla con "Aplicar a los análisis".
async function aplicarDatosIA(data) {
    const text = data.texto || "";

    // 🔎 TRAZADO: valor que DEVOLVIÓ la IA para el documento ACTUAL
    console.log("🤖 VALOR IA:", data.datos?.tipo_juicio);

    console.log("ENTRY ACTOR ANTES:", document.getElementById("actor")?.value);
    console.log("🧹 LIMPIANDO ENTRY");

    // 🔧 FIX: cada documento NUEVO SIEMPRE empieza con TODOS los Entry
    // vacíos. No se restaura memoria automáticamente en este flujo: los
    // únicos valores que pueden aparecer son los del documento ACTUAL
    // (IA/JSON). La memoria solo se usa en una restauración explícita
    // del documento guardado.
    document.querySelectorAll(".entry-input").forEach(input => {
        input.value = "";
    });

    documentoId = data.documento_id || "";
    cargarMemoriaDocs();

    console.log("🤖 DATOS IA ACTUALES:", data.datos);

    mostrarConfianza(data);

    textoBase = text;
    textoOriginal = data.texto_original || text;

    let texto = text;

    const partes = dividirPartes(texto);

    // 🔧 FIX (datos actor/demandado): cuando el documento NO contiene la
    // palabra "demandado" (p.ej. contestaciones donde quien comparece y
    // da sus datos es el demandado), el split no separa y TODO el texto
    // queda en la parte del actor: el regex metería los datos del
    // demandado (cédula, correo, barrio...) en los campos del ACTOR.
    // Para evitarlo, si la IA devolvió el nombre del demandado se
    // delimita la parte del actor hasta la primera mención de ese nombre.
    let actorTexto = partes.actor;
    const nombreDemandadoIA = (data.datos && (data.datos.demandado && data.datos.demandado.nombre || data.datos.nombre_demandado)) || "";
    if (!(partes.demandado || "").trim() && nombreDemandadoIA) {
        const idx = texto.toLowerCase().indexOf(nombreDemandadoIA.toLowerCase());
        if (idx > 0) actorTexto = texto.slice(0, idx);
        else if (idx === 0) actorTexto = "";
    }

    const actorDatos = detectarCampos(actorTexto);
    const demandadoDatos = detectarCamposDemandado(partes.demandado);

    // 🔧 FIX: fusionar la detección por regex (actorDatos/demandadoDatos)
    // con lo que devolvió la IA/manual. La IA gana en conflicto, pero si
    // un campo viene vacío, llenarEntriesDesdeIA usa el valor regex.
    let datos = {
        ...actorDatos,
        ...demandadoDatos,
        ...data.datos
    };

    const datosIA = data.datos || {};

    console.log("📝 CARGANDO ENTRY ACTUALES");

    // 🔎 TRAZADO: valor del Entry ANTES de asignar el JSON actual
    console.log("📝 ENTRY ANTES:", document.getElementById("tipo_juicio")?.value);

    // 🔧 FIX: se pasa el objeto FUSIONADO (regex + IA/manual) para que
    // las calles/cédulas detectadas por regex rellenen campos que la
    // IA dejó vacíos. Antes se pasaba solo data.datos y la detección
    // por regex quedaba descartada.
    llenarEntriesDesdeIA(datos);

    // 🔎 TRAZADO: valor del Entry DESPUÉS de asignar el JSON actual
    console.log("📝 ENTRY DESPUÉS:", document.getElementById("tipo_juicio")?.value);

    console.log("ENTRY ACTOR DESPUÉS:", document.getElementById("actor")?.value);

    const editor = document.getElementById("editor");

    // 🔧 RESTAURAR RESALTADOS: si el JSON guardado trae el HTML con los
    // resaltados (texto_html), se pinta tal cual para recuperar TODO el
    // resaltado (automáticos y manuales). Si no, se resalta desde cero
    // con los values actuales de los entries.
    const htmlConResaltado = data.texto_html && typeof data.texto_html === "string" && data.texto_html.trim();

    if (htmlConResaltado) {
        editor.innerHTML = data.texto_html;
        textoBase = texto;
        // 🔧 al restaurar un documento viejo, quitar calles/ciudades que
        // estuvieran resaltadas dentro del bloque del encabezado del juzgado
        // y volver a envolver el bloque protegido en el DOM
        limpiarResaltadosEnBloqueJuzgado();
        protegerBloqueJuzgadoEnDOM();
        console.log("🎨 HTML CON RESALTADOS RESTAURADO DESDE DRIVE");
    } else {
        texto = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        editor.innerHTML = texto;

        textoBase = texto;

        console.log("🎨 APLICANDO RESALTADO ACTUAL");
        resaltarGlobal();

        resaltarNombrePorPalabras("actor", document.getElementById("actor")?.value || "");
        resaltarNombrePorPalabras("nombre_demandado", document.getElementById("nombre_demandado")?.value || "");
    }

    guardarEstado();
    guardarEstadoEditor();
    guardarEnServidor();

    const idMem = idMemoria(); // 🔧 FIX: antes archivoActual (nombre de archivo)

    if (!memoriaDocs.documentos[idMem]) {
        memoriaDocs.documentos[idMem] = {
            campos: {},
            resaltados: []
        };
    }

    // 🔎 TRAZADO: valor del Entry justo ANTES de guardar la memoria
    console.log("💾 ENTRY ANTES DE GUARDAR:", document.getElementById("tipo_juicio")?.value);

    document.querySelectorAll(".entry-input").forEach(input => {
        memoriaDocs.documentos[idMem].campos[input.id] = input.value;
    });

    guardarMemoriaDocs();
}

let timerBannerConfianza;

// 🔧 NUEVO: genera un resumen ENTENDIBLE para el cliente a partir de los
// datos que reconoció la IA. Antes el banner solo decía "Se identificó el
// X% de los datos", sin decir QUÉ se reconoció.
function resumenLegible(datos) {
    datos = datos || {};

    const esObj = v => v && typeof v === "object" && !Array.isArray(v);
    const actorDict = esObj(datos.actor) ? datos.actor : null;
    const demandadoDict = esObj(datos.demandado) ? datos.demandado : null;
    const actorTexto = typeof datos.actor === "string" ? datos.actor : "";
    const demandadoTexto = typeof datos.demandado === "string" ? datos.demandado : "";

    const actor = (actorDict && actorDict.nombre) || actorTexto || "";
    const demandado = (demandadoDict && demandadoDict.nombre) || demandadoTexto || datos.nombre_demandado || "";

    const partes = [];

    if (actor) partes.push(`el actor ${actor}`);
    if (demandado) partes.push(`el demandado ${demandado}`);

    const cedula = (demandadoDict && demandadoDict.cedula) || datos.cedula_demandado
        || (actorDict && actorDict.cedula) || datos.cedula || "";
    if (cedula) partes.push(`la cédula ${cedula}`);

    const ad = actorDict ? actorDict.direccion : null;
    const dd = demandadoDict ? demandadoDict.direccion : null;
    const barrio = (dd && dd.barrio) || datos.barrio_demandado
        || (ad && ad.barrio) || datos.barrio_actor || "";
    if (barrio) partes.push(`el barrio ${barrio}`);

    const numeroJuicio = datos.numero_juicio || "";
    if (numeroJuicio) partes.push(`el número de juicio ${numeroJuicio}`);

    if (partes.length === 0) {
        return "La IA no pudo identificar datos claros en el documento. Revísalo manualmente.";
    }

    const ultima = partes.pop();
    const resumen = partes.length ? partes.join(", ") + " y " + ultima : ultima;
    return "Se reconoció " + resumen + ".";
}

function mostrarConfianza(data) {
    const banner = document.getElementById("bannerConfianza");
    if (!banner) return;

    const pct = data.porcentaje;
    const msg = data.mensaje_confianza;

    if (typeof pct !== "number" && !msg) {
        banner.style.display = "none";
        return;
    }

    let color, icono;
    if (typeof pct === "number" && pct >= 70) {
        color = "#2E7D32";
        icono = "✅";
    } else if (typeof pct === "number" && pct >= 40) {
        color = "#F9A825";
        icono = "⚠️";
    } else {
        color = "#C62828";
        icono = "❌";
    }

    const resumen = resumenLegible(data.datos);
    const pctTexto = typeof pct === "number" ? ` (identificación ${pct}%)` : "";

    banner.style.display = "block";
    banner.style.background = color;
    banner.style.color = "#FFFFFF";
    banner.innerHTML = `<strong>${icono} ${resumen}</strong>${pctTexto}<br><small>⚠️ La IA puede cometer errores. Verifica los datos antes de usarlos.</small>`;

    clearTimeout(timerBannerConfianza);
    timerBannerConfianza = setTimeout(() => {
        banner.style.display = "none";
    }, 10000);
}
function abrirConfig() {
    document.getElementById("configPanel").style.display = "block";
}

function cerrarConfig() {
    document.getElementById("configPanel").style.display = "none";
}

function guardarPrompt() {
    const prompt = document.getElementById("promptIA").value;
    localStorage.setItem("promptIA", prompt);

    // 🔧 FIX: al guardar instrucciones nuevas se borra el chat anterior,
    // para que la IA no arrastre contexto viejo de otro prompt.
    historialChat = [];
    localStorage.removeItem("chatIA");
    cargarChat();

    alert("Instrucciones guardadas. El chat se reinició con el nuevo prompt.");
    cerrarConfig();
}

// ============================================================
// 🤖 CHAT CON LA IA (panel "Configurar IA")
// ============================================================
// El chat usa el PROMPT PRINCIPAL protegido del servidor. Las
// correcciones de la IA se pueden aplicar a los análisis con el botón
// "Aplicar a los análisis".
// ============================================================

let historialChat = [];

function cargarChat() {
    try {
        const h = JSON.parse(localStorage.getItem("chatIA") || "[]");
        historialChat = Array.isArray(h) ? h : [];
    } catch (e) {
        historialChat = [];
    }

    const cont = document.getElementById("chatIA");
    if (!cont) return;
    cont.innerHTML = "";

    if (historialChat.length === 0) {
        cont.innerHTML = '<div style="color:#94a3b8; font-style:italic;">Escribe un mensaje para hablar con la IA...</div>';
        return;
    }

    historialChat.forEach(m => agregarBurbujaChat(m.rol, m.contenido, false));
}

function guardarChatLocal() {
    localStorage.setItem("chatIA", JSON.stringify(historialChat.slice(-40)));
}

function escapeHTML(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function agregarBurbujaChat(rol, contenido, guardar) {
    const cont = document.getElementById("chatIA");
    if (!cont) return;

    const div = document.createElement("div");
    div.style.cssText = "margin:6px 0; padding:8px 10px; border-radius:8px; white-space:pre-wrap; word-break:break-word; font-size:13px;";

    if (rol === "usuario") {
        div.style.background = "#e3f2fd";
        div.style.textAlign = "right";
        div.textContent = "🧑 " + contenido;
    } else {
        div.style.background = "#ffffff";
        div.style.border = "1px solid #e2e8f0";
        div.innerHTML = "🤖 " + escapeHTML(contenido);

        const btn = document.createElement("button");
        btn.className = "btn btn-primary";
        btn.style.cssText = "margin-top:8px; font-size:12px; padding:6px 10px;";
        btn.textContent = "Aplicar a los análisis";
        btn.onclick = () => aplicarCorreccion(contenido);
        div.appendChild(btn);
    }

    cont.appendChild(div);
    cont.scrollTop = cont.scrollHeight;

    if (guardar) {
        historialChat.push({ rol, contenido });
        guardarChatLocal();
    }
}

async function enviarChat() {
    const input = document.getElementById("chatMensaje");
    const msg = (input.value || "").trim();
    if (!msg) return;

    input.value = "";
    agregarBurbujaChat("usuario", msg, true);

    try {
        const response = await fetch("/chat-ia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mensaje: msg,
                historial: historialChat,
                instrucciones: document.getElementById("promptIA")?.value || ""
            })
        });

        if (!response.ok) throw new Error("Error en servidor");

        const data = await response.json();
        agregarBurbujaChat("ia", data.respuesta || "Sin respuesta", true);
    } catch (error) {
        console.error(error);
        agregarBurbujaChat("ia", "Error al conectar con la IA. Intenta de nuevo.", true);
    }
}

async function aplicarCorreccion(texto) {
    const ta = document.getElementById("promptIA");
    if (!ta) return;

    const marcador = "INSTRUCCIÓN PARA ANÁLISIS:";
    const idx = texto.indexOf(marcador);
    let instruccion = idx !== -1
        ? texto.slice(idx + marcador.length).trim()
        : texto.trim();

    if (!instruccion) return;

    const actual = ta.value.trim();
    ta.value = actual ? actual + "\n- " + instruccion : "- " + instruccion;

    localStorage.setItem("promptIA", ta.value);

    // 🔧 FIX (nuevo): al aplicar una corrección, el documento ACTUAL se
    // re-analiza de inmediato con el nuevo prompt, para que el usuario
    // vea el cambio sin volver a subir el archivo. Antes solo se guardaba
    // la instrucción y había que re-subir el documento.
    if (textoBase && documentoId) {
        try {
            const response = await fetch("/reanalizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto: textoOriginal || textoBase,
                    prompt: ta.value,
                    documento_id: documentoId
                })
            });

            if (!response.ok) throw new Error("Error en servidor");

            const data = await response.json();
            aplicarDatosIA(data);
            alert("Corrección aplicada y el documento se reanalizó con las nuevas instrucciones.");
        } catch (error) {
            console.error(error);
            alert("Corrección guardada, pero hubo un error al re-analizar: " + (error.message || "intenta de nuevo"));
        }
    } else {
        alert("Corrección aplicada a los análisis.");
    }
}

function cargarInstrucciones() {
    const ta = document.getElementById("promptIA");
    if (!ta) return;
    ta.value = localStorage.getItem("promptIA") || "";
}


let resaltadoActivo = true;
let textoOriginal = "";
let textoConResaltado = "";
let valoresOriginales = {};


// ============================================================
// Listeners de .entry-input:
//   - "input" en actor/nombre_demandado -> SOLO guarda el valor,
//     nunca toca el DOM del editor (evita duplicaciones al escribir).
//   - "blur" en actor/nombre_demandado -> elimina spans viejos del
//     key y resalta por palabras (resaltarNombrePorPalabras).
//   - el resto de campos (.entry-input normales) mantiene su
//     comportamiento original (actualiza spans directamente).
// ============================================================
document.querySelectorAll(".entry-input").forEach(input => {

    if (documentoRestaurado) return;

    const key = input.id;
    const esNombre = (key === "actor" || key === "actor_2" || key === "nombre_demandado" || /^nombre_testigo[1-8]$/.test(key));
    const esTipoJuicio = (key === "tipo_juicio");

    input.addEventListener("input", () => {

        const nuevoValor = input.value;

        if (esNombre) {
            const editor = document.getElementById("editor");
            const spans = editor.querySelectorAll(`span[data-key="${key}"]`);

            spans.forEach(span => {
                span.textContent = nuevoValor;
                if (nuevoValor.trim()) {
                    span.style.background = "#bbf7d0";
                } else {
                    span.style.background = colorCampo(key);
                }
            });

            guardarEstado();
            guardarEstadoEditor();
            programarGuardado();
            programarGuardadoConfiguracion();
            guardarCampoEnMemoria(key, nuevoValor);
            return;
        }

        if (esTipoJuicio) {
            // 🔧 el tipo de juicio se resalta por PALABRAS separadas
            // (varios spans con el mismo key). Actualizar aquí el texto
            // de todos los spans pondría el valor completo repetido en
            // cada palabra -> duplicaba el texto al escribir.
            //
            // 🔧 La sincronización con el documento (reemplazar/borrar
            // palabras del texto) ocurre SOLO al TERMINAR de editar
            // (blur), nunca mientras se escribe. Así se evita borrar el
            // texto cuando el Entry pasa por estados intermedios (p. ej.
            // al seleccionar todo y reescribir la palabra completa).
            guardarEstado();
            guardarEstadoEditor();
            programarGuardado();
            programarGuardadoConfiguracion();
            guardarCampoEnMemoria(key, nuevoValor);

            // 🔧 RE-SINCRONIZACIÓN DIFERIDA: al dejar de escribir 700 ms,
            // el documento se actualiza con el valor actual del Entry
            // (reescribe la frase / reemplaza / borra palabras). Si el
            // Entry quedó vacío o con palabras de menos de 3 letras
            // (p. ej. mientras se reescribe todo de cero), se espera al
            // blur para no borrar el texto prematuramente.
            clearTimeout(timerResaltarTipo);
            timerResaltarTipo = setTimeout(() => {
                timerResaltarTipo = null;
                const palabrasSig = (input.value || "").trim()
                    .split(/\s+/).filter(p => p && p.length >= 3).length;
                if (palabrasSig === 0) return;
                comprometerTipoJuicio(input.value);
            }, 700);

            return;
        }

        const editor = document.getElementById("editor");
        const spans = editor.querySelectorAll(`[data-key="${key}"]`);

        if (!nuevoValor.trim()) {

            spans.forEach(span => {
                span.textContent = "";
            });

            guardarEstado();
            guardarEstadoEditor();
            programarGuardado();
            programarGuardadoConfiguracion();
            guardarCampoEnMemoria(key, "");

            return;
        }

        spans.forEach(span => {
            span.textContent = nuevoValor;
            span.style.background = "#bbf7d0";
        });

        guardarEstado();
        guardarEstadoEditor();
        programarGuardado();
        programarGuardadoConfiguracion();
        guardarCampoEnMemoria(key, nuevoValor);
    });

    if (esTipoJuicio) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                input.blur();
            }
        });

        input.addEventListener("blur", () => {
            const valor = input.value;

            // si hay un re-resaltado pendiente del input, se cancela:
            // este blur hace el trabajo de una vez
            if (timerResaltarTipo) {
                clearTimeout(timerResaltarTipo);
                timerResaltarTipo = null;
            }

            // 🔙 DESHACER: el re-resaltado es una acción deshacible
            comprometerEdicion();
            guardarUndo();

            comprometerTipoJuicio(valor);
        });
    } else if (esNombre) {
        input.addEventListener("blur", () => {
            const valor = input.value;
            const editor = document.getElementById("editor");

            // 🔙 DESHACER: el re-resaltado del nombre es deshacible
            comprometerEdicion();
            guardarUndo();

            if (!valor.trim()) {
                if (configuracionActual) {
                    const spans = editor.querySelectorAll(`span[data-key="${key}"]`);
                    spans.forEach(span => { span.textContent = ""; span.style.background = colorCampo(key); });
                } else {
                    eliminarSpansPorKey(key);
                }
                guardarEstado();
                guardarEstadoEditor();
                programarGuardado();
                programarGuardadoConfiguracion();
                guardarCampoEnMemoria(key, "");
                return;
            }

            if (!configuracionActual) {
                editor.querySelectorAll(`span[data-key="${key}"]:not([data-manual])`).forEach(span => {
                    span.replaceWith(document.createTextNode(span.textContent));
                });
                editor.normalize();
                resaltarNombrePorPalabras(key, valor);
            }

            guardarEstado();
            guardarEstadoEditor();
            programarGuardado();
            programarGuardadoConfiguracion();
            guardarCampoEnMemoria(key, valor);
        });
    }
});

function toggleResaltado() {
    const editor = document.getElementById("editor");

    if (resaltadoActivo) {
        editor.innerText = textoOriginal;
    } else {
        editor.innerHTML = textoConResaltado;
    }

    resaltadoActivo = !resaltadoActivo;
}

function guardarEstado() {
    const estado = {
        textoBase: textoBase,
        inputs: {}
    };

    document.querySelectorAll(".entry-input").forEach(input => {
        estado.inputs[input.id] = input.value;
    });

    localStorage.setItem("jurisflow_estado", JSON.stringify(estado));
}

function guardarEstadoEditor() {
    const editor = document.getElementById("editor");
    localStorage.setItem("jurisflow_html", editor.innerHTML);
}

function actualizarInputDesdeSpans(key) {

    const spans = document.querySelectorAll(`[data-key="${key}"]`);
    const input = document.getElementById(key);

    if (!input) return;

    if (!spans.length) {
        input.value = "";
        guardarEstado();
        return;
    }

    // 🔧 FIX: antes reconstruía el nombre mezclando palabras únicas de
    // TODOS los spans del key (podía combinar una aparición completa +
    // una parcial en cualquier orden). Ahora se toma el texto de la
    // primera aparición: después de cualquier edición, todas las
    // apariciones del mismo key quedan con el mismo texto.
    input.value = spans[0].textContent.trim();

    guardarEstado();
}

function cargarEstado() {
    const data = localStorage.getItem("jurisflow_estado");
    if (!data) return;

    const estado = JSON.parse(data);

    textoBase = estado.textoBase || "";

    Object.entries(estado.inputs).forEach(([key, value]) => {
        const input = document.getElementById(key);
        if (input) input.value = value;
    });

    resaltarGlobal();
}

function eliminarSpansPorKey(key, borrarTexto) {
    const editor = document.getElementById("editor");

    const spans = editor.querySelectorAll(`[data-key="${key}"]`);

    spans.forEach(span => {
        if (borrarTexto) {
            span.remove();
        } else {
            span.replaceWith(document.createTextNode(span.textContent));
        }
    });

    editor.normalize();
}

function eliminarSpansPorKeyExcepto(key, spanExcluido) {
    const editor = document.getElementById("editor");
    const spans = editor.querySelectorAll(`[data-key="${key}"]`);
    spans.forEach(span => {
        if (span !== spanExcluido) {
            span.replaceWith(document.createTextNode(span.textContent));
        }
    });
    editor.normalize();
}

// 🔧 SINCRONIZACIÓN DEL TIPO DE JUICIO CON EL ENTRY:
// las palabras del documento que estaban resaltadas como tipo de juicio
// 🔧 COMPROMETE la edición del Entry de tipo de juicio sobre el documento.
// Se llama al TERMINAR de editar (blur): corrige el texto del documento
// (reemplaza/borra las palabras según el Entry), re-resalta y guarda.
// Si el Entry quedó vacío, se borran todas las palabras del tipo de juicio.
function comprometerTipoJuicio(valor) {
    const ed = document.getElementById("editor");
    if (!ed) return;

    if (configuracionActual && configuracionActual.mapeo && configuracionActual.mapeo["tipo_juicio"]) {
        const spans = ed.querySelectorAll('span[data-key="tipo_juicio"]');
        if (!valor.trim()) {
            spans.forEach(span => {
                span.textContent = "";
            });
        } else {
            spans.forEach(span => {
                span.textContent = valor;
                span.style.background = "#bbf7d0";
            });
        }
        ultimoValorTipo = String(valor || "");
        guardarEstado();
        guardarEstadoEditor();
        programarGuardadoConfiguracion();
        return;
    }

    const cambio = String(valor || "") !== ultimoValorTipo;
    if (cambio) {
        sincronizarTipoConEntry(valor);
    }

    eliminarSpansPorKey("tipo_juicio");
    ed.innerHTML = resaltarTipoJuicio(ed.innerHTML, valor);
    ed.normalize();
    if (cambio) {
        sincronizarTipoConEntry(valor);
    }

    ultimoValorTipo = String(valor || "");
    guardarEstado();
    guardarEstadoEditor();
}

// 🔧 SINCRONIZACIÓN DEL TIPO DE JUICIO CON EL ENTRY:
// las palabras del documento que estaban resaltadas como tipo de juicio
// pero que YA NO están en el Entry se ELIMINAN del texto del documento
// (comportamiento elegido por el usuario). Si es un cambio de una sola
// palabra ("alimenticia" -> "alimentaria"), se reemplaza el texto en vez
// de borrarlo.
function sincronizarTipoConEntry(valor) {
    const ed = document.getElementById("editor");
    if (!ed) return;
    const norm = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const entrada = new Set(
        norm(valor || "").split(/\s+/).filter(p => p.length >= 3)
    );
    if (entrada.size === 0) {
        eliminarSpansPorKey("tipo_juicio", true);
        return;
    }

    const matchEntry = (palabra) => {
        for (const e of entrada) {
            if (palabra.startsWith(e) || e.startsWith(palabra)) return true;
        }
        return false;
    };

    const prefComun = (a, b) => {
        const m = Math.min(a.length, b.length);
        let i = 0;
        while (i < m && a[i] === b[i]) i++;
        return i;
    };

    const spans = [...ed.querySelectorAll('span[data-key="tipo_juicio"]')];

    // palabras del entry que ya están representadas por algún span válido
    const presentes = new Set();
    spans.forEach(span => {
        const sig = norm(span.textContent).split(/\s+/).filter(p => p.length >= 3);
        sig.forEach(p => { if (matchEntry(p)) presentes.add(p); });
    });

    // palabras del entry que aún no están en ningún span
    const faltantes = new Set([...entrada].filter(e =>
        ![...presentes].some(p => p.startsWith(e) || e.startsWith(p))
    ));

    // 🔧 FRASES COMPLETAS: los spans que contienen VARIAS palabras
    // significativas (la frase del tipo de juicio que se resaltó entera)
    // se REESCRIBEN con el valor COMPLETO del Entry. Así, al cambiar el
    // Entry (corregir una palabra, añadir o quitar otras), el documento
    // muestra EXACTAMENTE lo que se escribió, igual que con los nombres.
    const reescritos = new Set();
    let hayFrase = false;
    spans.forEach(span => {
        const palabrasSig = norm(span.textContent).split(/\s+/).filter(p => p.length >= 3).length;
        if (palabrasSig >= 2) {
            span.textContent = String(valor || "").trim();
            reescritos.add(span);
            hayFrase = true;
        }
    });

    // 🔧 Si NO había ninguna frase resaltada (solo spans sueltos de 1
    // palabra, p. ej. "divorcio" o "pensión"), el PRIMER span se convierte
    // en la frase: se reescribe con el valor completo del Entry para que
    // el documento muestre exactamente lo escrito (igual que los nombres).
    if (!hayFrase && spans.length > 0) {
        spans[0].textContent = String(valor || "").trim();
        reescritos.add(spans[0]);
    }

    spans.forEach(span => {
        if (reescritos.has(span)) return;

        const tokens = span.textContent.trim().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return;

        const sig = tokens.map(t => ({ raw: t, n: norm(t) })).filter(x => x.n.length >= 3);
        const invalidas = sig.filter(x => !matchEntry(x.n));

        if (invalidas.length === 0) return;

        // caso "cambio de palabra": un solo token inválido y una palabra
        // del entry con prefijo común claro -> reemplazar en su sitio
        if (invalidas.length === 1) {
            let mejor = null, mejorPref = 0;
            faltantes.forEach(f => {
                const p = prefComun(invalidas[0].n, f);
                if (p > mejorPref) { mejorPref = p; mejor = f; }
            });
            if (mejor && mejorPref >= 3) {
                const tokenOriginal = valor.split(/\s+/).find(t => norm(t) === mejor);
                span.textContent = tokens.map(t =>
                    norm(t) === invalidas[0].n ? (tokenOriginal || t) : t
                ).join(" ");
                faltantes.delete(mejor);
                return;
            }
        }

        // quitar del texto SOLO los tokens que ya no están en el Entry
        const keep = tokens.filter(t => {
            const nn = norm(t);
            return nn.length < 3 || matchEntry(nn);
        });

        // colapsar conectores/palabras duplicadas consecutivas ("de de")
        const out = [];
        for (const t of keep) {
            const nn = norm(t);
            const ult = out.length ? norm(out[out.length - 1]) : null;
            if (ult === nn) continue;
            out.push(t);
        }

        // quitar conectores colgantes al inicio/final ("demanda de fijación de")
        while (out.length && norm(out[0]).length < 3) out.shift();
        while (out.length && norm(out[out.length - 1]).length < 3) out.pop();

        if (out.length === 0) span.remove();
        else span.textContent = out.join(" ");
    });
    ed.normalize();
}

// ============================================================
// 🎨 PALETA PROFESIONAL: cada CATEGORÍA de campo tiene SU color,
// para distinguir de un vistazo qué tipo de dato es cada resaltado.
//   Nombre actor: ámbar   | Nombre demandado: azul   | Testigos: morado
//   Cédulas: cian         | Correos: verde           | Teléfonos: naranja
//   Direcciones: marfil   | Datos personales: rosa   | Juicio: gris
// ============================================================
function colorCampo(key) {
    if (key === "actor" || key === "actor_2") return "#FFD54F";
    if (key === "nombre_demandado") return "#64B5F6";
    if (/^nombre_testigo[1-8]$/.test(key)) return "#BA68C8";
    if (key.includes("email")) return "#81C784";
    if (key.includes("cedula")) return "#4DD0E1";
    if (key.includes("telefono")) return "#FFB74D";
    if (key.includes("objeto")) return "#E1BEE7";
    if (/^hecho_[0-9]+$/.test(key)) return "#FFCC80";
    if (/^hecho_defensa_[0-9]+$/.test(key)) return "#EF9A9A";
    if (/^excepcion_/.test(key)) return "#EF9A9A";
    if (/^pronunciamiento_/.test(key)) return "#C5E1A5";
    if (/^(admite_|niega_|acepta_|se_opone_|no_le_consta_)/.test(key)) return "#C5E1A7";
    if (key === "numero_juicio") return "#4FC3F7";
    if (key === "tipo_juicio" || key === "tipo_accion") return "#7986CB";
    if (/^(age|civil|profesion|ciudadania)(|_actor_2|_demandado)$/.test(key)) return "#F48FB1";
    if (/^edad_demandado$/.test(key)) return "#F48FB1";
    if (key.includes("nombre_abogado")) return "#FFD54F";
    if (key.includes("matricula")) return "#80CBC4";
    if (key.includes("unidad_judicial") || key.includes("juzgador")) return "#7986CB";
    if (/^pretension_/.test(key)) return "#C5E1A5";
    if (/^fundamento_/.test(key)) return "#B39DDB";
    if (/^(norma_|articulo_norma_|descripcion_norma_)/.test(key)) return "#CE93D8";
    if (/^(documento_prueba_|descripcion_prueba_|finalidad_prueba_|fecha_documento_prueba_|emisor_documento_prueba_)/.test(key)) return "#80CBC4";
    if (/^(autenticidad_prueba_|admite_prueba_|niega_prueba_|objeta_prueba_)/.test(key)) return "#A5D6A7";
    if (/^(nombre_perito_|cedula_perito_|profesion_perito_|especialidad_perito_|objeto_pericia_|puntos_pericia_|conclusion_pericia_|registro_perito_|correo_perito_)/.test(key)) return "#FFF176";
    if (/^(lugar_inspeccion|objeto_inspeccion|finalidad_inspeccion|fecha_inspeccion|direccion_inspeccion|hechos_a_verificar_inspeccion)/.test(key)) return "#A5D6A7";
    if (/cuantia|valor|intereses|danos/.test(key)) return "#FFE082";
    if (/^(salario|ingresos_|egresos_|gastos_|carga_familiar|personas_a_cargo|numero_hijos|empresa_|cargo_trabajo|tipo_contrato|fecha_ingreso_trabajo|afiliacion_|numero_iess)/.test(key)) return "#FFE082";
    if (/^(pension_|valor_pension|fecha_inicio_pension|fecha_fin_pension|valor_adeudado|fecha_ultimo_pago|pagos_realizados|saldo_pendiente|porcentaje_ofertado|valor_ofertado|cuota_mensual_propuesta|forma_pago_pension|plazo_pago|periodo_liquidacion|valor_ultimo_pago)/.test(key)) return "#D1C4E9";
    if (/^(reconoce_paternidad|niega_paternidad|solicita_prueba_adn|nombre_madre|cedula_madre|nombre_padre|cedula_padre|nombre_menor|cedula_menor)/.test(key)) return "#F0F4C3";
    if (/^(fiscal_|unidad_fiscalia|fiscalia|numero_noticia|numero_investigacion|tipo_delito|delito|fecha_delito|hora_delito|lugar_delito|ciudad_delito|provincia_delito|nombre_victima|cedula_victima|nombre_investigado)/.test(key)) return "#FFCDD2";
    if (/^(materia_|submateria_|procedimiento_|sala_|ciudad_juicio|canton_juicio|provincia_juicio|fecha_escrito|fecha_presentacion)/.test(key)) return "#4FC3F7";
    if (/^(correo_notificacion|casillero_electronico_)/.test(key)) return "#81C784";
    if (/barrio|parroquia|calle|numero_casa|codigo_postal|direccion/.test(key)) return "#BCAAA4";
    if (/provincia|canton|ciudad/.test(key) && !/juicio|juzgado/.test(key)) return "#BCAAA4";
    if (/demandado/.test(key)) return "#64B5F6";
    return "#D1C4E9";
}

function obtenerColor(key) {
    return colorCampo(key);
}

// pinta cada botón .btn-rojo con el color de su campo (leyenda visual)
function colorearBotones() {
    document.querySelectorAll(".btn-rojo").forEach(btn => {
        const k = btn.dataset.key;
        if (k) btn.style.background = colorCampo(k);
    });
}


function limpiarEstado() {
    localStorage.removeItem("jurisflow_estado");
    location.reload();
}

function resaltarTodasLasCoincidencias(key, texto) {

    const editor = document.getElementById("editor");
    if (!editor || !texto) return;

    const color = obtenerColor(key);

    // 🔧 escapar caracteres especiales de regex (puntos, paréntesis, etc.)
    const limpio = texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const textoLower = texto.toLowerCase();

    const walker = document.createTreeWalker(
        editor,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let nodos = [];

    let nodo;
    while ((nodo = walker.nextNode())) {
        nodos.push(nodo);
    }

    nodos.forEach(nodo => {

        // 🔧 FIX: se salta también los nodos dentro de OTRO resaltado,
        // para que nunca se creen spans anidados (que corrompen el HTML)
        // y dentro del bloque protegido del encabezado del juzgado
        if (nodo.parentNode.closest("span[data-key], span[data-protegido]")) return;

        const contenido = nodo.nodeValue;
        const contenidoLower = contenido.toLowerCase();

        if (!contenidoLower.includes(textoLower)) return;

        // 🔧 límite de palabra (\b) para no resaltar fragmentos accidentales
        const partes = contenido.split(new RegExp(`\\b(${limpio})\\b`, "gi"));

        const fragment = document.createDocumentFragment();

        partes.forEach(parte => {

            if (parte.toLowerCase() === textoLower) {

                const span = document.createElement("span");
                span.dataset.key = key;
                span.dataset.manual = "true";
                span.dataset.instanceId = generarInstanceId(); // 🔧 NUEVO
                span.style.background = color;
                span.textContent = parte;

                fragment.appendChild(span);

            } else {
                fragment.appendChild(document.createTextNode(parte));
            }
        });

        nodo.parentNode.replaceChild(fragment, nodo);
    });
}

function reemplazarFueraDeSpans(html, regex, key, color) {
    // aplica el resaltado SOLO en segmentos de texto plano (fuera de
    // cualquier <span>): así un valor NUNCA se anida dentro de otro
    // resaltado y el HTML no se corrompe (no se borra texto)
    const partes = html.split(/(<span\b[^>]*>.*?<\/span>)/gi);
    return partes.map(parte => {
        if (/^<span\b/.test(parte)) return parte;
        return parte.replace(regex,
            `<span class="var" data-key="${key}" style="background:${color};">$1</span>`
        );
    }).join("");
}

// 🔧 Convierte una palabra en un patrón que IGNORA las tildes en ambos
// sentidos: "pensión" matchea "pension" y "pension" matchea "pensión"
// (igual que los nombres, que normalizan con NFD). El flag "gi" del
// regex cubre mayúsculas/acentos.
function patronTilde(palabra) {
    const VARIANTES = {
        a: "aá", á: "aá",
        e: "eé", é: "eé",
        i: "ií", í: "ií",
        o: "oó", ó: "oó",
        u: "uú", ú: "uú", ü: "uú",
        n: "nñ", ñ: "nñ"
    };
    return palabra.split("").map(ch => {
        const clase = VARIANTES[ch.toLowerCase()];
        if (clase) return `[${clase}]`;
        return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join("");
}

// 🔧 Resalta el tipo de juicio SIN duplicar texto: intenta primero la
// frase exacta y, si no aparece (p.ej. "Fijación de pensión alimenticia"
// vs el texto "fijación de la pensión alimenticia"), resalta cada palabra
// significativa por separado. Devuelve el html transformado y NO toca el
// editor: se usa igual en resaltarGlobal y al re-resaltar al editar el
// campo (blur). Las palabras genéricas de materia del juzgado
// ("civil", "civiles", "familia", "laboral", "penal"...) se omiten para
// no ensuciar el documento.
function resaltarTipoJuicio(html, valorT) {
    const valor = (valorT || "").trim();
    const palabrasTipo = valor.split(/\s+/).filter(p => p);
    if (palabrasTipo.length === 0) return html;
    const valorSinTildes = valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (palabrasTipo.length === 1 && /^(civil|civiles|familia|laboral|penal|constitucional|transito|ninez|adolescencia|judicial|materia)$/i.test(valorSinTildes)) {
        return html;
    }

    const colorTipo = colorCampo("tipo_juicio") || "#90A4AE";

    const regexT = new RegExp(`\\b(${patronTilde(valor)})\\b`, "gi");
    html = reemplazarFueraDeSpans(html, regexT, "tipo_juicio", colorTipo);

    // 🔧 SIEMPRE se hace también el pase por palabras significativas:
    // así las "palabras sueltas" que aparecen por separado en el
    // documento (p.ej. "pensión alimenticia" más abajo, fuera de la
    // frase completa) también se resaltan. reemplazarFueraDeSpans evita
    // anidar dentro de la frase ya marcada, y las palabras que ya no
    // estén en el Entry simplemente no se marcan (el resaltado queda
    // SIEMPRE sincronizado con el valor actual del Entry).
    const STOP = /^(de|del|la|las|los|el|un|una|y|o|por|para|en|con|sobre|su|sus)$/i;
    const txtPlano = html.replace(/<[^>]*>/g, " ");
    palabrasTipo.forEach(palabra => {
        if (palabra.length < 3 || STOP.test(palabra)) return;
        const patron = patronTilde(palabra);
        const hayExacta = new RegExp(`\\b${patron}\\b`, "i").test(txtPlano);
        if (hayExacta) {
            const regexP = new RegExp(`\\b(${patron})\\b`, "gi");
            html = reemplazarFueraDeSpans(html, regexP, "tipo_juicio", colorTipo);
        } else {
            // 🔧 la palabra exacta NO aparece, pero el documento puede
            // traer su raíz con otra forma ("alimenticias", "pensiones",
            // "fijaciones"...): se busca como PREFIJO para que el
            // resaltado no quede incompleto cuando el texto viene
            // abreviado o variado (p.ej. "demanda de la pension
            // alimenticia" o "demanda alimenticia").
            const regexPP = new RegExp(`\\b(${patron}\\w*)\\b`, "gi");
            html = reemplazarFueraDeSpans(html, regexPP, "tipo_juicio", colorTipo);
        }
    });

    return html;
}

// 🔧 PROTECCIÓN DEL ENCABEZADO DEL JUZGADO: el bloque "UNIDAD JUDICIAL ...
// PROVINCIA DE X." (o "JUZGADO ...") queda envuelto en un span marcador
// mientras se resaltan los campos, para que ahí NO se resalten calles,
// ciudades, parroquias ni cantones (p.ej. "CON SEDE EN EL CANTON
// RUMIÑAHUI, PROVINCIA DE PICHINCHA."). El resto del documento se
// resalta normal. Al final del resaltado el span se desenvolver.
function protegerBloqueJuzgado(html) {
    // solo se protege el ENCABEZADO (contiene la sede del juzgado), no
    // cualquier mención de "juzgado" en el cuerpo del documento
    return html.replace(
        /^[ \t]*(UNIDAD\s+JUDICIAL\b[^\n]*|JUZGADO\b[^\n]*)/gim,
        (m, bloque) => {
            if (/\b(?:SEDE|PROVINCIA|CANTON|CANTÓN|PARROQUIA)\b/i.test(bloque)) {
                return `<span data-protegido="1">${bloque}</span>`;
            }
            return m;
        }
    );
}

// Quita cualquier resaltado (span[data-key]) que haya quedado DENTRO del
// bloque del encabezado del juzgado (usado al restaurar documentos viejos
// que ya tenían calles/ciudades resaltadas en ese bloque).
function limpiarResaltadosEnBloqueJuzgado() {
    const editor = document.getElementById("editor");
    if (!editor) return;

    const texto = editor.textContent || "";
    const m = /\bUNIDAD\s+JUDICIAL\b/i.exec(texto);
    if (!m) return;

    let fin = texto.indexOf("\n", m.index);
    if (fin === -1) {
        const sub = texto.slice(m.index);
        const p = sub.search(/PROVINCIA\s+DE\s+[A-ZÁÉÍÓÚÑ]+[.,]?/i);
        if (p !== -1) {
            const punto = sub.indexOf(".", p);
            fin = m.index + (punto === -1 ? sub.length : punto + 1);
        } else {
            fin = m.index + Math.min(sub.length, 160);
        }
    }

    const aQuitar = new Set();
    let acum = 0;
    const walkerTxt = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
    let tn;
    while ((tn = walkerTxt.nextNode())) {
        const len = tn.nodeValue.length;
        const ini = acum;
        acum += len;
        if (acum <= m.index) continue;
        if (ini >= fin) break;
        let anc = tn.parentNode;
        while (anc && anc !== editor) {
            if (anc.matches && anc.matches("span[data-key]")) {
                aQuitar.add(anc);
                break;
            }
            anc = anc.parentNode;
        }
    }

    aQuitar.forEach(span => {
        span.replaceWith(document.createTextNode(span.textContent));
    });
    editor.normalize();
}

// Envuelve el bloque del encabezado del juzgado en un span data-protegido
// sobre el DOM ya pintado (tras restaurar un HTML guardado), para que la
// protección siga activa en futuros resaltados.
function protegerBloqueJuzgadoEnDOM() {
    const editor = document.getElementById("editor");
    if (!editor) return;
    if (editor.querySelector("span[data-protegido]")) return;

    const nodos = [];
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
    let tn;
    while ((tn = walker.nextNode())) nodos.push(tn);

    let ini = -1;
    for (let i = 0; i < nodos.length; i++) {
        if (/\bUNIDAD\s+JUDICIAL\b/i.test(nodos[i].nodeValue)) { ini = i; break; }
    }
    if (ini === -1) return;

    const nodosBloque = [];
    for (let i = ini; i < nodos.length; i++) {
        const valor = nodos[i].nodeValue;
        const idxNl = valor.indexOf("\n");
        if (idxNl !== -1) {
            if (idxNl > 0) {
                nodos[i].nodeValue = valor.slice(0, idxNl);
                nodosBloque.push(nodos[i]);
                nodos[i].parentNode.insertBefore(
                    document.createTextNode(valor.slice(idxNl)),
                    nodos[i].nextSibling
                );
            }
            break;
        }
        nodosBloque.push(nodos[i]);
    }

    nodosBloque.forEach(tx => {
        if (!tx.nodeValue.trim()) {
            tx.parentNode.removeChild(tx);
            return;
        }
        const span = document.createElement("span");
        span.dataset.protegido = "1";
        tx.parentNode.insertBefore(span, tx);
        span.appendChild(tx);
    });
    editor.normalize();
}

function resaltarGlobal() {
    if (documentoRestaurado) {
        console.log("⛔ NO resaltar (documento restaurado)");
        return;
    }
    const editor = document.getElementById("editor");

    let html = limpiarSpans(textoBase);

    // 🔧 PROTEGER EL ENCABEZADO DEL JUZGADO: el bloque "UNIDAD JUDICIAL ...
    // PROVINCIA DE X" (y variantes con JUZGADO) queda protegido para que
    // NO se resalten ahí calles, ciudades, parroquias ni cantones (p.ej.
    // "CON SEDE EN EL CANTON RUMIÑAHUI, PROVINCIA DE PICHINCHA"). El resto
    // del documento se resalta normal.
    html = protegerBloqueJuzgado(html);

    // 🎨 cada campo usa el color de su categoría (ver colorCampo)
    const colores = {};
    document.querySelectorAll(".entry-input").forEach(inp => {
        colores[inp.id] = colorCampo(inp.id);
    });

    document.querySelectorAll(".entry-input").forEach(input => {

        const key = input.id;
        const valor = input.value;

        // los nombres (actor, demandado y testigos) NO se resaltan aquí:
        // se resaltan abajo con resaltarNombrePorPalabras (inteligente)
        if (key === "actor" || key === "nombre_demandado") return;
        if (/^nombre_testigo[1-5]$/.test(key)) return;

        // 🔧 el tipo de juicio se resalta con su propia función
        // (frase exacta y, si no aparece, palabras clave sin duplicar)
        if (key === "tipo_juicio") {
            html = resaltarTipoJuicio(html, valor);
            return;
        }

        if (!valor) return;

        const limpio = valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // 🔧 límite de palabra (\b) para no resaltar fragmentos accidentales
        const regex = new RegExp(`\\b(${limpio})\\b`, "gi");

        const color = colores[key] || "#E0E0E0";

        html = reemplazarFueraDeSpans(html, regex, key, color);
    });

    editor.innerHTML = html;

    resaltarNombrePorPalabras("actor", document.getElementById("actor")?.value || "");
    resaltarNombrePorPalabras("nombre_demandado", document.getElementById("nombre_demandado")?.value || "");
    for (let i = 1; i <= 5; i++) {
        resaltarNombrePorPalabras(`nombre_testigo${i}`, document.getElementById(`nombre_testigo${i}`)?.value || "");
    }

    // 🔧 el documento recién resaltado refleja el valor ACTUAL del Entry:
    // se marca para no tocar el texto del documento si el Entry no cambia.
    ultimoValorTipo = document.getElementById("tipo_juicio")?.value || "";
}


document.addEventListener("click", function(e) {

    if (!e.target.classList.contains("btn-rojo")) return;

    e.preventDefault();

    const key = e.target.dataset.key;
    const input = document.getElementById(key);
    const editor = document.getElementById("editor");

    if (!input || !editor) return;

    const selection = window.getSelection();
    const textoSeleccionado = selection.toString().trim();
    const esNombre = (key === "actor" || key === "actor_2" || key === "nombre_demandado");

    if (textoSeleccionado) {

        // 🔙 DESHACER: el resaltado manual es una acción deshacible
        comprometerEdicion();
        guardarUndo();

        let span = null;

        if (esNombre) {
            if (!input.value.trim() && !configuracionActual) {
                input.value = textoSeleccionado;
            }

            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);

            span = document.createElement("span");
            span.dataset.key = key;
            span.dataset.manual = "true";
            span.dataset.instanceId = generarInstanceId();
            span.style.background = obtenerColor(key);
            span.setAttribute("contenteditable", "false");

            const contenido = range.extractContents();
            span.appendChild(contenido);

            range.insertNode(span);
            selection.removeAllRanges();

            if (input.value.trim() && input.value.trim() !== textoSeleccionado) {
                span.textContent = input.value;
            }

            if (configuracionActual) {
                input.value = textoSeleccionado;
                eliminarSpansPorKeyExcepto(key, span);
                resaltarTodasLasCoincidencias(key, textoSeleccionado);
            } else {
                resaltarNombrePorPalabras(key, input.value);
            }

        } else if (configuracionActual && selection.rangeCount) {
            const range = selection.getRangeAt(0);
            span = document.createElement("span");
            span.dataset.key = key;
            span.dataset.manual = "true";
            span.style.background = colorCampo(key);
            span.setAttribute("contenteditable", "false");
            const contenido = range.extractContents();
            span.appendChild(contenido);
            range.insertNode(span);
            selection.removeAllRanges();

            input.value = textoSeleccionado;
            eliminarSpansPorKeyExcepto(key, span);
            resaltarTodasLasCoincidencias(key, textoSeleccionado);

        } else {
            input.value = textoSeleccionado;
            eliminarSpansPorKey(key);
            resaltarTodasLasCoincidencias(key, textoSeleccionado);
        }

        guardarEstado();
        guardarEstadoEditor();
        guardarEnServidor();
        guardarCampoEnMemoria(key, input.value);

        if (configuracionActual && configuracionActual.mapeo) {
            if (textoSeleccionado) {
                if (!configuracionActual.mapeo[key]) configuracionActual.mapeo[key] = [];
                configuracionActual.mapeo[key] = configuracionActual.mapeo[key].filter(m => m !== textoSeleccionado);
                configuracionActual.mapeo[key].push(textoSeleccionado);
                if (!configuracionActual.resaltados) configuracionActual.resaltados = {};
                configuracionActual.resaltados[textoSeleccionado] = true;
            } else {
                configuracionActual.mapeo[key] = [];
            }
            programarGuardadoConfiguracion();
        }

        const idM = idMemoria(); // 🔧 FIX: antes archivoActual (nombre de archivo)
        if (idM) {
            if (!memoriaDocs.documentos[idM]) {
                memoriaDocs.documentos[idM] = { campos: {}, resaltados: [] };
            }

            if (esNombre) {
                // se agrega esta aparición a la lista (no reemplaza las anteriores)
                memoriaDocs.documentos[idM].resaltados.push({
                    key: key,
                    valor: input.value,
                    instanceId: span.dataset.instanceId
                });
            } else {
                memoriaDocs.documentos[idM].resaltados =
                    memoriaDocs.documentos[idM].resaltados.filter(r => r.key !== key);

                memoriaDocs.documentos[idM].resaltados.push({
                    key: key,
                    valor: textoSeleccionado
                });
            }

            guardarMemoriaDocs();
        }

        console.log("💾 guardado correctamente:", memoriaDocs);

        return;
    }

    eliminarSpansPorKey(key);

    input.value = "";

    if (configuracionActual && configuracionActual.mapeo && configuracionActual.mapeo[key]) {
        if (!configuracionActual.resaltados) configuracionActual.resaltados = {};
        configuracionActual.mapeo[key].forEach(m => {
            configuracionActual.resaltados[m] = false;
        });
        configuracionActual.mapeo[key] = [];
        programarGuardadoConfiguracion();
    }

    guardarEstado();
    guardarEstadoEditor();
    guardarEnServidor();
    guardarCampoEnMemoria(key, "");
});

// 🔧 guardado automático con debounce: al escribir se llama mucho, pero
// no conviene pegarle a Google Drive en cada tecla
let timerGuardar = null;
function programarGuardado() {
    if (timerGuardar) clearTimeout(timerGuardar);
    timerGuardar = setTimeout(() => {
        timerGuardar = null;
        guardarEnServidor();
    }, 600);
}

async function guardarEnServidor() {
    const editor = document.getElementById("editor");
    const html = editor.innerHTML;
    const plano = editor.innerText; // texto limpio (sin spans) para Drive

    const nombre = document.getElementById("actor")?.value || "documento";

    // 🔧 recolectar TODOS los inputs (se había perdido en la versión nueva)
    const inputs = {};
    document.querySelectorAll(".entry-input").forEach(i => {
        inputs[i.id] = i.value;
    });

    await fetch("/guardar-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            texto: html,
            texto_plano: plano,
            texto_original: textoOriginal || plano,
            datos: inputs,
            nombre: nombre.replace(/\s+/g, "_"),
            documento_id: documentoId || archivoActual
        })
    });
}

async function descargarDocx() {
    try {
        const texto = document.getElementById("editor").innerText;

        const response = await fetch("/exportar-docx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto })
        });

        if (!response.ok) {
            alert("Error al generar el documento");
            return;
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const nombre = document.getElementById("actor")?.value || "";
        const tipo = document.getElementById("tipo_juicio")?.value || "";

        function limpiar(texto) {
            return texto
                .trim()
                .replace(/\s+/g, "_")
                .replace(/[^\w\-]/g, "");
        }

        let nombreArchivo = "";

        if (nombre && tipo) {
            nombreArchivo = `${limpiar(nombre)}_${limpiar(tipo)}.docx`;
        } else if (nombre) {
            nombreArchivo = `${limpiar(nombre)}.docx`;
        } else if (tipo) {
            nombreArchivo = `${limpiar(tipo)}.docx`;
        } else {
            nombreArchivo = "documento.docx";
        }

        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        a.remove();

    } catch (error) {
        console.error("Error:", error);
        alert("Error al descargar DOCX");
    }
}

function generarDocumento() {
    const editor = document.getElementById("editor");

    const texto = editor.innerText;

    const blob = new Blob([texto], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "documento_editado.txt";
    a.click();

    URL.revokeObjectURL(url);
}

let modo = "actor1";

const PAGINAS = ["actor1", "actor2", "demandado", "hechos", "testigos", "otros", "pruebas", "pretensiones", "fundamentos", "proceso", "notificaciones", "excepciones", "pronunciamiento", "laboral"];
const BLOQUES_TESTIGO = ["bloque-testigo1", "bloque-testigo2", "bloque-testigo3", "bloque-testigo4", "bloque-testigo5", "bloque-testigo6", "bloque-testigo7", "bloque-testigo8"];
let testigoActual = 0;

function mostrarTestigo(idx) {
    BLOQUES_TESTIGO.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.style.display = (i === idx) ? "block" : "none";
    });
    const titulo = document.getElementById("testigos-titulo");
    if (titulo) titulo.textContent = `Prueba Testimonial — Testigo ${idx + 1} de ${BLOQUES_TESTIGO.length}`;
}

function mostrarPagina(nombre) {
    PAGINAS.forEach(p => {
        const el = document.getElementById("pagina-" + p);
        if (el) el.style.display = (p === nombre) ? "block" : "none";
    });
    if (nombre === "testigos") {
        mostrarTestigo(testigoActual);
    }
}

document.addEventListener("DOMContentLoaded", () => {

    colorearBotones();

    cargarInstrucciones();
    cargarChat();

    mostrarPagina("actor1");

    window.siguiente = function () {
        if (modo === "testigos") {
            if (testigoActual < BLOQUES_TESTIGO.length - 1) {
                testigoActual++;
                mostrarTestigo(testigoActual);
                return;
            }
        }
        const idx = PAGINAS.indexOf(modo);
        const next = (idx + 1) % PAGINAS.length;
        modo = PAGINAS[next];
        mostrarPagina(modo);
    };

    window.anterior = function () {
        if (modo === "testigos") {
            if (testigoActual > 0) {
                testigoActual--;
                mostrarTestigo(testigoActual);
                return;
            }
        }
        const idx = PAGINAS.indexOf(modo);
        const prev = (idx - 1 + PAGINAS.length) % PAGINAS.length;
        modo = PAGINAS[prev];
        mostrarPagina(modo);
    };

});

// ============================================================
// 📚 REPOSITORIO DE DOCUMENTOS BASE
// ============================================================

function toggleRepositorio() {
    const panel = document.getElementById("repositorioPanel");
    const flecha = document.getElementById("repoFlecha");
    if (panel.classList.contains("abierto")) {
        panel.classList.remove("abierto");
        flecha.textContent = "▼";
    } else {
        panel.classList.add("abierto");
        flecha.textContent = "▲";
        cargarDocumentosBase();
    }
}

async function cargarDocumentosBase() {
    const lista = document.getElementById("repoLista");
    lista.innerHTML = '<div class="repo-empty">Cargando...</div>';

    try {
        const resp = await fetch("/api/documentos-base");
        if (!resp.ok) throw new Error("Error al cargar");
        const data = await resp.json();
        documentosBaseCache = data.documentos || [];
        inicializarFiltroCategorias();
        renderizarDocumentosBase();
    } catch (e) {
        console.error(e);
        lista.innerHTML = '<div class="repo-empty">Error al cargar documentos</div>';
    }
}

function renderizarDocumentosBase() {
    const lista = document.getElementById("repoLista");
    const busqueda = (document.getElementById("repoBusqueda")?.value || "").toLowerCase().trim();
    const cat = repoCategoriaActual;

    let filtrados = documentosBaseCache.filter(doc => {
        if (cat !== "TODOS" && doc.categoria !== cat) return false;
        if (busqueda) {
            const texto = ((doc.nombre || "") + " " + (doc.categoria || "") + " " + (doc.subcategoria || "") + " " + (doc.procedimiento || "") + " " + (doc.descripcion || "")).toLowerCase();
            if (!texto.includes(busqueda)) return false;
        }
        return true;
    }).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));

    if (filtrados.length === 0) {
        lista.innerHTML = '<div class="repo-empty">No se encontraron documentos</div>';
        return;
    }

    lista.innerHTML = filtrados.map(doc => {
        const sel = docBaseSeleccionado && docBaseSeleccionado.id === doc.id;
        const clase = sel ? "repo-item seleccionado" : "repo-item";
        const badge = doc.tiene_datos ? '<span class="repo-item-badge">Configurado</span>' : '<span class="repo-item-badge" style="background:#fef3c7;color:#92400e;">Sin configurar</span>';
        const catSub = [doc.categoria, doc.subcategoria].filter(Boolean).join(" › ");
        const proc = doc.procedimiento ? ` — ${doc.procedimiento}` : "";
        return `
            <div class="${clase}" onclick="marcarDocumentoBase('${doc.id}')">
                <span class="repo-item-icono">📄</span>
                <div class="repo-item-info">
                    <div class="repo-item-nombre">${doc.nombre || doc.archivo_nombre}</div>
                    <div class="repo-item-cat">${catSub}${proc}${doc.descripcion ? " — " + doc.descripcion : ""}</div>
                </div>
                ${badge}
            </div>
        `;
    }).join("");
}

function filtrarDocumentosBase() {
    renderizarDocumentosBase();
}

function filtrarCategoria(cat, btn) {
    repoCategoriaActual = cat;
    document.querySelectorAll(".repo-cat-btn").forEach(b => b.classList.remove("activa"));
    if (btn) btn.classList.add("activa");
    renderizarDocumentosBase();
}

function marcarDocumentoBase(docId) {
    docBaseSeleccionado = documentosBaseCache.find(d => d.id === docId) || null;
    renderizarDocumentosBase();
}

function seleccionarDocumentoBase() {
    if (!docBaseSeleccionado) {
        alert("Seleccione un documento base.");
        return;
    }
    abrirDocumentoBase(docBaseSeleccionado);
}

async function abrirDocumentoBase(doc) {
    if (!doc) {
        alert("Seleccione un documento base.");
        return;
    }

    try {
        const resp = await fetch(`/api/documentos-base/${doc.id}/abrir`, { method: "POST" });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || "Error al abrir documento base");
        }
        const data = await resp.json();

        documentoBaseId = data.documento_base_id || doc.id;
        casoId = data.caso_id || "";
        documentoId = data.documento_id || "";
        archivoActual = doc.archivo_nombre || doc.nombre;

        document.querySelectorAll(".entry-input").forEach(input => { input.value = ""; });
        ultimoValorTipo = "";

        const textoPlano = data.texto || "";
        const htmlDocumento = textoPlanoToHtml(textoPlano);
        document.getElementById("editor").innerHTML = htmlDocumento;

        const marcadores = detectarMarcadores(textoPlano);
        let mapeo = {};
        let resaltados = {};
        let tieneMapeoGuardado = false;

        const configGuardada = data.config;
        if (configGuardada && configGuardada.mapeo && Object.keys(configGuardada.mapeo).length > 0) {
            mapeo = configGuardada.mapeo;
            resaltados = configGuardada.resaltados || {};
            tieneMapeoGuardado = true;
            console.log("[MEMORIA] Configuración cargada desde Google Drive:", Object.keys(mapeo).length, "entradas");
            console.log("[MEMORIA] Resaltados restaurados:", Object.keys(resaltados).length, "marcadores");
            console.log("[MEMORIA] Restaurando Entries...");
        } else {
            console.log("[MEMORIA] No hay configuración guardada. Ejecutando detección dinámica...");
            console.log("[MEMORIA] Documento ID:", doc.id);
            console.log("[MEMORIA] Buscando configuración en Drive...");
            console.log("[MEMORIA] Configuración no encontrada. Detectando marcadores...");
            marcadores.forEach(m => {
                const entryId = mapearVariableAEntrada(m.contenido);
                if (entryId) {
                    if (!mapeo[entryId]) mapeo[entryId] = [];
                    mapeo[entryId].push(m.original);
                    resaltados[m.original] = true;
                }
            });
            console.log("[MEMORIA] Detección dinámica:", Object.keys(mapeo).length, "entradas");
        }

        configuracionActual = { marcadores, mapeo, resaltados, tieneMapeoGuardado };

        Object.keys(mapeo).forEach(entryId => {
            const input = document.getElementById(entryId);
            if (!input || input.value.trim()) return;
            if (!mapeo[entryId] || mapeo[entryId].length === 0) return;
            const marcador = mapeo[entryId][0];
            if (resaltados && resaltados[marcador] === false) return;
            input.value = marcador.replace(/^\[|\]$/g, '');
        });

        resaltarMarcadoresBase(mapeo, resaltados);
        marcarEntriesConVariables(mapeo);

        if (!tieneMapeoGuardado && Object.keys(mapeo).length > 0) {
            console.log("[MEMORIA] Guardando configuración inicial automáticamente...");
            await guardarConfiguracionEnDrive();
        }

        toggleRepositorio();
    } catch (e) {
        console.error("Error abriendo doc base:", e);
        alert("Error al abrir documento base: " + e.message);
    }
}

let timerGuardarConfig = null;
let guardadoConfigPendiente = false;

function programarGuardadoConfiguracion() {
    if (!configuracionActual || !documentoBaseId) return;
    guardadoConfigPendiente = true;
    if (timerGuardarConfig) clearTimeout(timerGuardarConfig);
    timerGuardarConfig = setTimeout(() => {
        timerGuardarConfig = null;
        guardarConfiguracionEnDrive();
    }, 1000);
}

async function guardarConfiguracionEnDrive() {
    if (!documentoBaseId || !configuracionActual || !configuracionActual.mapeo) return;

    const mapeo = configuracionActual.mapeo;
    const resaltados = configuracionActual.resaltados || {};

    try {
        console.log("[MEMORIA] Cambio detectado");
        console.log("[MEMORIA] Documento ID:", documentoBaseId);
        console.log("[MEMORIA] Preparando configuración:", Object.keys(mapeo).length, "entradas,", Object.keys(resaltados).length, "resaltados");
        console.log("[MEMORIA] Enviando configuración al backend...");
        const resp = await fetch(`/api/documentos-base/${documentoBaseId}/guardar-configuracion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mapeo, resaltados })
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || "Error al guardar");
        }

        const result = await resp.json();
        configuracionActual.tieneMapeoGuardado = true;
        guardadoConfigPendiente = false;
        console.log("[MEMORIA] Google Drive respondió correctamente");
        console.log("[MEMORIA] Carpeta:", result.carpeta_doc || "OK");
        console.log("[MEMORIA] Configuración guardada");
    } catch (e) {
        console.error("[MEMORIA ERROR] Error guardando configuración:", e.message || e);
        guardadoConfigPendiente = true;
        setTimeout(() => guardarConfiguracionEnDrive(), 5000);
    }
}

function textoPlanoToHtml(texto) {
    if (!texto) return "";
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .split("\n")
        .map(line => line.trim() ? `<p style="margin:0 0 4px 0;">${line}</p>` : `<br>`)
        .join("");
}

function detectarMarcadores(texto) {
    const regex = /\[([^\]]+)\]/g;
    let match;
    const vistas = new Set();
    const resultado = [];
    while ((match = regex.exec(texto)) !== null) {
        const contenido = match[1].trim();
        if (!contenido) continue;
        if (vistas.has(match[0])) continue;
        vistas.add(match[0]);
        resultado.push({ original: match[0], contenido });
    }
    return resultado;
}

function mapearVariableAEntrada(contenido) {
    const c = contenido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (/nombre.*(actor\s*2|segundo\s*actor)/.test(c)) return "actor_2";
    if (/cedula.*(actor\s*2|segundo\s*actor)/.test(c)) return "cedula_actor_2";
    if (/(edad|de\s*edad).*(actor\s*2|segundo\s*actor)/.test(c)) return "age_actor_2";
    if (/estado\s*civil.*(actor\s*2|segundo\s*actor)/.test(c)) return "civil_actor_2";
    if (/(profesion|ocupacion).*(actor\s*2|segundo\s*actor)/.test(c)) return "profesion_actor_2";
    if (/(ciudadania|nacionalidad).*(actor\s*2|segundo\s*actor)/.test(c)) return "ciudadania_actor_2";
    if (/(correo|email).*(actor\s*2|segundo\s*actor)/.test(c)) return "email_actor_2";
    if (/(telefono|celular|contacto).*(actor\s*2|segundo\s*actor)/.test(c)) return "telefono_actor_2";
    if (/parroquia.*(actor\s*2|segundo\s*actor)/.test(c)) return "parroquia_actor_2";
    if (/barrio.*(actor\s*2|segundo\s*actor)/.test(c)) return "barrio_actor_2";
    if (/calle\s*principal.*(actor\s*2|segundo\s*actor)/.test(c)) return "calle_principal_actor_2";
    if (/calle\s*secundaria.*(actor\s*2|segundo\s*actor)/.test(c)) return "calle_secundaria_actor_2";
    if (/(numero.*casa|nro.*casa).*(actor\s*2|segundo\s*actor)/.test(c)) return "numero_casa_actor_2";
    if (/codigo\s*postal.*(actor\s*2|segundo\s*actor)/.test(c)) return "codigo_postal_actor_2";
    if (/(direccion|domicilio).*(actor\s*2|segundo\s*actor)/.test(c)) return "direccion_domiciliaria_actor_2";
    if (/casillero.*(actor\s*2|segundo\s*actor)/.test(c)) return "casillero_judicial_actor_2";
    if (/provincia.*(actor\s*2|segundo\s*actor)/.test(c)) return "provincia_actor_2";
    if (/(canton).*(actor\s*2|segundo\s*actor)/.test(c)) return "canton_actor_2";
    if (/ciudad.*(actor\s*2|segundo\s*actor)/.test(c)) return "ciudad_actor_2";

    if (/nombre.*(actor|demandante|reclamante|solicitante)/.test(c)) return "actor";
    if (/cedula.*(actor|demandante)/.test(c)) return "cedula";

    if (/nombre.*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `nombre_testigo${num[1]}` : "nombre_testigo1";
    }
    if (/cedula.*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `cedula_testigo${num[1]}` : "cedula_testigo1";
    }
    if (/(ciudad).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `ciudad_testigo${num[1]}` : "ciudad_testigo1";
    }
    if (/(provincia).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `provincia_testigo${num[1]}` : "provincia_testigo1";
    }
    if (/(canton).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `canton_testigo${num[1]}` : "canton_testigo1";
    }
    if (/(parroquia).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `parroquia_testigo${num[1]}` : "parroquia_testigo1";
    }
    if (/(barrio).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `barrio_testigo${num[1]}` : "barrio_testigo1";
    }
    if (/(direccion|domicilio).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `direccion_testigo${num[1]}` : "direccion_testigo1";
    }
    if (/(correo|email).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `email_testigo${num[1]}` : "email_testigo1";
    }
    if (/(telefono|celular).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `telefono_testigo${num[1]}` : "telefono_testigo1";
    }
    if (/(edad).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `edad_testigo${num[1]}` : "edad_testigo1";
    }
    if (/(profesion|ocupacion).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `profesion_testigo${num[1]}` : "profesion_testigo1";
    }
    if (/(nacionalidad|ciudadania).*(testigo)/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `nacionalidad_testigo${num[1]}` : "nacionalidad_testigo1";
    }
    if (/(hechos|declar|objeto|sobre.*declara)/.test(c) && /testigo/.test(c)) {
        const num = contenido.match(/(\d+)/);
        return num ? `objeto_testigo${num[1]}` : "objeto_testigo1";
    }

    if (/nombre.*(demandado|recurso|opositor)/.test(c)) return "nombre_demandado";
    if (/cedula.*(demandado)/.test(c)) return "cedula_demandado";

    if (/edad.*(demandado)/.test(c)) return "edad_demandado";
    if (/^(edad|de\s*edad)$/.test(c)) return "age";
    if (/^(edad|de\s*edad)\s*(del|del\s*demandado)/.test(c)) return "edad_demandado";
    if (/estado\s*civil/.test(c) && /demandado/.test(c)) return "civil_demandado";
    if (/estado\s*civil/.test(c)) return "civil";
    if (/(profesion|ocupacion)/.test(c) && /demandado/.test(c)) return "profesion_demandado";
    if (/(profesion|ocupacion)/.test(c)) return "profesion";
    if (/(ciudadania|nacionalidad)/.test(c) && /demandado/.test(c)) return "ciudadania_demandado";
    if (/(ciudadania|nacionalidad)/.test(c)) return "ciudadania";

    if (/(correo|email)/.test(c) && /demandado/.test(c)) return "email_demandado";
    if (/(correo|email)/.test(c)) return "email";

    if (/(direccion|domicilio)/.test(c) && /citacion/.test(c)) return "direccion_citacion_demandado";
    if (/(direccion|domicilio)/.test(c) && /demandado/.test(c)) return "parroquia_demandado";
    if (/(direccion|domicilio)/.test(c) && /actor/.test(c) && !/actor\s*2|segundo/.test(c)) return "direccion_domiciliaria_actor";
    if (/(direccion|domicilio)/.test(c)) return "parroquia_actor";

    if (/parroquia/.test(c) && /demandado/.test(c)) return "parroquia_demandado";
    if (/parroquia/.test(c)) return "parroquia_actor";
    if (/barrio/.test(c) && /demandado/.test(c)) return "barrio_demandado";
    if (/barrio/.test(c)) return "barrio_actor";
    if (/calle\s*principal/.test(c) && /demandado/.test(c)) return "calle_principal_demandado";
    if (/calle\s*principal/.test(c)) return "calle_principal_actor";
    if (/calle\s*secundaria/.test(c) && /demandado/.test(c)) return "calle_secundaria_demandado";
    if (/calle\s*secundaria/.test(c)) return "calle_secundaria_actor";
    if (/(numero.*casa|nro.*casa)/.test(c) && /demandado/.test(c)) return "numero_casa_demandado";
    if (/(numero.*casa|nro.*casa)/.test(c)) return "numero_casa_actor";
    if (/codigo\s*postal/.test(c) && /demandado/.test(c)) return "codigo_postal_demandado";
    if (/codigo\s*postal/.test(c)) return "codigo_postal_actor";

    if (/(telefono|celular|contacto)/.test(c) && /demandado/.test(c)) return "telefono_demandado";
    if (/(telefono|celular|contacto)/.test(c)) return "telefono_actor";

    if (/casillero/.test(c) && /actor\s*2|segundo.*actor/.test(c)) return "casillero_judicial_actor_2";
    if (/casillero/.test(c) && /actor/.test(c)) return "casillero_judicial_actor";
    if (/casillero/.test(c) && /demandado/.test(c)) return "casillero_judicial_demandado";
    if (/casillero/.test(c)) return "casillero_judicial_actor";

    if (/numero.*juicio|expediente|radi/.test(c)) return "numero_juicio";
    if (/tipo.*juicio/.test(c)) return "tipo_juicio";
    if (/unidad\s*judicial/.test(c)) return "unidad_judicial_top";
    if (/juzgador|juez|juzgado/.test(c)) return "juzgador";

    if (/abogado|apoderado|defensor/.test(c)) return "nombre_abogado";
    if (/mat.*foro|matricula/.test(c)) return "matricula_abogado";
    if (/cedula/.test(c) && /abogado/.test(c)) return "cedula_abogado";
    if (/(correo|email)/.test(c) && /abogado/.test(c)) return "correo_abogado";
    if (/(telefono|celular)/.test(c) && /abogado/.test(c)) return "telefono_abogado";
    if (/direccion/.test(c) && /abogado/.test(c)) return "direccion_abogado";
    if (/casillero/.test(c) && /abogado/.test(c)) return "casillero_judicial_abogado";
    if (/tipo/.test(c) && /patrocinio/.test(c)) return "tipo_patrocinio";

    // ==================== PROCESO ====================
    if (/numero.*juicio|expediente|radi/.test(c)) return "numero_juicio";
    if (/tipo.*juicio/.test(c)) return "tipo_juicio";
    if (/tipo.*accion/.test(c)) return "tipo_accion";
    if (/materia/.test(c) && !/prueba/.test(c)) return "materia_proceso";
    if (/submateria/.test(c)) return "submateria_proceso";
    if (/cuantia/.test(c) && /total/.test(c)) return "cuantia_total";
    if (/cuantia/.test(c)) return "cuantia";
    if (/procedimiento/.test(c) && /tipo/.test(c)) return "procedimiento_tipo";
    if (/unidad\s*judicial/.test(c)) return "unidad_judicial_top";
    if (/juzgador|juez|juzgado/.test(c)) return "juzgador";
    if (/sala/.test(c) && /juzgado|audiencia/.test(c)) return "sala_juzgado";
    if (/ciudad/.test(c) && /juicio|juzgado/.test(c)) return "ciudad_juicio";
    if (/canton/.test(c) && /juicio/.test(c)) return "canton_juicio";
    if (/provincia/.test(c) && /juicio/.test(c)) return "provincia_juicio";
    if (/fecha/.test(c) && /escrito/.test(c)) return "fecha_escrito";
    if (/fecha/.test(c) && /(presentacion|radicacion|ingreso)/.test(c)) return "fecha_presentacion";

    // ==================== NOTIFICACIONES ====================
    if (/(correo|email).*(notificacion|notificar)/.test(c)) return "correo_notificacion";
    if (/casillero/.test(c) && /electronico/.test(c) && /actor/.test(c) && /actor\s*2|segundo/.test(c)) return "casillero_electronico_actor_2";
    if (/casillero/.test(c) && /electronico/.test(c) && /actor/.test(c)) return "casillero_electronico_actor";
    if (/casillero/.test(c) && /electronico/.test(c) && /demandado/.test(c)) return "casillero_electronico_demandado";
    if (/casillero/.test(c) && /electronico/.test(c)) return "casillero_electronico_actor";

    // ==================== PRETENSIONES ====================
    if (/pretension/.test(c) && /principal/.test(c)) return "pretension_principal";
    if (/pretension/.test(c) && /subsidiar/.test(c)) return "pretension_subsidiaria";
    if (/pretension/.test(c) && /alternat/.test(c)) return "pretension_alternativa";
    if (/peticion/.test(c) && /final/.test(c)) return "peticion_final";
    if (/pretension/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `pretension_${num2[1]}` : "pretension_1";
    }

    // ==================== FUNDAMENTOS ====================
    if (/fundamento/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `fundamento_derecho_${num2[1]}` : "fundamento_derecho_1";
    }

    // ==================== NORMAS / ARTICULOS ====================
    if (/descripcion/.test(c) && /norma/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `descripcion_norma_${num2[1]}` : "descripcion_norma_1";
    }
    if (/articulo/.test(c) && /norma/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `articulo_norma_${num2[1]}` : "articulo_norma_1";
    }
    if (/norma/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `norma_${num2[1]}` : "norma_1";
    }
    if (/articulo/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `articulo_norma_${num2[1]}` : "articulo_norma_1";
    }

    // ==================== HECHOS (N genérico) ====================
    if (/hecho/.test(c) && /defensa/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `hecho_defensa_${num2[1]}` : "hecho_defensa_1";
    }
    if (/hecho/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `hecho_${num2[1]}` : "hecho_1";
    }

    // ==================== EXCEPCIONES (N genérico) ====================
    if (/excepcion/.test(c) && /previa/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `excepcion_previa_${num2[1]}` : "excepcion_previa_1";
    }
    if (/excepcion/.test(c) && /prescripcion/.test(c)) return "excepcion_prescripcion";
    if (/excepcion/.test(c) && /caducidad/.test(c)) return "excepcion_caducidad";
    if (/excepcion/.test(c) && /cosa.*juzgada/.test(c)) return "excepcion_cosa_juzgada";
    if (/excepcion/.test(c) && /litispendencia/.test(c)) return "excepcion_litispendencia";
    if (/excepcion/.test(c) && /transaccion/.test(c)) return "excepcion_transaccion";
    if (/excepcion/.test(c) && /convenio.*arbitral/.test(c)) return "excepcion_convenio_arbitral";
    if (/excepcion/.test(c) && /inadecuad/.test(c)) return "excepcion_inadecuacion_procedimiento";
    if (/excepcion/.test(c) && /indebida.*acumulacion/.test(c)) return "excepcion_indebida_acumulacion";
    if (/excepcion/.test(c) && /falta.*legitimacion/.test(c)) return "excepcion_falta_legitimacion";
    if (/excepcion/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `excepcion_${num2[1]}` : "excepcion_1";
    }

    // ==================== PRONUNCIAMIENTO (N genérico) ====================
    if (/pronunciamiento/.test(c) && /pretension/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `pronunciamiento_pretension_${num2[1]}` : "pronunciamiento_pretension_1";
    }
    if (/pronunciamiento/.test(c) && /hecho/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `pronunciamiento_hecho_${num2[1]}` : "pronunciamiento_hecho_1";
    }
    if (/admite/.test(c) && /pretension/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `admite_pretension_${num2[1]}` : "admite_pretension_1";
    }
    if (/(niega|rechaza)/.test(c) && /pretension/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `niega_pretension_${num2[1]}` : "niega_pretension_1";
    }
    if (/acepta/.test(c) && /pretension/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `acepta_pretension_${num2[1]}` : "acepta_pretension_1";
    }
    if (/opone/.test(c) && /pretension/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `se_opone_pretension_${num2[1]}` : "se_opone_pretension_1";
    }
    if (/admite/.test(c) && /hecho/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `admite_hecho_${num2[1]}` : "admite_hecho_1";
    }
    if (/(niega|rechaza)/.test(c) && /hecho/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `niega_hecho_${num2[1]}` : "niega_hecho_1";
    }
    if (/no.*le.*consta/.test(c) && /hecho/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `no_le_consta_hecho_${num2[1]}` : "no_le_consta_hecho_1";
    }

    // ==================== PRUEBA DOCUMENTAL (N genérico) ====================
    if (/descripcion/.test(c) && /prueba/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `descripcion_prueba_${num2[1]}` : "descripcion_prueba_1";
    }
    if (/finalidad/.test(c) && /prueba/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `finalidad_prueba_${num2[1]}` : "finalidad_prueba_1";
    }
    if (/fecha/.test(c) && /documento.*prueba/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `fecha_documento_prueba_${num2[1]}` : "fecha_documento_prueba_1";
    }
    if (/emisor/.test(c) && /documento.*prueba/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `emisor_documento_prueba_${num2[1]}` : "emisor_documento_prueba_1";
    }
    if (/documento.*prueba/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `documento_prueba_${num2[1]}` : "documento_prueba_1";
    }

    // ==================== AUTENTICIDAD / ADMITE / NIEGA / OBJETA PRUEBA ====================
    if (/autenticidad/.test(c) && /prueba/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `autenticidad_prueba_${num2[1]}` : "autenticidad_prueba_1";
    }
    if (/admite/.test(c) && /prueba/.test(c) && !/pretension/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `admite_prueba_${num2[1]}` : "admite_prueba_1";
    }
    if (/(niega|rechaza)/.test(c) && /prueba/.test(c) && !/pretension/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `niega_prueba_${num2[1]}` : "niega_prueba_1";
    }
    if (/objeta/.test(c) && /prueba/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `objeta_prueba_${num2[1]}` : "objeta_prueba_1";
    }

    // ==================== PERITOS (N genérico) ====================
    if (/nombre/.test(c) && /perito/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `nombre_perito_${num2[1]}` : "nombre_perito_1";
    }
    if (/cedula/.test(c) && /perito/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `cedula_perito_${num2[1]}` : "cedula_perito_1";
    }
    if (/profesion/.test(c) && /perito/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `profesion_perito_${num2[1]}` : "profesion_perito_1";
    }
    if (/especialidad/.test(c) && /perito/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `especialidad_perito_${num2[1]}` : "especialidad_perito_1";
    }
    if (/objeto/.test(c) && /pericia/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `objeto_pericia_${num2[1]}` : "objeto_pericia_1";
    }
    if (/puntos/.test(c) && /pericia/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `puntos_pericia_${num2[1]}` : "puntos_pericia_1";
    }
    if (/conclusion/.test(c) && /pericia/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `conclusion_pericia_${num2[1]}` : "conclusion_pericia_1";
    }
    if (/registro/.test(c) && /perito/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `registro_perito_${num2[1]}` : "registro_perito_1";
    }
    if (/correo/.test(c) && /perito/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `correo_perito_${num2[1]}` : "correo_perito_1";
    }
    if (/(telefono|celular)/.test(c) && /perito/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `telefono_perito_${num2[1]}` : "telefono_perito_1";
    }

    // ==================== INSPECCION JUDICIAL ====================
    if (/inspeccion/.test(c) && /lugar/.test(c)) return "lugar_inspeccion";
    if (/inspeccion/.test(c) && /objeto/.test(c)) return "objeto_inspeccion";
    if (/inspeccion/.test(c) && /finalidad/.test(c)) return "finalidad_inspeccion";
    if (/inspeccion/.test(c) && /fecha/.test(c)) return "fecha_inspeccion";
    if (/inspeccion/.test(c) && /direccion/.test(c)) return "direccion_inspeccion";
    if (/inspeccion/.test(c) && /hechos/.test(c)) return "hechos_a_verificar_inspeccion";

    // ==================== ECONOMICOS / LABORAL / ALIMENTOS ====================
    if (/salario/.test(c) || /sueldo/.test(c)) return "salario";
    if (/ingreso/.test(c) && /mensual/.test(c)) return "ingresos_mensuales";
    if (/ingreso/.test(c) && /extraordinario/.test(c)) return "ingresos_extraordinarios";
    if (/ingreso/.test(c) && /anual/.test(c)) return "ingresos_anuales";
    if (/egreso/.test(c) && /mensual/.test(c)) return "egresos_mensuales";
    if (/gasto/.test(c) && /alimentacion/.test(c)) return "gastos_alimentacion";
    if (/gasto/.test(c) && /vivienda/.test(c)) return "gastos_vivienda";
    if (/gasto/.test(c) && /educacion/.test(c)) return "gastos_educacion";
    if (/gasto/.test(c) && /salud/.test(c)) return "gastos_salud";
    if (/gasto/.test(c) && /transporte/.test(c)) return "gastos_transporte";
    if (/carga/.test(c) && /familiar/.test(c)) return "carga_familiar";
    if (/personas/.test(c) && /cargo/.test(c)) return "personas_a_cargo";
    if (/numero/.test(c) && /hijo/.test(c)) return "numero_hijos";
    if (/empresa/.test(c) && /trabajo/.test(c) || /empleador/.test(c)) return "empresa_trabajo";
    if (/cargo/.test(c) && /trabajo/.test(c) || /puesto/.test(c) && /trabajo/.test(c)) return "cargo_trabajo";
    if (/tipo/.test(c) && /contrato/.test(c) && !/legal/.test(c)) return "tipo_contrato";
    if (/fecha/.test(c) && /ingreso/.test(c) && /trabajo/.test(c)) return "fecha_ingreso_trabajo";
    if (/afiliacion/.test(c) && /iess/.test(c)) return "afiliacion_iess";
    if (/numero/.test(c) && /iess/.test(c)) return "numero_iess";
    if (/pension/.test(c) && /actual/.test(c)) return "pension_actual";
    if (/pension/.test(c) && /solicitad/.test(c)) return "pension_solicitada";
    if (/pension/.test(c) && /propuest/.test(c)) return "pension_propuesta";
    if (/pension/.test(c) && /provisional/.test(c)) return "pension_provisional";
    if (/pension/.test(c) && /definitiv/.test(c)) return "pension_definitiva";
    if (/valor/.test(c) && /pension/.test(c)) return "valor_pension";
    if (/valor/.test(c) && /adeudad/.test(c)) return "valor_adeudado";
    if (/fecha/.test(c) && /inicio/.test(c) && /pension/.test(c)) return "fecha_inicio_pension";
    if (/fecha/.test(c) && /ultimo/.test(c) && /pago/.test(c)) return "fecha_ultimo_pago";
    if (/danos/.test(c) || /perjuicios/.test(c)) return "danos_perjuicios";
    if (/intereses/.test(c)) return "intereses";
    if (/valor/.test(c) && /principal/.test(c)) return "valor_principal";

    // ==================== BENEFICIARIOS (N genérico) ====================
    if (/nombre/.test(c) && /beneficiario/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `nombre_beneficiario_${num2[1]}` : "nombre_beneficiario_1";
    }
    if (/cedula/.test(c) && /beneficiario/.test(c)) {
        const num2 = contenido.match(/(\d+)/);
        return num2 ? `cedula_beneficiario_${num2[1]}` : "cedula_beneficiario_1";
    }

    // ==================== PATERNIDAD ====================
    if (/reconoce/.test(c) && /paternidad/.test(c)) return "reconoce_paternidad";
    if (/niega/.test(c) && /paternidad/.test(c)) return "niega_paternidad";
    if (/prueba/.test(c) && /adn/.test(c)) return "solicita_prueba_adn";
    if (/nombre/.test(c) && /madre/.test(c)) return "nombre_madre";
    if (/nombre/.test(c) && /padre/.test(c)) return "nombre_padre";
    if (/nombre/.test(c) && /(menor|nino)/.test(c)) return "nombre_menor";

    // ==================== FISCALIA ====================
    if (/fiscal/.test(c) && /asignad|a\s*cargo/.test(c)) return "fiscal_asignado";
    if (/tipo/.test(c) && /delito/.test(c)) return "tipo_delito";
    if (/fecha/.test(c) && /delito/.test(c)) return "fecha_delito";
    if (/lugar/.test(c) && /delito/.test(c)) return "lugar_delito";
    if (/nombre/.test(c) && /victima/.test(c)) return "nombre_victima";
    if (/nombre/.test(c) && /investigad|imputado/.test(c)) return "nombre_investigado";

    if (typeof buscarEnMaestro === "function") {
        const match = buscarEnMaestro(contenido);
        if (match && match.entryId) return match.entryId;
    }

    return null;
}

function resaltarMarcadoresBase(mapeo, resaltados) {
    const editor = document.getElementById("editor");
    if (!editor) return;

    let html = editor.innerHTML;

    const todasLasVariables = [];
    Object.keys(mapeo).forEach(entryId => {
        mapeo[entryId].forEach(marcador => {
            todasLasVariables.push({ entryId, marcador });
        });
    });

    todasLasVariables.sort((a, b) => b.marcador.length - a.marcador.length);

    todasLasVariables.forEach(({ entryId, marcador }) => {
        if (resaltados && resaltados[marcador] === false) return;
        const color = colorCampo(entryId);
        const escaped = marcador.replace(/[-\/\\^$*+?.()|[\]{}%]/g, '\\$&');
        const regex = new RegExp(escaped, "g");
        const replacement = `<span data-key="${entryId}" style="background:${color}; padding:1px 2px; border-radius:2px; cursor:pointer;" title="${entryId}">${marcador}</span>`;
        html = html.replace(regex, replacement);
    });

    editor.innerHTML = html;
}

function marcarEntriesConVariables(mapeo) {
    document.querySelectorAll(".entry-input").forEach(input => {
        const existing = input.parentNode.querySelector(".var-badge");
        if (existing) existing.remove();
        if (mapeo[input.id]) {
            const badge = document.createElement("span");
            badge.className = "var-badge";
            badge.style.cssText = `display:inline-block;width:8px;height:8px;border-radius:50%;background:${colorCampo(input.id)};margin-left:4px;vertical-align:middle;border:1px solid #666;`;
            badge.title = `${mapeo[input.id].length} variable(s) en el documento`;
            input.parentNode.appendChild(badge);
        }
    });
}

function limpiarBadgeEntries() {
    document.querySelectorAll(".var-badge").forEach(el => el.remove());
}

function cerrarDocumentoBase() {
    configuracionActual = null;
    documentoBaseId = "";
    casoId = "";
    documentoId = "";
    limpiarBadgeEntries();
    document.querySelectorAll(".entry-input").forEach(input => { input.value = ""; });
    document.getElementById("editor").innerHTML = "";
    const hechosContainer = document.getElementById("entries-hechos-dinamicos");
    if (hechosContainer) hechosContainer.innerHTML = "";
}

function subirDocumentoBase() {
    document.getElementById("modalBaseNombre").value = "";
    document.getElementById("modalBaseDescripcion").value = "";
    document.getElementById("modalBaseArchivo").value = "";
    document.getElementById("modalBaseNuevaCatWrap").style.display = "none";
    document.getElementById("modalBaseNuevaCat").value = "";
    document.getElementById("modalBaseNuevaSubWrap").style.display = "none";
    document.getElementById("modalBaseNuevaSub").value = "";

    const catSelect = document.getElementById("modalBaseCategoria");
    const proSelect = document.getElementById("modalBaseProcedimiento");
    const subSelect = document.getElementById("modalBaseSubcategoria");

    if (catSelect.options.length <= 1) {
        catSelect.innerHTML = '<option value="">Seleccionar...</option>' +
            CATEGORIAS_PRINCIPALES.map(c => `<option value="${c}">${c}</option>`).join("") +
            '<option value="__NUEVA__">+ Nueva categoría</option>';
    }
    catSelect.value = "";

    if (proSelect.options.length <= 1) {
        proSelect.innerHTML = '<option value="">No aplica</option>' +
            PROCEDIMIENTOS.map(p => `<option value="${p}">${p}</option>`).join("");
    }
    proSelect.value = "";

    subSelect.innerHTML = '<option value="">Seleccionar...</option>';

    document.getElementById("modalSubirBase").classList.add("abierto");
}

function cerrarModalSubirBase() {
    document.getElementById("modalSubirBase").classList.remove("abierto");
}

function cambiarCategoriaModal() {
    const cat = document.getElementById("modalBaseCategoria").value;
    const subSelect = document.getElementById("modalBaseSubcategoria");
    const nuevaCatWrap = document.getElementById("modalBaseNuevaCatWrap");
    const nuevaSubWrap = document.getElementById("modalBaseNuevaSubWrap");

    if (cat === "__NUEVA__") {
        nuevaCatWrap.style.display = "block";
        subSelect.innerHTML = '<option value="">Seleccionar...</option>';
        nuevaSubWrap.style.display = "none";
        return;
    }

    nuevaCatWrap.style.display = "none";
    nuevaSubWrap.style.display = "none";

    const subs = SUBCATEGORIAS[cat] || [];
    subSelect.innerHTML = '<option value="">Seleccionar...</option>' +
        subs.map(s => `<option value="${s}">${s}</option>`).join("") +
        '<option value="__NUEVA__">+ Nueva subcategoría</option>';
}

function cambiarSubcategoriaModal() {
    const val = document.getElementById("modalBaseSubcategoria").value;
    const wrap = document.getElementById("modalBaseNuevaSubWrap");
    if (val === "__NUEVA__") {
        wrap.style.display = "block";
        document.getElementById("modalBaseNuevaSub").value = "";
    } else {
        wrap.style.display = "none";
    }
}

async function confirmarSubirDocumentoBase() {
    const nombre = document.getElementById("modalBaseNombre").value.trim();
    let categoria = document.getElementById("modalBaseCategoria").value;
    let subcategoria = document.getElementById("modalBaseSubcategoria").value;
    const procedimiento = document.getElementById("modalBaseProcedimiento").value;
    const descripcion = document.getElementById("modalBaseDescripcion").value.trim();
    const archivo = document.getElementById("modalBaseArchivo").files[0];

    if (categoria === "__NUEVA__") {
        categoria = document.getElementById("modalBaseNuevaCat").value.trim();
    }
    if (subcategoria === "__NUEVA__") {
        subcategoria = document.getElementById("modalBaseNuevaSub").value.trim();
    }

    if (!archivo) {
        alert("Seleccione un archivo.");
        return;
    }
    if (!nombre) {
        alert("Ingrese un nombre para el documento.");
        return;
    }

    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("nombre", nombre);
    formData.append("categoria", categoria);
    formData.append("subcategoria", subcategoria);
    formData.append("procedimiento", procedimiento);
    formData.append("descripcion", descripcion);

    try {
        cerrarModalSubirBase();

        const resp = await fetch("/api/documentos-base/subir", {
            method: "POST",
            body: formData
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || "Error al subir");
        }

        const result = await resp.json();
        await cargarDocumentosBase();

        if (result.sugerencia) {
            mostrarSugerenciaClasificacion(result.documento, result.sugerencia);
        } else {
            alert("Documento base subido exitosamente.");
        }
    } catch (e) {
        console.error(e);
        alert("Error al subir documento base: " + e.message);
    }
}

function mostrarSugerenciaClasificacion(doc, sugerencia) {
    const msg = `Clasificación sugerida por IA:\n\nCategoría: ${sugerencia.categoria || "—"}\nSubcategoría: ${sugerencia.subcategoria || "—"}\nProcedimiento: ${sugerencia.procedimiento || "—"}\n\n¿Desea aplicar esta clasificación?`;

    if (confirm(msg)) {
        aplicarSugerenciaClasificacion(doc.id, sugerencia);
    }
}

async function aplicarSugerenciaClasificacion(docId, sugerencia) {
    try {
        const resp = await fetch(`/api/documentos-base/${docId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categoria: sugerencia.categoria,
                subcategoria: sugerencia.subcategoria,
                procedimiento: sugerencia.procedimiento
            })
        });
        if (resp.ok) {
            await cargarDocumentosBase();
        }
    } catch (e) {
        console.error("Error aplicando sugerencia:", e);
    }
}

function editarDocumentoBase() {
    if (!docBaseSeleccionado) {
        alert("Seleccione un documento para editar.");
        return;
    }

    const catSelect = document.getElementById("modalEditarBaseCategoria");
    const subSelect = document.getElementById("modalEditarBaseSubcategoria");
    const proSelect = document.getElementById("modalEditarBaseProcedimiento");

    catSelect.innerHTML = '<option value="">Seleccionar...</option>' +
        CATEGORIAS_PRINCIPALES.map(c => `<option value="${c}">${c}</option>`).join("") +
        '<option value="__NUEVA__">+ Nueva categoría</option>';

    proSelect.innerHTML = '<option value="">No aplica</option>' +
        PROCEDIMIENTOS.map(p => `<option value="${p}">${p}</option>`).join("");

    document.getElementById("modalEditarBaseNuevaCatWrap").style.display = "none";
    document.getElementById("modalEditarBaseNuevaCat").value = "";
    document.getElementById("modalEditarBaseNuevaSubWrap").style.display = "none";
    document.getElementById("modalEditarBaseNuevaSub").value = "";

    const doc = docBaseSeleccionado;
    document.getElementById("modalEditarBaseNombre").value = doc.nombre || "";
    document.getElementById("modalEditarBaseDescripcion").value = doc.descripcion || "";
    document.getElementById("modalEditarBaseArchivo").value = "";

    if (doc.categoria && CATEGORIAS_PRINCIPALES.includes(doc.categoria)) {
        catSelect.value = doc.categoria;
        cambiarCategoriaModalEditar();
    } else if (doc.categoria) {
        catSelect.value = "__NUEVA__";
        document.getElementById("modalEditarBaseNuevaCatWrap").style.display = "block";
        document.getElementById("modalEditarBaseNuevaCat").value = doc.categoria;
        subSelect.innerHTML = '<option value="">Seleccionar...</option>';
    }

    if (doc.subcategoria && subSelect.querySelector(`option[value="${doc.subcategoria}"]`)) {
        subSelect.value = doc.subcategoria;
    } else if (doc.subcategoria) {
        subSelect.value = "__NUEVA__";
        document.getElementById("modalEditarBaseNuevaSubWrap").style.display = "block";
        document.getElementById("modalEditarBaseNuevaSub").value = doc.subcategoria;
    }

    if (doc.procedimiento) {
        proSelect.value = doc.procedimiento;
    }

    document.getElementById("modalEditarBase").classList.add("abierto");
}

function cerrarModalEditarBase() {
    document.getElementById("modalEditarBase").classList.remove("abierto");
}

function cambiarCategoriaModalEditar() {
    const cat = document.getElementById("modalEditarBaseCategoria").value;
    const subSelect = document.getElementById("modalEditarBaseSubcategoria");
    const nuevaCatWrap = document.getElementById("modalEditarBaseNuevaCatWrap");
    const nuevaSubWrap = document.getElementById("modalEditarBaseNuevaSubWrap");

    if (cat === "__NUEVA__") {
        nuevaCatWrap.style.display = "block";
        subSelect.innerHTML = '<option value="">Seleccionar...</option>';
        nuevaSubWrap.style.display = "none";
        return;
    }

    nuevaCatWrap.style.display = "none";
    nuevaSubWrap.style.display = "none";

    const subs = SUBCATEGORIAS[cat] || [];
    subSelect.innerHTML = '<option value="">Seleccionar...</option>' +
        subs.map(s => `<option value="${s}">${s}</option>`).join("") +
        '<option value="__NUEVA__">+ Nueva subcategoría</option>';
}

function cambiarSubcategoriaModalEditar() {
    const val = document.getElementById("modalEditarBaseSubcategoria").value;
    const wrap = document.getElementById("modalEditarBaseNuevaSubWrap");
    if (val === "__NUEVA__") {
        wrap.style.display = "block";
        document.getElementById("modalEditarBaseNuevaSub").value = "";
    } else {
        wrap.style.display = "none";
    }
}

async function confirmarEditarDocumentoBase() {
    const nombre = document.getElementById("modalEditarBaseNombre").value.trim();
    let categoria = document.getElementById("modalEditarBaseCategoria").value;
    let subcategoria = document.getElementById("modalEditarBaseSubcategoria").value;
    const procedimiento = document.getElementById("modalEditarBaseProcedimiento").value;
    const descripcion = document.getElementById("modalEditarBaseDescripcion").value.trim();
    const archivoInput = document.getElementById("modalEditarBaseArchivo");
    const archivo = archivoInput && archivoInput.files.length > 0 ? archivoInput.files[0] : null;

    if (categoria === "__NUEVA__") {
        categoria = document.getElementById("modalEditarBaseNuevaCat").value.trim();
    }
    if (subcategoria === "__NUEVA__") {
        subcategoria = document.getElementById("modalEditarBaseNuevaSub").value.trim();
    }

    if (!nombre) {
        alert("Ingrese un nombre para el documento.");
        return;
    }

    try {
        cerrarModalEditarBase();

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("categoria", categoria);
        formData.append("subcategoria", subcategoria || "");
        formData.append("procedimiento", procedimiento || "");
        formData.append("descripcion", descripcion);
        if (archivo) {
            formData.append("archivo", archivo);
        }

        const resp = await fetch(`/api/documentos-base/${docBaseSeleccionado.id}`, {
            method: "PATCH",
            body: formData
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || "Error al guardar");
        }

        await cargarDocumentosBase();
        alert("Documento base actualizado.");
    } catch (e) {
        console.error(e);
        alert("Error al editar documento base: " + e.message);
    }
}

async function borrarDocumentoBase() {
    if (!docBaseSeleccionado) {
        alert("Seleccione un documento para eliminar.");
        return;
    }

    if (!confirm("¿Está seguro de que desea eliminar este documento base?\n\nLos casos existentes creados a partir de él NO se eliminarán.")) {
        return;
    }

    try {
        const resp = await fetch(`/api/documentos-base/${docBaseSeleccionado.id}`, {
            method: "DELETE"
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || "Error al eliminar");
        }

        docBaseSeleccionado = null;
        await cargarDocumentosBase();
        alert("Documento base eliminado.");
    } catch (e) {
        console.error(e);
        alert("Error al eliminar documento base: " + e.message);
    }
}

async function seedDocumentosBase() {
    try {
        await fetch("/api/documentos-base/seed", { method: "POST" });
    } catch (e) {
        console.warn("Seed:", e);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    seedDocumentosBase();
    inicializarFiltroCategorias();
});

function inicializarFiltroCategorias() {
    const contenedor = document.getElementById("repoCategorias");
    if (!contenedor) return;
    let html = '<button class="repo-cat-btn activa" onclick="filtrarCategoria(\'TODOS\', this)">TODOS</button>';
    const catsUsadas = [...new Set(documentosBaseCache.map(d => d.categoria).filter(Boolean))];
    const catsFinales = [...new Set([...CATEGORIAS_PRINCIPALES, ...catsUsadas])];
    catsFinales.forEach(c => {
        html += `<button class="repo-cat-btn" onclick="filtrarCategoria('${c.replace(/'/g, "\\'")}', this)">${c}</button>`;
    });
    contenedor.innerHTML = html;
}
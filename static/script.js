const VERSION_SCRIPT = 144;
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

let taxonomyCache = { categorias_extra: {}, procedimientos_extra: [] };
let taxonomyCargada = false;

async function cargarTaxonomia() {
    try {
        const resp = await fetch("/api/documentos-base/taxonomy");
        if (resp.ok) {
            taxonomyCache = await resp.json();
            taxonomyCargada = true;
        }
    } catch (e) {
        console.error("Error cargando taxonomía:", e);
    }
}

function getTodasCategorias() {
    const base = new Set(CATEGORIAS_PRINCIPALES);
    Object.keys(taxonomyCache.categorias_extra || {}).forEach(c => base.add(c));
    if (documentosBaseCache) {
        documentosBaseCache.forEach(d => { if (d.categoria) base.add(d.categoria); });
    }
    const arr = [...base].filter(c => c.toUpperCase() !== "OTROS").sort((a, b) => a.localeCompare(b, "es"));
    const otrosCat = [...base].find(c => c.toUpperCase() === "OTROS");
    if (otrosCat) arr.push(otrosCat);
    return arr;
}

function getSubcategoriasDe(cat) {
    if (!cat) return [];
    const base = SUBCATEGORIAS[cat] || [];
    const extra = Object.keys((taxonomyCache.categorias_extra || {})[cat.toUpperCase()] || {});
    const merged = new Set([...base, ...extra]);
    return [...merged].sort((a, b) => a.localeCompare(b, "es"));
}

function getProcedimientosDe(cat, sub) {
    const base = [...PROCEDIMIENTOS];
    if (cat && sub) {
        const extra = ((taxonomyCache.categorias_extra || {})[cat.toUpperCase()] || {})[sub] || [];
        extra.forEach(p => { if (!base.includes(p)) base.push(p); });
    } else if (taxonomyCache.procedimientos_extra) {
        taxonomyCache.procedimientos_extra.forEach(p => { if (!base.includes(p)) base.push(p); });
    }
    return base;
}

async function agregarATaxonomia(categoria, subcategoria, procedimiento) {
    if (!categoria) return;
    try {
        const resp = await fetch("/api/documentos-base/taxonomy/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoria, subcategoria, procedimiento })
        });
        if (resp.ok) {
            const result = await resp.json();
            taxonomyCache = result.taxonomy || taxonomyCache;
        }
    } catch (e) {
        console.error("Error guardando taxonomía:", e);
    }
}

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
    if (configuracionActual && configuracionActual.mapeo && documentoBaseId) {
        programarGuardadoConfiguracion();
    }
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
        marcarCambio();
        if (documentoBaseId) {
            if (window._timerDetectarEntries) clearTimeout(window._timerDetectarEntries);
            window._timerDetectarEntries = setTimeout(function() {
                actualizarEntriesEnTiempoReal();
            }, 200);
        }
    });

    document.addEventListener("keydown", (e) => {
        // 🔙 DESHACER con Ctrl+Z (Ctrl mayúscula incluida)
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === "z" || e.key === "Z")) {
            e.preventDefault();
            deshacerUndo();
        }
    });

    document.addEventListener("input", function(e) {
        if (e.target && e.target.classList && (e.target.classList.contains("entry-input") || e.target.classList.contains("entry-input-valor"))) {
            marcarCambio();
        }
    }, true);

    window.addEventListener("beforeunload", function(e) {
        if (cambiosPendientes > 0) {
            e.preventDefault();
            e.returnValue = "Hay cambios sin guardar. ¿Deseas salir?";
            return e.returnValue;
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
    formData.append("prompt", localStorage.getItem("promptIA") || "");

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

    // SEPARAR ESTADOS: al analizar un documento nuevo, limpiar los entries
    // que pertenecían al repositorio o a otro documento previo.
    configuracionActual = configuracionActual || {};
    configuracionActual.dynamicEntries = {};
    matchNavigationState = {};
    var containerEntries = document.getElementById("v142EntriesContainer");
    if (containerEntries) containerEntries.innerHTML = "";

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

var _iaInstruccionesDefault = "Actúa como asistente jurídico especializado en documentos del Ecuador. Utiliza lenguaje formal. No inventes datos. Cuando falte información crea un Entry.";

function abrirModalConfigIA() {
    var textarea = document.getElementById("promptIAModal");
    if (textarea) {
        textarea.value = localStorage.getItem("promptIA") || "";
    }
    document.getElementById("modalConfigIA").classList.add("abierto");
}

function cerrarModalConfigIA() {
    document.getElementById("modalConfigIA").classList.remove("abierto");
}

function guardarInstruccionesIA() {
    var textarea = document.getElementById("promptIAModal");
    if (!textarea) return;
    var valor = textarea.value.trim();
    localStorage.setItem("promptIA", valor);
    historialChat = [];
    localStorage.removeItem("chatIA");
    cargarChat();
    alert("Instrucciones guardadas. El chat se reinició con las nuevas instrucciones.");
    cerrarModalConfigIA();
}

function restablecerInstruccionesIA() {
    if (!confirm("¿Deseas restaurar las instrucciones predeterminadas?")) return;
    localStorage.setItem("promptIA", _iaInstruccionesDefault);
    var textarea = document.getElementById("promptIAModal");
    if (textarea) textarea.value = _iaInstruccionesDefault;
    historialChat = [];
    localStorage.removeItem("chatIA");
    cargarChat();
    alert("Instrucciones restauradas. El chat se reinició.");
    cerrarModalConfigIA();
}

function guardarPrompt() {
    var textarea = document.getElementById("promptIAModal") || document.getElementById("promptIA");
    var prompt = textarea ? textarea.value : "";
    localStorage.setItem("promptIA", prompt);

    historialChat = [];
    localStorage.removeItem("chatIA");
    cargarChat();

    alert("Instrucciones guardadas. El chat se reinició con las nuevas instrucciones.");
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
                instrucciones: localStorage.getItem("promptIA") || ""
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
    var instruccionActual = localStorage.getItem("promptIA") || "";

    const marcador = "INSTRUCCIÓN PARA ANÁLISIS:";
    const idx = texto.indexOf(marcador);
    let instruccion = idx !== -1
        ? texto.slice(idx + marcador.length).trim()
        : texto.trim();

    if (!instruccion) return;

    const actual = instruccionActual;
    var nuevo = actual ? actual + "\n- " + instruccion : "- " + instruccion;
    localStorage.setItem("promptIA", nuevo);

    if (textoBase && documentoId) {
        try {
            const response = await fetch("/reanalizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto: textoOriginal || textoBase,
                    prompt: nuevo,
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
    var ta = document.getElementById("promptIAModal");
    if (ta) ta.value = localStorage.getItem("promptIA") || "";
}

// ============================================================
// v142 ASISTENTE IA: STREAMING + EDICIÓN + UNDO/REDO
// ============================================================

var iaHistorialOperaciones = [];
var iaIndiceOperacion = -1;
var iaStreamingActivo = false;

function iaGuardarEstado() {
    var editor = document.getElementById("editor");
    if (!editor) return;
    return editor.innerHTML;
}

function iaDeshacer() {
    if (iaIndiceOperacion <= 0) return;
    iaIndiceOperacion--;
    var editor = document.getElementById("editor");
    if (editor && iaHistorialOperaciones[iaIndiceOperacion]) {
        editor.innerHTML = iaHistorialOperaciones[iaIndiceOperacion];
        if (typeof detectarYSincronizarEntries === "function") {
            detectarYSincronizarEntries();
        }
        marcarCambio();
    }
}

function iaRehacer() {
    if (iaIndiceOperacion >= iaHistorialOperaciones.length - 1) return;
    iaIndiceOperacion++;
    var editor = document.getElementById("editor");
    if (editor && iaHistorialOperaciones[iaIndiceOperacion]) {
        editor.innerHTML = iaHistorialOperaciones[iaIndiceOperacion];
        if (typeof detectarYSincronizarEntries === "function") {
            detectarYSincronizarEntries();
        }
        marcarCambio();
    }
}

function iaRegistrarOperacion(htmlState) {
    iaHistorialOperaciones = iaHistorialOperaciones.slice(0, iaIndiceOperacion + 1);
    iaHistorialOperaciones.push(htmlState);
    if (iaHistorialOperaciones.length > 50) {
        iaHistorialOperaciones.shift();
    } else {
        iaIndiceOperacion++;
    }
}

function iaSeleccionTexto() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    var range = sel.getRangeAt(0);
    var editor = document.getElementById("editor");
    if (!editor || !editor.contains(range.commonAncestorContainer)) return null;
    var texto = sel.toString().trim();
    if (!texto) return null;
    return { texto: texto, range: range.cloneRange() };
}

function iaConstruirContexto() {
    var editor = document.getElementById("editor");
    var editorText = "";
    if (editor) {
        editorText = (editor.innerText || editor.textContent || "").substring(0, 3000);
    }
    var entries = {};
    if (configuracionActual && configuracionActual.dynamicEntries) {
        entries = configuracionActual.dynamicEntries;
    }
    var cat = "", sub = "", proc = "";
    if (docBaseSeleccionado) {
        cat = docBaseSeleccionado.categoria || "";
        sub = docBaseSeleccionado.subcategoria || "";
        proc = docBaseSeleccionado.procedimiento || "";
    }
    return { editor_text: editorText, entries: entries, categoria: cat, subcategoria: sub, procedimiento: proc };
}

async function enviarChatStream() {
    var input = document.getElementById("chatMensaje");
    var msg = (input.value || "").trim();
    if (!msg || iaStreamingActivo) return;

    input.value = "";
    agregarBurbujaChat("usuario", msg, true);

    var seleccion = iaSeleccionTexto();

    var payload = {
        mensaje: msg,
        historial: historialChat.slice(-20),
        instrucciones: localStorage.getItem("promptIA") || "",
        contexto_documento: iaConstruirContexto()
    };

    if (seleccion) {
        payload.mensaje = '[TEXTO SELECCIONADO: "' + seleccion.texto + '"]\n\n' + msg;
    }

    iaStreamingActivo = true;

    var cont = document.getElementById("chatIA");
    var div = document.createElement("div");
    div.style.cssText = "margin:6px 0; padding:8px 10px; border-radius:8px; white-space:pre-wrap; word-break:break-word; font-size:13px; background:#ffffff; border:1px solid #e2e8f0;";
    div.innerHTML = "🤖 <span class='ia-cursor'>▌</span>";
    cont.appendChild(div);
    cont.scrollTop = cont.scrollHeight;

    var contenidoCompleto = "";

    try {
        var response = await fetch("/chat-ia-stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error en servidor: " + response.status);

        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var buffer = "";

        while (true) {
            var { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            var lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line.startsWith("data: ")) continue;
                var jsonStr = line.slice(6);
                try {
                    var parsed = JSON.parse(jsonStr);
                    if (parsed.chunk) {
                        contenidoCompleto += parsed.chunk;
                        div.innerHTML = "🤖 " + escapeHTML(contenidoCompleto) + "<span class='ia-cursor'>▌</span>";
                        cont.scrollTop = cont.scrollHeight;
                    } else if (parsed.done) {
                        div.innerHTML = "🤖 " + escapeHTML(contenidoCompleto);
                        procesarAccionesIA(contenidoCompleto, seleccion, div, cont);
                    } else if (parsed.error) {
                        div.innerHTML = "❌ Error: " + escapeHTML(parsed.error);
                    }
                } catch (e) {}
            }
        }

        if (contenidoCompleto && !div.querySelector(".ia-action-buttons")) {
            historialChat.push({ rol: "ia", contenido: contenidoCompleto });
            guardarChatLocal();
        }

    } catch (error) {
        console.error("Error streaming:", error);
        div.innerHTML = "❌ Error al conectar con la IA. <button onclick='enviarChatStream()' style='margin-left:8px;font-size:11px;'>Reintentar</button>";
    }

    iaStreamingActivo = false;
    cont.scrollTop = cont.scrollHeight;
}

function procesarAccionesIA(respuesta, seleccion, divBubble, contChat) {
    var editor = document.getElementById("editor");

    var accionMatch = respuesta.match(/<!--JURIS_ACTION({.*?})-->/s);
    var respuestaLimpia = respuesta.replace(/<!--JURIS_ACTION\{.*?\}-->/g, "").trim();
    if (editor) {
        divBubble.innerHTML = "🤖 " + escapeHTML(respuestaLimpia);
    }

    if (accionMatch) {
        try {
            var accion = JSON.parse(accionMatch[1]);
            iaEjecutarAccion(accion, divBubble);
        } catch (e) {
            console.error("Error parseando JURIS_ACTION:", e);
        }
    } else if (editor) {
        var esEdicion = seleccion && seleccion.texto;
        var tieneAccion = /\b(REPLACE_TEXT|UPDATE_ENTRY|INSERT_TEXT|DELETE_TEXT)\b/i.test(respuesta);

        if (esEdicion || tieneAccion) {
            var textoSeleccion = seleccion ? seleccion.texto : "";
            var textoOriginal = "";
            var textoPropuesto = "";

            var antesMatch = respuesta.match(/ANTES[:\s]*(.*?)(?=DESPUÉS|$)/si);
            var despuesMatch = respuesta.match(/DESPUÉS[:\s]*(.*?)(?=\[APLICAR|$)/si);

            if (antesMatch && despuesMatch) {
                textoOriginal = antesMatch[1].trim();
                textoPropuesto = despuesMatch[1].trim();
            } else if (textoSeleccion) {
                textoOriginal = textoSeleccion;
                var cambioMatch = respuesta.match(/["""](.+?)["""].*?["""](.+?)["""']/s);
                if (cambioMatch) {
                    textoPropuesto = textoSeleccion.replace(cambioMatch[1], cambioMatch[2]);
                }
            }

            if (textoOriginal && textoPropuesto && textoOriginal !== textoPropuesto) {
                var btnContainer = document.createElement("div");
                btnContainer.className = "ia-action-buttons";
                btnContainer.style.cssText = "display:flex; gap:8px; margin-top:8px;";

                var btnAplicar = document.createElement("button");
                btnAplicar.className = "btn btn-primary";
                btnAplicar.style.cssText = "font-size:11px; padding:5px 10px; background:#2563eb;";
                btnAplicar.textContent = "APLICAR";
                btnAplicar.onclick = function() {
                    var estadoAntes = iaGuardarEstado();
                    var regex = textoOriginal.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    var re = new RegExp(regex, "g");
                    if (re.test(editor.innerHTML)) {
                        editor.innerHTML = editor.innerHTML.replace(re, function(match) {
                            return '<span class="ia-texto-modificado" style="background:#dcfce7; padding:1px 2px; border-radius:2px;">' + textoPropuesto + '</span>';
                        });
                        iaRegistrarOperacion(estadoAntes);
                        iaRegistrarOperacion(editor.innerHTML);
                        if (typeof detectarYSincronizarEntries === "function") {
                            detectarYSincronizarEntries();
                        }
                        marcarCambio();
                        setTimeout(function() {
                            document.querySelectorAll(".ia-texto-modificado").forEach(function(el) {
                                el.style.background = "";
                                el.style.padding = "";
                                el.style.borderRadius = "";
                                el.className = "";
                            });
                        }, 3000);
                    }
                    btnContainer.innerHTML = '<span style="color:#16a34a; font-size:11px; font-weight:600;">✅ Cambio aplicado</span>';
                    btnContainer.appendChild(document.createElement("br"));
                    var btnDeshacer = document.createElement("button");
                    btnDeshacer.style.cssText = "font-size:11px; padding:4px 8px; background:none; border:1px solid #d1d5db; border-radius:4px; cursor:pointer; margin-top:4px;";
                    btnDeshacer.textContent = "↶ Deshacer";
                    btnDeshacer.onclick = function() { iaDeshacer(); };
                    btnContainer.appendChild(btnDeshacer);
                };

                var btnCancelar = document.createElement("button");
                btnCancelar.className = "btn btn-secundario";
                btnCancelar.style.cssText = "font-size:11px; padding:5px 10px;";
                btnCancelar.textContent = "CANCELAR";
                btnCancelar.onclick = function() {
                    btnContainer.innerHTML = '<span style="color:#64748b; font-size:11px;">Cambio cancelado</span>';
                };

                btnContainer.appendChild(btnAplicar);
                btnContainer.appendChild(btnCancelar);
                divBubble.appendChild(btnContainer);
            }
        }
    }

    historialChat.push({ rol: "ia", contenido: respuestaLimpia || respuesta });
    guardarChatLocal();
    contChat.scrollTop = contChat.scrollHeight;
}

function iaEjecutarAccion(accion, divBubble) {
    var tipo = accion.accion || "";
    if (tipo === "crear_documento") {
        iaCrearDocumentoEnEditor(accion, divBubble);
    } else if (tipo === "modificar_entry") {
        iaModificarEntry(accion.key || "", accion.value || "", divBubble);
    } else if (tipo === "editar_texto") {
        iaEditarTexto(accion.buscar || "", accion.reemplazar || "", divBubble);
    } else if (tipo === "agregar_texto") {
        iaAgregarTexto(accion.ubicacion || "", accion.referencia || "", accion.texto || "", divBubble);
    } else if (tipo === "eliminar_texto") {
        iaEliminarTexto(accion.buscar || "", divBubble);
    }
}

function iaCrearDocumentoEnEditor(accion, divBubble) {
    var editor = document.getElementById("editor");
    if (!editor) return;

    var estadoAntes = iaGuardarEstado();
    if (estadoAntes) iaRegistrarOperacion(estadoAntes);

    var texto = accion.texto || "";
    var lineas = texto.split("\n");
    var html = lineas.map(function(l) {
        if (!l.trim()) return "<br>";
        return "<p>" + escapeHTML(l) + "</p>";
    }).join("");
    editor.innerHTML = html;

    if (accion.titulo) {
        docBaseSeleccionado = {
            nombre: accion.titulo,
            categoria: accion.categoria || "OTROS",
            subcategoria: accion.subcategoria || "",
            procedimiento: accion.procedimiento || ""
        };
    }

    if (typeof detectarYSincronizarEntries === "function") {
        detectarYSincronizarEntries();
    }
    marcarCambio();
    iaRegistrarOperacion(editor.innerHTML);

    document.getElementById("panelEditor").style.display = "flex";

    var btns = document.createElement("div");
    btns.style.cssText = "display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;";
    var lbl = document.createElement("span");
    lbl.style.cssText = "color:#16a34a; font-size:11px; font-weight:600; align-self:center;";
    lbl.textContent = "✅ Documento creado en el editor";
    btns.appendChild(lbl);

    var btnDesc = document.createElement("button");
    btnDesc.className = "btn btn-primary";
    btnDesc.style.cssText = "font-size:11px; padding:5px 10px; background:#d97706;";
    btnDesc.textContent = "💾 DESCARGAR DOCX";
    btnDesc.onclick = function() { descargarDocx(); };
    btns.appendChild(btnDesc);

    var btnGuardar = document.createElement("button");
    btnGuardar.className = "btn btn-primary";
    btnGuardar.style.cssText = "font-size:11px; padding:5px 10px; background:#7c3aed;";
    btnGuardar.textContent = "📁 GUARDAR COMO BASE";
    btnGuardar.onclick = function() { iaGuardarComoBase(); };
    btns.appendChild(btnGuardar);

    divBubble.appendChild(btns);
}

function iaModificarEntry(key, value, divBubble) {
    if (!key) return;
    var editor = document.getElementById("editor");

    if (!configuracionActual) configuracionActual = {};
    if (!configuracionActual.dynamicEntries) configuracionActual.dynamicEntries = {};
    var entry = configuracionActual.dynamicEntries[key];
    if (!entry) {
        configuracionActual.dynamicEntries[key] = {
            variable: key,
            nombre: nombreAmigableVariable(key),
            color: asignarColorDinamico ? asignarColorDinamico(key) : "#D1C4E9",
            instances: 0,
            order: Object.keys(configuracionActual.dynamicEntries).length,
            value: value,
            placeholder: "[" + key + "]"
        };
        entry = configuracionActual.dynamicEntries[key];
    }

    var estadoAntes = iaGuardarEstado();
    if (estadoAntes) iaRegistrarOperacion(estadoAntes);

    entry.value = value;

    if (editor) {
        var spans = editor.querySelectorAll('span[data-key="' + key + '"]');
        spans.forEach(function(span) {
            span.textContent = value;
            if (value.trim()) {
                span.style.background = "#bbf7d0";
            } else {
                span.style.background = entry.color || "#D1C4E9";
            }
        });
        marcarCambio();
        iaRegistrarOperacion(editor.innerHTML);
    }

    if (typeof construirListaEntriesPlana === "function" && configuracionActual.dynamicEntries) {
        var vars = Object.keys(configuracionActual.dynamicEntries);
        construirListaEntriesPlana(vars, {}, {});
    }

    var btns = document.createElement("div");
    btns.style.cssText = "margin-top:8px;";
    var lbl = document.createElement("span");
    lbl.style.cssText = "color:#16a34a; font-size:11px; font-weight:600;";
    lbl.textContent = "✅ Entry [" + key + "] = \"" + value + "\"";
    btns.appendChild(lbl);
    divBubble.appendChild(btns);
}

function iaEditarTexto(buscar, reemplazar, divBubble) {
    var editor = document.getElementById("editor");
    if (!editor || !buscar) return;

    var estadoAntes = iaGuardarEstado();
    if (estadoAntes) iaRegistrarOperacion(estadoAntes);

    var escaped = buscar.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var re = new RegExp(escaped, "g");

    if (re.test(editor.innerHTML)) {
        editor.innerHTML = editor.innerHTML.replace(re, function(match) {
            return '<span class="ia-texto-modificado" style="background:#dcfce7; padding:1px 2px; border-radius:2px;">' + reemplazar + '</span>';
        });
        iaRegistrarOperacion(editor.innerHTML);
        if (typeof detectarYSincronizarEntries === "function") {
            detectarYSincronizarEntries();
        }
        marcarCambio();
        setTimeout(function() {
            document.querySelectorAll(".ia-texto-modificado").forEach(function(el) {
                el.style.background = "";
                el.style.padding = "";
                el.style.borderRadius = "";
                el.className = "";
            });
        }, 3000);
    }

    var btns = document.createElement("div");
    btns.style.cssText = "margin-top:8px;";
    var lbl = document.createElement("span");
    lbl.style.cssText = "color:#16a34a; font-size:11px; font-weight:600;";
    lbl.textContent = "✅ Texto modificado en el editor";
    btns.appendChild(lbl);
    divBubble.appendChild(btns);
}

function iaAgregarTexto(ubicacion, referencia, texto, divBubble) {
    var editor = document.getElementById("editor");
    if (!editor || !texto) return;

    var estadoAntes = iaGuardarEstado();
    if (estadoAntes) iaRegistrarOperacion(estadoAntes);

    var nuevoP = document.createElement("p");
    nuevoP.textContent = texto;
    nuevoP.style.cssText = "background:#dcfce7; padding:1px 2px; border-radius:2px;";

    if (referencia && ubicacion) {
        var spans = editor.querySelectorAll("span[data-key]");
        var parrafos = editor.querySelectorAll("p");
        var insertarDespues = null;

        for (var i = 0; i < parrafos.length; i++) {
            if (parrafos[i].innerText && parrafos[i].innerText.indexOf(referencia) !== -1) {
                insertarDespues = parrafos[i];
                break;
            }
        }
        if (!insertarDespues) {
            for (var j = 0; j < spans.length; j++) {
                if (spans[j].getAttribute("data-key") === referencia || spans[j].textContent === referencia) {
                    insertarDespues = spans[j].closest("p") || spans[j];
                    break;
                }
            }
        }

        if (insertarDespues && ubicacion === "despues_de") {
            if (insertarDespues.nextSibling) {
                editor.insertBefore(nuevoP, insertarDespues.nextSibling);
            } else {
                editor.appendChild(nuevoP);
            }
        } else if (insertarDespues && ubicacion === "antes_de") {
            editor.insertBefore(nuevoP, insertarDespues);
        } else {
            editor.appendChild(nuevoP);
        }
    } else {
        editor.appendChild(nuevoP);
    }

    iaRegistrarOperacion(editor.innerHTML);
    if (typeof detectarYSincronizarEntries === "function") {
        detectarYSincronizarEntries();
    }
    marcarCambio();
    setTimeout(function() {
        nuevoP.style.background = "";
        nuevoP.style.padding = "";
        nuevoP.style.borderRadius = "";
    }, 3000);

    var btns = document.createElement("div");
    btns.style.cssText = "margin-top:8px;";
    var lbl = document.createElement("span");
    lbl.style.cssText = "color:#16a34a; font-size:11px; font-weight:600;";
    lbl.textContent = "✅ Texto agregado al editor";
    btns.appendChild(lbl);
    divBubble.appendChild(btns);
}

function iaEliminarTexto(buscar, divBubble) {
    var editor = document.getElementById("editor");
    if (!editor || !buscar) return;

    var estadoAntes = iaGuardarEstado();
    if (estadoAntes) iaRegistrarOperacion(estadoAntes);

    var parrafos = editor.querySelectorAll("p");
    var eliminado = false;

    for (var i = 0; i < parrafos.length; i++) {
        if (parrafos[i].innerText && parrafos[i].innerText.indexOf(buscar) !== -1) {
            parrafos[i].style.background = "#fee2e2";
            setTimeout(function(p) {
                p.parentNode && p.parentNode.removeChild(p);
            }.bind(null, parrafos[i]), 500);
            eliminado = true;
            break;
        }
    }

    setTimeout(function() {
        iaRegistrarOperacion(editor.innerHTML);
        if (typeof detectarYSincronizarEntries === "function") {
            detectarYSincronizarEntries();
        }
        marcarCambio();
    }, 600);

    var btns = document.createElement("div");
    btns.style.cssText = "margin-top:8px;";
    var lbl = document.createElement("span");
    lbl.style.cssText = "color:" + (eliminado ? "#16a34a" : "#d97706") + "; font-size:11px; font-weight:600;";
    lbl.textContent = eliminado ? "✅ Texto eliminado del editor" : "⚠️ No se encontró el texto";
    btns.appendChild(lbl);
    divBubble.appendChild(btns);
}

var _iaDocGenResultado = null;

async function iaCrearDocumento() {
    var input = document.getElementById("chatMensaje");
    var msg = (input.value || "").trim();
    if (!msg) {
        msg = prompt("Describe el documento que necesitas:", "Necesito una demanda de pensión alimenticia para dos niños.");
        if (!msg) return;
    }

    input.value = "";
    agregarBurbujaChat("usuario", msg, true);

    var cont = document.getElementById("chatIA");
    var div = document.createElement("div");
    div.style.cssText = "margin:6px 0; padding:8px 10px; border-radius:8px; white-space:pre-wrap; word-break:break-word; font-size:13px; background:#f0fdf4; border:1px solid #86efac;";
    div.innerHTML = "📄 Generando documento... <span class='ia-cursor'>▌</span>";
    cont.appendChild(div);
    cont.scrollTop = cont.scrollHeight;

    try {
        var resp = await fetch("/api/ia/crear-documento", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ instruccion: msg, historial: historialChat.slice(-10) })
        });

        if (!resp.ok) {
            var err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || "Error al generar documento");
        }

        var result = await resp.json();
        _iaDocGenResultado = result;

        var entriesHtml = "";
        if (result.entries_pendientes && result.entries_pendientes.length > 0) {
            entriesHtml = "\n\n📋 Entries pendientes:\n" + result.entries_pendientes.map(function(e) { return "  • " + e; }).join("\n");
        }

        div.innerHTML = "📄 <b>Documento generado:</b> " + escapeHTML(result.titulo) +
            "\n\n📂 " + escapeHTML(result.categoria) + " › " + escapeHTML(result.subcategoria) +
            entriesHtml +
            "\n\n✅ Listo para previsualizar o guardar.";

        var btnContainer = document.createElement("div");
        btnContainer.className = "ia-action-buttons";
        btnContainer.style.cssText = "display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;";

        var btnPreview = document.createElement("button");
        btnPreview.className = "btn btn-primary";
        btnPreview.style.cssText = "font-size:11px; padding:5px 10px; background:#2563eb;";
        btnPreview.textContent = "👁 PREVISUALIZAR";
        btnPreview.onclick = function() { iaPrevisualizarDocumento(); };

        var btnEditar = document.createElement("button");
        btnEditar.className = "btn btn-primary";
        btnEditar.style.cssText = "font-size:11px; padding:5px 10px; background:#059669;";
        btnEditar.textContent = "✏️ EDITAR";
        btnEditar.onclick = function() { iaCargarEnEditor(); };

        var btnDescargar = document.createElement("button");
        btnDescargar.className = "btn btn-primary";
        btnDescargar.style.cssText = "font-size:11px; padding:5px 10px; background:#d97706;";
        btnDescargar.textContent = "💾 DESCARGAR DOCX";
        btnDescargar.onclick = function() { iaDescargarDocxGenerado(); };

        var btnGuardar = document.createElement("button");
        btnGuardar.className = "btn btn-primary";
        btnGuardar.style.cssText = "font-size:11px; padding:5px 10px; background:#7c3aed;";
        btnGuardar.textContent = "📁 GUARDAR COMO BASE";
        btnGuardar.onclick = function() { iaGuardarComoBase(); };

        btnContainer.appendChild(btnPreview);
        btnContainer.appendChild(btnEditar);
        btnContainer.appendChild(btnDescargar);
        btnContainer.appendChild(btnGuardar);
        div.appendChild(btnContainer);

        historialChat.push({ rol: "ia", contenido: "Documento generado: " + result.titulo });
        guardarChatLocal();

    } catch (error) {
        console.error("Error creando documento:", error);
        div.innerHTML = "❌ Error: " + escapeHTML(error.message);
    }

    cont.scrollTop = cont.scrollHeight;
}

function iaPrevisualizarDocumento() {
    if (!_iaDocGenResultado || !_iaDocGenResultado.texto) return;
    var texto = _iaDocGenResultado.texto;
    var html = textoPlanoToHtml(texto);
    var editor = document.getElementById("editor");
    if (editor) {
        editor.innerHTML = html;
        document.getElementById("panelEditor").style.display = "flex";
    }
}

function iaCargarEnEditor() {
    if (!_iaDocGenResultado || !_iaDocGenResultado.texto) return;
    var texto = _iaDocGenResultado.texto;
    var html = textoPlanoToHtml(texto);
    var editor = document.getElementById("editor");
    if (editor) {
        editor.innerHTML = html;
        document.getElementById("panelEditor").style.display = "flex";
        if (typeof detectarYSincronizarEntries === "function") {
            detectarYSincronizarEntries();
        }
        marcarCambio();
    }
}

function iaDescargarDocxGenerado() {
    if (!_iaDocGenResultado || !_iaDocGenResultado.docx_base64) return;
    var bytes = Uint8Array.from(atob(_iaDocGenResultado.docx_base64), function(c) { return c.charCodeAt(0); });
    var blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    var filename = _iaDocGenResultado.filename || "documento.docx";

    if (window.showSaveFilePicker) {
        window.showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: "Documento Word", accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] } }]
        }).then(function(handle) {
            return handle.createWritable();
        }).then(function(writable) {
            return writable.write(blob).then(function() { return writable.close(); });
        }).catch(function(e) {
            if (e.name !== "AbortError") {
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a"); a.href = url; a.download = filename;
                document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            }
        });
    } else {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a"); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }
}

function iaGuardarComoBase() {
    if (!_iaDocGenResultado) return;
    document.getElementById("modalGenBaseNombre").value = _iaDocGenResultado.titulo || "";
    document.getElementById("modalGenBaseCategoria").value = _iaDocGenResultado.categoria || "OTROS";
    document.getElementById("modalGenBaseSubcategoria").value = _iaDocGenResultado.subcategoria || "";
    document.getElementById("modalGenBaseProcedimiento").value = _iaDocGenResultado.procedimiento || "";
    document.getElementById("modalGenBaseDescripcion").value = "";
    document.getElementById("modalGenBase").classList.add("abierto");
}

function cerrarModalGenBase() {
    document.getElementById("modalGenBase").classList.remove("abierto");
}

async function confirmarGuardarGenBase() {
    if (!_iaDocGenResultado) return;
    var nombre = document.getElementById("modalGenBaseNombre").value.trim();
    var categoria = document.getElementById("modalGenBaseCategoria").value.trim();
    var subcategoria = document.getElementById("modalGenBaseSubcategoria").value.trim();
    var procedimiento = document.getElementById("modalGenBaseProcedimiento").value.trim();
    var descripcion = document.getElementById("modalGenBaseDescripcion").value.trim();

    if (!nombre) { alert("Ingrese un nombre."); return; }

    var bytes = Uint8Array.from(atob(_iaDocGenResultado.docx_base64), function(c) { return c.charCodeAt(0); });
    var blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

    var formData = new FormData();
    formData.append("file", blob, _iaDocGenResultado.filename || "documento.docx");
    formData.append("nombre", nombre);
    formData.append("categoria", categoria || "OTROS");
    formData.append("subcategoria", subcategoria || "");
    formData.append("procedimiento", procedimiento || "");
    formData.append("descripcion", descripcion || "");

    try {
        cerrarModalGenBase();
        var resp = await fetch("/api/documentos-base/subir", { method: "POST", body: formData });
        if (!resp.ok) throw new Error("Error al guardar");
        await agregarATaxonomia(categoria, subcategoria || null, procedimiento || null);
        await cargarDocumentosBase();
        alert("Documento guardado como documento base.");
    } catch (e) {
        alert("Error: " + e.message);
    }
}

var _iaSeleccionAnterior = "";

function iaDetectarSeleccion() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    var texto = sel.toString().trim();
    if (texto && texto.length > 5 && texto !== _iaSeleccionAnterior) {
        _iaSeleccionAnterior = texto;
        var indicador = document.getElementById("iaSeleccionIndicator");
        if (indicador) {
            indicador.style.display = "block";
            indicador.textContent = "📝 Texto seleccionado (" + texto.length + " caracteres) — escribe una instrucción en el chat";
        }
    } else if (!texto) {
        _iaSeleccionAnterior = "";
        var indicador = document.getElementById("iaSeleccionIndicator");
        if (indicador) indicador.style.display = "none";
    }
}

document.addEventListener("selectionchange", function() {
    if (window._timerIaSeleccion) clearTimeout(window._timerIaSeleccion);
    window._timerIaSeleccion = setTimeout(iaDetectarSeleccion, 300);
});

document.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (iaIndiceOperacion > 0) { e.preventDefault(); iaDeshacer(); }
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        if (iaIndiceOperacion < iaHistorialOperaciones.length - 1) { e.preventDefault(); iaRehacer(); }
    }
});


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
function attachEntryInputListeners(input) {
    if (input.dataset.bound === "1") return;
    input.dataset.bound = "1";

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
            guardarEstado();
            guardarEstadoEditor();
            programarGuardado();
            programarGuardadoConfiguracion();
            guardarCampoEnMemoria(key, nuevoValor);

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

            if (timerResaltarTipo) {
                clearTimeout(timerResaltarTipo);
                timerResaltarTipo = null;
            }

            comprometerEdicion();
            guardarUndo();

            comprometerTipoJuicio(valor);
        });
    } else if (esNombre) {
        input.addEventListener("blur", () => {
            const valor = input.value;
            const editor = document.getElementById("editor");

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
}

document.querySelectorAll(".entry-input").forEach(input => {
    attachEntryInputListeners(input);
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

function setupEditorToEntrySync() {
    const editor = document.getElementById("editor");
    if (!editor) return;

    editor.addEventListener("input", () => {
        const spans = editor.querySelectorAll("span[data-key]");
        const synced = new Set();
        spans.forEach(span => {
            const key = span.getAttribute("data-key");
            if (synced.has(key)) return;
            synced.add(key);
            const input = document.getElementById(key);
            if (!input || input === document.activeElement) return;
            const texto = span.textContent.trim();
            input.value = texto;
        });
    });
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
    if (configuracionActual && configuracionActual.blockEntries) {
        var sysBlocks = configuracionActual.blockEntries;
        for (var bId in sysBlocks) {
            var entries = sysBlocks[bId];
            if (entries) {
                var _e = entries.find(en => en.id === key || en.variable === key);
                if (_e && _e.color) return _e.color;
            }
        }
    }
    const _customBlocks = ecGetCustomBloques();
    for (const _b of _customBlocks) {
        const _e = (_b.entries || []).find(en => en.id === key || en.variable === key);
        if (_e && _e.color) return _e.color;
    }
    if (configuracionActual && configuracionActual.dynamicEntries && configuracionActual.dynamicEntries[key] && configuracionActual.dynamicEntries[key].color) {
        return configuracionActual.dynamicEntries[key].color;
    }
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
        if (configuracionActual.mapeo) {
            var conteosAfter = {};
            Object.keys(configuracionActual.mapeo).forEach(function(eid) {
                var marks = configuracionActual.mapeo[eid];
                if (marks && marks.length > 0) conteosAfter[eid] = marks.length;
            });
            marcarEntriesConVariables(configuracionActual.mapeo, conteosAfter);
        }
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
    const plano = editorAPlano();

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
        const texto = editorAPlanoLimpio();

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
        const nombreArchivo = generarNombreArchivo();

        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: nombreArchivo,
                    types: [{
                        description: "Documento Word",
                        accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (e) {
                if (e.name === "AbortError") return;
            }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error:", error);
        alert("Error al descargar DOCX");
    }
}

function generarNombreArchivo() {
    const prioridades = [
        "NOMBRE_ACTOR_1", "NOMBRE_DEMANDANTE_1", "NOMBRE_DENUNCIANTE_1",
        "NOMBRE_VICTIMA_1", "NOMBRE_PERSONA", "NOMBRE_CLIENTE"
    ];
    let nombrePersona = "";
    const entries = (configuracionActual && configuracionActual.dynamicEntries) || {};
    for (let i = 0; i < prioridades.length; i++) {
        const key = prioridades[i];
        if (entries[key] && entries[key].value && entries[key].value.trim()) {
            nombrePersona = entries[key].value.trim();
            break;
        }
    }
    if (!nombrePersona) {
        for (const key in entries) {
            if (entries[key] && entries[key].value && entries[key].value.trim() &&
                (key.indexOf("NOMBRE") !== -1 || key.indexOf("ACTOR") !== -1 || key.indexOf("DEMANDADO") !== -1)) {
                nombrePersona = entries[key].value.trim();
                break;
            }
        }
    }

    let tipoDocumento = "";
    if (docBaseSeleccionado) {
        const sub = (docBaseSeleccionado.subcategoria || "").trim();
        const cat = (docBaseSeleccionado.categoria || "").trim();
        const nombreDoc = (docBaseSeleccionado.nombre || "").trim();
        if (sub) {
            tipoDocumento = sub;
        } else if (cat) {
            tipoDocumento = "Demanda " + cat;
        } else if (nombreDoc) {
            tipoDocumento = nombreDoc;
        }
    }
    if (!tipoDocumento) {
        tipoDocumento = "Documento JurisFlow";
    }

    function limpiarNombre(str) {
        return str
            .replace(/[<>:"/\\|?*]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    let partes = [];
    if (nombrePersona) partes.push(limpiarNombre(nombrePersona));
    partes.push(limpiarNombre(tipoDocumento));
    let nombreFinal = partes.join(" - ");
    if (nombreFinal.length > 120) nombreFinal = nombreFinal.substring(0, 120).trim();
    return nombreFinal + ".docx";
}

var cambiosPendientes = 0;
var ultimoTextoGuardado = "";

function marcarCambio() {
    if (!documentoBaseId) return;
    cambiosPendientes++;
    actualizarEstadoBotonGuardarCambios();
}

function limpiarCambioPendiente() {
    cambiosPendientes = 0;
    ultimoTextoGuardado = document.getElementById("editor").innerText;
    actualizarEstadoBotonGuardarCambios();
}

function actualizarEstadoBotonGuardarCambios() {
    var btn = document.getElementById("btnGuardarCambios");
    var badge = document.getElementById("cambiosPendientesBadge");
    var count = document.getElementById("cambiosPendientesCount");
    if (!btn) return;

    if (!documentoBaseId) {
        btn.disabled = true;
        btn.title = "Abra un documento base primero";
        if (badge) badge.style.display = "none";
        return;
    }

    if (cambiosPendientes > 0) {
        btn.disabled = false;
        btn.title = "Guardar cambios en el documento base";
        if (badge) badge.style.display = "inline";
        if (count) count.textContent = cambiosPendientes;
    } else {
        btn.disabled = true;
        btn.title = "No hay cambios pendientes";
        if (badge) badge.style.display = "none";
    }
}

function guardarCambios() {
    if (!documentoBaseId) {
        alert("No hay documento base abierto.");
        return;
    }
    var modal = document.getElementById("modalGuardarCambios");
    var versionInfo = document.getElementById("guardarCambiosVersionInfo");
    if (versionInfo) {
        versionInfo.textContent = "Documento base: " + (archivoActual || documentoBaseId);
    }
    if (modal) {
        modal.classList.add("abierto");
    }
}

function rechazarGuardarCambios() {
    var modal = document.getElementById("modalGuardarCambios");
    if (modal) {
        modal.classList.remove("abierto");
    }
}

async function confirmarGuardarCambios() {
    if (!documentoBaseId) {
        alert("No hay documento base abierto.");
        return;
    }

    var modal = document.getElementById("modalGuardarCambios");
    if (modal) modal.classList.remove("abierto");

    var modalEstado = document.getElementById("modalEstadoGuardado");
    var icono = document.getElementById("estadoGuardadoIcono");
    var mensaje = document.getElementById("estadoGuardadoMensaje");
    var detalle = document.getElementById("estadoGuardadoDetalle");
    var acciones = document.getElementById("estadoGuardadoAcciones");

    if (modalEstado) modalEstado.classList.add("abierto");
    if (icono) icono.textContent = "💾";
    if (mensaje) mensaje.textContent = "Guardando cambios...";
    if (detalle) detalle.textContent = "Generando documento y actualizando en Google Drive...";
    if (acciones) acciones.style.display = "none";

    try {
        var textoPlano = editorAPlano();

        var resp = await fetch("/api/documentos-base/" + documentoBaseId + "/guardar-cambios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto_plano: textoPlano })
        });

        if (!resp.ok) {
            var err = await resp.json().catch(function() { return {}; });
            throw new Error(err.detail || "Error al guardar cambios");
        }

        var result = await resp.json();

        if (icono) icono.textContent = "✅";
        if (mensaje) mensaje.textContent = "Cambios guardados correctamente.";
        if (detalle) detalle.textContent = "Documento base actualizado. Version: " + result.version;
        if (acciones) acciones.style.display = "block";

        cambiosPendientes = 0;
        ultimoTextoGuardado = textoPlano;
        actualizarEstadoBotonGuardarCambios();

    } catch (error) {
        console.error("Error guardando cambios:", error);
        if (icono) icono.textContent = "❌";
        if (mensaje) mensaje.textContent = "No se pudieron guardar los cambios.";
        if (detalle) detalle.textContent = error.message || "Error desconocido";
        if (acciones) acciones.style.display = "block";
    }
}

function cerrarEstadoGuardado() {
    var modal = document.getElementById("modalEstadoGuardado");
    if (modal) modal.classList.remove("abierto");
}

function generarDocumento() {
    const editor = document.getElementById("editor");

    const texto = editorAPlano();

    const blob = new Blob([texto], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "documento_editado.txt";
    a.click();

    URL.revokeObjectURL(url);
}

let modo = "actor1";

const PAGINAS_FIJAS = ["actor1", "actor2", "demandado", "hechos", "testigos", "otros", "pruebas", "pretensiones", "fundamentos", "proceso", "notificaciones", "excepciones", "pronunciamiento", "laboral"];
let PAGINAS = [...PAGINAS_FIJAS];
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

function rebuildPaginasDinamicas() {
    document.querySelectorAll(".pagina-custom-dinamica").forEach(el => el.remove());

    var deletedBlockIds = (configuracionActual && configuracionActual.deletedCustomBlocks) || [];

    EC_SYS_BLOCK_IDS.forEach(function(pageId) {
        var pageDiv = document.getElementById("pagina-" + pageId);
        if (!pageDiv) return;
        if (deletedBlockIds.indexOf(pageId) !== -1) {
            pageDiv.style.display = "none";
            return;
        }
        var entries = getActiveEntries(pageId);
        var customName = (configuracionActual && configuracionActual.blockNames && configuracionActual.blockNames[pageId]) || null;
        var nombre = customName || EC_SYS_BLOCK_NAMES[pageId] || pageId.toUpperCase();
        var inner = "<h4>" + nombre + "</h4>";
        entries.forEach(function(e) {
            inner += '<div class="campo">' +
                '<button class="btn-rojo" data-key="' + e.id + '" onmousedown="event.preventDefault()" style="background:' + (e.color || '#D1C4E9') + '"></button>' +
                '<input id="' + e.id + '" class="entry-input" placeholder="' + e.nombre + '">' +
                '</div>';
        });
        if (entries.length === 0) {
            inner += '<p style="color:#94a3b8; font-size:12px; padding:8px 0;">Sin entries. Edite este bloque desde EDITAR CAMPOS.</p>';
        }
        pageDiv.innerHTML = inner;
    });

    const customBlocks = ecGetCustomBloques();
    const lastFixed = document.getElementById("pagina-laboral");
    if (!lastFixed) return;
    const parent = lastFixed.parentNode;

    customBlocks.forEach(b => {
        const div = document.createElement("div");
        div.id = "pagina-" + b.id;
        div.className = "pagina-entries pagina-custom-dinamica";
        div.style.display = "none";

        let inner = `<h4>${b.nombre}</h4>`;
        (b.entries || []).forEach(e => {
            inner += `<div class="campo">
                <button class="btn-rojo" data-key="${e.id}" onmousedown="event.preventDefault()" style="background:${e.color || '#D1C4E9'}"></button>
                <input id="${e.id}" class="entry-input" placeholder="${e.nombre}">
            </div>`;
        });
        if ((b.entries || []).length === 0) {
            inner += '<p style="color:#94a3b8; font-size:12px; padding:8px 0;">Sin entries. Edite este bloque desde EDITAR CAMPOS.</p>';
        }
        div.innerHTML = inner;
        parent.insertBefore(div, lastFixed.nextSibling);
    });

    var dynEntries = (configuracionActual && configuracionActual.dynamicEntries) || {};
    var dynKeys = Object.keys(dynEntries);
    if (dynKeys.length > 0) {
        var dynDiv = document.createElement("div");
        dynDiv.id = "pagina-dynamic-entries";
        dynDiv.className = "pagina-entries pagina-custom-dinamica";
        dynDiv.style.display = "none";
        var dynInner = "<h4>VARIABLES DETECTADAS</h4>";
        dynKeys.sort(function(a, b) {
            return (dynEntries[a].order || 0) - (dynEntries[b].order || 0);
        });
        dynKeys.forEach(function(variable) {
            var de = dynEntries[variable];
            var dynBloque = de.bloque || "otros";
            var dynLabel = de.nombre || nombreAmigableVariable(variable);
            dynInner += '<div class="campo" data-dynamic-block="' + dynBloque + '">' +
                '<button class="btn-rojo" data-key="' + variable + '" onmousedown="event.preventDefault()" style="background:' + (de.color || '#D1C4E9') + '"></button>' +
                '<input id="' + variable + '" class="entry-input" placeholder="' + dynLabel + '">' +
                '</div>';
        });
        dynDiv.innerHTML = dynInner;
        parent.insertBefore(dynDiv, lastFixed.nextSibling);
    }

    var orderedPags = configuracionActual && configuracionActual.blockOrder ? configuracionActual.blockOrder : [...PAGINAS_FIJAS];
    var customIds = customBlocks.map(b => b.id);
    orderedPags = orderedPags.filter(function(id) {
        if (deletedBlockIds.indexOf(id) !== -1) return false;
        return EC_SYS_BLOCK_IDS.indexOf(id) !== -1 || customIds.indexOf(id) !== -1;
    });
    PAGINAS = orderedPags.concat(customIds.filter(id => orderedPags.indexOf(id) === -1));
    if (dynKeys.length > 0 && PAGINAS.indexOf("dynamic-entries") === -1) {
        PAGINAS.push("dynamic-entries");
    }

    if (!PAGINAS.includes(modo)) {
        modo = PAGINAS[0];
        mostrarPagina(modo);
    }

    document.querySelectorAll(".pagina-entries .entry-input").forEach(input => {
        attachEntryInputListeners(input);
    });
}

document.addEventListener("DOMContentLoaded", () => {

    colorearBotones();

    cargarInstrucciones();
    cargarChat();

    mostrarPagina("actor1");
    rebuildPaginasDinamicas();
    setupEditorToEntrySync();

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
        await cargarTaxonomia();
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
        var deletedBlockIds = (configGuardada && configGuardada.deletedCustomBlocks) || [];
        var savedBlockEntries = {};
        var savedBlockOrder = null;
        if (configGuardada && configGuardada.blockEntries) {
            Object.keys(configGuardada.blockEntries).forEach(function(k) {
                if (deletedBlockIds.indexOf(k) === -1) {
                    savedBlockEntries[k] = configGuardada.blockEntries[k];
                }
            });
            console.log("[MEMORIA] BlockEntries restaurados:", Object.keys(savedBlockEntries).length);
        }
        if (configGuardada && configGuardada.blockOrder) {
            savedBlockOrder = configGuardada.blockOrder.filter(function(id) {
                return deletedBlockIds.indexOf(id) === -1;
            });
        }
        if (configGuardada && configGuardada.customBlocks && configGuardada.customBlocks.length > 0) {
            var filteredBlocks = configGuardada.customBlocks.filter(function(b) {
                return deletedBlockIds.indexOf(b.id) === -1;
            });
            if (filteredBlocks.length > 0) {
                ecSaveCustomBloques(filteredBlocks);
                console.log("[MEMORIA] Bloques personalizados restaurados:", filteredBlocks.length);
            }
        }
        var savedMemoriaDocData = (configGuardada && configGuardada.memoriaDocData) || null;
        configuracionActual = { marcadores, mapeo, resaltados, tieneMapeoGuardado, deletedCustomBlocks: (configGuardada && configGuardada.deletedCustomBlocks) || [], customBlocks: ecGetCustomBloques(), blockEntries: savedBlockEntries, blockOrder: savedBlockOrder, blockNames: (configGuardada && configGuardada.blockNames) || null, dynamicEntries: (configGuardada && configGuardada.dynamicEntries) || {} };

        if (savedMemoriaDocData && documentoId) {
            if (!memoriaDocs.documentos[documentoId]) {
                memoriaDocs.documentos[documentoId] = { campos: {}, resaltados: [] };
            }
            if (savedMemoriaDocData.campos) {
                Object.keys(savedMemoriaDocData.campos).forEach(function(k) {
                    memoriaDocs.documentos[documentoId].campos[k] = savedMemoriaDocData.campos[k];
                });
            }
            guardarMemoriaDocs();
            console.log("[MEMORIA] Valores de campos restaurados desde Drive:", Object.keys(savedMemoriaDocData.campos || {}).length, "campos");
        }

        detectarYSincronizarEntries();

        if (!tieneMapeoGuardado && Object.keys(mapeo).length > 0) {
            console.log("[MEMORIA] Guardando configuración inicial automáticamente...");
            await guardarConfiguracionEnDrive();
        }

        cambiosPendientes = 0;
        ultimoTextoGuardado = document.getElementById("editor").innerText;
        actualizarEstadoBotonGuardarCambios();

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
    const customBlocks = ecGetCustomBloques();
    const deletedCustomBlocks = configuracionActual.deletedCustomBlocks || [];
    const blockEntries = configuracionActual.blockEntries || {};
    const blockOrder = configuracionActual.blockOrder || null;
    const blockNames = configuracionActual.blockNames || null;
    const dynamicEntries = configuracionActual.dynamicEntries || {};
    var memoriaDocData = null;
    if (documentoId && memoriaDocs.documentos && memoriaDocs.documentos[documentoId]) {
        memoriaDocData = memoriaDocs.documentos[documentoId];
    }

    try {
        console.log("[MEMORIA] Cambio detectado");
        console.log("[MEMORIA] Documento ID:", documentoBaseId);
        console.log("[MEMORIA] Preparando configuración:", Object.keys(mapeo).length, "entradas,", Object.keys(resaltados).length, "resaltados,", Object.keys(blockEntries).length, "blockEntries");
        console.log("[MEMORIA] Enviando configuración al backend...");
        const resp = await fetch(`/api/documentos-base/${documentoBaseId}/guardar-configuracion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mapeo, resaltados, customBlocks, deletedCustomBlocks, blockEntries, blockOrder, blockNames, dynamicEntries, memoriaDocData })
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

function editorAPlano() {
    var editor = document.getElementById("editor");
    if (!editor) return "";
    var lineas = [];
    editor.childNodes.forEach(function(nodo) {
        if (nodo.nodeType === 3) {
            var t = nodo.textContent.trim();
            if (t) lineas.push(t);
        } else if (nodo.nodeType === 1) {
            var tag = nodo.tagName;
            if (tag === "P") {
                var txt = nodo.innerText.replace(/\n+$/, "").trim();
                lineas.push(txt);
            } else if (tag === "BR") {
                lineas.push("");
            } else {
                var txt = nodo.innerText ? nodo.innerText.replace(/\n+$/, "").trim() : "";
                if (txt) lineas.push(txt);
            }
        }
    });
    while (lineas.length > 0 && lineas[lineas.length - 1] === "") {
        lineas.pop();
    }
    return lineas.join("\n");
}

function editorAPlanoLimpio() {
    var texto = editorAPlano();
    var entries = (configuracionActual && configuracionActual.dynamicEntries) || {};
    var keys = Object.keys(entries);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var entry = entries[key];
        var val = (entry && entry.value != null) ? String(entry.value).trim() : "";
        var marcador = "[" + key + "]";
        if (val) {
            while (texto.indexOf(marcador) !== -1) {
                texto = texto.replace(marcador, val);
            }
        } else {
            while (texto.indexOf(marcador) !== -1) {
                texto = texto.replace(marcador, "");
            }
        }
    }
    texto = texto.replace(/\[[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9_]*\]/g, "");
    texto = texto.replace(/  +/g, " ");
    texto = texto.replace(/ \n/g, "\n").replace(/\n /g, "\n");
    return texto.trim();
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

function normalizarVariableCanonica(str) {
    return str.toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/g, " ")
        .trim()
        .split(/\s+/)
        .map(function(part) {
            if (/^\d+$/.test(part)) {
                return part.replace(/^0+/, "") || "0";
            }
            return part;
        })
        .join("");
}

function detectarMarcadores(texto) {
    const regex = /\[([^\]]+)\]/g;
    let match;
    const porCanonica = new Map();
    while ((match = regex.exec(texto)) !== null) {
        const contenido = match[1].trim();
        if (!contenido) continue;
        const canonical = normalizarVariableCanonica(contenido);
        if (!porCanonica.has(canonical)) {
            porCanonica.set(canonical, { originals: [], total: 0, contenido: contenido, canonical: canonical });
        }
        const group = porCanonica.get(canonical);
        if (!group.originals.includes(match[0])) {
            group.originals.push(match[0]);
        }
        group.total++;
    }
    const resultado = [];
    porCanonica.forEach(function(group) {
        resultado.push({
            original: group.originals[0],
            contenido: group.contenido,
            count: group.total,
            allOriginals: group.originals,
            canonical: group.canonical
        });
    });
    return resultado;
}

var _EXACT_VAR_MAP_CACHE = null;
function _buildExactVarMap() {
    if (_EXACT_VAR_MAP_CACHE) return _EXACT_VAR_MAP_CACHE;
    var m = {};
    function add(k, v) { m[k] = v; }
    add("numero_juicio","numero_juicio"); add("tipo_juicio","tipo_juicio"); add("unidad_judicial","unidad_judicial_top");
    add("juzgador","juzgador"); add("numero_expediente","numero_expediente"); add("sala_juzgado","sala_juzgado");
    add("ciudad_juicio","ciudad_juicio"); add("canton_juicio","canton_juicio"); add("provincia_juicio","provincia_juicio");
    add("fecha_escrito","fecha_escrito"); add("fecha_presentacion","fecha_presentacion"); add("tipo_accion","tipo_accion");
    add("materia_proceso","materia_proceso"); add("submateria_proceso","submateria_proceso"); add("procedimiento_tipo","procedimiento_tipo");
    add("cuantia","cuantia"); add("cuantia_total","cuantia_total");
    var _a1 = {
        NOMBRE:"actor", CEDULA:"cedula", EDAD:"age", ESTADO_CIVIL:"civil", PROFESION:"profesion",
        NACIONALIDAD:"ciudadania", CIUDADANIA:"ciudadania", CORREO:"email", EMAIL:"email",
        TELEFONO:"telefono_actor", CELULAR:"telefono_actor", CONTACTO:"telefono_actor",
        PARROQUIA:"parroquia_actor", BARRIO:"barrio_actor", CALLE_PRINCIPAL:"calle_principal_actor",
        CALLE_SECUNDARIA:"calle_secundaria_actor", NUMERO_CASA:"numero_casa_actor",
        CODIGO_POSTAL:"codigo_postal_actor", DIRECCION:"direccion_domiciliaria_actor",
        DOMICILIO:"direccion_domiciliaria_actor", CASILLERO:"casillero_judicial_actor"
    };
    for (var f in _a1) {
        if (!_a1.hasOwnProperty(f)) continue;
        add(f + "_ACTOR_1", _a1[f]); add(f + "_DEL_ACTOR", _a1[f]); add(f + "_ACTOR", _a1[f]);
        add(f + "_DEMANDANTE", _a1[f]); add(f + "_DEL_DEMANDANTE", _a1[f]);
        add(f + "_RECLAMANTE", _a1[f]); add(f + "_SOLICITANTE", _a1[f]);
    }
    var _a2 = {
        NOMBRE:"actor_2", CEDULA:"cedula_actor_2", EDAD:"age_actor_2", ESTADO_CIVIL:"civil_actor_2",
        PROFESION:"profesion_actor_2", NACIONALIDAD:"ciudadania_actor_2", CIUDADANIA:"ciudadania_actor_2",
        CORREO:"email_actor_2", EMAIL:"email_actor_2", TELEFONO:"telefono_actor_2", CELULAR:"telefono_actor_2",
        PARROQUIA:"parroquia_actor_2", BARRIO:"barrio_actor_2", CALLE_PRINCIPAL:"calle_principal_actor_2",
        CALLE_SECUNDARIA:"calle_secundaria_actor_2", NUMERO_CASA:"numero_casa_actor_2",
        CODIGO_POSTAL:"codigo_postal_actor_2", DIRECCION:"direccion_domiciliaria_actor_2",
        DOMICILIO:"direccion_domiciliaria_actor_2", CASILLERO:"casillero_judicial_actor_2"
    };
    for (var f in _a2) {
        if (!_a2.hasOwnProperty(f)) continue;
        add(f + "_ACTOR_2", _a2[f]); add(f + "_DEL_ACTOR_2", _a2[f]); add(f + "_SEGUNDO_ACTOR", _a2[f]);
        add(f + "_DEL_SEGUNDO_ACTOR", _a2[f]);
    }
    var _d = {
        NOMBRE:"nombre_demandado", CEDULA:"cedula_demandado", EDAD:"edad_demandado",
        ESTADO_CIVIL:"civil_demandado", PROFESION:"profesion_demandado",
        NACIONALIDAD:"ciudadania_demandado", CIUDADANIA:"ciudadania_demandado",
        CORREO:"email_demandado", EMAIL:"email_demandado", TELEFONO:"telefono_demandado",
        CELULAR:"telefono_demandado", PARROQUIA:"parroquia_demandado", BARRIO:"barrio_demandado",
        CALLE_PRINCIPAL:"calle_principal_demandado", CALLE_SECUNDARIA:"calle_secundaria_demandado",
        NUMERO_CASA:"numero_casa_demandado", CODIGO_POSTAL:"codigo_postal_demandado",
        DIRECCION:"direccion_citacion_demandado", DOMICILIO:"direccion_citacion_demandado",
        CASILLERO:"casillero_judicial_demandado"
    };
    for (var f in _d) {
        if (!_d.hasOwnProperty(f)) continue;
        add(f + "_DEMANDADO", _d[f]); add(f + "_DEL_DEMANDADO", _d[f]);
        add(f + "_REO", _d[f]); add(f + "_DEL_REO", _d[f]);
    }
    var _tg = {
        NOMBRE:"nombre_testigo", CEDULA:"cedula_testigo", CIUDAD:"ciudad_testigo",
        PROVINCIA:"provincia_testigo", CANTON:"canton_testigo", PARROQUIA:"parroquia_testigo",
        BARRIO:"barrio_testigo", DIRECCION:"direccion_testigo", DOMICILIO:"direccion_testigo",
        CORREO:"email_testigo", EMAIL:"email_testigo", TELEFONO:"telefono_testigo",
        CELULAR:"telefono_testigo", EDAD:"edad_testigo", PROFESION:"profesion_testigo",
        NACIONALIDAD:"nacionalidad_testigo", CIUDADANIA:"nacionalidad_testigo",
        DECLARACION:"objeto_testigo", OBJETO:"objeto_testigo"
    };
    for (var t = 1; t <= 8; t++) {
        for (var f in _tg) {
            if (!_tg.hasOwnProperty(f)) continue;
            add(f + "_TESTIGO_" + t, _tg[f] + t);
            add(f + "_DEL_TESTIGO_" + t, _tg[f] + t);
        }
    }
    var _ab = {
        NOMBRE:"nombre_abogado", MATRICULA:"matricula_abogado", CEDULA:"cedula_abogado",
        CORREO:"correo_abogado", TELEFONO:"telefono_abogado", DIRECCION:"direccion_abogado",
        CASILLERO:"casillero_judicial_abogado"
    };
    for (var f in _ab) {
        if (!_ab.hasOwnProperty(f)) continue;
        add(f + "_ABOGADO", _ab[f]); add(f + "_DEL_ABOGADO", _ab[f]);
        add(f + "_APODERADO", _ab[f]); add(f + "_DEFENSOR", _ab[f]);
    }
    add("tipo_patrocinio","tipo_patrocinio");
    for (var p = 1; p <= 2; p++) {
        add("DOCUMENTO_PRUEBA_" + p, "documento_prueba_" + p);
        add("DESCRIPCION_PRUEBA_" + p, "descripcion_prueba_" + p);
        add("FINALIDAD_PRUEBA_" + p, "finalidad_prueba_" + p);
        add("FECHA_DOCUMENTO_PRUEBA_" + p, "fecha_documento_prueba_" + p);
        add("EMISOR_DOCUMENTO_PRUEBA_" + p, "emisor_documento_prueba_" + p);
        add("AUTENTICIDAD_PRUEBA_" + p, "autenticidad_prueba_" + p);
        add("ADMITE_PRUEBA_" + p, "admite_prueba_" + p);
        add("NIEGA_PRUEBA_" + p, "niega_prueba_" + p);
        add("OBJETA_PRUEBA_" + p, "objeta_prueba_" + p);
    }
    for (var pe = 1; pe <= 3; pe++) {
        add("NOMBRE_PERITO_" + pe, "nombre_perito_" + pe);
        add("CEDULA_PERITO_" + pe, "cedula_perito_" + pe);
        add("PROFESION_PERITO_" + pe, "profesion_perito_" + pe);
        add("ESPECIALIDAD_PERITO_" + pe, "especialidad_perito_" + pe);
        add("OBJETO_PERICIA_" + pe, "objeto_pericia_" + pe);
        add("PUNTOS_PERICIA_" + pe, "puntos_pericia_" + pe);
        add("CONCLUSION_PERICIA_" + pe, "conclusion_pericia_" + pe);
        add("REGISTRO_PERITO_" + pe, "registro_perito_" + pe);
        add("CORREO_PERITO_" + pe, "correo_perito_" + pe);
        add("TELEFONO_PERITO_" + pe, "telefono_perito_" + pe);
    }
    add("LUGAR_INSPECCION","lugar_inspeccion"); add("OBJETO_INSPECCION","objeto_inspeccion");
    add("FINALIDAD_INSPECCION","finalidad_inspeccion"); add("FECHA_INSPECCION","fecha_inspeccion");
    add("DIRECCION_INSPECCION","direccion_inspeccion"); add("HECHOS_A_VERIFICAR_INSPECCION","hechos_a_verificar_inspeccion");
    for (var h = 1; h <= 10; h++) { add("HECHO_" + h, "hecho_" + h); add("HECHO_DEFENSA_" + h, "hecho_defensa_" + h); }
    for (var pt = 1; pt <= 10; pt++) { add("PRETENSION_" + pt, "pretension_" + pt); }
    add("PRETENSION_PRINCIPAL","pretension_principal"); add("PRETENSION_SUBSIDIARIA","pretension_subsidiaria");
    add("PRETENSION_ALTERNATIVA","pretension_alternativa"); add("PETICION_FINAL","peticion_final");
    for (var fd = 1; fd <= 5; fd++) { add("FUNDAMENTO_DERECHO_" + fd, "fundamento_derecho_" + fd); }
    for (var n = 1; n <= 2; n++) {
        add("NORMA_" + n, "norma_" + n); add("ARTICULO_NORMA_" + n, "articulo_norma_" + n);
        add("DESCRIPCION_NORMA_" + n, "descripcion_norma_" + n);
    }
    add("CORREO_NOTIFICACION","correo_notificacion");
    add("CASILLERO_ELECTRONICO_ACTOR","casillero_electronico_actor");
    add("CASILLERO_ELECTRONICO_ACTOR_2","casillero_electronico_actor_2");
    add("CASILLERO_ELECTRONICO_DEMANDADO","casillero_electronico_demandado");
    for (var pr = 1; pr <= 10; pr++) {
        add("PRONUNCIAMIENTO_PRETENSION_" + pr, "pronunciamiento_pretension_" + pr);
        add("PRONUNCIAMIENTO_HECHO_" + pr, "pronunciamiento_hecho_" + pr);
        add("ADMITE_PRETENSION_" + pr, "admite_pretension_" + pr);
        add("NIEGA_PRETENSION_" + pr, "niega_pretension_" + pr);
        add("ACEPTA_PRETENSION_" + pr, "acepta_pretension_" + pr);
        add("SE_OPONE_PRETENSION_" + pr, "se_opone_pretension_" + pr);
        add("ADMITE_HECHO_" + pr, "admite_hecho_" + pr);
        add("NIEGA_HECHO_" + pr, "niega_hecho_" + pr);
        add("NO_LE_CONSTA_HECHO_" + pr, "no_le_consta_hecho_" + pr);
    }
    for (var ex = 1; ex <= 5; ex++) { add("EXCEPCION_" + ex, "excepcion_" + ex); }
    add("EXCEPCION_PREVIA_1","excepcion_previa_1"); add("EXCEPCION_PRESCRIPCION","excepcion_prescripcion");
    add("EXCEPCION_CADUCIDAD","excepcion_caducidad"); add("EXCEPCION_COSA_JUZGADA","excepcion_cosa_juzgada");
    add("EXCEPCION_LITISPENDENCIA","excepcion_litispendencia"); add("EXCEPCION_TRANSACCION","excepcion_transaccion");
    add("EXCEPCION_CONVENIO_ARBITRAL","excepcion_convenio_arbitral");
    add("EXCEPCION_INADECUACION_PROCEDIMIENTO","excepcion_inadecuacion_procedimiento");
    add("EXCEPCION_INDEBIDA_ACUMULACION","excepcion_indebida_acumulacion");
    add("EXCEPCION_FALTA_LEGITIMACION","excepcion_falta_legitimacion");
    add("SALARIO","salario"); add("INGRESOS_MENSUALES","ingresos_mensuales");
    add("INGRESOS_EXTRAORDINARIOS","ingresos_extraordinarios"); add("INGRESOS_ANUALES","ingresos_anuales");
    add("EGRESOS_MENSUALES","egresos_mensuales"); add("GASTOS_ALIMENTACION","gastos_alimentacion");
    add("GASTOS_VIVIENDA","gastos_vivienda"); add("GASTOS_EDUCACION","gastos_educacion");
    add("GASTOS_SALUD","gastos_salud"); add("GASTOS_TRANSPORTE","gastos_transporte");
    add("CARGA_FAMILIAR","carga_familiar"); add("PERSONAS_A_CARGO","personas_a_cargo");
    add("NUMERO_HIJOS","numero_hijos"); add("EMPRESA_TRABAJO","empresa_trabajo");
    add("CARGO_TRABAJO","cargo_trabajo"); add("TIPO_CONTRATO","tipo_contrato");
    add("FECHA_INGRESO_TRABAJO","fecha_ingreso_trabajo"); add("AFILIACION_IESS","afiliacion_iess");
    add("NUMERO_IESS","numero_iess");
    add("PENSION_ACTUAL","pension_actual"); add("PENSION_SOLICITADA","pension_solicitada");
    add("PENSION_PROPUESTA","pension_propuesta"); add("PENSION_PROVISIONAL","pension_provisional");
    add("PENSION_DEFINITIVA","pension_definitiva"); add("VALOR_PENSION","valor_pension");
    add("VALOR_ADEUDADO","valor_adeudado"); add("FECHA_INICIO_PENSION","fecha_inicio_pension");
    add("FECHA_ULTIMO_PAGO","fecha_ultimo_pago");
    add("DANOS_PERJUICIOS","danos_perjuicios"); add("INTERESES","intereses"); add("VALOR_PRINCIPAL","valor_principal");
    for (var b = 1; b <= 5; b++) {
        add("NOMBRE_BENEFICIARIO_" + b, "nombre_beneficiario_" + b);
        add("CEDULA_BENEFICIARIO_" + b, "cedula_beneficiario_" + b);
    }
    add("RECONOCE_PATERNIDAD","reconoce_paternidad"); add("NIEGA_PATERNIDAD","niega_paternidad");
    add("SOLICITA_PRUEBA_ADN","solicita_prueba_adn"); add("NOMBRE_MADRE","nombre_madre");
    add("CEDULA_MADRE","cedula_madre"); add("NOMBRE_PADRE","nombre_padre");
    add("CEDULA_PADRE","cedula_padre"); add("NOMBRE_MENOR","nombre_menor"); add("CEDULA_MENOR","cedula_menor");
    add("FISCAL_ASIGNADO","fiscal_asignado"); add("UNIDAD_FISCALIA","unidad_fiscalia");
    add("FISCALIA","fiscalia"); add("NUMERO_NOTICIA","numero_noticia");
    add("NUMERO_INVESTIGACION","numero_investigacion"); add("TIPO_DELITO","tipo_delito");
    add("DELITO","delito"); add("FECHA_DELITO","fecha_delito"); add("HORA_DELITO","hora_delito");
    add("LUGAR_DELITO","lugar_delito"); add("CIUDAD_DELITO","ciudad_delito");
    add("PROVINCIA_DELITO","provincia_delito"); add("NOMBRE_VICTIMA","nombre_victima");
    add("CEDULA_VICTIMA","cedula_victima");     add("NOMBRE_INVESTIGADO","nombre_investigado");
    add("NOMBRE_PROCURADOR_GENERAL","nombre_procurador_general");
    add("DIRECCION_PROCURADOR_GENERAL","direccion_procurador_general");
    add("CIUDAD_PROCURADOR_GENERAL","ciudad_procurador_general");
    add("PROVINCIA_PROCURADOR_GENERAL","provincia_procurador_general");
    add("CANTON_PROCURADOR_GENERAL","canton_procurador_general");
    add("CODIGO_POSTAL_PROCURADOR_GENERAL","codigo_postal_procurador_general");
    add("CASILLERO_ELECTRONICO_PROCURADOR_GENERAL","casillero_electronico_procurador_general");
    _EXACT_VAR_MAP_CACHE = m;
    return m;
}

var _CANONICAL_MAP_CACHE = null;
function _buildCanonicalMap() {
    if (_CANONICAL_MAP_CACHE) return _CANONICAL_MAP_CACHE;
    var exactMap = _buildExactVarMap();
    var canonicalMap = {};
    for (var key in exactMap) {
        if (!exactMap.hasOwnProperty(key)) continue;
        var canonical = normalizarVariableCanonica(key);
        if (!canonicalMap[canonical]) {
            canonicalMap[canonical] = exactMap[key];
        }
    }
    _CANONICAL_MAP_CACHE = canonicalMap;
    return canonicalMap;
}

function mapearVariableAEntrada(contenido) {
    var norm = contenido.toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\u2013\u2014\u2015]+/g, "_").replace(/[^A-Z0-9_]/g, "")
        .replace(/^_+|_+$/g, "");
    var exactMap = _buildExactVarMap();
    if (exactMap[norm]) return exactMap[norm];

    var canonical = normalizarVariableCanonica(contenido);
    var canonicalMap = _buildCanonicalMap();
    if (canonicalMap[canonical]) return canonicalMap[canonical];

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

    const _customBlocks = ecGetCustomBloques();
    for (const _b of _customBlocks) {
        for (const _e of (_b.entries || [])) {
            if (_e.variable && c.includes(_e.variable.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) {
                return _e.id;
            }
            if (_e.nombre && c.includes(_e.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) {
                return _e.id;
            }
        }
    }

    if (typeof buscarEnMaestro === "function") {
        const match = buscarEnMaestro(contenido);
        if (match && match.entryId) return match.entryId;
    }

    if (contenido && /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9_]*$/.test(contenido)) {
        return contenido;
    }

    return null;
}

function resaltarMarcadoresBase(mapeo, resaltados) {
    const editor = document.getElementById("editor");
    if (!editor) return;

    let html = editor.innerHTML;

    const todasLasVariables = [];
    const _procesadosRM = {};
    Object.keys(mapeo).forEach(entryId => {
        if (_procesadosRM[entryId]) return;
        if (editor.querySelector('span[data-key="' + entryId + '"]')) return;
        _procesadosRM[entryId] = true;
        const marcador = mapeo[entryId][0];
        if (marcador) {
            todasLasVariables.push({ entryId, marcador });
        }
    });

    todasLasVariables.sort((a, b) => b.marcador.length - a.marcador.length);

    todasLasVariables.forEach(({ entryId, marcador }) => {
        if (resaltados && resaltados[marcador] === false) return;
        const color = colorCampo(entryId);
        const escaped = marcador.replace(/[-\/\\^$*+?.()|[\]{}%]/g, '\\$&');
        const regex = new RegExp(escaped, "g");
        let counter = 0;
        html = html.replace(regex, function() {
            counter++;
            return '<span data-key="' + entryId + '" data-instance-id="' + entryId + '_base_' + counter + '" style="background:' + color + '; padding:1px 2px; border-radius:2px; cursor:pointer;" title="' + entryId + '">' + marcador + '</span>';
        });
    });

    editor.innerHTML = html;
}

// ============================================================
// FUNCIÓN CENTRAL: REEMPLAZAR ENTRY EN DOCUMENTO
// ============================================================

function reemplazarEntryEnDocumento(key, value) {
    var editor = document.getElementById("editor");
    if (!editor) return;

    var spans = editor.querySelectorAll('span[data-key="' + key + '"]');
    if (spans.length === 0) return;

    var textoAMostrar = value ? value : ("[" + key + "]");

    spans.forEach(function(span) {
        span.textContent = textoAMostrar;
    });

    if (configuracionActual && configuracionActual.dynamicEntries && configuracionActual.dynamicEntries[key]) {
        configuracionActual.dynamicEntries[key].value = value || "";
        configuracionActual.dynamicEntries[key].instances = spans.length;
    }

    var badge = document.querySelector('.entry-contador[data-variable="' + key + '"]');
    if (badge) {
        var nav = matchNavigationState[key];
        var idx = nav ? ((nav.currentIndex % spans.length) + 1) : 1;
        badge.textContent = idx + "/" + spans.length;
        badge.title = idx + " de " + spans.length + " coincidencias";
    }

    marcarCambio();
    programarGuardadoConfiguracion();
}

// ============================================================
// DETECCIÓN: ENTRIES VINCULADAS (span[data-key] en editor)
// ============================================================

function detectarEntriesVinculadas() {
    var editor = document.getElementById("editor");
    if (!editor) return {};
    var vinculadas = {};
    var spans = editor.querySelectorAll('span[data-key]');
    spans.forEach(function(span) {
        var key = span.getAttribute("data-key");
        if (!key) return;
        if (!vinculadas[key]) {
            vinculadas[key] = { variable: key, count: 0, instances: [] };
        }
        vinculadas[key].count++;
        vinculadas[key].instances.push(span.textContent);
    });
    return vinculadas;
}

// ============================================================
// APLICAR VALORES GUARDADOS A SPANS
// ============================================================

function aplicarValoresGuardadosEnSpans() {
    if (!configuracionActual || !configuracionActual.dynamicEntries) return;
    var editor = document.getElementById("editor");
    if (!editor) return;

    Object.keys(configuracionActual.dynamicEntries).forEach(function(key) {
        var entry = configuracionActual.dynamicEntries[key];
        if (!entry.value) return;

        var spans = editor.querySelectorAll('span[data-key="' + key + '"]');
        if (spans.length === 0) {
            var html = editor.innerHTML;
            var placeholder = "[" + key + "]";
            var esc = placeholder.replace(/[-\/\\^$*+?.()|[\]{}%]/g, '\\$&');
            var regex = new RegExp(esc, "g");
            var c = 0;
            html = html.replace(regex, function() {
                c++;
                var color = entry.color || "#D1C4E9";
                return '<span class="jurisflow-entry" data-key="' + key + '" data-instance-id="' + key + '_saved_' + c + '" style="background:' + color + '; padding:1px 2px; border-radius:2px; cursor:pointer;" title="' + key + '">' + entry.value + '</span>';
            });
            if (c > 0) {
                editor.innerHTML = html;
                entry.instances = c;
            }
            return;
        }

        spans.forEach(function(span) {
            if (span.textContent !== entry.value) {
                span.textContent = entry.value;
            }
        });
        entry.instances = spans.length;
    });
}

// ============================================================
// DETECCIÓN NATIVA DE PLACEHOLDERS
// ============================================================

var PLACEHOLDER_REGEX = /\[([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9_]*)\]/g;

function detectarPlaceholdersDelDocumento() {
    var editor = document.getElementById("editor");
    if (!editor) return {};
    var texto = editor.innerText || editor.textContent || "";
    var porVariable = {};
    var match;
    PLACEHOLDER_REGEX.lastIndex = 0;
    while ((match = PLACEHOLDER_REGEX.exec(texto)) !== null) {
        var variable = match[1];
        if (!porVariable[variable]) {
            porVariable[variable] = { variable: variable, count: 0, instances: [] };
        }
        porVariable[variable].count++;
        porVariable[variable].instances.push(match[0]);
    }
    return porVariable;
}

function nombreAmigableVariable(variable) {
    return variable
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
}

function obtenerBloqueParaVariable(variable) {
    var v = variable.toUpperCase();
    if (/_ACTOR_1(?!\d)/.test(v) || v === "NOMBRE_ACTOR_1") return "actor1";
    if (/_ACTOR_2(?!\d)/.test(v) || v === "NOMBRE_ACTOR_2") return "actor2";
    if (/DEMANDADO/.test(v)) return "demandado";
    if (/TESTIGO/.test(v)) return "testigos";
    if (/HECHO/.test(v)) return "hechos";
    if (/EXCEPCION/.test(v)) return "excepciones";
    if (/PRETENSION/.test(v)) return "pretensiones";
    if (/FUNDAMENTO/.test(v)) return "fundamentos";
    if (/NORMA|ARTICULO/.test(v)) return "fundamentos";
    if (/PRUEBA|PERITO|INSPECCION/.test(v)) return "pruebas";
    if (/PRONUNCIAMIENTO/.test(v)) return "pronunciamiento";
    if (/ABOGADO|MATRICULA|DEFENSOR|APODERADO/.test(v)) return "otros";
    if (/PROCURADOR/.test(v)) return "otros";
    if (/(?:SALARIO|INGRESO|EGRESO|GASTO|CONTRATO|IESS|CARGA|HIJOS|DANO|INTERES)/.test(v)) return "laboral";
    if (/(?:CORREO|CASILLERO|NOTIFICAC)/.test(v)) return "notificaciones";
    if (/(?:JUZGADO|SALA|CIUDAD|CANTON|PROVINCIA|EXPEDIENTE|CUANTIA|ACCION|MATERIA|PROCEDIMIENTO)/.test(v)) return "proceso";
    return "otros";
}

var _colorIdxDinamico = 0;
function asignarColorDinamico(variable) {
    if (configuracionActual && configuracionActual.dynamicEntries && configuracionActual.dynamicEntries[variable]) {
        return configuracionActual.dynamicEntries[variable].color;
    }
    var color = EC_COLOR_PALETTE[_colorIdxDinamico % EC_COLOR_PALETTE.length];
    _colorIdxDinamico++;
    return color;
}

function sincronizarEntriesConDocumento(placeholdersDetectados, conteosEntradas) {
    if (!configuracionActual) return;
    if (!configuracionActual.dynamicEntries) configuracionActual.dynamicEntries = {};

    var existingKeys = {};
    document.querySelectorAll(".entry-input").forEach(function(inp) { existingKeys[inp.id] = true; });

    Object.keys(placeholdersDetectados).forEach(function(variable) {
        if (existingKeys[variable]) return;
        if (configuracionActual.dynamicEntries[variable]) {
            configuracionActual.dynamicEntries[variable].instances = placeholdersDetectados[variable].count;
            return;
        }
        configuracionActual.dynamicEntries[variable] = {
            variable: variable,
            nombre: nombreAmigableVariable(variable),
            color: asignarColorDinamico(variable),
            bloque: obtenerBloqueParaVariable(variable),
            instances: placeholdersDetectados[variable].count,
            order: Object.keys(configuracionActual.dynamicEntries).length
        };
        console.log("[DETECCION] Entry dinámico creado:", variable, "→", configuracionActual.dynamicEntries[variable].bloque);
    });
}

// ============================================================
// v142: SISTEMA DE ENTRIES SIMPLIFICADO
// ============================================================

function detectarYSincronizarEntries() {
    if (!documentoBaseId) return;

    var placeholders = detectarPlaceholdersDelDocumento();
    var vinculadas = detectarEntriesVinculadas();
    var container = document.getElementById("v142EntriesContainer");
    if (!container) return;

    if (!configuracionActual) configuracionActual = {};
    if (!configuracionActual.dynamicEntries) configuracionActual.dynamicEntries = {};

    var variablesUnificadas = {};

    Object.keys(placeholders).forEach(function(v) {
        variablesUnificadas[v] = {
            variable: v,
            count: placeholders[v].count,
            instances: placeholders[v].instances,
            fromText: true
        };
    });

    Object.keys(vinculadas).forEach(function(v) {
        if (!variablesUnificadas[v]) {
            variablesUnificadas[v] = {
                variable: v,
                count: vinculadas[v].count,
                instances: vinculadas[v].instances,
                fromSpans: true
            };
        } else {
            variablesUnificadas[v].fromSpans = true;
        }
    });

    Object.keys(configuracionActual.dynamicEntries).forEach(function(v) {
        if (!variablesUnificadas[v]) {
            var entry = configuracionActual.dynamicEntries[v];
            if (entry && entry.value && entry.placeholder) {
                variablesUnificadas[v] = {
                    variable: v,
                    count: 0,
                    instances: [],
                    fromConfig: true
                };
            } else {
                delete configuracionActual.dynamicEntries[v];
            }
        }
    });

    var variablesDetectadas = Object.keys(variablesUnificadas);

    variablesDetectadas.forEach(function(variable) {
        if (!configuracionActual.dynamicEntries[variable]) {
            configuracionActual.dynamicEntries[variable] = {
                variable: variable,
                nombre: nombreAmigableVariable(variable),
                color: asignarColorDinamico(variable),
                instances: variablesUnificadas[variable].count,
                order: Object.keys(configuracionActual.dynamicEntries).length,
                value: "",
                placeholder: "[" + variable + "]"
            };
        } else {
            configuracionActual.dynamicEntries[variable].instances = variablesUnificadas[variable].count;
            if (!configuracionActual.dynamicEntries[variable].nombre) {
                configuracionActual.dynamicEntries[variable].nombre = nombreAmigableVariable(variable);
            }
            if (!configuracionActual.dynamicEntries[variable].color) {
                configuracionActual.dynamicEntries[variable].color = asignarColorDinamico(variable);
            }
            if (!configuracionActual.dynamicEntries[variable].placeholder) {
                configuracionActual.dynamicEntries[variable].placeholder = "[" + variable + "]";
            }
        }
    });

    var mapeo = {};
    variablesDetectadas.forEach(function(variable) {
        mapeo[variable] = [];
        var count = variablesUnificadas[variable].count || 1;
        for (var i = 0; i < count; i++) {
            mapeo[variable].push("[" + variable + "]");
        }
    });

    construirListaEntriesPlana(variablesDetectadas, variablesUnificadas, mapeo);
    resaltarMarcadoresBase(mapeo, {});
    aplicarValoresGuardadosEnSpans();
    actualizarEstadoBotonGuardarCambios();
}

function construirListaEntriesPlana(variables, placeholders, mapeo) {
    var container = document.getElementById("v142EntriesContainer");
    if (!container) return;

    if (!variables || variables.length === 0) {
        container.innerHTML = '<p class="v142-empty">No se detectaron placeholders [VARIABLE] en el documento.</p>';
        return;
    }

    variables.sort(function(a, b) {
        var orderA = configuracionActual.dynamicEntries[a] ? configuracionActual.dynamicEntries[a].order : 999;
        var orderB = configuracionActual.dynamicEntries[b] ? configuracionActual.dynamicEntries[b].order : 999;
        return orderA - orderB;
    });

    var html = '<div class="v142-seccion-titulo">ENTRIES (' + variables.length + ')</div>';

    variables.forEach(function(variable) {
        var de = configuracionActual.dynamicEntries[variable];
        var color = de ? de.color : "#D1C4E9";
        var nombre = de ? de.nombre : nombreAmigableVariable(variable);
        var count = placeholders[variable] ? placeholders[variable].count : 0;
        var value = de ? (de.value || "") : "";

        if (!matchNavigationState[variable]) {
            matchNavigationState[variable] = { currentIndex: 0 };
        }
        var nav = matchNavigationState[variable];
        var displayIndex = (count > 0) ? ((nav.currentIndex % count) + 1) : 0;

        html += '<div class="entry-item" data-variable="' + variable + '">' +
            '<span class="entry-dot" style="background:' + color + '"></span>' +
            '<span class="entry-nombre" title="' + variable + '">' + nombre + '</span>' +
            '<input class="entry-input-valor" data-variable="' + variable + '" placeholder="Valor..." value="' + value.replace(/"/g, '&quot;') + '">' +
            '<span class="entry-contador" data-variable="' + variable + '" style="background:' + color + '" title="' + displayIndex + ' de ' + count + ' coincidencias">' +
            displayIndex + '/' + count +
            '</span>' +
            '</div>';
    });

    container.innerHTML = html;

    container.querySelectorAll(".entry-contador").forEach(function(badge) {
        badge.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            var v = badge.getAttribute("data-variable");
            navegarContador(v);
        };
    });

    container.querySelectorAll(".entry-nombre").forEach(function(nombreEl) {
        nombreEl.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            var item = nombreEl.closest(".entry-item");
            if (!item) return;
            var v = item.getAttribute("data-variable");
            if (!v) return;
            if (matchNavigationState[v]) {
                matchNavigationState[v].currentIndex = -1;
            }
            navegarContador(v);
        };
    });

    container.querySelectorAll(".entry-input-valor").forEach(function(input) {
        input.oninput = function() {
            var v = input.getAttribute("data-variable");
            reemplazarEntryEnDocumento(v, input.value);
        };
    });
}

// ============================================================
// CURSOR SAVE/RESTORE (para cambios en editor.innerHTML)
// ============================================================

function guardarPosicionCursor() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    var range = sel.getRangeAt(0);
    var editor = document.getElementById("editor");
    if (!editor || !editor.contains(range.startContainer)) return null;
    var preRange = document.createRange();
    preRange.selectNodeContents(editor);
    preRange.setEnd(range.startContainer, range.startOffset);
    return { offset: preRange.toString().length };
}

function restaurarPosicionCursor(pos) {
    if (!pos) return;
    var editor = document.getElementById("editor");
    if (!editor) return;
    var sel = window.getSelection();
    var range = document.createRange();
    var walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
    var currentOffset = 0;
    var targetNode = null;
    var targetOffset = 0;
    while (walker.nextNode()) {
        var node = walker.currentNode;
        var nodeLen = node.textContent.length;
        if (currentOffset + nodeLen >= pos.offset) {
            targetNode = node;
            targetOffset = pos.offset - currentOffset;
            break;
        }
        currentOffset += nodeLen;
    }
    if (targetNode) {
        range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent.length));
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

// ============================================================
// v142: ACTUALIZACIÓN INCREMENTAL EN TIEMPO REAL
// ============================================================

function crearElementoEntrada(variable, count) {
    var de = configuracionActual.dynamicEntries[variable];
    var color = de ? de.color : "#D1C4E9";
    var nombre = de ? de.nombre : nombreAmigableVariable(variable);
    var value = de ? (de.value || "") : "";

    if (!matchNavigationState[variable]) {
        matchNavigationState[variable] = { currentIndex: 0 };
    }
    var nav = matchNavigationState[variable];
    var displayIndex = (count > 0) ? ((nav.currentIndex % count) + 1) : 0;

    var div = document.createElement("div");
    div.className = "entry-item";
    div.setAttribute("data-variable", variable);
    div.innerHTML =
        '<span class="entry-dot" style="background:' + color + '"></span>' +
        '<span class="entry-nombre" title="' + variable + '">' + nombre + '</span>' +
        '<input class="entry-input-valor" data-variable="' + variable + '" placeholder="Valor..." value="' + value.replace(/"/g, '&quot;') + '">' +
        '<span class="entry-contador" data-variable="' + variable + '" style="background:' + color + '" title="' + displayIndex + ' de ' + count + ' coincidencias">' +
        displayIndex + '/' + count +
        '</span>';

    var badge = div.querySelector(".entry-contador");
    if (badge) {
        badge.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            navegarContador(variable);
        };
    }
    var nombreEl = div.querySelector(".entry-nombre");
    if (nombreEl) {
        nombreEl.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (matchNavigationState[variable]) {
                matchNavigationState[variable].currentIndex = -1;
            }
            navegarContador(variable);
        };
    }
    var input = div.querySelector(".entry-input-valor");
    if (input) {
        input.oninput = function() {
            reemplazarEntryEnDocumento(variable, input.value);
        };
    }
    return div;
}

function actualizarContadorEntrada(variable, count) {
    var badge = document.querySelector('.entry-contador[data-variable="' + variable + '"]');
    if (!badge) return false;
    if (!matchNavigationState[variable]) matchNavigationState[variable] = { currentIndex: 0 };
    var nav = matchNavigationState[variable];
    if (nav.currentIndex >= count) nav.currentIndex = 0;
    var displayIndex = (count > 0) ? ((nav.currentIndex % count) + 1) : 0;
    badge.textContent = displayIndex + "/" + count;
    badge.title = displayIndex + " de " + count + " coincidencias";
    return true;
}

function actualizarHeaderEntries(container) {
    var total = container.querySelectorAll(".entry-item").length;
    var titulo = container.querySelector(".v142-seccion-titulo");
    if (titulo) titulo.textContent = "ENTRIES (" + total + ")";
}

function actualizarEntriesEnTiempoReal() {
    if (!documentoBaseId) return;

    var placeholders = detectarPlaceholdersDelDocumento();
    var vinculadas = detectarEntriesVinculadas();
    var container = document.getElementById("v142EntriesContainer");
    if (!container) return;

    if (!configuracionActual) configuracionActual = {};
    if (!configuracionActual.dynamicEntries) configuracionActual.dynamicEntries = {};

    var variablesUnificadas = {};

    Object.keys(placeholders).forEach(function(v) {
        variablesUnificadas[v] = {
            variable: v,
            count: placeholders[v].count,
            instances: placeholders[v].instances,
            fromText: true
        };
    });

    Object.keys(vinculadas).forEach(function(v) {
        if (!variablesUnificadas[v]) {
            variablesUnificadas[v] = {
                variable: v,
                count: vinculadas[v].count,
                instances: vinculadas[v].instances,
                fromSpans: true
            };
        } else {
            variablesUnificadas[v].fromSpans = true;
        }
    });

    Object.keys(configuracionActual.dynamicEntries).forEach(function(v) {
        if (!variablesUnificadas[v]) {
            var entry = configuracionActual.dynamicEntries[v];
            if (entry && entry.value && entry.placeholder) {
                variablesUnificadas[v] = {
                    variable: v,
                    count: 0,
                    instances: [],
                    fromConfig: true
                };
            } else {
                delete configuracionActual.dynamicEntries[v];
            }
        }
    });

    var variablesDetectadas = Object.keys(variablesUnificadas);

    variablesDetectadas.forEach(function(variable) {
        if (!configuracionActual.dynamicEntries[variable]) {
            configuracionActual.dynamicEntries[variable] = {
                variable: variable,
                nombre: nombreAmigableVariable(variable),
                color: asignarColorDinamico(variable),
                instances: variablesUnificadas[variable].count,
                order: Object.keys(configuracionActual.dynamicEntries).length,
                value: "",
                placeholder: "[" + variable + "]"
            };
        } else {
            configuracionActual.dynamicEntries[variable].instances = variablesUnificadas[variable].count;
            if (!configuracionActual.dynamicEntries[variable].nombre) {
                configuracionActual.dynamicEntries[variable].nombre = nombreAmigableVariable(variable);
            }
            if (!configuracionActual.dynamicEntries[variable].color) {
                configuracionActual.dynamicEntries[variable].color = asignarColorDinamico(variable);
            }
            if (!configuracionActual.dynamicEntries[variable].placeholder) {
                configuracionActual.dynamicEntries[variable].placeholder = "[" + variable + "]";
            }
        }
    });

    var existingItems = container.querySelectorAll(".entry-item");
    var existingVars = {};
    existingItems.forEach(function(item) {
        existingVars[item.getAttribute("data-variable")] = item;
    });
    var detectedSet = {};
    variablesDetectadas.forEach(function(v) { detectedSet[v] = true; });
    var panelChanged = false;

    existingItems.forEach(function(item) {
        var v = item.getAttribute("data-variable");
        if (!detectedSet[v]) {
            var de = configuracionActual.dynamicEntries[v];
            if (!de || !de.value) {
                item.remove();
                delete configuracionActual.dynamicEntries[v];
                delete matchNavigationState[v];
                panelChanged = true;
            }
        }
    });

    variablesDetectadas.forEach(function(variable) {
        if (!existingVars[variable] || !container.querySelector('.entry-item[data-variable="' + variable + '"]')) {
            var count = variablesUnificadas[variable] ? variablesUnificadas[variable].count : 0;
            var newEntry = crearElementoEntrada(variable, count);
            var inserted = false;
            var allItems = container.querySelectorAll(".entry-item");
            var newOrder = configuracionActual.dynamicEntries[variable] ? configuracionActual.dynamicEntries[variable].order : 999;
            for (var i = 0; i < allItems.length; i++) {
                var ev = allItems[i].getAttribute("data-variable");
                var eo = configuracionActual.dynamicEntries[ev] ? configuracionActual.dynamicEntries[ev].order : 999;
                if (newOrder < eo) {
                    container.insertBefore(newEntry, allItems[i]);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                container.appendChild(newEntry);
            }
            panelChanged = true;
        }
    });

    variablesDetectadas.forEach(function(variable) {
        var count = variablesUnificadas[variable] ? variablesUnificadas[variable].count : 0;
        actualizarContadorEntrada(variable, count);
    });

    if (panelChanged) {
        actualizarHeaderEntries(container);
    }

    var mapeo = {};
    variablesDetectadas.forEach(function(variable) {
        mapeo[variable] = [];
        var count = variablesUnificadas[variable].count || 1;
        for (var i = 0; i < count; i++) {
            mapeo[variable].push("[" + variable + "]");
        }
    });

    var pos = guardarPosicionCursor();
    resaltarMarcadoresBase(mapeo, {});
    aplicarValoresGuardadosEnSpans();
    restaurarPosicionCursor(pos);

    actualizarEstadoBotonGuardarCambios();
}

function navegarContador(variable) {
    var editor = document.getElementById("editor");
    if (!editor) return;
    var spans = editor.querySelectorAll('span[data-key="' + variable + '"]');
    if (spans.length === 0) return;

    if (!matchNavigationState[variable]) matchNavigationState[variable] = { currentIndex: 0 };
    var nav = matchNavigationState[variable];

    document.querySelectorAll('.match-highlight-current').forEach(function(el) {
        el.style.outline = "";
        el.style.outlineOffset = "";
        el.style.boxShadow = "";
        el.classList.remove("match-highlight-current");
    });

    nav.currentIndex = (nav.currentIndex + 1) % spans.length;
    var currentSpan = spans[nav.currentIndex];
    currentSpan.scrollIntoView({ behavior: "smooth", block: "center" });
    currentSpan.style.outline = "3px solid #FF6B6B";
    currentSpan.style.outlineOffset = "2px";
    currentSpan.style.boxShadow = "0 0 8px rgba(255,107,107,0.6)";
    currentSpan.classList.add("match-highlight-current");
    setTimeout(function() {
        currentSpan.style.outline = "";
        currentSpan.style.outlineOffset = "";
        currentSpan.style.boxShadow = "";
        currentSpan.classList.remove("match-highlight-current");
    }, 2000);

    var badge = document.querySelector('.entry-contador[data-variable="' + variable + '"]');
    if (badge) {
        var displayIndex = nav.currentIndex + 1;
        badge.textContent = displayIndex + "/" + spans.length;
        badge.title = displayIndex + " de " + spans.length + " coincidencias";
    }
}

function marcarEntriesConVariables(mapeo, conteos) {
    document.querySelectorAll(".entry-input").forEach(input => {
        const existing = input.parentNode.querySelector(".var-badge");
        if (existing) existing.remove();
        if (mapeo[input.id]) {
            const total = (conteos && conteos[input.id]) ? conteos[input.id] : mapeo[input.id].length;
            if (total === 0) {
                const badge = document.createElement("span");
                badge.className = "var-badge";
                badge.style.cssText = "display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;border-radius:9px;background:#e2e8f0;color:#64748b;font-size:10px;font-weight:700;margin-left:4px;vertical-align:middle;border:1px solid rgba(0,0,0,.15);padding:0 3px;cursor:default;line-height:1;";
                badge.textContent = "0/0";
                badge.title = "Sin coincidencias en el documento";
                input.parentNode.appendChild(badge);
                return;
            }
            if (!matchNavigationState[input.id]) {
                matchNavigationState[input.id] = { currentIndex: 0 };
            }
            var nav = matchNavigationState[input.id];
            if (nav.currentIndex >= total) nav.currentIndex = 0;
            if (nav.currentIndex < 0) nav.currentIndex = 0;
            var displayIndex = nav.currentIndex + 1;
            const badge = document.createElement("span");
            badge.className = "var-badge match-nav-badge";
            badge.setAttribute("data-entry-key", input.id);
            badge.style.cssText = "display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;border-radius:9px;background:" + colorCampo(input.id) + ";color:#000;font-size:10px;font-weight:700;margin-left:4px;vertical-align:middle;border:1px solid rgba(0,0,0,.3);padding:0 4px;cursor:pointer;line-height:1;transition:transform 0.15s;";
            badge.textContent = displayIndex + "/" + total;
            badge.title = displayIndex + " de " + total + " coincidencias — clic para navegar";
            badge.setAttribute("tabindex", "0");
            badge.setAttribute("role", "button");
            badge.setAttribute("aria-label", input.id + " " + displayIndex + " de " + total);
            badge.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                navegarCoincidencia(input.id);
            };
            badge.onmouseenter = function() { badge.style.transform = "scale(1.15)"; };
            badge.onmouseleave = function() { badge.style.transform = "scale(1)"; };
            input.parentNode.appendChild(badge);
        }
    });
}

function actualizarBadgeNavegacion(entryKey) {
    var badge = document.querySelector('.match-nav-badge[data-entry-key="' + entryKey + '"]');
    if (!badge) return;
    var spans = document.querySelectorAll('#editor span[data-key="' + entryKey + '"]');
    var total = spans.length;
    if (total === 0) {
        badge.textContent = "0/0";
        badge.title = "Sin coincidencias en el documento";
        badge.style.cursor = "default";
        badge.style.background = "#e2e8f0";
        badge.style.color = "#64748b";
        badge.onclick = null;
        return;
    }
    if (!matchNavigationState[entryKey]) matchNavigationState[entryKey] = { currentIndex: 0 };
    var nav = matchNavigationState[entryKey];
    if (nav.currentIndex >= total) nav.currentIndex = 0;
    if (nav.currentIndex < 0) nav.currentIndex = 0;
    badge.textContent = (nav.currentIndex + 1) + "/" + total;
    badge.title = (nav.currentIndex + 1) + " de " + total + " coincidencias — clic para navegar";
    badge.style.background = colorCampo(entryKey);
    badge.style.color = "#000";
    badge.style.cursor = "pointer";
}

function navegarCoincidencia(entryKey) {
    var editor = document.getElementById("editor");
    if (!editor) return;
    var spans = editor.querySelectorAll('span[data-key="' + entryKey + '"]');
    if (spans.length === 0) return;
    if (!matchNavigationState[entryKey]) matchNavigationState[entryKey] = { currentIndex: 0 };
    var nav = matchNavigationState[entryKey];
    document.querySelectorAll('.match-highlight-current').forEach(function(el) {
        el.style.outline = "";
        el.style.outlineOffset = "";
        el.style.boxShadow = "";
        el.classList.remove("match-highlight-current");
    });
    nav.currentIndex = (nav.currentIndex + 1) % spans.length;
    var currentSpan = spans[nav.currentIndex];
    currentSpan.scrollIntoView({ behavior: "smooth", block: "center" });
    currentSpan.style.outline = "3px solid #FF6B6B";
    currentSpan.style.outlineOffset = "2px";
    currentSpan.style.boxShadow = "0 0 8px rgba(255,107,107,0.6)";
    currentSpan.classList.add("match-highlight-current");
    setTimeout(function() {
        currentSpan.style.outline = "";
        currentSpan.style.outlineOffset = "";
        currentSpan.style.boxShadow = "";
        currentSpan.classList.remove("match-highlight-current");
    }, 2000);
    actualizarBadgeNavegacion(entryKey);
}

function navegarCoincidenciaAnterior(entryKey) {
    var editor = document.getElementById("editor");
    if (!editor) return;
    var spans = editor.querySelectorAll('span[data-key="' + entryKey + '"]');
    if (spans.length === 0) return;
    if (!matchNavigationState[entryKey]) matchNavigationState[entryKey] = { currentIndex: 0 };
    var nav = matchNavigationState[entryKey];
    document.querySelectorAll('.match-highlight-current').forEach(function(el) {
        el.style.outline = "";
        el.style.outlineOffset = "";
        el.style.boxShadow = "";
        el.classList.remove("match-highlight-current");
    });
    nav.currentIndex = (nav.currentIndex - 1 + spans.length) % spans.length;
    var currentSpan = spans[nav.currentIndex];
    currentSpan.scrollIntoView({ behavior: "smooth", block: "center" });
    currentSpan.style.outline = "3px solid #FF6B6B";
    currentSpan.style.outlineOffset = "2px";
    currentSpan.style.boxShadow = "0 0 8px rgba(255,107,107,0.6)";
    currentSpan.classList.add("match-highlight-current");
    setTimeout(function() {
        currentSpan.style.outline = "";
        currentSpan.style.outlineOffset = "";
        currentSpan.style.boxShadow = "";
        currentSpan.classList.remove("match-highlight-current");
    }, 2000);
    actualizarBadgeNavegacion(entryKey);
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
    rebuildPaginasDinamicas();
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

    const cats = getTodasCategorias();
    catSelect.innerHTML = '<option value="">Seleccionar...</option>' +
        cats.map(c => `<option value="${c}">${c}</option>`).join("") +
        '<option value="__NUEVA__">+ Nueva categoría</option>';
    catSelect.value = "";

    proSelect.innerHTML = '<option value="">No aplica</option>' +
        PROCEDIMIENTOS.map(p => `<option value="${p}">${p}</option>`).join("");
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
    const proSelect = document.getElementById("modalBaseProcedimiento");
    const nuevaCatWrap = document.getElementById("modalBaseNuevaCatWrap");
    const nuevaSubWrap = document.getElementById("modalBaseNuevaSubWrap");

    if (cat === "__NUEVA__") {
        nuevaCatWrap.style.display = "block";
        subSelect.innerHTML = '<option value="">Seleccionar...</option>';
        proSelect.innerHTML = '<option value="">No aplica</option>' +
            PROCEDIMIENTOS.map(p => `<option value="${p}">${p}</option>`).join("");
        proSelect.value = "";
        nuevaSubWrap.style.display = "none";
        return;
    }

    nuevaCatWrap.style.display = "none";
    nuevaSubWrap.style.display = "none";

    const subs = getSubcategoriasDe(cat);
    subSelect.innerHTML = '<option value="">Seleccionar...</option>' +
        subs.map(s => `<option value="${s}">${s}</option>`).join("") +
        '<option value="__NUEVA__">+ Nueva subcategoría</option>';

    const procs = getProcedimientosDe(cat, null);
    proSelect.innerHTML = '<option value="">No aplica</option>' +
        procs.map(p => `<option value="${p}">${p}</option>`).join("");
    proSelect.value = "";
}

function cambiarSubcategoriaModal() {
    const val = document.getElementById("modalBaseSubcategoria").value;
    const wrap = document.getElementById("modalBaseNuevaSubWrap");
    const proSelect = document.getElementById("modalBaseProcedimiento");
    const cat = document.getElementById("modalBaseCategoria").value;
    if (val === "__NUEVA__") {
        wrap.style.display = "block";
        document.getElementById("modalBaseNuevaSub").value = "";
    } else {
        wrap.style.display = "none";
    }
    if (val && cat) {
        const procs = getProcedimientosDe(cat, val);
        proSelect.innerHTML = '<option value="">No aplica</option>' +
            procs.map(p => `<option value="${p}">${p}</option>`).join("");
        proSelect.value = "";
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
        await agregarATaxonomia(categoria, subcategoria || null, procedimiento || null);
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
            await agregarATaxonomia(sugerencia.categoria, sugerencia.subcategoria || null, sugerencia.procedimiento || null);
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

    const cats = getTodasCategorias();
    catSelect.innerHTML = '<option value="">Seleccionar...</option>' +
        cats.map(c => `<option value="${c}">${c}</option>`).join("") +
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

    if (doc.categoria && cats.includes(doc.categoria)) {
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
    const proSelect = document.getElementById("modalEditarBaseProcedimiento");
    const nuevaCatWrap = document.getElementById("modalEditarBaseNuevaCatWrap");
    const nuevaSubWrap = document.getElementById("modalEditarBaseNuevaSubWrap");

    if (cat === "__NUEVA__") {
        nuevaCatWrap.style.display = "block";
        subSelect.innerHTML = '<option value="">Seleccionar...</option>';
        proSelect.innerHTML = '<option value="">No aplica</option>' +
            PROCEDIMIENTOS.map(p => `<option value="${p}">${p}</option>`).join("");
        proSelect.value = "";
        nuevaSubWrap.style.display = "none";
        return;
    }

    nuevaCatWrap.style.display = "none";
    nuevaSubWrap.style.display = "none";

    const subs = getSubcategoriasDe(cat);
    subSelect.innerHTML = '<option value="">Seleccionar...</option>' +
        subs.map(s => `<option value="${s}">${s}</option>`).join("") +
        '<option value="__NUEVA__">+ Nueva subcategoría</option>';

    const procs = getProcedimientosDe(cat, null);
    proSelect.innerHTML = '<option value="">No aplica</option>' +
        procs.map(p => `<option value="${p}">${p}</option>`).join("");
    proSelect.value = "";
}

function cambiarSubcategoriaModalEditar() {
    const val = document.getElementById("modalEditarBaseSubcategoria").value;
    const wrap = document.getElementById("modalEditarBaseNuevaSubWrap");
    const proSelect = document.getElementById("modalEditarBaseProcedimiento");
    const cat = document.getElementById("modalEditarBaseCategoria").value;
    if (val === "__NUEVA__") {
        wrap.style.display = "block";
        document.getElementById("modalEditarBaseNuevaSub").value = "";
    } else {
        wrap.style.display = "none";
    }
    if (val && cat) {
        const procs = getProcedimientosDe(cat, val);
        proSelect.innerHTML = '<option value="">No aplica</option>' +
            procs.map(p => `<option value="${p}">${p}</option>`).join("");
        proSelect.value = "";
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
        await agregarATaxonomia(categoria, subcategoria || null, procedimiento || null);
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
    cargarTaxonomia();
    seedDocumentosBase();
    inicializarFiltroCategorias();
});

function inicializarFiltroCategorias() {
    const contenedor = document.getElementById("repoCategorias");
    if (!contenedor) return;
    let html = '<button class="repo-cat-btn activa" onclick="filtrarCategoria(\'TODOS\', this)">TODOS</button>';
    const catsUsadas = [...new Set(documentosBaseCache.map(d => d.categoria).filter(Boolean))];
    const catsTax = Object.keys(taxonomyCache.categorias_extra || {});
    const catsSet = new Set([...CATEGORIAS_PRINCIPALES, ...catsUsadas, ...catsTax]);
    const catsSorted = [...catsSet].filter(c => c.toUpperCase() !== "OTROS").sort((a, b) => a.localeCompare(b, "es"));
    const otrosCat = [...catsSet].find(c => c.toUpperCase() === "OTROS");
    if (otrosCat) catsSorted.push(otrosCat);
    catsSorted.forEach(c => {
        html += `<button class="repo-cat-btn" onclick="filtrarCategoria('${c.replace(/'/g, "\\'")}', this)">${c}</button>`;
    });
    contenedor.innerHTML = html;
}

// ============================================================
// ✏ EDITAR CAMPOS — Modal state machine + CRUD
// ============================================================

let ecView = "blocks";
let ecBloqueActualId = null;
let ecEditEntryId = null;
var matchNavigationState = {};
const EC_SYS_BLOCK_IDS = ["actor1", "actor2", "demandado", "testigos", "hechos", "pruebas", "pretensiones", "fundamentos", "otros", "proceso", "notificaciones", "excepciones", "pronunciamiento", "laboral"];
const EC_SYS_BLOCK_NAMES = {
    actor1: "ACTOR 1", actor2: "ACTOR 2", demandado: "DEMANDADO",
    testigos: "TESTIGOS", hechos: "HECHOS", pruebas: "PRUEBAS",
    pretensiones: "PRETENSIONES", fundamentos: "FUNDAMENTOS",
    otros: "OTROS", proceso: "PROCESO", notificaciones: "NOTIFICACIONES",
    excepciones: "EXCEPCIONES Y DEFENSA", pronunciamiento: "PRONUNCIAMIENTO",
    laboral: "LABORAL / ECONÓMICO"
};

const EC_COLOR_PALETTE = [
    "#FFD54F", "#64B5F6", "#BA68C8", "#81C784", "#4DD0E1",
    "#FFB74D", "#BCAAA4", "#F48FB1", "#7986CB", "#C5E1A5",
    "#EF9A9A", "#B39DDB", "#80CBC4", "#FFE082", "#D1C4E9"
];

function isSystemBlock(bloqueId) {
    return EC_SYS_BLOCK_IDS.indexOf(bloqueId) !== -1;
}

function getActiveEntries(bloqueId) {
    if (configuracionActual && configuracionActual.blockEntries && configuracionActual.blockEntries[bloqueId]) {
        return configuracionActual.blockEntries[bloqueId];
    }
    if (isSystemBlock(bloqueId)) {
        return ecGetEntriesForSysBlock(bloqueId);
    }
    var custom = ecGetCustomBloques();
    var block = custom.find(function(b) { return b.id === bloqueId; });
    return block ? (block.entries || []) : [];
}

function saveBlockEntries(bloqueId, entries) {
    if (!configuracionActual) configuracionActual = {};
    if (!configuracionActual.blockEntries) configuracionActual.blockEntries = {};
    configuracionActual.blockEntries[bloqueId] = entries;
    if (isSystemBlock(bloqueId)) {
        programarGuardadoConfiguracion();
    } else {
        var blocks = ecGetCustomBloques();
        var blockIdx = blocks.findIndex(function(b) { return b.id === bloqueId; });
        if (blockIdx !== -1) {
            blocks[blockIdx].entries = entries;
            ecSaveCustomBloques(blocks);
        }
    }
}

function ecGetBloques() {
    const custom = ecGetCustomBloques();
    return EC_SYS_BLOCK_IDS.map(id => {
        var customName = (configuracionActual && configuracionActual.blockNames && configuracionActual.blockNames[id]) || null;
        return {
            id, nombre: customName || EC_SYS_BLOCK_NAMES[id] || id.toUpperCase(), tipo: "sistema",
            entries: getActiveEntries(id)
        };
    }).concat(custom);
}

function ecGetEntriesForSysBlock(bloqueId) {
    const map = {
        actor1: [
            { id: "actor", nombre: "Nombre del Actor", variable: "actor", color: "#FFD54F", tipo: "texto" },
            { id: "cedula", nombre: "Cédula", variable: "cedula", color: "#4DD0E1", tipo: "texto" },
            { id: "age", nombre: "Edad", variable: "age", color: "#F48FB1", tipo: "texto" },
            { id: "civil", nombre: "Estado Civil", variable: "civil", color: "#F48FB1", tipo: "texto" },
            { id: "profesion", nombre: "Profesión", variable: "profesion", color: "#F48FB1", tipo: "texto" },
            { id: "ciudadania", nombre: "Ciudadanía", variable: "ciudadania", color: "#F48FB1", tipo: "texto" },
            { id: "email", nombre: "Correo Electrónico", variable: "email", color: "#81C784", tipo: "texto" },
            { id: "telefono", nombre: "Teléfono", variable: "telefono", color: "#FFB74D", tipo: "texto" },
            { id: "parroquia", nombre: "Parroquia", variable: "parroquia", color: "#BCAAA4", tipo: "texto" },
            { id: "barrio", nombre: "Barrio", variable: "barrio", color: "#BCAAA4", tipo: "texto" },
            { id: "calle_principal", nombre: "Calle Principal", variable: "calle_principal", color: "#BCAAA4", tipo: "texto" },
            { id: "calle_secundaria", nombre: "Calle Secundaria", variable: "calle_secundaria", color: "#BCAAA4", tipo: "texto" },
            { id: "numero_casa", nombre: "Número de Casa", variable: "numero_casa", color: "#BCAAA4", tipo: "texto" },
            { id: "codigo_postal", nombre: "Código Postal", variable: "codigo_postal", color: "#BCAAA4", tipo: "texto" },
            { id: "direccion_domiciliaria", nombre: "Dirección Domiciliaria", variable: "direccion_domiciliaria", color: "#BCAAA4", tipo: "texto" },
            { id: "casillero_judicial_actor", nombre: "Casillero Judicial", variable: "casillero_judicial_actor", color: "#81C784", tipo: "texto" },
            { id: "provincia", nombre: "Provincia", variable: "provincia", color: "#BCAAA4", tipo: "texto" },
            { id: "canton", nombre: "Cantón", variable: "canton", color: "#BCAAA4", tipo: "texto" },
            { id: "ciudad", nombre: "Ciudad", variable: "ciudad", color: "#BCAAA4", tipo: "texto" }
        ],
        actor2: [
            { id: "actor_2", nombre: "Nombre Actor 2", variable: "actor_2", color: "#FFD54F", tipo: "texto" },
            { id: "cedula_actor_2", nombre: "Cédula", variable: "cedula_actor_2", color: "#4DD0E1", tipo: "texto" },
            { id: "age_actor_2", nombre: "Edad", variable: "age_actor_2", color: "#F48FB1", tipo: "texto" },
            { id: "civil_actor_2", nombre: "Estado Civil", variable: "civil_actor_2", color: "#F48FB1", tipo: "texto" },
            { id: "profesion_actor_2", nombre: "Profesión", variable: "profesion_actor_2", color: "#F48FB1", tipo: "texto" },
            { id: "ciudadania_actor_2", nombre: "Ciudadanía", variable: "ciudadania_actor_2", color: "#F48FB1", tipo: "texto" },
            { id: "email_actor_2", nombre: "Correo", variable: "email_actor_2", color: "#81C784", tipo: "texto" },
            { id: "telefono_actor_2", nombre: "Teléfono", variable: "telefono_actor_2", color: "#FFB74D", tipo: "texto" },
            { id: "parroquia_actor_2", nombre: "Parroquia", variable: "parroquia_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "barrio_actor_2", nombre: "Barrio", variable: "barrio_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "calle_principal_actor_2", nombre: "Calle Principal", variable: "calle_principal_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "calle_secundaria_actor_2", nombre: "Calle Secundaria", variable: "calle_secundaria_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "numero_casa_actor_2", nombre: "Número de Casa", variable: "numero_casa_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "codigo_postal_actor_2", nombre: "Código Postal", variable: "codigo_postal_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "direccion_domiciliaria_actor_2", nombre: "Dirección Domiciliaria", variable: "direccion_domiciliaria_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "casillero_judicial_actor_2", nombre: "Casillero Judicial", variable: "casillero_judicial_actor_2", color: "#81C784", tipo: "texto" },
            { id: "provincia_actor_2", nombre: "Provincia", variable: "provincia_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "canton_actor_2", nombre: "Cantón", variable: "canton_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "ciudad_actor_2", nombre: "Ciudad", variable: "ciudad_actor_2", color: "#BCAAA4", tipo: "texto" }
        ],
        demandado: [
            { id: "nombre_demandado", nombre: "Nombre Demandado", variable: "nombre_demandado", color: "#64B5F6", tipo: "texto" },
            { id: "cedula_demandado", nombre: "Cédula", variable: "cedula_demandado", color: "#4DD0E1", tipo: "texto" },
            { id: "edad_demandado", nombre: "Edad", variable: "edad_demandado", color: "#F48FB1", tipo: "texto" },
            { id: "civil_demandado", nombre: "Estado Civil", variable: "civil_demandado", color: "#F48FB1", tipo: "texto" },
            { id: "profesion_demandado", nombre: "Profesión", variable: "profesion_demandado", color: "#F48FB1", tipo: "texto" },
            { id: "ciudadania_demandado", nombre: "Ciudadanía", variable: "ciudadania_demandado", color: "#F48FB1", tipo: "texto" },
            { id: "email_demandado", nombre: "Correo", variable: "email_demandado", color: "#81C784", tipo: "texto" },
            { id: "telefono_demandado", nombre: "Teléfono", variable: "telefono_demandado", color: "#FFB74D", tipo: "texto" },
            { id: "parroquia_demandado", nombre: "Parroquia", variable: "parroquia_demandado", color: "#BCAAA4", tipo: "texto" },
            { id: "barrio_demandado", nombre: "Barrio", variable: "barrio_demandado", color: "#BCAAA4", tipo: "texto" },
            { id: "calle_principal_demandado", nombre: "Calle Principal", variable: "calle_principal_demandado", color: "#BCAAA4", tipo: "texto" },
            { id: "calle_secundaria_demandado", nombre: "Calle Secundaria", variable: "calle_secundaria_demandado", color: "#BCAAA4", tipo: "texto" },
            { id: "numero_casa_demandado", nombre: "Número de Casa", variable: "numero_casa_demandado", color: "#BCAAA4", tipo: "texto" },
            { id: "codigo_postal_demandado", nombre: "Código Postal", variable: "codigo_postal_demandado", color: "#BCAAA4", tipo: "texto" },
            { id: "direccion_domiciliaria_demandado", nombre: "Dirección Domiciliaria", variable: "direccion_domiciliaria_demandado", color: "#BCAAA4", tipo: "texto" },
            { id: "casillero_judicial_demandado", nombre: "Casillero Judicial", variable: "casillero_judicial_demandado", color: "#81C784", tipo: "texto" },
            { id: "provincia_demandado", nombre: "Provincia", variable: "provincia_demandado", color: "#BCAAA4", tipo: "texto" },
            { id: "canton_demandado", nombre: "Cantón", variable: "canton_demandado", color: "#BCAAA4", tipo: "texto" },
            { id: "ciudad_demandado", nombre: "Ciudad", variable: "ciudad_demandado", color: "#BCAAA4", tipo: "texto" }
        ],
        testigos: [1,2,3,4,5,6,7,8].flatMap(n => [
            { id: `nombre_testigo${n}`, nombre: `Testigo ${n} - Nombre`, variable: `nombre_testigo${n}`, color: "#BA68C8", tipo: "texto" },
            { id: `cedula_testigo${n}`, nombre: `Testigo ${n} - Cédula`, variable: `cedula_testigo${n}`, color: "#4DD0E1", tipo: "texto" },
            { id: `ciudad_testigo${n}`, nombre: `Testigo ${n} - Ciudad`, variable: `ciudad_testigo${n}`, color: "#BCAAA4", tipo: "texto" },
            { id: `provincia_testigo${n}`, nombre: `Testigo ${n} - Provincia`, variable: `provincia_testigo${n}`, color: "#BCAAA4", tipo: "texto" },
            { id: `relacion_testigo${n}`, nombre: `Testigo ${n} - Relación`, variable: `relacion_testigo${n}`, color: "#BA68C8", tipo: "texto" },
            { id: `declaracion_testigo${n}`, nombre: `Testigo ${n} - Declaración`, variable: `declaracion_testigo${n}`, color: "#BA68C8", tipo: "texto_largo" },
            { id: `horas_testigo${n}`, nombre: `Testigo ${n} - Horas`, variable: `horas_testigo${n}`, color: "#BA68C8", tipo: "texto" },
            { id: `distancia_testigo${n}`, nombre: `Testigo ${n} - Distancia`, variable: `distancia_testigo${n}`, color: "#BA68C8", tipo: "texto" },
            { id: `reconocimiento_testigo${n}`, nombre: `Testigo ${n} - Reconocimiento`, variable: `reconocimiento_testigo${n}`, color: "#BA68C8", tipo: "texto" },
            { id: `observaciones_testigo${n}`, nombre: `Testigo ${n} - Observaciones`, variable: `observaciones_testigo${n}`, color: "#BA68C8", tipo: "texto_largo" }
        ]),
        hechos: [1,2,3,4,5,6,7,8,9,10].map(n => ({
            id: `hecho_${n}`, nombre: `Hecho ${n}`, variable: `hecho_${n}`, color: "#FFCC80", tipo: "texto_largo"
        })),
        pruebas: [
            { id: "documento_prueba", nombre: "Documento", variable: "documento_prueba", color: "#80CBC4", tipo: "texto" },
            { id: "descripcion_prueba", nombre: "Descripción", variable: "descripcion_prueba", color: "#80CBC4", tipo: "texto" },
            { id: "finalidad_prueba", nombre: "Finalidad", variable: "finalidad_prueba", color: "#80CBC4", tipo: "texto" },
            { id: "fecha_documento_prueba", nombre: "Fecha Documento", variable: "fecha_documento_prueba", color: "#80CBC4", tipo: "fecha" },
            { id: "emisor_documento_prueba", nombre: "Emisor", variable: "emisor_documento_prueba", color: "#80CBC4", tipo: "texto" },
            { id: "autenticidad_prueba", nombre: "Autenticidad", variable: "autenticidad_prueba", color: "#A5D6A7", tipo: "texto" },
            { id: "admite_prueba", nombre: "Admite", variable: "admite_prueba", color: "#A5D6A7", tipo: "texto" },
            { id: "niega_prueba", nombre: "Niega", variable: "niega_prueba", color: "#A5D6A7", tipo: "texto" },
            { id: "objeta_prueba", nombre: "Objeta", variable: "objeta_prueba", color: "#A5D6A7", tipo: "texto" },
            { id: "nombre_perito", nombre: "Nombre Perito", variable: "nombre_perito", color: "#FFF176", tipo: "texto" },
            { id: "cedula_perito", nombre: "Cédula Perito", variable: "cedula_perito", color: "#FFF176", tipo: "texto" },
            { id: "profesion_perito", nombre: "Profesión Perito", variable: "profesion_perito", color: "#FFF176", tipo: "texto" },
            { id: "especialidad_perito", nombre: "Especialidad Perito", variable: "especialidad_perito", color: "#FFF176", tipo: "texto" },
            { id: "objeto_pericia", nombre: "Objeto Pericia", variable: "objeto_pericia", color: "#FFF176", tipo: "texto" },
            { id: "puntos_pericia", nombre: "Puntos Pericia", variable: "puntos_pericia", color: "#FFF176", tipo: "texto_largo" },
            { id: "conclusion_pericia", nombre: "Conclusión Pericia", variable: "conclusion_pericia", color: "#FFF176", tipo: "texto_largo" },
            { id: "registro_perito", nombre: "Registro Perito", variable: "registro_perito", color: "#FFF176", tipo: "texto" },
            { id: "correo_perito", nombre: "Correo Perito", variable: "correo_perito", color: "#FFF176", tipo: "texto" },
            { id: "lugar_inspeccion", nombre: "Lugar Inspección", variable: "lugar_inspeccion", color: "#A5D6A7", tipo: "texto" },
            { id: "objeto_inspeccion", nombre: "Objeto Inspección", variable: "objeto_inspeccion", color: "#A5D6A7", tipo: "texto" },
            { id: "finalidad_inspeccion", nombre: "Finalidad Inspección", variable: "finalidad_inspeccion", color: "#A5D6A7", tipo: "texto" },
            { id: "fecha_inspeccion", nombre: "Fecha Inspección", variable: "fecha_inspeccion", color: "#A5D6A7", tipo: "fecha" },
            { id: "direccion_inspeccion", nombre: "Dirección Inspección", variable: "direccion_inspeccion", color: "#A5D6A7", tipo: "texto" },
            { id: "hechos_a_verificar_inspeccion", nombre: "Hechos a Verificar", variable: "hechos_a_verificar_inspeccion", color: "#A5D6A7", tipo: "texto_largo" }
        ],
        pretensiones: [1,2,3,4,5,6,7,8,9,10].map(n => ({
            id: `pretension_${n}`, nombre: `Pretensión ${n}`, variable: `pretension_${n}`, color: "#C5E1A5", tipo: "texto_largo"
        })),
        fundamentos: [
            { id: "fundamento_1", nombre: "Fundamento 1", variable: "fundamento_1", color: "#B39DDB", tipo: "texto_largo" },
            { id: "fundamento_2", nombre: "Fundamento 2", variable: "fundamento_2", color: "#B39DDB", tipo: "texto_largo" },
            { id: "fundamento_3", nombre: "Fundamento 3", variable: "fundamento_3", color: "#B39DDB", tipo: "texto_largo" },
            { id: "fundamento_4", nombre: "Fundamento 4", variable: "fundamento_4", color: "#B39DDB", tipo: "texto_largo" },
            { id: "fundamento_5", nombre: "Fundamento 5", variable: "fundamento_5", color: "#B39DDB", tipo: "texto_largo" },
            { id: "norma", nombre: "Norma Aplicable", variable: "norma", color: "#CE93D8", tipo: "texto" },
            { id: "articulo_norma", nombre: "Artículo de Norma", variable: "articulo_norma", color: "#CE93D8", tipo: "texto" },
            { id: "descripcion_norma", nombre: "Descripción Norma", variable: "descripcion_norma", color: "#CE93D8", tipo: "texto_largo" }
        ],
        otros: [
            { id: "nombre_abogado", nombre: "Nombre Abogado", variable: "nombre_abogado", color: "#FFD54F", tipo: "texto" },
            { id: "matricula_abogado", nombre: "Matrícula Abogado", variable: "matricula_abogado", color: "#80CBC4", tipo: "texto" },
            { id: "unidad_judicial", nombre: "Unidad Judicial", variable: "unidad_judicial", color: "#7986CB", tipo: "texto" },
            { id: "juzgador", nombre: "Juzgador", variable: "juzgador", color: "#7986CB", tipo: "texto" }
        ],
        proceso: [
            { id: "tipo_accion", nombre: "Tipo de Acción", variable: "tipo_accion", color: "#7986CB", tipo: "texto" },
            { id: "materia", nombre: "Materia", variable: "materia", color: "#4FC3F7", tipo: "texto" },
            { id: "submateria", nombre: "Submateria", variable: "submateria", color: "#4FC3F7", tipo: "texto" },
            { id: "procedimiento", nombre: "Procedimiento", variable: "procedimiento", color: "#4FC3F7", tipo: "texto" },
            { id: "cuantia", nombre: "Cuantía", variable: "cuantia", color: "#FFE082", tipo: "texto" },
            { id: "sala", nombre: "Sala", variable: "sala", color: "#4FC3F7", tipo: "texto" },
            { id: "ciudad_juicio", nombre: "Ciudad Juicio", variable: "ciudad_juicio", color: "#4FC3F7", tipo: "texto" },
            { id: "canton_juicio", nombre: "Cantón Juicio", variable: "canton_juicio", color: "#4FC3F7", tipo: "texto" },
            { id: "provincia_juicio", nombre: "Provincia Juicio", variable: "provincia_juicio", color: "#4FC3F7", tipo: "texto" },
            { id: "fecha_escrito", nombre: "Fecha Escrito", variable: "fecha_escrito", color: "#4FC3F7", tipo: "fecha" },
            { id: "fecha_presentacion", nombre: "Fecha Presentación", variable: "fecha_presentacion", color: "#4FC3F7", tipo: "fecha" },
            { id: "numero_noticia", nombre: "Número Noticia", variable: "numero_noticia", color: "#4FC3F7", tipo: "texto" },
            { id: "numero_investigacion", nombre: "Número Investigación", variable: "numero_investigacion", color: "#4FC3F7", tipo: "texto" }
        ],
        notificaciones: [
            { id: "correo_notificacion", nombre: "Correo Notificación", variable: "correo_notificacion", color: "#81C784", tipo: "texto" },
            { id: "casillero_electronico_actor", nombre: "Casillero Electrónico Actor", variable: "casillero_electronico_actor", color: "#81C784", tipo: "texto" },
            { id: "casillero_electronico_demandado", nombre: "Casillero Electrónico Demandado", variable: "casillero_electronico_demandado", color: "#81C784", tipo: "texto" },
            { id: "direccion_citacion_actor", nombre: "Dirección Citación Actor", variable: "direccion_citacion_actor", color: "#BCAAA4", tipo: "texto" },
            { id: "direccion_citacion_actor_2", nombre: "Dirección Citación Actor 2", variable: "direccion_citacion_actor_2", color: "#BCAAA4", tipo: "texto" },
            { id: "direccion_citacion_demandado", nombre: "Dirección Citación Demandado", variable: "direccion_citacion_demandado", color: "#BCAAA4", tipo: "texto" }
        ],
        excepciones: [
            { id: "excepcion_1", nombre: "Excepción 1", variable: "excepcion_1", color: "#EF9A9A", tipo: "texto" },
            { id: "excepcion_2", nombre: "Excepción 2", variable: "excepcion_2", color: "#EF9A9A", tipo: "texto" },
            { id: "excepcion_3", nombre: "Excepción 3", variable: "excepcion_3", color: "#EF9A9A", tipo: "texto" },
            { id: "excepcion_4", nombre: "Excepción 4", variable: "excepcion_4", color: "#EF9A9A", tipo: "texto" },
            { id: "excepcion_5", nombre: "Excepción 5", variable: "excepcion_5", color: "#EF9A9A", tipo: "texto" },
            { id: "excepcion_6", nombre: "Excepción 6", variable: "excepcion_6", color: "#EF9A9A", tipo: "texto" },
            { id: "contestacion", nombre: "Contestación", variable: "contestacion", color: "#EF9A9A", tipo: "texto_largo" },
            { id: "hecho_defensa_1", nombre: "Hecho Defensa 1", variable: "hecho_defensa_1", color: "#EF9A9A", tipo: "texto_largo" },
            { id: "hecho_defensa_2", nombre: "Hecho Defensa 2", variable: "hecho_defensa_2", color: "#EF9A9A", tipo: "texto_largo" },
            { id: "hecho_defensa_3", nombre: "Hecho Defensa 3", variable: "hecho_defensa_3", color: "#EF9A9A", tipo: "texto_largo" },
            { id: "hecho_defensa_4", nombre: "Hecho Defensa 4", variable: "hecho_defensa_4", color: "#EF9A9A", tipo: "texto_largo" },
            { id: "hecho_defensa_5", nombre: "Hecho Defensa 5", variable: "hecho_defensa_5", color: "#EF9A9A", tipo: "texto_largo" },
            { id: "hecho_defensa_6", nombre: "Hecho Defensa 6", variable: "hecho_defensa_6", color: "#EF9A9A", tipo: "texto_largo" },
            { id: "hecho_defensa_7", nombre: "Hecho Defensa 7", variable: "hecho_defensa_7", color: "#EF9A9A", tipo: "texto_largo" },
            { id: "hecho_defensa_8", nombre: "Hecho Defensa 8", variable: "hecho_defensa_8", color: "#EF9A9A", tipo: "texto_largo" }
        ],
        pronunciamiento: [
            { id: "admite_pretension", nombre: "Admite Pretensión", variable: "admite_pretension", color: "#C5E1A5", tipo: "texto_largo" },
            { id: "niega_pretension", nombre: "Niega Pretensión", variable: "niega_pretension", color: "#C5E1A5", tipo: "texto_largo" },
            { id: "acepta_hechos", nombre: "Acepta Hechos", variable: "acepta_hechos", color: "#C5E1A5", tipo: "texto_largo" },
            { id: "se_opone_hechos", nombre: "Se Opone Hechos", variable: "se_opone_hechos", color: "#C5E1A5", tipo: "texto_largo" },
            { id: "no_le_consta_hechos", nombre: "No Le Constata Hechos", variable: "no_le_consta_hechos", color: "#C5E1A5", tipo: "texto_largo" },
            { id: "pronunciamiento_excepciones", nombre: "Pronunciamiento Excepciones", variable: "pronunciamiento_excepciones", color: "#C5E1A5", tipo: "texto_largo" }
        ],
        laboral: [
            { id: "salario", nombre: "Salario", variable: "salario", color: "#FFE082", tipo: "texto" },
            { id: "ingresos", nombre: "Ingresos", variable: "ingresos", color: "#FFE082", tipo: "texto" },
            { id: "egresos", nombre: "Egresos", variable: "egresos", color: "#FFE082", tipo: "texto" },
            { id: "gastos", nombre: "Gastos", variable: "gastos", color: "#FFE082", tipo: "texto" },
            { id: "carga_familiar", nombre: "Carga Familiar", variable: "carga_familiar", color: "#FFE082", tipo: "texto" },
            { id: "personas_a_cargo", nombre: "Personas a Cargo", variable: "personas_a_cargo", color: "#FFE082", tipo: "texto" },
            { id: "numero_hijos", nombre: "Número Hijos", variable: "numero_hijos", color: "#FFE082", tipo: "texto" },
            { id: "empresa", nombre: "Empresa", variable: "empresa", color: "#FFE082", tipo: "texto" },
            { id: "cargo_trabajo", nombre: "Cargo Trabajo", variable: "cargo_trabajo", color: "#FFE082", tipo: "texto" },
            { id: "tipo_contrato", nombre: "Tipo Contrato", variable: "tipo_contrato", color: "#FFE082", tipo: "texto" },
            { id: "fecha_ingreso_trabajo", nombre: "Fecha Ingreso", variable: "fecha_ingreso_trabajo", color: "#FFE082", tipo: "fecha" },
            { id: "afiliacion", nombre: "Afiliación IESS", variable: "afiliacion", color: "#FFE082", tipo: "texto" },
            { id: "numero_iess", nombre: "Número IESS", variable: "numero_iess", color: "#FFE082", tipo: "texto" },
            { id: "pension", nombre: "Pensión", variable: "pension", color: "#D1C4E9", tipo: "texto" },
            { id: "valor_pension", nombre: "Valor Pensión", variable: "valor_pension", color: "#D1C4E9", tipo: "texto" },
            { id: "fecha_inicio_pension", nombre: "Fecha Inicio Pensión", variable: "fecha_inicio_pension", color: "#D1C4E9", tipo: "fecha" },
            { id: "fecha_fin_pension", nombre: "Fecha Fin Pensión", variable: "fecha_fin_pension", color: "#D1C4E9", tipo: "fecha" },
            { id: "valor_adeudado", nombre: "Valor Adeudado", variable: "valor_adeudado", color: "#D1C4E9", tipo: "texto" },
            { id: "fecha_ultimo_pago", nombre: "Fecha Último Pago", variable: "fecha_ultimo_pago", color: "#D1C4E9", tipo: "fecha" },
            { id: "pagos_realizados", nombre: "Pagos Realizados", variable: "pagos_realizados", color: "#D1C4E9", tipo: "texto" },
            { id: "saldo_pendiente", nombre: "Saldo Pendiente", variable: "saldo_pendiente", color: "#D1C4E9", tipo: "texto" },
            { id: "porcentaje_ofertado", nombre: "Porcentaje Ofertado", variable: "porcentaje_ofertado", color: "#D1C4E9", tipo: "texto" },
            { id: "valor_ofertado", nombre: "Valor Ofertado", variable: "valor_ofertado", color: "#D1C4E9", tipo: "texto" },
            { id: "cuota_mensual_propuesta", nombre: "Cuota Mensual Propuesta", variable: "cuota_mensual_propuesta", color: "#D1C4E9", tipo: "texto" },
            { id: "forma_pago_pension", nombre: "Forma de Pago", variable: "forma_pago_pension", color: "#D1C4E9", tipo: "texto" },
            { id: "plazo_pago", nombre: "Plazo Pago", variable: "plazo_pago", color: "#D1C4E9", tipo: "texto" },
            { id: "periodo_liquidacion", nombre: "Período Liquidación", variable: "periodo_liquidacion", color: "#D1C4E9", tipo: "texto" },
            { id: "valor_ultimo_pago", nombre: "Valor Último Pago", variable: "valor_ultimo_pago", color: "#D1C4E9", tipo: "texto" }
        ]
    };
    return map[bloqueId] || [];
}

function ecGetCustomBloques() {
    if (configuracionActual && configuracionActual.customBlocks && configuracionActual.customBlocks.length > 0) {
        return configuracionActual.customBlocks;
    }
    try {
        var stored = JSON.parse(localStorage.getItem("ec_custom_blocks") || "[]");
        if (stored.length > 0 && configuracionActual) {
            configuracionActual.customBlocks = stored;
        }
        return stored;
    } catch(e) { return []; }
}

function ecSaveCustomBloques(blocks) {
    localStorage.setItem("ec_custom_blocks", JSON.stringify(blocks));
    if (configuracionActual) {
        configuracionActual.customBlocks = blocks;
    }
    ecNotifyCustomBlocksChanged(blocks);
}

function ecNotifyCustomBlocksChanged(blocks) {
    if (configuracionActual && configuracionActual.mapeo) {
        programarGuardadoConfiguracion();
    }
}

function ecGetBloque(bloqueId) {
    const all = ecGetBloques();
    return all.find(b => b.id === bloqueId) || null;
}

function abrirModalEditarCampos() {
    const modal = document.getElementById("modalEditarCampos");
    if (!modal) return;
    modal.classList.add("abierto");
    ecView = "blocks";
    ecBloqueActualId = null;
    ecEditEntryId = null;
    ecRender();
}

function cerrarModalEditarCampos() {
    const modal = document.getElementById("modalEditarCampos");
    if (!modal) return;
    modal.classList.remove("abierto");
    ecView = "blocks";
    ecBloqueActualId = null;
    ecEditEntryId = null;
}

function ecAtras() {
    if (ecView === "block" || ecView === "newBlock" || ecView === "editBlock") {
        ecView = "blocks";
        ecBloqueActualId = null;
    } else if (ecView === "newEntry" || ecView === "editEntry") {
        ecView = "block";
        ecEditEntryId = null;
    }
    ecRender();
}

function ecRender() {
    const body = document.getElementById("ecBody");
    const title = document.getElementById("ecTitulo");
    const backBtn = document.getElementById("ecBtnBack");
    if (!body || !title || !backBtn) return;

    if (ecView === "blocks") {
        title.textContent = "EDITAR CAMPOS";
        backBtn.style.display = "none";
        ecRenderBloquesList(body);
    } else if (ecView === "block") {
        const bloque = ecGetBloque(ecBloqueActualId);
        title.textContent = bloque ? bloque.nombre : "BLOQUE";
        backBtn.style.display = "inline-block";
        ecRenderBloqueDetail(body);
    } else if (ecView === "newBlock") {
        title.textContent = "NUEVO BLOQUE";
        backBtn.style.display = "inline-block";
        ecRenderNewBlockForm(body);
    } else if (ecView === "editBlock") {
        title.textContent = "EDITAR BLOQUE";
        backBtn.style.display = "inline-block";
        ecRenderEditBlockForm(body);
    } else if (ecView === "newEntry") {
        title.textContent = "NUEVA ENTRY";
        backBtn.style.display = "inline-block";
        ecRenderEntryForm(body, null);
    } else if (ecView === "editEntry") {
        title.textContent = "EDITAR ENTRY";
        backBtn.style.display = "inline-block";
        ecRenderEntryForm(body, ecEditEntryId);
    }
}

function ecRenderBloquesList(container) {
    const bloques = ecGetBloques();
    let html = "";
    bloques.forEach(function(b, idx) {
        const count = b.entries ? b.entries.length : 0;
        const esSistema = b.tipo === "sistema";
        const badge = esSistema
            ? '<span style="background:#e2e8f0; color:#64748b; font-size:10px; padding:2px 6px; border-radius:3px; margin-left:6px;">sistema</span>'
            : "";
        const click = `ecView='block'; ecBloqueActualId='${b.id}'; ecRender();`;
        let actions = `<div style="display:flex; gap:2px; flex-shrink:0;">
            <button onclick="event.stopPropagation(); ecMoverBloque('${b.id}',-1);" title="Subir" style="background:none;border:none;cursor:pointer;font-size:13px;color:#64748b;padding:2px 3px;">&#9650;</button>
            <button onclick="event.stopPropagation(); ecMoverBloque('${b.id}',1);" title="Bajar" style="background:none;border:none;cursor:pointer;font-size:13px;color:#64748b;padding:2px 3px;">&#9660;</button>
            <button onclick="event.stopPropagation(); ecView='editBlock'; ecBloqueActualId='${b.id}'; ecRender();" title="Editar nombre" style="background:none;border:none;cursor:pointer;font-size:13px;color:#5c6bc0;padding:2px 3px;">&#9998;</button>
            <button onclick="event.stopPropagation(); ecEliminarBloque('${b.id}');" title="Eliminar" style="background:none;border:none;cursor:pointer;font-size:13px;color:#ef4444;padding:2px 3px;">&#128465;</button>
        </div>`;
        html += `<div style="display:flex; align-items:center; padding:10px 12px; border-bottom:1px solid #f1f5f9; cursor:pointer; border-radius:6px; margin-bottom:2px;" 
                      onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background=''" onclick="${click}">
            <div style="flex:1; min-width:0;">
                <div style="font-size:13px; font-weight:600; color:#1e293b;">${b.nombre}${badge}</div>
                <div style="font-size:11px; color:#94a3b8;">${count} / 25 entries</div>
            </div>
            ${actions}
            <span style="color:#cbd5e1; font-size:14px; margin-left:4px;">&#8250;</span>
        </div>`;
    });
    html += `<div style="text-align:center; padding:12px;">
        <button onclick="ecView='newBlock'; ecRender();" style="background:#5c6bc0; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">+ NUEVO BLOQUE</button>
    </div>`;
    container.innerHTML = html;
}

function ecRenderBloqueDetail(container) {
    const bloque = ecGetBloque(ecBloqueActualId);
    if (!bloque) { container.innerHTML = "<p style='color:#999;'>Bloque no encontrado.</p>"; return; }
    let html = "";
    html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0 8px; font-size:11px; color:#94a3b8;">
        <span>Entries: ${(bloque.entries||[]).length} / 25</span>
    </div>`;
    if (bloque.entries && bloque.entries.length > 0) {
        bloque.entries.forEach(function(e, eIdx) {
            html += `<div style="display:flex; align-items:center; padding:8px 10px; border-bottom:1px solid #f1f5f9; gap:6px;">
                <span onclick="window.open('${colorCampo(e.id)}')" style="width:10px; height:10px; border-radius:50%; background:${e.color || '#ccc'}; flex-shrink:0; border:1px solid rgba(0,0,0,.15);"></span>
                <div style="flex:1; min-width:0;">
                    <div style="font-size:12px; font-weight:600; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.nombre}</div>
                    <div style="font-size:10px; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.id}${e.tipo ? ' · ' + e.tipo : ''}</div>
                </div>`;
            html += `<button onclick="ecMoverEntry('${bloque.id}','${e.id}',-1);" title="Subir" style="background:none;border:none;cursor:pointer;font-size:12px;color:#64748b;padding:1px 2px;">&#9650;</button>`;
            html += `<button onclick="ecMoverEntry('${bloque.id}','${e.id}',1);" title="Bajar" style="background:none;border:none;cursor:pointer;font-size:12px;color:#64748b;padding:1px 2px;">&#9660;</button>`;
            html += `<button onclick="ecEditEntryId='${e.id}'; ecView='editEntry'; ecRender();" title="Editar" style="background:none;border:none;cursor:pointer;font-size:13px;color:#5c6bc0;padding:1px 3px;">&#9998;</button>`;
            html += `<button onclick="ecEliminarEntrada('${bloque.id}','${e.id}');" title="Eliminar" style="background:none;border:none;cursor:pointer;font-size:13px;color:#ef4444;padding:1px 3px;">&#128465;</button>`;
            html += `</div>`;
        });
    } else {
        html += '<p style="color:#94a3b8; font-size:12px; text-align:center; padding:8px;">Sin entries</p>';
    }
    if (bloque.entries && bloque.entries.length < 25) {
        html += `<div style="text-align:center; padding:10px;">
            <button onclick="ecView='newEntry'; ecRender();" style="background:#5c6bc0; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">+ AGREGAR ENTRY</button>
        </div>`;
    } else if (bloque.entries && bloque.entries.length >= 25) {
        html += '<p style="color:#ef4444; font-size:11px; text-align:center; padding:4px;">Este bloque alcanzó el máximo de 25 Entries.</p>';
    }
    html += `<div style="text-align:center; padding:8px; border-top:1px solid #f1f5f9; margin-top:8px;">
        <button onclick="ecEliminarBloque('${bloque.id}')" style="background:#fee2e2; color:#dc2626; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">&#128465; ELIMINAR BLOQUE</button>
    </div>`;
    container.innerHTML = html;
}

function ecRenderNewBlockForm(container) {
    let html = `<div style="padding:4px 0;">
        <div style="margin-bottom:12px;">
            <label style="font-size:12px; font-weight:600; color:#475569; display:block; margin-bottom:4px;">Nombre del bloque:</label>
            <input id="ecNewBlockName" type="text" placeholder="Ej: DATOS DEL VEHÍCULO" style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;">
        </div>
        <div class="modal-acciones">
            <button onclick="ecCrearBloque();" style="background:#5c6bc0; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">CREAR BLOQUE</button>
            <button onclick="ecView='blocks'; ecRender();" style="background:#e2e8f0; color:#333; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:12px;">CANCELAR</button>
        </div>
    </div>`;
    container.innerHTML = html;
    setTimeout(function(){ var el = document.getElementById("ecNewBlockName"); if(el) el.focus(); }, 50);
}

function ecRenderEditBlockForm(container) {
    const bloque = ecGetBloque(ecBloqueActualId);
    if (!bloque) return;
    let html = `<div style="padding:4px 0;">
        <div style="margin-bottom:12px;">
            <label style="font-size:12px; font-weight:600; color:#475569; display:block; margin-bottom:4px;">Nombre del bloque:</label>
            <input id="ecEditBlockName" type="text" value="${bloque.nombre}" style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;">
        </div>
        <div class="modal-acciones">
            <button onclick="ecGuardarBloque();" style="background:#5c6bc0; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">GUARDAR</button>
            <button onclick="ecView='block'; ecRender();" style="background:#e2e8f0; color:#333; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:12px;">CANCELAR</button>
        </div>
    </div>`;
    container.innerHTML = html;
    setTimeout(function(){ var el = document.getElementById("ecEditBlockName"); if(el) el.focus(); }, 50);
}

function ecCrearBloque() {
    var nameEl = document.getElementById("ecNewBlockName");
    if (!nameEl) return;
    var name = nameEl.value.trim();
    if (!name) { alert("Ingrese un nombre para el bloque."); return; }
    var id = "custom_" + name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    var blocks = ecGetCustomBloques();
    if (blocks.find(function(b){ return b.id === id; })) { alert("Ya existe un bloque con ese nombre."); return; }
    blocks.push({ id: id, nombre: name.toUpperCase(), tipo: "custom", entries: [] });
    ecSaveCustomBloques(blocks);
    sincronizarInterfazCampos();
    ecView = "block";
    ecBloqueActualId = id;
    ecRender();
}

function ecGuardarBloque() {
    var nameEl = document.getElementById("ecEditBlockName");
    if (!nameEl || !ecBloqueActualId) return;
    var newName = nameEl.value.trim();
    if (!newName) { alert("Ingrese un nombre."); return; }
    if (isSystemBlock(ecBloqueActualId)) {
        if (!configuracionActual) configuracionActual = {};
        if (!configuracionActual.blockNames) configuracionActual.blockNames = {};
        configuracionActual.blockNames[ecBloqueActualId] = newName.toUpperCase();
        programarGuardadoConfiguracion();
    } else {
        var blocks = ecGetCustomBloques();
        var bIdx = blocks.findIndex(function(b){ return b.id === ecBloqueActualId; });
        if (bIdx === -1) return;
        blocks[bIdx].nombre = newName.toUpperCase();
        ecSaveCustomBloques(blocks);
    }
    sincronizarInterfazCampos();
    ecRender();
}

function ecEliminarBloque(bloqueId) {
    if (!confirm("¿Deseas eliminar este bloque y todos sus Entries?")) return;
    var removedEntries = getActiveEntries(bloqueId);
    var removedEntryIds = removedEntries.map(function(e){ return e.id; });
    if (isSystemBlock(bloqueId)) {
        if (!configuracionActual) configuracionActual = {};
        if (!configuracionActual.deletedCustomBlocks) configuracionActual.deletedCustomBlocks = [];
        if (configuracionActual.deletedCustomBlocks.indexOf(bloqueId) === -1) {
            configuracionActual.deletedCustomBlocks.push(bloqueId);
        }
        if (configuracionActual.blockEntries) {
            delete configuracionActual.blockEntries[bloqueId];
        }
    } else {
        var blocks = ecGetCustomBloques();
        blocks = blocks.filter(function(b){ return b.id !== bloqueId; });
        ecSaveCustomBloques(blocks);
        if (!configuracionActual) configuracionActual = {};
        configuracionActual.customBlocks = blocks;
    }
    if (configuracionActual && configuracionActual.mapeo) {
        removedEntryIds.forEach(function(entryId) {
            if (configuracionActual.mapeo[entryId]) {
                configuracionActual.mapeo[entryId].forEach(function(m) {
                    if (configuracionActual.resaltados) configuracionActual.resaltados[m] = false;
                });
                configuracionActual.mapeo[entryId] = [];
            }
        });
    }
    programarGuardadoConfiguracion();
    sincronizarInterfazCampos();
    if (modo === bloqueId) {
        modo = PAGINAS[0];
        mostrarPagina(modo);
    }
    ecView = "blocks";
    ecBloqueActualId = null;
    ecRender();
}

function ecMoverBloque(bloqueId, dir) {
    var allBloques = ecGetBloques();
    var ids = allBloques.map(function(b){ return b.id; });
    var idx = ids.indexOf(bloqueId);
    if (idx === -1) return;
    var newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= ids.length) return;
    var temp = ids[idx];
    ids[idx] = ids[newIdx];
    ids[newIdx] = temp;
    if (!configuracionActual) configuracionActual = {};
    configuracionActual.blockOrder = ids;
    if (!isSystemBlock(bloqueId)) {
        var custom = ecGetCustomBloques();
        var cIds = custom.map(function(b){ return b.id; });
        var cIdx = cIds.indexOf(bloqueId);
        if (cIdx !== -1) {
            var cNewIdx = cIdx + dir;
            if (cNewIdx >= 0 && cNewIdx < custom.length) {
                var tmp = custom[cIdx];
                custom[cIdx] = custom[cNewIdx];
                custom[cNewIdx] = tmp;
                ecSaveCustomBloques(custom);
            }
        }
    }
    programarGuardadoConfiguracion();
    sincronizarInterfazCampos();
    ecRender();
}

function ecMoverEntry(bloqueId, entryId, dir) {
    var entries = JSON.parse(JSON.stringify(getActiveEntries(bloqueId)));
    var eIdx = entries.findIndex(function(e){ return e.id === entryId; });
    if (eIdx === -1) return;
    var newIdx = eIdx + dir;
    if (newIdx < 0 || newIdx >= entries.length) return;
    var temp = entries[eIdx];
    entries[eIdx] = entries[newIdx];
    entries[newIdx] = temp;
    saveBlockEntries(bloqueId, entries);
    sincronizarInterfazCampos();
    ecRender();
}

function ecRenderEntryForm(container, existingEntryId) {
    var bloque = ecGetBloque(ecBloqueActualId);
    if (!bloque) return;
    var existing = existingEntryId ? bloque.entries.find(function(e){ return e.id === existingEntryId; }) : null;
    var colors = EC_COLOR_PALETTE;
    var tipoOptions = ["texto", "textarea", "fecha", "numero", "email"];
    var html = '<div style="padding:4px 0;">';
    html += '<div class="modal-campo"><label>Nombre visible:</label>';
    html += '<input id="ecEntryName" type="text" value="' + (existing ? existing.nombre : '') + '" placeholder="Nombre del campo"></div>';
    html += '<div class="modal-campo"><label>Variable:</label>';
    html += '<input id="ecEntryVar" type="text" value="' + (existing ? existing.id : '') + '" placeholder="NOMBRE_VARIABLE_1"';
    if (existing) html += ' readonly style="background:#f1f5f9;"';
    html += '></div>';
    html += '<div class="modal-campo"><label>Color:</label><div style="display:flex;gap:5px;flex-wrap:wrap;" id="ecColorPalette">';
    colors.forEach(function(c) {
        var sel = (existing && existing.color === c) || (!existing && c === colors[0]);
        html += '<span data-color="' + c + '" onclick="ecSelectColor(this)" style="width:24px;height:24px;border-radius:50%;background:' + c + ';cursor:pointer;display:inline-block;' + (sel ? 'outline:3px solid #333;outline-offset:2px;' : '') + '"></span>';
    });
    html += '</div><input id="ecEntryColor" type="hidden" value="' + (existing ? existing.color : colors[0]) + '"></div>';
    html += '<div class="modal-campo"><label>Tipo:</label>';
    html += '<select id="ecEntryTipo">';
    tipoOptions.forEach(function(t) {
        html += '<option value="' + t + '"' + (existing && existing.tipo === t ? ' selected' : '') + '>' + t + '</option>';
    });
    html += '</select></div>';
    html += '<div class="modal-acciones">';
    html += '<button onclick="ecGuardarEntrada();" style="background:#5c6bc0;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">AGREGAR</button>';
    html += '<button onclick="ecView=\'block\'; ecEditEntryId=null; ecRender();" style="background:#e2e8f0;color:#333;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:12px;">CANCELAR</button>';
    html += '</div></div>';
    container.innerHTML = html;
    if (!existingEntryId) {
        setTimeout(function(){ var el = document.getElementById("ecEntryName"); if(el) el.focus(); }, 50);
    }
}

function ecSelectColor(el) {
    document.querySelectorAll('#ecColorPalette span').forEach(function(s){ s.style.outline = 'none'; s.style.outlineOffset = '0'; });
    el.style.outline = '3px solid #333';
    el.style.outlineOffset = '2px';
    var hidden = document.getElementById("ecEntryColor");
    if (hidden) hidden.value = el.dataset.color;
}

function ecGuardarEntrada() {
    var bloque = ecGetBloque(ecBloqueActualId);
    if (!bloque) return;
    var nameEl = document.getElementById("ecEntryName");
    var varEl = document.getElementById("ecEntryVar");
    var colorEl = document.getElementById("ecEntryColor");
    var tipoEl = document.getElementById("ecEntryTipo");
    if (!nameEl || !varEl || !colorEl || !tipoEl) return;
    var nombre = nameEl.value.trim();
    var variable = varEl.value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_").replace(/^_+|_+$/g, "");
    var color = colorEl.value;
    var tipo = tipoEl.value;
    if (!nombre || !variable) { alert("Nombre y Variable son obligatorios."); return; }
    var entries = JSON.parse(JSON.stringify(getActiveEntries(ecBloqueActualId)));
    if (ecEditEntryId) {
        var eIdx = entries.findIndex(function(e){ return e.id === ecEditEntryId; });
        if (eIdx !== -1) {
            entries[eIdx] = { id: variable, nombre: nombre, variable: variable, color: color, tipo: tipo };
        }
    } else {
        if (entries.length >= 25) { alert("Este bloque alcanzó el máximo de 25 Entries."); return; }
        var exists = entries.find(function(e){ return e.id === variable; });
        if (exists) { alert("Esta variable ya existe en el bloque " + bloque.nombre + "."); return; }
        entries.push({ id: variable, nombre: nombre, variable: variable, color: color, tipo: tipo });
    }
    saveBlockEntries(ecBloqueActualId, entries);
    ecEditEntryId = null;
    ecView = "block";
    ecRender();
    sincronizarInterfazCampos();
}

function ecEliminarEntrada(bloqueId, entryId) {
    if (!confirm("¿Deseas eliminar este Entry?")) return;
    var entries = JSON.parse(JSON.stringify(getActiveEntries(bloqueId)));
    entries = entries.filter(function(e){ return e.id !== entryId; });
    saveBlockEntries(bloqueId, entries);
    if (configuracionActual && configuracionActual.mapeo && configuracionActual.mapeo[entryId]) {
        configuracionActual.mapeo[entryId].forEach(function(m) {
            if (configuracionActual.resaltados) configuracionActual.resaltados[m] = false;
        });
        configuracionActual.mapeo[entryId] = [];
    }
    ecRender();
    sincronizarInterfazCampos();
}

function ecGetAllCustomEntries() {
    var entries = [];
    ecGetBloques().forEach(function(b) {
        if (b.entries) b.entries.forEach(function(e) {
            entries.push({ id: e.id, nombre: e.nombre, variable: e.variable, color: e.color, tipo: e.tipo, bloqueId: b.id, bloqueNombre: b.nombre });
        });
    });
    return entries;
}

function sincronizarInterfazCampos() {
    rebuildPaginasDinamicas();
    if (configuracionActual && configuracionActual.mapeo) {
        var conteos = {};
        Object.keys(configuracionActual.mapeo).forEach(function(entryId) {
            var markers = configuracionActual.mapeo[entryId];
            if (markers && markers.length > 0) {
                conteos[entryId] = markers.length;
            }
        });
        marcarEntriesConVariables(configuracionActual.mapeo, conteos);
    }
}

function ecOnOpen() {
    rebuildPaginasDinamicas();
    document.getElementById("btnEditarCampos").style.display = "inline-block";
}

document.addEventListener("DOMContentLoaded", function() {
    rebuildPaginasDinamicas();
    var btn = document.getElementById("btnEditarCampos");
    if (btn) btn.style.display = "inline-block";
    document.addEventListener("keydown", function(e) {
        if (e.target && e.target.classList && e.target.classList.contains("match-nav-badge")) {
            if (e.key === "Enter") {
                e.preventDefault();
                var entryKey = e.target.getAttribute("data-entry-key");
                if (entryKey) {
                    if (e.shiftKey) {
                        navegarCoincidenciaAnterior(entryKey);
                    } else {
                        navegarCoincidencia(entryKey);
                    }
                }
            }
        }
    });
});
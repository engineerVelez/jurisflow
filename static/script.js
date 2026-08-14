const VERSION_SCRIPT = 127;
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
    const esNombre = (key === "actor" || key === "nombre_demandado" || /^nombre_testigo[1-5]$/.test(key));
    const esTipoJuicio = (key === "tipo_juicio");

    input.addEventListener("input", () => {

        const nuevoValor = input.value;

        if (esNombre) {
            // 🔧 FIX PRINCIPAL: ya NO se vuelve a buscar el nombre en el
            // documento. Se actualiza directamente el texto de todas las
            // apariciones ya asociadas a este key (detectadas o marcadas
            // manualmente). Mismo patrón que los campos normales: no se
            // reconstruye el editor, no se pierde el cursor, no hay riesgo
            // de duplicar al escribir espacios.
            const editor = document.getElementById("editor");
            const spans = editor.querySelectorAll(`span[data-key="${key}"]`);

            spans.forEach(span => {
                span.textContent = nuevoValor;
            });

            guardarEstado();
            guardarEstadoEditor();
            programarGuardado();
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

            if (spans.length) {
                spans.forEach(span => {
                    span.textContent = "";
                });
            }

            guardarEstado();
            guardarEstadoEditor();
            programarGuardado();
            guardarCampoEnMemoria(key, "");

            return;
        }

        spans.forEach(span => {
            span.textContent = nuevoValor;
        });

        guardarEstado();
        guardarEstadoEditor();
        programarGuardado();
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
                eliminarSpansPorKey(key);
                guardarEstado();
                guardarEstadoEditor();
                programarGuardado();
                guardarCampoEnMemoria(key, "");
                return;
            }

            // 🔧 RECONOCIMIENTO AUTOMÁTICO: si la IA dejó el nombre
            // incompleto o con errores, al CORREGIRLO en el Entry se
            // vuelve a buscar en el documento con el valor corregido.
            // Se quitan primero las apariciones automáticas viejas
            // (las marcadas a mano con data-manual se conservan), y se
            // detectan de nuevo todas las menciones del nombre nuevo.
            editor.querySelectorAll(`span[data-key="${key}"]:not([data-manual])`).forEach(span => {
                span.replaceWith(document.createTextNode(span.textContent));
            });
            editor.normalize();

            resaltarNombrePorPalabras(key, valor);

            guardarEstado();
            guardarEstadoEditor();
            programarGuardado();
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

// 🔧 SINCRONIZACIÓN DEL TIPO DE JUICIO CON EL ENTRY:
// las palabras del documento que estaban resaltadas como tipo de juicio
// 🔧 COMPROMETE la edición del Entry de tipo de juicio sobre el documento.
// Se llama al TERMINAR de editar (blur): corrige el texto del documento
// (reemplaza/borra las palabras según el Entry), re-resalta y guarda.
// Si el Entry quedó vacío, se borran todas las palabras del tipo de juicio.
function comprometerTipoJuicio(valor) {
    const ed = document.getElementById("editor");
    if (!ed) return;

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
    if (key === "actor") return "#FFD54F";
    if (key === "nombre_demandado") return "#64B5F6";
    if (/^nombre_testigo[1-5]$/.test(key)) return "#BA68C8";
    if (key.includes("email")) return "#81C784";
    if (key.includes("cedula")) return "#4DD0E1";
    if (key.includes("telefono")) return "#FFB74D";
    if (key.includes("objeto")) return "#E1BEE7";
    if (key === "numero_juicio") return "#78909C";
    if (key === "tipo_juicio") return "#90A4AE";
    if (["age", "civil", "profesion", "ciudadania"].includes(key)) return "#F48FB1";
    return "#D7CCC8";
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
    const esNombre = (key === "actor" || key === "nombre_demandado");

    if (textoSeleccionado) {

        // 🔙 DESHACER: el resaltado manual es una acción deshacible
        comprometerEdicion();
        guardarUndo();

        let span = null;

        if (esNombre) {
            // 🔧 FIX: la selección manual de una aparición ya NO borra
            // las apariciones existentes ni sobrescribe el Entry con
            // solo el texto seleccionado. Solo se agrega esta aparición
            // como una instancia más, ligada al valor actual del Entry.
            if (!input.value.trim()) {
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

            // si el Entry ya tenía un nombre distinto al texto que
            // acabas de seleccionar, esta nueva aparición se sincroniza
            // con el valor actual del Entry (no con lo seleccionado),
            // para quedar consistente con las demás apariciones del key.
            if (input.value.trim() && input.value.trim() !== textoSeleccionado) {
                span.textContent = input.value;
            }

            // 🔧 resaltar TODAS las coincidencias del nombre en el
            // documento (igual que los campos normales): la aparición
            // recién marcada ya está dentro de un span y se ignora,
            // así que aquí solo se agregan las demás.
            resaltarNombrePorPalabras(key, input.value);

        } else {
            input.value = textoSeleccionado;
            eliminarSpansPorKey(key);
            resaltarTodasLasCoincidencias(key, textoSeleccionado);
        }

        guardarEstado();
        guardarEstadoEditor();
        guardarEnServidor();
        guardarCampoEnMemoria(key, input.value);

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

let modo = "actor";

document.addEventListener("DOMContentLoaded", () => {

    colorearBotones();

    cargarInstrucciones();
    cargarChat();

    const actor = document.getElementById("bloque-actor");
    const demandado = document.getElementById("bloque-demandado");
    const testigo1 = document.getElementById("bloque-testigo1");
    const testigo2 = document.getElementById("bloque-testigo2");
    const testigo3 = document.getElementById("bloque-testigo3");
    const testigo4 = document.getElementById("bloque-testigo4");
    const testigo5 = document.getElementById("bloque-testigo5");

    actor.style.display = "block";
    demandado.style.display = "none";
    testigo1.style.display = "none";
    testigo2.style.display = "none";
    testigo3.style.display = "none";
    testigo4.style.display = "none";
    testigo5.style.display = "none";

    window.siguiente = function () {
        if (modo === "actor") {
            actor.style.display = "none";
            demandado.style.display = "block";
            modo = "demandado";
        }
        else if (modo === "demandado") {
            demandado.style.display = "none";
            testigo1.style.display = "block";
            modo = "testigo1";
        }
        else if (modo === "testigo1") {
            testigo1.style.display = "none";
            testigo2.style.display = "block";
            modo = "testigo2";
        }
        else if (modo === "testigo2") {
            testigo2.style.display = "none";
            testigo3.style.display = "block";
            modo = "testigo3";
        }
        else if (modo === "testigo3") {
            testigo3.style.display = "none";
            testigo4.style.display = "block";
            modo = "testigo4";
        }
        else if (modo === "testigo4") {
            testigo4.style.display = "none";
            testigo5.style.display = "block";
            modo = "testigo5";
        }
        else if (modo === "testigo5") {
            testigo5.style.display = "none";
            actor.style.display = "block";
            modo = "actor";
        }
    };

    window.anterior = function () {
        if (modo === "actor") {
            actor.style.display = "none";
            testigo5.style.display = "block";
            modo = "testigo5";
        }
        else if (modo === "testigo5") {
            testigo5.style.display = "none";
            testigo4.style.display = "block";
            modo = "testigo4";
        }
        else if (modo === "testigo4") {
            testigo4.style.display = "none";
            testigo3.style.display = "block";
            modo = "testigo3";
        }
        else if (modo === "testigo3") {
            testigo3.style.display = "none";
            testigo2.style.display = "block";
            modo = "testigo2";
        }
        else if (modo === "testigo2") {
            testigo2.style.display = "none";
            testigo1.style.display = "block";
            modo = "testigo1";
        }
        else if (modo === "testigo1") {
            testigo1.style.display = "none";
            demandado.style.display = "block";
            modo = "demandado";
        }
        else if (modo === "demandado") {
            demandado.style.display = "none";
            actor.style.display = "block";
            modo = "actor";
        }
    };

});
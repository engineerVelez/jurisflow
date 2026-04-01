let textoBase = "";

window.addEventListener("load", () => {


    const editor = document.getElementById("editor");
    if (editor) editor.innerHTML = "";

    document.querySelectorAll(".entry-input").forEach(input => {
        input.value = "";
    });
});

document.addEventListener("DOMContentLoaded", () => {

    const editor = document.getElementById("editor");

    // 🔥 cargar HTML real (con spans)
    cargarEstadoEditor();

    // 🔥 guardar TODO al editar
    editor.addEventListener("input", () => {
        guardarEstadoEditor();
        guardarEnServidor();
        guardarEstado();
    });

    // 🔥 sincronizar spans → inputs
    editor.addEventListener("input", (e) => {

        const span = e.target;

        if (!span.dataset || !span.dataset.key) return;

        const key = span.dataset.key;

        actualizarInputDesdeSpans(key);
    });

});

function dividirPartes(texto) {

    const partes = texto.split(/demandado|demandada/i);

    return {
        actor: partes[0] || "",
        demandado: partes[1] || ""
    };
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

    // PARROQUIA
    const parroquia = texto.match(/parroquia\s+([a-zA-Záéíóúñ\s]+)/i);
    if (parroquia) datos.parroquia_actor = parroquia[1].trim();

    // BARRIO
    const barrio = texto.match(/barrio\s+([a-zA-Záéíóúñ\s]+)/i);
    if (barrio) datos.barrio_actor = barrio[1].trim();

    // CALLE PRINCIPAL
    const calle1 = texto.match(/calle\s+principal\s+([a-zA-Z0-9\s]+)/i);
    if (calle1) datos.calle_principal_actor = calle1[1].trim();

    // CALLE SECUNDARIA
    const calle2 = texto.match(/calle\s+secundaria\s+([a-zA-Z0-9\s]+)/i);
    if (calle2) datos.calle_secundaria_actor = calle2[1].trim();

    // NÚMERO CASA
    const numero = texto.match(/n[uú]mero\s+(\w+)/i);
    if (numero) datos.numero_casa_actor = numero[1];

    // CÓDIGO POSTAL
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

    // 🔥 CALLES
    const calle1 = texto.match(/calle\s+principal\s+([a-zA-Z0-9\s]+)/i);
    if (calle1) datos.calle_principal_demandado = calle1[1].trim();

    const calle2 = texto.match(/calle\s+secundaria\s+([a-zA-Z0-9\s]+)/i);
    if (calle2) datos.calle_secundaria_demandado = calle2[1].trim();

    // 🔥 CASA
    const numero = texto.match(/n[uú]mero\s+(\w+)/i);
    if (numero) datos.numero_casa_demandado = numero[1];

    // 🔥 CP
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
        .replace(/[^a-záéíóúñ\s]/gi, "") // quitar basura
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

function resaltarNombreFlexible(html, key, nombre, color) {
    if (!nombre) return html;

    const palabras = nombre.split(" ").filter(p => p.length > 2);

    palabras.forEach(palabra => {

        // 🔥 evitar reemplazar dentro de spans
        const limpio = palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const regex = new RegExp(`(?![^<]*>)(${limpio})`, "gi");

        html = html.replace(regex,
            `<span class="var" data-key="${key}" style="background:${color};">$1</span>`
        );
    });

    return html;
}

async function extraerDireccionConIA(texto) {
    const response = await fetch("/ia-direccion", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ texto })
    });

    const data = await response.json();
    return data;
}
// 🔥 SUBIR ARCHIVO
document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Selecciona un archivo");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Error en servidor");
        }

        const text = await response.text();

        let data = {};

        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("⚠️ JSON inválido, pero continuo:", text);
        }

        // 🔥 obtener datos
        let texto = data.texto || "";

        // 🔥 intentar cargar versión guardada
        const nombreArchivo = file.name.replace(".docx", "").replace(/\s+/g, "_");

        const resHTML = await fetch(`/cargar-html/${nombreArchivo}`);
        const dataHTML = await resHTML.json();

        if (dataHTML.html) {
            console.log("📂 Cargando versión guardada");

            document.getElementById("editor").innerHTML = dataHTML.html;
            // 🔥 reconstruir inputs desde spans
            document.querySelectorAll("[data-key]").forEach(span => {
                const key = span.dataset.key;
                actualizarInputDesdeSpans(key);
            });

            return; // 🔥 IMPORTANTE: detener flujo normal
        }

        const partes = dividirPartes(texto);

        const actorDatos = detectarCampos(partes.actor);
        const demandadoDatos = detectarCamposDemandado(partes.demandado);

        let datos = {
            ...actorDatos,
            ...demandadoDatos,
            ...data.datos
        };

        const necesitaIA = !datos.calle_principal_actor && !datos.parroquia_actor;

        if (necesitaIA) {
            console.log("🤖 Usando IA para dirección...");

            const datosIA = await extraerDireccionConIA(texto);

            console.log("🤖 IA respondió:", datosIA);

            datos = { ...datos, ...datosIA };
        }

        console.log("🔥 DATOS IA:", data.datos);

        // 🔥 función segura
        function setValor(id, valor) {
            const el = document.getElementById(id);
            if (el) {
                el.value = valor || "";
            }
        }


        const datosIA = data.datos || {};

        for (let i = 1; i <= 5; i++) {

            setValor(`nombre_testigo${i}`, datosIA[`nombre_testigo${i}`]);
            setValor(`cedula_testigo${i}`, datosIA[`cedula_testigo${i}`]);
            setValor(`direccion_testigo${i}`, datosIA[`direccion_testigo${i}`]);
            setValor(`parroquia_testigo${i}`, datosIA[`parroquia_testigo${i}`]);
            setValor(`ciudad_testigo${i}`, datosIA[`ciudad_testigo${i}`]);
            setValor(`email_testigo${i}`, datosIA[`email_testigo${i}`]);
            setValor(`objeto_testigo${i}`, datosIA[`objeto_testigo${i}`]);
        }

        // 🔵 ACTOR
        setValor("actor", limpiarNombre(datosIA.actor?.nombre));
        setValor("cedula", datosIA.actor?.cedula);
        setValor("age", datosIA.actor?.edad);
        setValor("civil", datosIA.actor?.estado_civil);
        setValor("profesion", datosIA.actor?.profesion);
        setValor("ciudadania", datosIA.actor?.ciudadania);
        setValor("email", datosIA.actor?.email);
        setValor("telefono_actor", datosIA.actor?.telefono);

        setValor("parroquia_actor", datosIA.actor?.direccion?.parroquia);
        setValor("barrio_actor", datosIA.actor?.direccion?.barrio);
        setValor("calle_principal_actor", datosIA.actor?.direccion?.calle_principal);
        setValor("calle_secundaria_actor", datosIA.actor?.direccion?.calle_secundaria);
        setValor("numero_casa_actor", datosIA.actor?.direccion?.numero_casa);
        setValor("codigo_postal_actor", datosIA.actor?.direccion?.codigo_postal);

        // 🔴 DEMANDADO
        setValor("nombre_demandado", datosIA.demandado?.nombre);
        setValor("cedula_demandado", datosIA.demandado?.cedula);
        setValor("email_demandado", datosIA.demandado?.email);
        setValor("telefono_demandado", datosIA.demandado?.telefono);

        setValor("parroquia_demandado", datosIA.demandado?.direccion?.parroquia);
        setValor("barrio_demandado", datosIA.demandado?.direccion?.barrio);
        setValor("calle_principal_demandado", datosIA.demandado?.direccion?.calle_principal);
        setValor("calle_secundaria_demandado", datosIA.demandado?.direccion?.calle_secundaria);
        setValor("numero_casa_demandado", datosIA.demandado?.direccion?.numero_casa);
        setValor("codigo_postal_demandado", datosIA.demandado?.direccion?.codigo_postal);

        // 🟢 GENERAL
        setValor("tipo_juicio", datosIA.tipo_juicio); 

        const editor = document.getElementById("editor");

        // 🔥 limpiar HTML
        texto = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // 🔥 PRIMERO insertar en editor
        editor.innerHTML = texto;

        // 🔥 luego guardar base
        textoBase = texto;

        // 🔥 ahora sí resaltar
        resaltarGlobal();
        guardarEstado();
        
        function normalizar(texto) {
            return texto
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, " ")
                .trim();
        }
        // 🔥 insertar en editor

    } catch (error) {
        console.error(error);
        console.warn("Error controlado:", error);
    }
});

function abrirConfig() {
    document.getElementById("configPanel").style.display = "block";
}

function cerrarConfig() {
    document.getElementById("configPanel").style.display = "none";
}

function guardarPrompt() {
    const prompt = document.getElementById("promptIA").value;

    localStorage.setItem("promptIA", prompt);

    alert("Prompt guardado");
    cerrarConfig();
}


// 🔥 FUNCIÓN PARA RESALTAR TEXTO
function resaltarSeleccion() {
    const selection = window.getSelection();

    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    const span = document.createElement("span");
    span.style.backgroundColor = "yellow";

    range.surroundContents(span);
}

// 🔥 ESTADO GLOBAL
let resaltadoActivo = true;
let textoOriginal = "";
let textoConResaltado = "";
let valoresOriginales = {};



// 🔥 SINCRONIZACIÓN INPUT → TEXTO
document.querySelectorAll(".entry-input").forEach(input => {
    input.addEventListener("input", () => {

    const key = input.id;
    const nuevoValor = input.value;

    const editor = document.getElementById("editor");
    const spans = editor.querySelectorAll(`[data-key="${key}"]`);

    // 🔥 CASO ESPECIAL: NOMBRES (CORRECTO)
    if (key === "actor" || key === "nombre_demandado") {

        if (!spans.length) return;

        const palabras = nuevoValor.trim().split(/\s+/);

        // 🔥 agrupar por bloques
        const bloques = [];
        let bloqueActual = [];

        spans.forEach((span, i) => {
            bloqueActual.push(span);

            // cuando el bloque alcanza el tamaño del nombre → cerrar bloque
            if (bloqueActual.length === palabras.length) {
                bloques.push(bloqueActual);
                bloqueActual = [];
            }
        });

        // 🔥 aplicar actualización por bloque
        bloques.forEach(bloque => {
            bloque.forEach((span, i) => {
                span.textContent = palabras[i] || "";
            });
        });

        guardarEstado();
        return;
    }

    // 🔴 si se borra → quitar resaltado pero mantener texto
    if (!nuevoValor.trim()) {

        if (!spans.length) return;

        spans.forEach(span => {
            span.textContent = ""; // 🔥 NO borrar el span
        });


        // 🔥 guardar estado correctamente
        guardarEstado();
        guardarEstadoEditor();
        guardarEnServidor();

        return;
    }

    spans.forEach(span => {
        span.textContent = nuevoValor;
    });

    //resaltarGlobal();
    guardarEstadoEditor();
    guardarEnServidor()
});
});

// 🔥 TOGGLE RESALTADO
function toggleResaltado() {
    const editor = document.getElementById("editor");

    if (resaltadoActivo) {
        editor.innerText = textoOriginal;
    } else {
        editor.innerHTML = textoConResaltado;
    }

    resaltadoActivo = !resaltadoActivo;
}

// 🔥 CONFIG IA
function abrirConfig() {
    document.getElementById("configPanel").style.display = "block";
}

function cerrarConfig() {
    document.getElementById("configPanel").style.display = "none";
}

function guardarPrompt() {
    const prompt = document.getElementById("promptIA").value;
    localStorage.setItem("promptIA", prompt);
    alert("Prompt guardado");
    cerrarConfig();
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

    // 🔥 caso nombres (multi palabra)
    if (
        key === "actor" ||
        key === "nombre_demandado" ||
        key.startsWith("nombre_testigo")
    ) {

        let texto = [];

        spans.forEach(span => {
            const t = span.textContent.trim();
            if (t) texto.push(t);
        });

        input.value = texto.join(" ");
    }
    else {
        // 🔵 campos normales
        input.value = spans[0]?.textContent || "";
    }

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


// 🔥 RESALTAR MANUAL
function resaltarSeleccion() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    const span = document.createElement("span");
    span.style.backgroundColor = "yellow";

    range.surroundContents(span);
}


function limpiarEstado() {
    localStorage.removeItem("jurisflow_estado");
    location.reload();
}


function resaltarGlobal() {

    const editor = document.getElementById("editor");

    let html = limpiarSpans(textoBase);
    // 🔥 NOMBRES FLEXIBLES (ANTES DEL LOOP)
    const nombreActor = document.getElementById("actor")?.value;
    const nombreDemandado = document.getElementById("nombre_demandado")?.value;

    html = resaltarNombreFlexible(html, "actor", nombreActor, "#FFF59D");
    html = resaltarNombreFlexible(html, "nombre_demandado", nombreDemandado, "#77cdff");

    const colores = {
        actor: "#FFF59D",
        cedula: "#FFF59D",
        tipo_juicio: "#C8E6C9",
        age: "#FFF59D",
        civil: "#FFF59D",       // 👈 NUEVO
        profesion: "#FFF59D",   // 👈 NUEVO
        email: "#FFF59D",
        ciudadania: "#FFF59D",       // 👈 NUEVO
        parroquia_actor: "#FFF59D",
        barrio_actor: "#FFF59D",
        calle_principal_actor: "#FFF59D",
        calle_secundaria_actor: "#FFF59D",
        numero_casa_actor: "#FFF59D",
        codigo_postal_actor: "#FFF59D",
        telefono_actor: "#FFF59D",
        
        // DEMANDADO
        nombre_demandado: "#77cdff",
        cedula_demandado: "#77cdff",
        email_demandado: "#77cdff",

        parroquia_demandado: "#77cdff",
        barrio_demandado: "#77cdff",
        calle_principal_demandado: "#77cdff",
        calle_secundaria_demandado: "#77cdff",
        numero_casa_demandado: "#77cdff",
        codigo_postal_demandado: "#77cdff",
        telefono_demandado: "#77cdff",
        
        
        
    };
    for (let i = 1; i <= 5; i++) {
    colores[`nombre_testigo${i}`] = "#D1C4E9";
    colores[`cedula_testigo${i}`] = "#D1C4E9";
    colores[`direccion_testigo${i}`] = "#D1C4E9";
    colores[`parroquia_testigo${i}`] = "#D1C4E9";
    colores[`ciudad_testigo${i}`] = "#D1C4E9";
    colores[`email_testigo${i}`] = "#D1C4E9";
    colores[`objeto_testigo${i}`] = "#D1C4E9";
    }

    document.querySelectorAll(".entry-input").forEach(input => {

        const key = input.id;
        const valor = input.value;

        // 🔥 evitar duplicar nombres
        if (key === "actor" || key === "nombre_demandado") return;

        if (!valor) return;

        const limpio = valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${limpio})`, "gi");

        const color = colores[key] || "#E0E0E0";

        html = html.replace(regex,
            `<span class="var" data-key="${key}" style="background:${color};">$1</span>`
        );
    });

    editor.innerHTML = html;
}


document.addEventListener("click", function(e) {
    if (!e.target.classList.contains("btn-rojo")) return;

    e.preventDefault();

    const key = e.target.dataset.key;
    const input = document.getElementById(key);
    const editor = document.getElementById("editor");

    const selection = window.getSelection();
    const textoSeleccionado = selection.toString().trim();

    // 🔒 SOLO buscar dentro del editor
    const spans = editor.querySelectorAll(`[data-key="${key}"]`);

    // 🟢 1. SI HAY SELECCIÓN → resaltar
    if (textoSeleccionado) {
        input.value = textoSeleccionado;
        resaltarGlobal();
        guardarEstado();
        guardarEstadoEditor();
        guardarEnServidor();
        return;
    }

    // 🔴 2. SI NO HAY SELECCIÓN Y NO HAY SPANS → NO HACER NADA
    if (spans.length === 0) {
        return;
    }

    // 🔴 3. SI YA ESTÁ VACÍO → NO HACER NADA (evita tercer click)
    if (!input.value.trim()) {
        return;
    }

    // 🔥 4. BORRAR SOLO UNA VEZ
    spans.forEach(span => {
        const texto = span.textContent;
        span.remove();
    });

    input.value = "";

    guardarEstado();
    guardarEstadoEditor();
    guardarEnServidor();
});

async function guardarEnServidor() {
    const html = document.getElementById("editor").innerHTML;

    const nombre = document.getElementById("actor")?.value || "documento";

    await fetch("/guardar-html", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            texto: html,
            nombre: nombre.replace(/\s+/g, "_")
        })
    });
}

async function descargarDocx() {
    try {
        const texto = document.getElementById("editor").innerText;

        const response = await fetch("/exportar-docx", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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

        // limpiar espacios y caracteres raros
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

// 🔥 GENERAR DOCUMENTO
function generarDocumento() {
    const editor = document.getElementById("editor");

    // obtener texto limpio (sin spans)
    const texto = editor.innerText;

    // descargar archivo
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

    const actor = document.getElementById("bloque-actor");
    const demandado = document.getElementById("bloque-demandado");
    const testigo1 = document.getElementById("bloque-testigo1");
    const testigo2 = document.getElementById("bloque-testigo2");
    const testigo3 = document.getElementById("bloque-testigo3");
    const testigo4 = document.getElementById("bloque-testigo4");
    const testigo5 = document.getElementById("bloque-testigo5");

    // estado inicial
    actor.style.display = "block";
    demandado.style.display = "none";
    testigo1.style.display = "none";
    testigo2.style.display = "none";
    testigo3.style.display = "none";
    testigo4.style.display = "none";
    testigo5.style.display = "none";

    window.siguiente = function () {
        console.log("CLICK SIGUIENTE");

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
        else {
            console.log("Ya estás en el último bloque");
        }
    };

    window.anterior = function () {
        console.log("CLICK ANTERIOR");

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
        else {
            console.log("Estado desconocido");
        }
    };

});

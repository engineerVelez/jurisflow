// ============================================================
// variables_maestro.js — Catalogo Central de Variables Juridicas
// Version 2.0 — Compatible con JurisFlow v136+
// ============================================================

const MAESTRO_CATEGORIAS = {
    PROCESO:                    { nombre: "Identificacion del Proceso",         icono: "balance",  color: "#4FC3F7" },
    ACTOR:                      { nombre: "Actor / Demandante",                icono: "person",   color: "#FFD54F" },
    DEMANDADO:                  { nombre: "Demandado",                         icono: "person",   color: "#64B5F6" },
    ABOGADO:                    { nombre: "Abogado",                           icono: "gavel",    color: "#FFD54F" },
    REPRESENTANTE:              { nombre: "Representante Legal",               icono: "handshake",color: "#81C784" },
    PROCURADOR:                 { nombre: "Procurador",                        icono: "clipboard",color: "#80CBC4" },
    HECHOS:                     { nombre: "Hechos",                            icono: "edit",     color: "#FFCC80" },
    EXCEPCIONES:                { nombre: "Excepciones",                       icono: "block",    color: "#EF9A9A" },
    PRONUNCIAMIENTO_PRETENSIONES: { nombre: "Pronunciamiento Pretensiones",    icono: "announce", color: "#C5E1A5" },
    PRONUNCIAMIENTO_HECHOS:     { nombre: "Pronunciamiento Hechos",            icono: "announce", color: "#FFCC80" },
    PRETENSIONES:               { nombre: "Pretensiones",                      icono: "target",   color: "#C5E1A5" },
    FUNDAMENTOS:                { nombre: "Fundamentos de Derecho",            icono: "books",    color: "#B39DDB" },
    NORMAS:                     { nombre: "Normas y Articulos",                icono: "scroll",   color: "#CE93D8" },
    PRUEBA_DOCUMENTAL:          { nombre: "Prueba Documental",                 icono: "description", color: "#80CBC4" },
    AUTENTICIDAD_PRUEBAS:       { nombre: "Autenticidad de Pruebas",           icono: "verified", color: "#A5D6A7" },
    TESTIGOS:                   { nombre: "Testigos",                          icono: "record_voice_over", color: "#BA68C8" },
    PERITOS:                    { nombre: "Peritos",                           icono: "science",  color: "#FFF176" },
    INSPECCION:                 { nombre: "Inspeccion Judicial",               icono: "search",   color: "#A5D6A7" },
    ACCESO_JUDICIAL_PRUEBA:     { nombre: "Acceso Judicial a Prueba",          icono: "folder",   color: "#80CBC4" },
    CUANTIA:                    { nombre: "Cuantia",                           icono: "payments", color: "#FFE082" },
    DATOS_ECONOMICOS:           { nombre: "Datos Economicos",                  icono: "paid",     color: "#FFE082" },
    ALIMENTOS:                  { nombre: "Alimentos / Beneficiarios",         icono: "family_restroom", color: "#F8BBD0" },
    PENSION:                    { nombre: "Pension / Liquidacion",             icono: "bar_chart",color: "#D1C4E9" },
    PATERNIDAD:                 { nombre: "Paternidad",                        icono: "child_care", color: "#F0F4C3" },
    ARBITRAJE:                  { nombre: "Arbitraje",                         icono: "account_balance", color: "#B2EBF2" },
    ACCION_PROTECCION:          { nombre: "Accion de Proteccion",              icono: "security", color: "#FFAB91" },
    CONTRATOS:                  { nombre: "Contratos",                         icono: "article",  color: "#C8E6C9" },
    VEHICULOS:                  { nombre: "Vehiculos",                         icono: "directions_car", color: "#B0BEC5" },
    FISCALIA:                   { nombre: "Fiscalia",                          icono: "policy",   color: "#FFCDD2" },
    OFICIOS:                    { nombre: "Oficios",                           icono: "mail",     color: "#D7CCC8" },
    ESCRITOS:                   { nombre: "Escritos",                          icono: "description", color: "#E1BEE7" }
};
// ============================================================
// MAESTRO DE VARIABLES — ENTRADA PRINCIPAL
// ============================================================

const MAESTRO_VARIABLES = {

    // ======================== PROCESO ========================
    "numero_juicio": {
        entryId: "numero_juicio", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["numero del juicio","numero del expediente","nro juicio","nro expediente","expediente","radiacion","radicacion","radicado","numero de caso","caso numero"]
    },
    "tipo_juicio": {
        entryId: "tipo_juicio", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["tipo de juicio","tipo de proceso","accion","tipo de accion","accion interpuesta"]
    },
    "unidad_judicial_top": {
        entryId: "unidad_judicial_top", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["unidad judicial","juzgado","juzgamiento","corte de justicia","tribunal"]
    },
    "juzgador": {
        entryId: "juzgador", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["juzgador","juez","juez titular","juez de turno","magistrado"]
    },
    "numero_expediente": {
        entryId: "numero_expediente", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["numero de expediente","num expediente","expediente numero"]
    },
    "sala_juzgado": {
        entryId: "sala_juzgado", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["sala","sala del juzgado","sala juzgado","sala de audiencias"]
    },
    "ciudad_juicio": {
        entryId: "ciudad_juicio", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["ciudad del juicio","ciudad juicio","ciudad donde se lleva el juicio","ciudad del juzgado"]
    },
    "canton_juicio": {
        entryId: "canton_juicio", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["canton del juicio","canton juicio"]
    },
    "provincia_juicio": {
        entryId: "provincia_juicio", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["provincia del juicio","provincia juicio","provincia del juzgado"]
    },
    "fecha_escrito": {
        entryId: "fecha_escrito", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["fecha del escrito","fecha escrito"]
    },
    "fecha_presentacion": {
        entryId: "fecha_presentacion", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["fecha de presentacion","fecha presentacion","fecha de radicacion","fecha de ingreso"]
    },
    "tipo_accion": {
        entryId: "tipo_accion", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["tipo de accion","tipo accion","accion ejercida"]
    },
    "materia_proceso": {
        entryId: "materia_proceso", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["materia del proceso","materia proceso","materia","materia del juicio"]
    },
    "procedimiento_tipo": {
        entryId: "procedimiento_tipo", categoria: "PROCESO", color: "#4FC3F7",
        aliases: ["tipo de procedimiento","procedimiento tipo","via procedimental","procedimiento"]
    },

    // ======================== ACTOR 1 ========================
    "actor": {
        entryId: "actor", categoria: "ACTOR", color: "#FFD54F",
        aliases: ["nombre del actor","nombre del demandante","nombre del reclamante","nombre del solicitante","nombre actor","nombre demandante","actor","demandante","reclamante","solicitante","nombre completo del actor"]
    },
    "cedula": {
        entryId: "cedula", categoria: "ACTOR", color: "#4DD0E1",
        aliases: ["cedula del actor","cedula actor","cedula del demandante","cedula demandante","numero de cedula del actor","identificacion del actor"]
    },
    "age": {
        entryId: "age", categoria: "ACTOR", color: "#F48FB1",
        aliases: ["edad del actor","edad actor","edad del demandante","de edad","edad"]
    },
    "civil": {
        entryId: "civil", categoria: "ACTOR", color: "#F48FB1",
        aliases: ["estado civil del actor","estado civil actor","estado civil del demandante","estado civil"]
    },
    "profesion": {
        entryId: "profesion", categoria: "ACTOR", color: "#F48FB1",
        aliases: ["profesion del actor","profesion actor","ocupacion del actor","profesion del demandante","profesion","ocupacion"]
    },
    "ciudadania": {
        entryId: "ciudadania", categoria: "ACTOR", color: "#4DD0E1",
        aliases: ["ciudadania del actor","ciudadania actor","ciudadania del demandante","ciudadania"]
    },
    "email": {
        entryId: "email", categoria: "ACTOR", color: "#81C784",
        aliases: ["correo del actor","correo actor","email del actor","correo electronico del actor","correo del demandante","correo","email","correo electronico"]
    },
    "telefono_actor": {
        entryId: "telefono_actor", categoria: "ACTOR", color: "#FFB74D",
        aliases: ["telefono del actor","telefono actor","celular del actor","contacto del actor","telefono","celular","contacto"]
    },
    "parroquia_actor": {
        entryId: "parroquia_actor", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["parroquia del actor","parroquia actor","parroquia del demandante","parroquia"]
    },
    "barrio_actor": {
        entryId: "barrio_actor", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["barrio del actor","barrio actor","barrio del demandante","barrio"]
    },
    "calle_principal_actor": {
        entryId: "calle_principal_actor", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["calle principal del actor","calle principal actor","calle principal del demandante","calle principal"]
    },
    "calle_secundaria_actor": {
        entryId: "calle_secundaria_actor", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["calle secundaria del actor","calle secundaria actor","calle secundaria del demandante","calle secundaria"]
    },
    "numero_casa_actor": {
        entryId: "numero_casa_actor", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["numero de casa del actor","numero casa actor","numero de casa del demandante","numero de casa","nro casa","numero de vivienda"]
    },
    "codigo_postal_actor": {
        entryId: "codigo_postal_actor", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["codigo postal del actor","codigo postal actor","codigo postal del demandante","codigo postal"]
    },
    "direccion_domiciliaria_actor": {
        entryId: "direccion_domiciliaria_actor", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["direccion del actor","domicilio del actor","direccion actor","domicilio actor","direccion del demandante","domicilio del demandante","direccion domiciliaria","direccion"]
    },
    "casillero_judicial_actor": {
        entryId: "casillero_judicial_actor", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["casillero judicial del actor","casillero judicial actor","casillero del actor","casillero judicial"]
    },
    "ruc_actor": {
        entryId: "ruc_actor", categoria: "ACTOR", color: "#4DD0E1",
        aliases: ["ruc del actor","ruc actor","ruc del demandante","numero de ruc del actor","ruc"]
    },
    "pasaporte_actor": {
        entryId: "pasaporte_actor", categoria: "ACTOR", color: "#4DD0E1",
        aliases: ["pasaporte del actor","pasaporte actor","pasaporte del demandante","numero de pasaporte del actor"]
    },
    "nacionalidad_actor": {
        entryId: "nacionalidad_actor", categoria: "ACTOR", color: "#4DD0E1",
        aliases: ["nacionalidad del actor","nacionalidad actor","nacionalidad del demandante","nacionalidad"]
    },
    "fecha_nacimiento_actor": {
        entryId: "fecha_nacimiento_actor", categoria: "ACTOR", color: "#F48FB1",
        aliases: ["fecha de nacimiento del actor","fecha nacimiento actor","fecha de nacimiento del demandante"]
    },
    "referencia_domicilio_actor": {
        entryId: "referencia_domicilio_actor", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["referencia de domicilio del actor","referencia domicilio actor","referencia del domicilio del actor"]
    },
    "casillero_electronico_actor": {
        entryId: "casillero_electronico_actor", categoria: "ACTOR", color: "#81C784",
        aliases: ["casillero electronico del actor","casillero electronico actor","casillero electronico del demandante"]
    },
    "calidad_actor": {
        entryId: "calidad_actor", categoria: "ACTOR", color: "#FFD54F",
        aliases: ["calidad del actor","calidad actor","calidad del demandante","en calidad de actor"]
    },
    "representante_legal_actor": {
        entryId: "representante_legal_actor", categoria: "ACTOR", color: "#81C784",
        aliases: ["representante legal del actor","representante legal actor","representante del actor"]
    },
    "cedula_representante_actor": {
        entryId: "cedula_representante_actor", categoria: "ACTOR", color: "#4DD0E1",
        aliases: ["cedula del representante del actor","cedula representante actor","cedula del representante legal del actor"]
    },
    "cargo_representante_actor": {
        entryId: "cargo_representante_actor", categoria: "ACTOR", color: "#F48FB1",
        aliases: ["cargo del representante del actor","cargo representante actor","cargo del representante legal del actor"]
    },
    // ======================== ACTOR 2 ========================
    "actor_2": {
        entryId: "actor_2", categoria: "ACTOR", color: "#FFD54F",
        aliases: ["nombre del actor 2","nombre del segundo actor","nombre actor 2","nombre segundo actor","segundo actor","actor 2","nombre del demandante 2","demandante 2"]
    },
    "cedula_actor_2": {
        entryId: "cedula_actor_2", categoria: "ACTOR", color: "#4DD0E1",
        aliases: ["cedula del actor 2","cedula actor 2","cedula del segundo actor","cedula segundo actor","cedula del demandante 2"]
    },
    "age_actor_2": {
        entryId: "age_actor_2", categoria: "ACTOR", color: "#F48FB1",
        aliases: ["edad del actor 2","edad actor 2","edad del segundo actor","de edad del actor 2"]
    },
    "civil_actor_2": {
        entryId: "civil_actor_2", categoria: "ACTOR", color: "#F48FB1",
        aliases: ["estado civil del actor 2","estado civil actor 2","estado civil del segundo actor"]
    },
    "profesion_actor_2": {
        entryId: "profesion_actor_2", categoria: "ACTOR", color: "#F48FB1",
        aliases: ["profesion del actor 2","profesion actor 2","profesion del segundo actor","ocupacion del actor 2"]
    },
    "ciudadania_actor_2": {
        entryId: "ciudadania_actor_2", categoria: "ACTOR", color: "#4DD0E1",
        aliases: ["ciudadania del actor 2","ciudadania actor 2","ciudadania del segundo actor"]
    },
    "email_actor_2": {
        entryId: "email_actor_2", categoria: "ACTOR", color: "#81C784",
        aliases: ["correo del actor 2","correo actor 2","email del actor 2","correo del segundo actor"]
    },
    "telefono_actor_2": {
        entryId: "telefono_actor_2", categoria: "ACTOR", color: "#FFB74D",
        aliases: ["telefono del actor 2","telefono actor 2","celular del actor 2","telefono del segundo actor"]
    },
    "parroquia_actor_2": {
        entryId: "parroquia_actor_2", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["parroquia del actor 2","parroquia actor 2","parroquia del segundo actor"]
    },
    "barrio_actor_2": {
        entryId: "barrio_actor_2", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["barrio del actor 2","barrio actor 2","barrio del segundo actor"]
    },
    "calle_principal_actor_2": {
        entryId: "calle_principal_actor_2", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["calle principal del actor 2","calle principal actor 2"]
    },
    "calle_secundaria_actor_2": {
        entryId: "calle_secundaria_actor_2", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["calle secundaria del actor 2","calle secundaria actor 2"]
    },
    "numero_casa_actor_2": {
        entryId: "numero_casa_actor_2", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["numero de casa del actor 2","numero casa actor 2"]
    },
    "codigo_postal_actor_2": {
        entryId: "codigo_postal_actor_2", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["codigo postal del actor 2","codigo postal actor 2"]
    },
    "direccion_domiciliaria_actor_2": {
        entryId: "direccion_domiciliaria_actor_2", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["direccion del actor 2","domicilio del actor 2","direccion actor 2","domicilio actor 2","direccion domiciliaria del actor 2"]
    },
    "casillero_judicial_actor_2": {
        entryId: "casillero_judicial_actor_2", categoria: "ACTOR", color: "#BCAAA4",
        aliases: ["casillero judicial del actor 2","casillero judicial actor 2"]
    },

    // ======================== DEMANDADO ========================
    "nombre_demandado": {
        entryId: "nombre_demandado", categoria: "DEMANDADO", color: "#64B5F6",
        aliases: ["nombre del demandado","nombre demandado","demandado","nombre del opositor","nombre del recurrido"]
    },
    "cedula_demandado": {
        entryId: "cedula_demandado", categoria: "DEMANDADO", color: "#4DD0E1",
        aliases: ["cedula del demandado","cedula demandado","cedula del opositor"]
    },
    "edad_demandado": {
        entryId: "edad_demandado", categoria: "DEMANDADO", color: "#F48FB1",
        aliases: ["edad del demandado","edad demandado","edad del opositor"]
    },
    "civil_demandado": {
        entryId: "civil_demandado", categoria: "DEMANDADO", color: "#F48FB1",
        aliases: ["estado civil del demandado","estado civil demandado","estado civil del opositor"]
    },
    "profesion_demandado": {
        entryId: "profesion_demandado", categoria: "DEMANDADO", color: "#F48FB1",
        aliases: ["profesion del demandado","profesion demandado","ocupacion del demandado"]
    },
    "ciudadania_demandado": {
        entryId: "ciudadania_demandado", categoria: "DEMANDADO", color: "#4DD0E1",
        aliases: ["ciudadania del demandado","ciudadania demandado","nacionalidad del demandado"]
    },
    "email_demandado": {
        entryId: "email_demandado", categoria: "DEMANDADO", color: "#81C784",
        aliases: ["correo del demandado","correo demandado","email del demandado","correo electronico del demandado"]
    },
    "telefono_demandado": {
        entryId: "telefono_demandado", categoria: "DEMANDADO", color: "#FFB74D",
        aliases: ["telefono del demandado","telefono demandado","celular del demandado","contacto del demandado"]
    },
    "parroquia_demandado": {
        entryId: "parroquia_demandado", categoria: "DEMANDADO", color: "#BCAAA4",
        aliases: ["parroquia del demandado","parroquia demandado"]
    },
    "barrio_demandado": {
        entryId: "barrio_demandado", categoria: "DEMANDADO", color: "#BCAAA4",
        aliases: ["barrio del demandado","barrio demandado"]
    },
    "calle_principal_demandado": {
        entryId: "calle_principal_demandado", categoria: "DEMANDADO", color: "#BCAAA4",
        aliases: ["calle principal del demandado","calle principal demandado"]
    },
    "calle_secundaria_demandado": {
        entryId: "calle_secundaria_demandado", categoria: "DEMANDADO", color: "#BCAAA4",
        aliases: ["calle secundaria del demandado","calle secundaria demandado"]
    },
    "numero_casa_demandado": {
        entryId: "numero_casa_demandado", categoria: "DEMANDADO", color: "#BCAAA4",
        aliases: ["numero de casa del demandado","numero casa demandado"]
    },
    "codigo_postal_demandado": {
        entryId: "codigo_postal_demandado", categoria: "DEMANDADO", color: "#BCAAA4",
        aliases: ["codigo postal del demandado","codigo postal demandado"]
    },
    "direccion_citacion_demandado": {
        entryId: "direccion_citacion_demandado", categoria: "DEMANDADO", color: "#BCAAA4",
        aliases: ["direccion para citacion del demandado","direccion de citacion del demandado","domicilio del demandado","direccion del demandado","direccion demandado"]
    },
    "ruc_demandado": {
        entryId: "ruc_demandado", categoria: "DEMANDADO", color: "#4DD0E1",
        aliases: ["ruc del demandado","ruc demandado","numero de ruc del demandado"]
    },
    "pasaporte_demandado": {
        entryId: "pasaporte_demandado", categoria: "DEMANDADO", color: "#4DD0E1",
        aliases: ["pasaporte del demandado","pasaporte demandado","numero de pasaporte del demandado"]
    },
    "nacionalidad_demandado": {
        entryId: "nacionalidad_demandado", categoria: "DEMANDADO", color: "#4DD0E1",
        aliases: ["nacionalidad del demandado","nacionalidad demandado"]
    },
    "fecha_nacimiento_demandado": {
        entryId: "fecha_nacimiento_demandado", categoria: "DEMANDADO", color: "#F48FB1",
        aliases: ["fecha de nacimiento del demandado","fecha nacimiento demandado"]
    },
    "calidad_demandado": {
        entryId: "calidad_demandado", categoria: "DEMANDADO", color: "#64B5F6",
        aliases: ["calidad del demandado","calidad demandado","en calidad de demandado"]
    },
    "representante_legal_demandado": {
        entryId: "representante_legal_demandado", categoria: "DEMANDADO", color: "#81C784",
        aliases: ["representante legal del demandado","representante legal demandado","representante del demandado"]
    },
    "cedula_representante_demandado": {
        entryId: "cedula_representante_demandado", categoria: "DEMANDADO", color: "#4DD0E1",
        aliases: ["cedula del representante del demandado","cedula representante demandado"]
    },
    "cargo_representante_demandado": {
        entryId: "cargo_representante_demandado", categoria: "DEMANDADO", color: "#F48FB1",
        aliases: ["cargo del representante del demandado","cargo representante demandado"]
    },
    // ======================== ABOGADO ========================
    "nombre_abogado": {
        entryId: "nombre_abogado", categoria: "ABOGADO", color: "#FFD54F",
        aliases: ["nombre del abogado","abogado","apoderado","defensor","apoderado judicial"]
    },
    "matricula_abogado": {
        entryId: "matricula_abogado", categoria: "ABOGADO", color: "#80CBC4",
        aliases: ["matricula del abogado","matricula abogado","matricula del foro","foro","matricula"]
    },
    "cedula_abogado": {
        entryId: "cedula_abogado", categoria: "ABOGADO", color: "#4DD0E1",
        aliases: ["cedula del abogado","cedula abogado","identificacion del abogado"]
    },
    "correo_abogado": {
        entryId: "correo_abogado", categoria: "ABOGADO", color: "#81C784",
        aliases: ["correo del abogado","correo abogado","email del abogado","correo electronico del abogado"]
    },
    "telefono_abogado": {
        entryId: "telefono_abogado", categoria: "ABOGADO", color: "#FFB74D",
        aliases: ["telefono del abogado","telefono abogado","celular del abogado"]
    },
    "direccion_abogado": {
        entryId: "direccion_abogado", categoria: "ABOGADO", color: "#BCAAA4",
        aliases: ["direccion del abogado","direccion abogado","domicilio del abogado"]
    },
    "casillero_judicial_abogado": {
        entryId: "casillero_judicial_abogado", categoria: "ABOGADO", color: "#BCAAA4",
        aliases: ["casillero judicial del abogado","casillero judicial abogado","casillero del abogado"]
    },
    "casillero_electronico_abogado": {
        entryId: "casillero_electronico_abogado", categoria: "ABOGADO", color: "#81C784",
        aliases: ["casillero electronico del abogado","casillero electronico abogado"]
    },
    "tipo_patrocinio": {
        entryId: "tipo_patrocinio", categoria: "ABOGADO", color: "#FFD54F",
        aliases: ["tipo de patrocinio","tipo patrocinio","forma de patrocinio","modalidad de patrocinio"]
    },
    "calidad_abogado": {
        entryId: "calidad_abogado", categoria: "ABOGADO", color: "#FFD54F",
        aliases: ["calidad del abogado","calidad abogado","en calidad de abogado"]
    },

    // ======================== REPRESENTANTE ========================
    "nombre_representante": {
        entryId: "nombre_representante", categoria: "REPRESENTANTE", color: "#81C784",
        aliases: ["nombre del representante","nombre representante","representante"]
    },
    "cedula_representante": {
        entryId: "cedula_representante", categoria: "REPRESENTANTE", color: "#4DD0E1",
        aliases: ["cedula del representante","cedula representante"]
    },
    "nacionalidad_representante": {
        entryId: "nacionalidad_representante", categoria: "REPRESENTANTE", color: "#4DD0E1",
        aliases: ["nacionalidad del representante","nacionalidad representante"]
    },
    "cargo_representante": {
        entryId: "cargo_representante", categoria: "REPRESENTANTE", color: "#F48FB1",
        aliases: ["cargo del representante","cargo representante"]
    },
    "calidad_representante": {
        entryId: "calidad_representante", categoria: "REPRESENTANTE", color: "#81C784",
        aliases: ["calidad del representante","calidad representante"]
    },
    "correo_representante": {
        entryId: "correo_representante", categoria: "REPRESENTANTE", color: "#81C784",
        aliases: ["correo del representante","correo representante","email del representante"]
    },
    "telefono_representante": {
        entryId: "telefono_representante", categoria: "REPRESENTANTE", color: "#FFB74D",
        aliases: ["telefono del representante","telefono representante"]
    },
    "direccion_representante": {
        entryId: "direccion_representante", categoria: "REPRESENTANTE", color: "#BCAAA4",
        aliases: ["direccion del representante","direccion representante"]
    },
    "facultades_representante": {
        entryId: "facultades_representante", categoria: "REPRESENTANTE", color: "#81C784",
        aliases: ["facultades del representante","facultades representante","poderes del representante"]
    },

    // ======================== PROCURADOR ========================
    "nombre_procurador": {
        entryId: "nombre_procurador", categoria: "PROCURADOR", color: "#80CBC4",
        aliases: ["nombre del procurador","nombre procurador","procurador"]
    },
    "cedula_procurador": {
        entryId: "cedula_procurador", categoria: "PROCURADOR", color: "#4DD0E1",
        aliases: ["cedula del procurador","cedula procurador"]
    },
    "tipo_procuracion": {
        entryId: "tipo_procuracion", categoria: "PROCURADOR", color: "#80CBC4",
        aliases: ["tipo de procuracion","tipo procuracion","tipo de poder","modalidad de procuracion"]
    },
    "fecha_procuracion": {
        entryId: "fecha_procuracion", categoria: "PROCURADOR", color: "#80CBC4",
        aliases: ["fecha de procuracion","fecha procuracion","fecha del poder"]
    },
    "documento_procuracion": {
        entryId: "documento_procuracion", categoria: "PROCURADOR", color: "#80CBC4",
        aliases: ["documento de procuracion","documento procuracion","documento de poder"]
    },
    "facultades_procurador": {
        entryId: "facultades_procurador", categoria: "PROCURADOR", color: "#80CBC4",
        aliases: ["facultades del procurador","facultades procurador","poderes del procurador"]
    },
    // ======================== HECHOS 1-10 ========================
    "hecho_1": { entryId: "hecho_1", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 1","primer hecho","primer supuesto"] },
    "hecho_2": { entryId: "hecho_2", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 2","segundo hecho","segundo supuesto"] },
    "hecho_3": { entryId: "hecho_3", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 3","tercer hecho"] },
    "hecho_4": { entryId: "hecho_4", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 4","cuarto hecho"] },
    "hecho_5": { entryId: "hecho_5", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 5","quinto hecho"] },
    "hecho_6": { entryId: "hecho_6", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 6","sexto hecho"] },
    "hecho_7": { entryId: "hecho_7", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 7","septimo hecho"] },
    "hecho_8": { entryId: "hecho_8", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 8","octavo hecho"] },
    "hecho_9": { entryId: "hecho_9", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 9","noveno hecho"] },
    "hecho_10": { entryId: "hecho_10", categoria: "HECHOS", color: "#FFCC80", aliases: ["hecho 10","decimo hecho"] },

    // ======================== PRETENSIONES 1-10 + NUEVAS ========================
    "pretension_1": { entryId: "pretension_1", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 1","primera pretension","primera peticion"] },
    "pretension_2": { entryId: "pretension_2", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 2","segunda pretension"] },
    "pretension_3": { entryId: "pretension_3", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 3","tercera pretension"] },
    "pretension_4": { entryId: "pretension_4", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 4","cuarta pretension"] },
    "pretension_5": { entryId: "pretension_5", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 5","quinta pretension"] },
    "pretension_6": { entryId: "pretension_6", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 6","sexta pretension"] },
    "pretension_7": { entryId: "pretension_7", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 7","septima pretension"] },
    "pretension_8": { entryId: "pretension_8", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 8","octava pretension"] },
    "pretension_9": { entryId: "pretension_9", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 9","novena pretension"] },
    "pretension_10": { entryId: "pretension_10", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension 10","decima pretension"] },
    "pretension_principal": { entryId: "pretension_principal", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension principal","peticion principal","solicitud principal"] },
    "pretension_subsidiaria": { entryId: "pretension_subsidiaria", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension subsidiaria","peticion subsidiaria","solicitud subsidiaria"] },
    "pretension_alternativa": { entryId: "pretension_alternativa", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["pretension alternativa","peticion alternativa","solicitud alternativa"] },
    "peticion_final": { entryId: "peticion_final", categoria: "PRETENSIONES", color: "#C5E1A5", aliases: ["peticion final","solicitud final","petitorio final"] },

    // ======================== FUNDAMENTOS DE DERECHO ========================
    "fundamento_derecho_1": { entryId: "fundamento_derecho_1", categoria: "FUNDAMENTOS", color: "#B39DDB", aliases: ["fundamento 1","primer fundamento","fundamento de derecho 1"] },
    "fundamento_derecho_2": { entryId: "fundamento_derecho_2", categoria: "FUNDAMENTOS", color: "#B39DDB", aliases: ["fundamento 2","segundo fundamento","fundamento de derecho 2"] },
    "fundamento_derecho_3": { entryId: "fundamento_derecho_3", categoria: "FUNDAMENTOS", color: "#B39DDB", aliases: ["fundamento 3","tercer fundamento","fundamento de derecho 3"] },
    "fundamento_derecho_4": { entryId: "fundamento_derecho_4", categoria: "FUNDAMENTOS", color: "#B39DDB", aliases: ["fundamento 4","cuarto fundamento","fundamento de derecho 4"] },
    "fundamento_derecho_5": { entryId: "fundamento_derecho_5", categoria: "FUNDAMENTOS", color: "#B39DDB", aliases: ["fundamento 5","quinto fundamento","fundamento de derecho 5"] },

    // ======================== NORMAS Y ARTICULOS ========================
    "norma_1": { entryId: "norma_1", categoria: "NORMAS", color: "#CE93D8", aliases: ["norma 1","primera norma","primer articulo"] },
    "norma_2": { entryId: "norma_2", categoria: "NORMAS", color: "#CE93D8", aliases: ["norma 2","segunda norma"] },
    "norma_3": { entryId: "norma_3", categoria: "NORMAS", color: "#CE93D8", aliases: ["norma 3","tercera norma"] },
    "articulo_norma_1": { entryId: "articulo_norma_1", categoria: "NORMAS", color: "#CE93D8", aliases: ["articulo 1","articulo norma 1","primer articulo normativo"] },
    "articulo_norma_2": { entryId: "articulo_norma_2", categoria: "NORMAS", color: "#CE93D8", aliases: ["articulo 2","articulo norma 2","segundo articulo normativo"] },
    "descripcion_norma_1": { entryId: "descripcion_norma_1", categoria: "NORMAS", color: "#CE93D8", aliases: ["descripcion de norma 1","texto norma 1"] },
    "descripcion_norma_2": { entryId: "descripcion_norma_2", categoria: "NORMAS", color: "#CE93D8", aliases: ["descripcion de norma 2","texto norma 2"] },

    // ======================== PRUEBA DOCUMENTAL 1-2 ========================
    "documento_prueba_1": { entryId: "documento_prueba_1", categoria: "PRUEBA_DOCUMENTAL", color: "#80CBC4", aliases: ["documento prueba 1","primer documento de prueba"] },
    "descripcion_prueba_1": { entryId: "descripcion_prueba_1", categoria: "PRUEBA_DOCUMENTAL", color: "#80CBC4", aliases: ["descripcion prueba 1","descripcion del documento prueba 1"] },
    "finalidad_prueba_1": { entryId: "finalidad_prueba_1", categoria: "PRUEBA_DOCUMENTAL", color: "#80CBC4", aliases: ["finalidad prueba 1","finalidad del documento prueba 1"] },
    "documento_prueba_2": { entryId: "documento_prueba_2", categoria: "PRUEBA_DOCUMENTAL", color: "#80CBC4", aliases: ["documento prueba 2","segundo documento de prueba"] },
    "descripcion_prueba_2": { entryId: "descripcion_prueba_2", categoria: "PRUEBA_DOCUMENTAL", color: "#80CBC4", aliases: ["descripcion prueba 2","descripcion del documento prueba 2"] },
    "finalidad_prueba_2": { entryId: "finalidad_prueba_2", categoria: "PRUEBA_DOCUMENTAL", color: "#80CBC4", aliases: ["finalidad prueba 2","finalidad del documento prueba 2"] },

    // ======================== PERITO 1 ========================
    "nombre_perito_1": { entryId: "nombre_perito_1", categoria: "PERITOS", color: "#FFF176", aliases: ["nombre del perito 1","perito 1","nombre perito"] },
    "cedula_perito_1": { entryId: "cedula_perito_1", categoria: "PERITOS", color: "#4DD0E1", aliases: ["cedula del perito 1","cedula perito"] },
    "profesion_perito_1": { entryId: "profesion_perito_1", categoria: "PERITOS", color: "#F48FB1", aliases: ["profesion del perito 1","profesion perito"] },
    "especialidad_perito_1": { entryId: "especialidad_perito_1", categoria: "PERITOS", color: "#FFF176", aliases: ["especialidad del perito 1","especialidad perito"] },
    "objeto_pericia_1": { entryId: "objeto_pericia_1", categoria: "PERITOS", color: "#FFF176", aliases: ["objeto de pericia 1","objeto pericia 1"] },
    "puntos_pericia_1": { entryId: "puntos_pericia_1", categoria: "PERITOS", color: "#FFF176", aliases: ["puntos de pericia 1","puntos pericia 1"] },
    "conclusion_pericia_1": { entryId: "conclusion_pericia_1", categoria: "PERITOS", color: "#FFF176", aliases: ["conclusion de pericia 1","conclusion pericia 1"] },

    // ======================== INSPECCION JUDICIAL ========================
    "lugar_inspeccion": { entryId: "lugar_inspeccion", categoria: "INSPECCION", color: "#A5D6A7", aliases: ["lugar de inspeccion","lugar inspeccion"] },
    "objeto_inspeccion": { entryId: "objeto_inspeccion", categoria: "INSPECCION", color: "#A5D6A7", aliases: ["objeto de inspeccion","objeto inspeccion"] },
    "finalidad_inspeccion": { entryId: "finalidad_inspeccion", categoria: "INSPECCION", color: "#A5D6A7", aliases: ["finalidad de inspeccion","finalidad inspeccion"] },
    "fecha_inspeccion": { entryId: "fecha_inspeccion", categoria: "INSPECCION", color: "#A5D6A7", aliases: ["fecha de inspeccion","fecha inspeccion"] },
    "solicita_inspeccion_judicial": { entryId: "solicita_inspeccion_judicial", categoria: "INSPECCION", color: "#A5D6A7", aliases: ["solicita inspeccion judicial","se solicita inspeccion judicial","pide inspeccion judicial"] },
    "direccion_inspeccion": { entryId: "direccion_inspeccion", categoria: "INSPECCION", color: "#BCAAA4", aliases: ["direccion de inspeccion","direccion inspeccion","domicilio de inspeccion"] },
    "hechos_a_verificar_inspeccion": { entryId: "hechos_a_verificar_inspeccion", categoria: "INSPECCION", color: "#A5D6A7", aliases: ["hechos a verificar en inspeccion","hechos a verificar","hechos objeto de inspeccion"] },
    // ======================== CUANTIA ========================
    "cuantia": { entryId: "cuantia", categoria: "CUANTIA", color: "#FFE082", aliases: ["cuantia","valor de la demanda","cuantia demandada"] },
    "cuantia_principal": { entryId: "cuantia_principal", categoria: "CUANTIA", color: "#FFE082", aliases: ["cuantia principal","valor principal de la demanda"] },
    "valor_principal": { entryId: "valor_principal", categoria: "CUANTIA", color: "#FFE082", aliases: ["valor principal","monto principal"] },
    "intereses": { entryId: "intereses", categoria: "CUANTIA", color: "#FFE082", aliases: ["intereses","intereses moratorios","intereses de ley"] },
    "danos_perjuicios": { entryId: "danos_perjuicios", categoria: "CUANTIA", color: "#FFE082", aliases: ["danos y perjuicios","danos perjuicios","perjuicios materiales","perjuicios"] },
    "otros_valores": { entryId: "otros_valores", categoria: "CUANTIA", color: "#FFE082", aliases: ["otros valores","demas valores","valores adicionales"] },
    "cuantia_total": { entryId: "cuantia_total", categoria: "CUANTIA", color: "#FFE082", aliases: ["cuantia total","total de la demanda","monto total"] },
    "forma_determinacion_cuantia": { entryId: "forma_determinacion_cuantia", categoria: "CUANTIA", color: "#FFE082", aliases: ["forma de determinacion de cuantia","base de calculo de la cuantia"] },

    // ======================== DATOS ECONOMICOS ========================
    "ingresos_mensuales": { entryId: "ingresos_mensuales", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["ingresos mensuales","ingreso mensual","ingresos mensuales del demandado"] },
    "ingresos_extraordinarios": { entryId: "ingresos_extraordinarios", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["ingresos extraordinarios","ingreso extraordinario"] },
    "ingresos_anuales": { entryId: "ingresos_anuales", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["ingresos anuales","ingreso anual"] },
    "egresos_mensuales": { entryId: "egresos_mensuales", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["egresos mensuales","egreso mensual"] },
    "gastos_alimentacion": { entryId: "gastos_alimentacion", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["gastos de alimentacion","gastos alimentacion","gasto de alimentacion"] },
    "gastos_vivienda": { entryId: "gastos_vivienda", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["gastos de vivienda","gastos vivienda","gasto de vivienda"] },
    "gastos_educacion": { entryId: "gastos_educacion", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["gastos de educacion","gastos educacion","gasto de educacion"] },
    "gastos_salud": { entryId: "gastos_salud", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["gastos de salud","gastos salud","gasto de salud"] },
    "gastos_transporte": { entryId: "gastos_transporte", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["gastos de transporte","gastos transporte","gasto de transporte"] },
    "otros_gastos": { entryId: "otros_gastos", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["otros gastos","demas gastos","gastos adicionales"] },
    "carga_familiar": { entryId: "carga_familiar", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["carga familiar","carga familiar del demandado"] },
    "personas_a_cargo": { entryId: "personas_a_cargo", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["personas a cargo","personas a cargo del demandado"] },
    "numero_hijos": { entryId: "numero_hijos", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["numero de hijos","numero hijos","cantidad de hijos"] },
    "empresa_trabajo": { entryId: "empresa_trabajo", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["empresa de trabajo","empresa trabajo","empresa donde trabaja","empleador"] },
    "cargo_trabajo": { entryId: "cargo_trabajo", categoria: "DATOS_ECONOMICOS", color: "#F48FB1", aliases: ["cargo de trabajo","cargo trabajo","cargo que desempena","puesto de trabajo"] },
    "salario": { entryId: "salario", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["salario","sueldo","remuneracion","salario mensual","sueldo mensual"] },
    "tipo_contrato": { entryId: "tipo_contrato", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["tipo de contrato","tipo contrato","modalidad de contrato"] },
    "fecha_ingreso_trabajo": { entryId: "fecha_ingreso_trabajo", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["fecha de ingreso al trabajo","fecha ingreso trabajo","fecha de inicio de labores"] },
    "afiliacion_iess": { entryId: "afiliacion_iess", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["afiliacion al iess","afiliacion iess","esta afiliado al iess"] },
    "numero_iess": { entryId: "numero_iess", categoria: "DATOS_ECONOMICOS", color: "#FFE082", aliases: ["numero del iess","numero iess","numero de afiliacion al iess"] },
    // ======================== ALIMENTOS / BENEFICIARIOS ========================
    "necesidades_beneficiario": { entryId: "necesidades_beneficiario", categoria: "ALIMENTOS", color: "#F8BBD0", aliases: ["necesidades del beneficiario","necesidades beneficiario","necesidades basics del menor"] },
    "gastos_beneficiario": { entryId: "gastos_beneficiario", categoria: "ALIMENTOS", color: "#F8BBD0", aliases: ["gastos del beneficiario","gastos beneficiario"] },
    "gastos_educativos_beneficiario": { entryId: "gastos_educativos_beneficiario", categoria: "ALIMENTOS", color: "#F8BBD0", aliases: ["gastos educativos del beneficiario","gastos educativos beneficiario"] },
    "gastos_medicos_beneficiario": { entryId: "gastos_medicos_beneficiario", categoria: "ALIMENTOS", color: "#F8BBD0", aliases: ["gastos medicos del beneficiario","gastos medicos beneficiario"] },
    "discapacidad_beneficiario": { entryId: "discapacidad_beneficiario", categoria: "ALIMENTOS", color: "#F8BBD0", aliases: ["discapacidad del beneficiario","discapacidad beneficiario"] },
    "enfermedad_beneficiario": { entryId: "enfermedad_beneficiario", categoria: "ALIMENTOS", color: "#F8BBD0", aliases: ["enfermedad del beneficiario","enfermedad beneficiario"] },
    "pension_actual": { entryId: "pension_actual", categoria: "ALIMENTOS", color: "#D1C4E9", aliases: ["pension actual","pension actual","monto de pension actual"] },
    "pension_solicitada": { entryId: "pension_solicitada", categoria: "ALIMENTOS", color: "#D1C4E9", aliases: ["pension solicitada","pension solicitada","monto de pension solicitada"] },
    "pension_propuesta": { entryId: "pension_propuesta", categoria: "ALIMENTOS", color: "#D1C4E9", aliases: ["pension propuesta","pension propuesta","monto de pension propuesta"] },

    // ======================== PENSION / LIQUIDACION ========================
    "valor_pension": { entryId: "valor_pension", categoria: "PENSION", color: "#D1C4E9", aliases: ["valor de pension","valor pension","monto de pension"] },
    "pension_provisional": { entryId: "pension_provisional", categoria: "PENSION", color: "#D1C4E9", aliases: ["pension provisional","pension provisional"] },
    "pension_definitiva": { entryId: "pension_definitiva", categoria: "PENSION", color: "#D1C4E9", aliases: ["pension definitiva","pension definitiva"] },
    "fecha_inicio_pension": { entryId: "fecha_inicio_pension", categoria: "PENSION", color: "#D1C4E9", aliases: ["fecha de inicio de pension","fecha inicio pension","desde cuando se paga la pension"] },
    "fecha_fin_pension": { entryId: "fecha_fin_pension", categoria: "PENSION", color: "#D1C4E9", aliases: ["fecha de fin de pension","fecha fin pension","hasta cuando se paga la pension"] },
    "valor_adeudado": { entryId: "valor_adeudado", categoria: "PENSION", color: "#D1C4E9", aliases: ["valor adeudado","deuda total","monto adeudado","valor pendiente"] },
    "periodo_liquidacion": { entryId: "periodo_liquidacion", categoria: "PENSION", color: "#D1C4E9", aliases: ["periodo de liquidacion","periodo liquidacion","periodo que se liquida"] },
    "fecha_ultimo_pago": { entryId: "fecha_ultimo_pago", categoria: "PENSION", color: "#D1C4E9", aliases: ["fecha de ultimo pago","fecha ultimo pago","fecha del ultimo pago"] },
    "valor_ultimo_pago": { entryId: "valor_ultimo_pago", categoria: "PENSION", color: "#D1C4E9", aliases: ["valor de ultimo pago","valor ultimo pago"] },
    "pagos_realizados": { entryId: "pagos_realizados", categoria: "PENSION", color: "#D1C4E9", aliases: ["pagos realizados","pagos efectuados","abonos realizados"] },
    "saldo_pendiente": { entryId: "saldo_pendiente", categoria: "PENSION", color: "#D1C4E9", aliases: ["saldo pendiente","saldo por pagar"] },
    "porcentaje_ofertado": { entryId: "porcentaje_ofertado", categoria: "PENSION", color: "#D1C4E9", aliases: ["porcentaje ofertado","porcentaje ofrecido"] },
    "valor_ofertado": { entryId: "valor_ofertado", categoria: "PENSION", color: "#D1C4E9", aliases: ["valor ofertado","valor ofrecido","monto ofertado"] },
    "cuota_mensual_propuesta": { entryId: "cuota_mensual_propuesta", categoria: "PENSION", color: "#D1C4E9", aliases: ["cuota mensual propuesta","cuota mensual ofrecida"] },
    "forma_pago_pension": { entryId: "forma_pago_pension", categoria: "PENSION", color: "#D1C4E9", aliases: ["forma de pago de pension","forma de pago pension","modalidad de pago de pension"] },
    "plazo_pago": { entryId: "plazo_pago", categoria: "PENSION", color: "#D1C4E9", aliases: ["plazo de pago","plazo pago"] },

    // ======================== PATERNIDAD ========================
    "reconoce_paternidad": { entryId: "reconoce_paternidad", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["reconoce la paternidad","reconoce paternidad","acepta la paternidad"] },
    "niega_paternidad": { entryId: "niega_paternidad", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["niega la paternidad","niega paternidad","desconoce la paternidad"] },
    "solicita_prueba_adn": { entryId: "solicita_prueba_adn", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["solicita prueba de adn","solicita prueba adn","prueba de adn","examen de adn"] },
    "nombre_madre": { entryId: "nombre_madre", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["nombre de la madre","nombre madre"] },
    "cedula_madre": { entryId: "cedula_madre", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["cedula de la madre","cedula madre"] },
    "nombre_padre": { entryId: "nombre_padre", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["nombre del padre","nombre padre"] },
    "cedula_padre": { entryId: "cedula_padre", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["cedula del padre","cedula padre"] },
    "nombre_menor": { entryId: "nombre_menor", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["nombre del menor","nombre menor","nombre del nino"] },
    "cedula_menor": { entryId: "cedula_menor", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["cedula del menor","cedula menor"] },
    "fecha_nacimiento_menor": { entryId: "fecha_nacimiento_menor", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["fecha de nacimiento del menor","fecha nacimiento menor"] },
    "fecha_examen_adn": { entryId: "fecha_examen_adn", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["fecha del examen de adn","fecha examen adn","fecha de la prueba de adn"] },
    "lugar_examen_adn": { entryId: "lugar_examen_adn", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["lugar del examen de adn","lugar examen adn","centro donde se realiza el examen"] },
    "solicita_senalamiento_adn": { entryId: "solicita_senalamiento_adn", categoria: "PATERNIDAD", color: "#F0F4C3", aliases: ["solicita senalamiento de adn","solicita senalamiento adn","se solicita senalamiento para prueba de adn"] },
    // ======================== ARBITRAJE ========================
    "centro_arbitraje": { entryId: "centro_arbitraje", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["centro de arbitraje","centro arbitraje","centro de mediacion y arbitraje"] },
    "director_centro_arbitraje": { entryId: "director_centro_arbitraje", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["director del centro de arbitraje","director centro arbitraje"] },
    "tipo_arbitraje": { entryId: "tipo_arbitraje", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["tipo de arbitraje","tipo arbitraje"] },
    "arbitraje_derecho_equipdad": { entryId: "arbitraje_derecho_equipdad", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["arbitraje de derecho","arbitraje en equidad","arbitraje derecho o equidad"] },
    "arbitraje_nacional_internacional": { entryId: "arbitraje_nacional_internacional", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["arbitraje nacional","arbitraje internacional","si es arbitraje nacional o internacional"] },
    "sede_arbitraje": { entryId: "sede_arbitraje", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["sede del arbitraje","sede arbitraje"] },
    "lugar_arbitraje": { entryId: "lugar_arbitraje", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["lugar del arbitraje","lugar arbitraje"] },
    "idioma_arbitraje": { entryId: "idioma_arbitraje", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["idioma del arbitraje","idioma arbitraje"] },
    "numero_arbitros": { entryId: "numero_arbitros", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["numero de arbitros","numero arbitros","cantidad de arbitros"] },
    "forma_designacion_arbitros": { entryId: "forma_designacion_arbitros", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["forma de designacion de arbitros","forma designacion arbitros","mecanismo de designacion de arbitros"] },
    "documento_convenio_arbitral": { entryId: "documento_convenio_arbitral", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["documento convenio arbitral","convenio arbitral","clausula compromisoria"] },
    "fecha_convenio_arbitral": { entryId: "fecha_convenio_arbitral", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["fecha del convenio arbitral","fecha convenio arbitral"] },
    "clausula_arbitral": { entryId: "clausula_arbitral", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["clausula arbitral","clausula compromisoria","pacto arbitral"] },
    "se_acompana_convenio_arbitral": { entryId: "se_acompana_convenio_arbitral", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["se acompana convenio arbitral","se adjunta convenio arbitral"] },
    "controversia_arbitral": { entryId: "controversia_arbitral", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["controversia arbitral","objeto de la controversia"] },
    "materia_transigible": { entryId: "materia_transigible", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["materia transigible","es materia transigible"] },
    "incumplimiento_contractual": { entryId: "incumplimiento_contractual", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["incumplimiento contractual","incumplimiento del contrato"] },
    "fecha_incumplimiento": { entryId: "fecha_incumplimiento", categoria: "ARBITRAJE", color: "#B2EBF2", aliases: ["fecha de incumplimiento","fecha incumplimiento"] },

    // ======================== ACCION DE PROTECCION ========================
    "entidad_accionada": { entryId: "entidad_accionada", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["entidad accionada","institucion accionada"] },
    "autoridad_accionada": { entryId: "autoridad_accionada", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["autoridad accionada","funcionario accionado"] },
    "funcionario_accionado": { entryId: "funcionario_accionado", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["funcionario accionado","servidor publico accionado"] },
    "acto_vulnerador": { entryId: "acto_vulnerador", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["acto vulnerador","acto que vulnera","acto administrativo vulnerador"] },
    "omision_vulneradora": { entryId: "omision_vulneradora", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["omision vulneradora","omision que vulnera"] },
    "fecha_acto": { entryId: "fecha_acto", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["fecha del acto","fecha acto","fecha del acto vulnerador"] },
    "fecha_vulneracion": { entryId: "fecha_vulneracion", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["fecha de vulneracion","fecha vulneracion"] },
    "lugar_vulneracion": { entryId: "lugar_vulneracion", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["lugar de vulneracion","lugar vulneracion"] },
    "fundamento_vulneracion": { entryId: "fundamento_vulneracion", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["fundamento de la vulneracion","fundamento vulneracion"] },
    "dano_causado": { entryId: "dano_causado", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["dano causado","dano ocasionado","perjuicio causado"] },
    "via_judicial_previa": { entryId: "via_judicial_previa", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["via judicial previa","accion judicial previa"] },
    "otra_garantia_presentada": { entryId: "otra_garantia_presentada", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["otra garantia presentada","garantia presentada"] },
    "juez_que_conocio": { entryId: "juez_que_conocio", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["juez que conocio","juez que conocio de la causa"] },
    "numero_proceso_previo": { entryId: "numero_proceso_previo", categoria: "ACCION_PROTECCION", color: "#FFAB91", aliases: ["numero de proceso previo","numero proceso previo"] },
    // ======================== CONTRATOS ========================
    "tipo_contrato_legal": { entryId: "tipo_contrato_legal", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["tipo de contrato","tipo contrato","clase de contrato"] },
    "fecha_contrato": { entryId: "fecha_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["fecha de contrato","fecha contrato","fecha de celebracion del contrato"] },
    "lugar_contrato": { entryId: "lugar_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["lugar del contrato","lugar contrato"] },
    "objeto_contrato": { entryId: "objeto_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["objeto del contrato","objeto contrato","finalidad del contrato"] },
    "plazo_contrato": { entryId: "plazo_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["plazo del contrato","plazo contrato","duracion del contrato"] },
    "fecha_inicio_contrato": { entryId: "fecha_inicio_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["fecha de inicio del contrato","fecha inicio contrato"] },
    "fecha_fin_contrato": { entryId: "fecha_fin_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["fecha de fin del contrato","fecha fin contrato"] },
    "valor_contrato": { entryId: "valor_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["valor del contrato","valor contrato","monto del contrato"] },
    "numero_cuotas": { entryId: "numero_cuotas", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["numero de cuotas","numero cuotas","cantidad de cuotas"] },
    "cuota_mensual_contrato": { entryId: "cuota_mensual_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["cuota mensual del contrato","cuota mensual contrato"] },
    "garantia_contrato": { entryId: "garantia_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["garantia del contrato","garantia contrato","garantias del contrato"] },
    "penalidad_contrato": { entryId: "penalidad_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["penalidad del contrato","penalidad contrato","clausula penal"] },
    "obligacion_parte_1": { entryId: "obligacion_parte_1", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["obligacion de la parte 1","obligacion parte 1","primera obligacion contractual"] },
    "obligacion_parte_2": { entryId: "obligacion_parte_2", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["obligacion de la parte 2","obligacion parte 2","segunda obligacion contractual"] },
    "incumplimiento_contrato": { entryId: "incumplimiento_contrato", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["incumplimiento del contrato","incumplimiento contrato"] },
    "causal_terminacion": { entryId: "causal_terminacion", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["causal de terminacion","causal terminacion","motivo de terminacion"] },
    "forma_terminacion": { entryId: "forma_terminacion", categoria: "CONTRATOS", color: "#C8E6C9", aliases: ["forma de terminacion","forma terminacion","modalidad de terminacion"] },

    // ======================== VEHICULOS ========================
    "marca_vehiculo": { entryId: "marca_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["marca del vehiculo","marca vehiculo","marca"] },
    "modelo_vehiculo": { entryId: "modelo_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["modelo del vehiculo","modelo vehiculo","modelo"] },
    "anio_vehiculo": { entryId: "anio_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["anio del vehiculo","anio vehiculo","anio"] },
    "color_vehiculo": { entryId: "color_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["color del vehiculo","color vehiculo","color"] },
    "placa_vehiculo": { entryId: "placa_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["placa del vehiculo","placa vehiculo","placa"] },
    "chasis_vehiculo": { entryId: "chasis_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["chasis del vehiculo","chasis vehiculo","chasis","numero de chasis"] },
    "motor_vehiculo": { entryId: "motor_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["motor del vehiculo","motor vehiculo","motor","numero de motor"] },
    "tipo_vehiculo": { entryId: "tipo_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["tipo de vehiculo","tipo vehiculo","clase de vehiculo"] },
    "avaluo_vehiculo": { entryId: "avaluo_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["avaluo del vehiculo","avaluo vehiculo","valor del vehiculo","tasacion del vehiculo"] },
    "matricula_vehiculo": { entryId: "matricula_vehiculo", categoria: "VEHICULOS", color: "#B0BEC5", aliases: ["matricula del vehiculo","matricula vehiculo","tarjeta de matricula"] },
    // ======================== FISCALIA ========================
    "fiscalia": { entryId: "fiscalia", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["fiscalia","unidad de fiscalia","fiscalia competente"] },
    "fiscal_asignado": { entryId: "fiscal_asignado", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["fiscal asignado","fiscal a cargo","nombre del fiscal"] },
    "unidad_fiscalia": { entryId: "unidad_fiscalia", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["unidad de fiscalia","unidad fiscalia"] },
    "numero_noticia_delito": { entryId: "numero_noticia_delito", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["numero de noticia de delito","numero noticia delito","numero de noticia"] },
    "numero_investigacion": { entryId: "numero_investigacion", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["numero de investigacion","numero investigacion","nro de investigacion"] },
    "tipo_delito": { entryId: "tipo_delito", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["tipo de delito","tipo delito","clase de delito"] },
    "delito": { entryId: "delito", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["delito","el delito","delito cometido"] },
    "fecha_delito": { entryId: "fecha_delito", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["fecha del delito","fecha delito","fecha en que se cometio el delito"] },
    "hora_delito": { entryId: "hora_delito", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["hora del delito","hora delito","hora en que se cometio el delito"] },
    "lugar_delito": { entryId: "lugar_delito", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["lugar del delito","lugar delito","lugar donde se cometio el delito"] },
    "ciudad_delito": { entryId: "ciudad_delito", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["ciudad del delito","ciudad delito"] },
    "provincia_delito": { entryId: "provincia_delito", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["provincia del delito","provincia delito"] },
    "nombre_victima": { entryId: "nombre_victima", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["nombre de la victima","nombre victima","victima"] },
    "cedula_victima": { entryId: "cedula_victima", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["cedula de la victima","cedula victima"] },
    "direccion_victima": { entryId: "direccion_victima", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["direccion de la victima","direccion victima"] },
    "telefono_victima": { entryId: "telefono_victima", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["telefono de la victima","telefono victima"] },
    "correo_victima": { entryId: "correo_victima", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["correo de la victima","correo victima"] },
    "nombre_investigado": { entryId: "nombre_investigado", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["nombre del investigado","nombre investigado","nombre del imputado"] },
    "cedula_investigado": { entryId: "cedula_investigado", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["cedula del investigado","cedula investigado"] },
    "direccion_investigado": { entryId: "direccion_investigado", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["direccion del investigado","direccion investigado"] },
    "solicitud_fiscalia": { entryId: "solicitud_fiscalia", categoria: "FISCALIA", color: "#FFCDD2", aliases: ["solicitud de fiscalia","solicitud fiscalia"] },

    // ======================== OFICIOS ========================
    "numero_oficio": { entryId: "numero_oficio", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["numero de oficio","numero oficio","nro oficio"] },
    "fecha_oficio": { entryId: "fecha_oficio", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["fecha de oficio","fecha oficio"] },
    "autoridad_destinataria": { entryId: "autoridad_destinataria", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["autoridad destinataria","autoridad a la que se dirige"] },
    "cargo_destinatario": { entryId: "cargo_destinatario", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["cargo del destinatario","cargo destinatario"] },
    "entidad_destinataria": { entryId: "entidad_destinataria", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["entidad destinataria","entidad a la que se dirige"] },
    "direccion_destinatario": { entryId: "direccion_destinatario", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["direccion del destinatario","direccion destinatario"] },
    "ciudad_destinatario": { entryId: "ciudad_destinatario", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["ciudad del destinatario","ciudad destinatario"] },
    "referencia_oficio": { entryId: "referencia_oficio", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["referencia del oficio","referencia oficio"] },
    "asunto_oficio": { entryId: "asunto_oficio", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["asunto del oficio","asunto oficio"] },
    "antecedente_oficio": { entryId: "antecedente_oficio", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["antecedente del oficio","antecedente oficio"] },
    "solicitud_oficio": { entryId: "solicitud_oficio", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["solicitud del oficio","solicitud oficio"] },
    "fundamento_oficio": { entryId: "fundamento_oficio", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["fundamento del oficio","fundamento oficio"] },
    "documento_adjunto_oficio": { entryId: "documento_adjunto_oficio", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["documento adjunto al oficio","documento adjunto oficio"] },
    "plazo_oficio": { entryId: "plazo_oficio", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["plazo del oficio","plazo oficio"] },
    "nombre_firmante": { entryId: "nombre_firmante", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["nombre del firmante","nombre firmante"] },
    "cargo_firmante": { entryId: "cargo_firmante", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["cargo del firmante","cargo firmante"] },
    "correo_firmante": { entryId: "correo_firmante", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["correo del firmante","correo firmante"] },
    "telefono_firmante": { entryId: "telefono_firmante", categoria: "OFICIOS", color: "#D7CCC8", aliases: ["telefono del firmante","telefono firmante"] },

    // ======================== ESCRITOS ========================
    "tipo_escrito": { entryId: "tipo_escrito", categoria: "ESCRITOS", color: "#E1BEE7", aliases: ["tipo de escrito","tipo escrito"] },
    "asunto_escrito": { entryId: "asunto_escrito", categoria: "ESCRITOS", color: "#E1BEE7", aliases: ["asunto del escrito","asunto escrito"] },
    "antecedente_escrito": { entryId: "antecedente_escrito", categoria: "ESCRITOS", color: "#E1BEE7", aliases: ["antecedente del escrito","antecedente escrito"] },
    "solicitud_escrito": { entryId: "solicitud_escrito", categoria: "ESCRITOS", color: "#E1BEE7", aliases: ["solicitud del escrito","solicitud escrito"] },
    "peticion_final_escrito": { entryId: "peticion_final_escrito", categoria: "ESCRITOS", color: "#E1BEE7", aliases: ["peticion final del escrito","peticion final escrito"] }
};

// ============================================================
// GENERADOR DINAMICO — TESTIGOS 1-8 (campos base + nuevos)
// ============================================================
(function() {
    var camposBase = [
        ["nombre","Nombre"],["cedula","Cedula"],["ciudad","Ciudad"],
        ["provincia","Provincia"],["canton","Canton"],["parroquia","Parroquia"],
        ["barrio","Barrio"],["direccion","Direccion"],["email","Correo electronico"],
        ["objeto","Objeto del testimonio"]
    ];
    var camposNuevos = [
        ["nacionalidad","Nacionalidad"],["edad","Edad"],["profesion","Profesion"],
        ["calle","Calle"],["numero_casa","Numero de casa"],["telefono","Telefono"]
    ];
    var todos = camposBase.concat(camposNuevos);
    for (var i = 1; i <= 8; i++) {
        todos.forEach(function(campos) {
            var campo = campos[0], label = campos[1];
            var varName = campo + "_testigo" + i;
            MAESTRO_VARIABLES[varName] = {
                entryId: varName,
                categoria: "TESTIGOS",
                color: "#BA68C8",
                aliases: [
                    campo + " del testigo " + i,
                    campo + " testigo " + i,
                    "testigo " + i + " " + campo,
                    label.toLowerCase() + " testigo " + i
                ]
            };
        });
    }
})();

// ============================================================
// GENERADOR DINAMICO — HECHOS 11-15
// ============================================================
(function() {
    var ord = {11:"once",12:"doce",13:"trece",14:"catorce",15:"quince"};
    for (var i = 11; i <= 15; i++) {
        var vn = "hecho_" + i;
        MAESTRO_VARIABLES[vn] = {
            entryId: vn, categoria: "HECHOS", color: "#FFCC80",
            aliases: ["hecho " + i, ord[i] + " hecho"]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — HECHO DEFENSA 1-8
// ============================================================
(function() {
    var ord = ["","primero","segundo","tercero","cuarto","quinto","sexto","septimo","octavo"];
    for (var i = 1; i <= 8; i++) {
        var vn = "hecho_defensa_" + i;
        MAESTRO_VARIABLES[vn] = {
            entryId: vn, categoria: "HECHOS", color: "#FFCC80",
            aliases: ["hecho de defensa " + i,"hecho defensa " + i, ord[i] + " hecho de defensa"]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — EXCEPCIONES 1-6
// ============================================================
(function() {
    var ord = ["","primera","segunda","tercera","cuarta","quinta","sexta"];
    for (var i = 1; i <= 6; i++) {
        var vn = "excepcion_" + i;
        MAESTRO_VARIABLES[vn] = {
            entryId: vn, categoria: "EXCEPCIONES", color: "#EF9A9A",
            aliases: ["excepcion " + i, ord[i] + " excepcion","excepcion " + i + " de la contestacion"]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — EXCEPCIONES PREVIAS 1-3
// ============================================================
(function() {
    var ord = ["","primera","segunda","tercera"];
    for (var i = 1; i <= 3; i++) {
        var vn = "excepcion_previa_" + i;
        MAESTRO_VARIABLES[vn] = {
            entryId: vn, categoria: "EXCEPCIONES", color: "#EF9A9A",
            aliases: ["excepcion previa " + i, ord[i] + " excepcion previa"]
        };
    }
})();

// ============================================================
// EXCEPCIONES ESPECIFICAS
// ============================================================
(function() {
    var excep = [
        ["excepcion_prescripcion","excepcion de prescripcion","prescripcion"],
        ["excepcion_caducidad","excepcion de caducidad","caducidad"],
        ["excepcion_cosa_juzgada","excepcion de cosa juzgada","cosa juzgada"],
        ["excepcion_litispendencia","excepcion de litispendencia","litispendencia"],
        ["excepcion_transaccion","excepcion de transaccion","transaccion"],
        ["excepcion_convenio_arbitral","excepcion de convenio arbitral","convenio arbitral"],
        ["excepcion_inadecuacion_procedimiento","excepcion de inadecuada via procedimental","inadecuada via procedimental"],
        ["excepcion_indebida_acumulacion","excepcion de indebida acumulacion","indebida acumulacion"],
        ["excepcion_falta_legitimacion","excepcion de falta de legitimacion","falta de legitimacion"]
    ];
    excep.forEach(function(e) {
        MAESTRO_VARIABLES[e[0]] = {
            entryId: e[0], categoria: "EXCEPCIONES", color: "#EF9A9A",
            aliases: [e[1], e[2]]
        };
    });
    MAESTRO_VARIABLES["excepciones_contestacion"] = {
        entryId: "excepciones_contestacion", categoria: "EXCEPCIONES", color: "#EF9A9A",
        aliases: ["excepciones de la contestacion","excepciones contestacion","excepciones opuestas en la contestacion"]
    };
})();

// ============================================================
// GENERADOR DINAMICO — PRONUNCIAMIENTO PRETENSIONES
// ============================================================
(function() {
    var ord6 = ["","primera","segunda","tercera","cuarta","quinta","sexta"];
    var ord5 = ["","primera","segunda","tercera","cuarta","quinta"];
    for (var i = 1; i <= 6; i++) {
        var vn = "pronunciamiento_pretension_" + i;
        MAESTRO_VARIABLES[vn] = {
            entryId: vn, categoria: "PRONUNCIAMIENTO_PRETENSIONES", color: "#C5E1A5",
            aliases: ["pronunciamiento sobre la pretension " + i,"pronunciamiento pretension " + i, ord6[i] + " pronunciamiento sobre pretension"]
        };
    }
    for (var i = 1; i <= 5; i++) {
        MAESTRO_VARIABLES["admite_pretension_" + i] = {
            entryId: "admite_pretension_" + i, categoria: "PRONUNCIAMIENTO_PRETENSIONES", color: "#C5E1A5",
            aliases: ["admite pretension " + i, ord5[i] + " pretension admitida"]
        };
        MAESTRO_VARIABLES["niega_pretension_" + i] = {
            entryId: "niega_pretension_" + i, categoria: "PRONUNCIAMIENTO_PRETENSIONES", color: "#C5E1A5",
            aliases: ["niega pretension " + i, ord5[i] + " pretension negada"]
        };
        MAESTRO_VARIABLES["acepta_pretension_" + i] = {
            entryId: "acepta_pretension_" + i, categoria: "PRONUNCIAMIENTO_PRETENSIONES", color: "#C5E1A5",
            aliases: ["acepta pretension " + i, ord5[i] + " pretension aceptada"]
        };
        MAESTRO_VARIABLES["se_opone_pretension_" + i] = {
            entryId: "se_opone_pretension_" + i, categoria: "PRONUNCIAMIENTO_PRETENSIONES", color: "#C5E1A5",
            aliases: ["se opone a la pretension " + i,"se opone pretension " + i, ord5[i] + " pretension a la que se opone"]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — PRONUNCIAMIENTO HECHOS
// ============================================================
(function() {
    var ord6 = ["","primero","segundo","tercero","cuarto","quinto","sexto"];
    var ord5 = ["","primero","segundo","tercero","cuarto","quinto"];
    for (var i = 1; i <= 6; i++) {
        var vn = "pronunciamiento_hecho_" + i;
        MAESTRO_VARIABLES[vn] = {
            entryId: vn, categoria: "PRONUNCIAMIENTO_HECHOS", color: "#FFCC80",
            aliases: ["pronunciamiento sobre el hecho " + i,"pronunciamiento hecho " + i, ord6[i] + " pronunciamiento sobre hecho"]
        };
    }
    for (var i = 1; i <= 5; i++) {
        MAESTRO_VARIABLES["admite_hecho_" + i] = {
            entryId: "admite_hecho_" + i, categoria: "PRONUNCIAMIENTO_HECHOS", color: "#FFCC80",
            aliases: ["admite hecho " + i, ord5[i] + " hecho admitido"]
        };
        MAESTRO_VARIABLES["niega_hecho_" + i] = {
            entryId: "niega_hecho_" + i, categoria: "PRONUNCIAMIENTO_HECHOS", color: "#FFCC80",
            aliases: ["niega hecho " + i, ord5[i] + " hecho negado"]
        };
        MAESTRO_VARIABLES["no_le_consta_hecho_" + i] = {
            entryId: "no_le_consta_hecho_" + i, categoria: "PRONUNCIAMIENTO_HECHOS", color: "#FFCC80",
            aliases: ["no le consta hecho " + i, ord5[i] + " hecho que no le consta"]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — PRUEBA DOCUMENTAL 3-15
// ============================================================
(function() {
    for (var i = 3; i <= 15; i++) {
        MAESTRO_VARIABLES["documento_prueba_" + i] = {
            entryId: "documento_prueba_" + i, categoria: "PRUEBA_DOCUMENTAL", color: "#80CBC4",
            aliases: ["documento prueba " + i]
        };
        MAESTRO_VARIABLES["descripcion_prueba_" + i] = {
            entryId: "descripcion_prueba_" + i, categoria: "PRUEBA_DOCUMENTAL", color: "#80CBC4",
            aliases: ["descripcion prueba " + i,"descripcion del documento prueba " + i]
        };
        MAESTRO_VARIABLES["finalidad_prueba_" + i] = {
            entryId: "finalidad_prueba_" + i, categoria: "PRUEBA_DOCUMENTAL", color: "#80CBC4",
            aliases: ["finalidad prueba " + i,"finalidad del documento prueba " + i]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — AUTENTICIDAD / ADMITE / NIEGA / OBJETA PRUEBA 1-5
// ============================================================
(function() {
    var ord = ["","primera","segunda","tercera","cuarta","quinta"];
    for (var i = 1; i <= 5; i++) {
        MAESTRO_VARIABLES["autenticidad_prueba_" + i] = {
            entryId: "autenticidad_prueba_" + i, categoria: "AUTENTICIDAD_PRUEBAS", color: "#A5D6A7",
            aliases: ["autenticidad de prueba " + i,"autenticidad prueba " + i, ord[i] + " prueba autenticidad"]
        };
        MAESTRO_VARIABLES["admite_prueba_" + i] = {
            entryId: "admite_prueba_" + i, categoria: "AUTENTICIDAD_PRUEBAS", color: "#A5D6A7",
            aliases: ["admite prueba " + i, ord[i] + " prueba admitida"]
        };
        MAESTRO_VARIABLES["niega_prueba_" + i] = {
            entryId: "niega_prueba_" + i, categoria: "AUTENTICIDAD_PRUEBAS", color: "#A5D6A7",
            aliases: ["niega prueba " + i, ord[i] + " prueba negada"]
        };
        MAESTRO_VARIABLES["objeta_prueba_" + i] = {
            entryId: "objeta_prueba_" + i, categoria: "AUTENTICIDAD_PRUEBAS", color: "#A5D6A7",
            aliases: ["objeta prueba " + i, ord[i] + " prueba objetada"]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — PERITOS 2-5 + CAMPOS NUEVOS 1-5
// ============================================================
(function() {
    var camposPerito = [
        ["nombre","Nombre"],["cedula","Cedula"],["profesion","Profesion"],
        ["especialidad","Especialidad"],["objeto_pericia","Objeto de pericia"],
        ["puntos_pericia","Puntos de pericia"],["conclusion_pericia","Conclusion de pericia"]
    ];
    var camposNuevosPerito = [
        ["registro","Registro"],["direccion","Direccion"],
        ["correo","Correo"],["telefono","Telefono"]
    ];
    var ord = ["","segundo","tercero","cuarto","quinto"];
    for (var i = 2; i <= 5; i++) {
        camposPerito.forEach(function(campos) {
            var campo = campos[0], label = campos[1];
            var vn = campo + "_" + i;
            if (campo === "objeto_pericia") vn = "objeto_pericia_" + i;
            else if (campo === "puntos_pericia") vn = "puntos_pericia_" + i;
            else if (campo === "conclusion_pericia") vn = "conclusion_pericia_" + i;
            else vn = campo + "_perito_" + i;
            MAESTRO_VARIABLES[vn] = {
                entryId: vn, categoria: "PERITOS", color: "#FFF176",
                aliases: [
                    campo.replace(/_/g," ") + " del perito " + i,
                    campo.replace(/_/g," ") + " perito " + i,
                    ord[i-1] + " perito " + campo.replace(/_/g," ")
                ]
            };
        });
    }
    for (var i = 1; i <= 5; i++) {
        camposNuevosPerito.forEach(function(campos) {
            var campo = campos[0], label = campos[1];
            var vn = campo + "_perito_" + i;
            MAESTRO_VARIABLES[vn] = {
                entryId: vn, categoria: "PERITOS", color: "#FFF176",
                aliases: [
                    campo + " del perito " + i,
                    campo + " perito " + i,
                    label.toLowerCase() + " perito " + i
                ]
            };
        });
    }
})();

// ============================================================
// GENERADOR DINAMICO — BENEFICIARIOS 1-4
// ============================================================
(function() {
    var camposBase = [
        ["nombre","Nombre"],["cedula","Cedula"],["fecha_nacimiento","Fecha de nacimiento"],
        ["edad","Edad"],["nacionalidad","Nacionalidad"],["parentesco","Parentesco"],
        ["direccion","Direccion"],["ciudad","Ciudad"],["provincia","Provincia"]
    ];
    for (var i = 1; i <= 4; i++) {
        camposBase.forEach(function(campos) {
            var campo = campos[0], label = campos[1];
            var vn = campo + "_beneficiario_" + i;
            MAESTRO_VARIABLES[vn] = {
                entryId: vn, categoria: "ALIMENTOS", color: "#F8BBD0",
                aliases: [
                    campo.replace(/_/g," ") + " del beneficiario " + i,
                    campo.replace(/_/g," ") + " beneficiario " + i,
                    label.toLowerCase() + " beneficiario " + i
                ]
            };
        });
    }
})();

// ============================================================
// GENERADOR DINAMICO — ACCION PROTECCION (DERECHOS, ARTICULOS, REPARACIONES)
// ============================================================
(function() {
    for (var i = 1; i <= 3; i++) {
        MAESTRO_VARIABLES["derecho_vulnerado_" + i] = {
            entryId: "derecho_vulnerado_" + i, categoria: "ACCION_PROTECCION", color: "#FFAB91",
            aliases: ["derecho vulnerado " + i, ["","primer","segundo","tercero"][i] + " derecho vulnerado"]
        };
        MAESTRO_VARIABLES["articulo_constitucional_" + i] = {
            entryId: "articulo_constitucional_" + i, categoria: "ACCION_PROTECCION", color: "#FFAB91",
            aliases: ["articulo constitucional " + i]
        };
        MAESTRO_VARIABLES["reparacion_integral_" + i] = {
            entryId: "reparacion_integral_" + i, categoria: "ACCION_PROTECCION", color: "#FFAB91",
            aliases: ["reparacion integral " + i,"reparacion integral " + i + " solicitada"]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — ARBITROS INDEPENDIENTES 1-3
// ============================================================
(function() {
    var ord = ["","primero","segundo","tercero"];
    for (var i = 1; i <= 3; i++) {
        MAESTRO_VARIABLES["arbitro_independiente_" + i] = {
            entryId: "arbitro_independiente_" + i, categoria: "ARBITRAJE", color: "#B2EBF2",
            aliases: ["arbitro independiente " + i, ord[i] + " arbitro independiente","arbitro " + i]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — FISCALIA (HECHOS, DILIGENCIAS, PERICIAS, DOCUMENTOS)
// ============================================================
(function() {
    for (var i = 1; i <= 10; i++) {
        MAESTRO_VARIABLES["hecho_delito_" + i] = {
            entryId: "hecho_delito_" + i, categoria: "FISCALIA", color: "#FFCDD2",
            aliases: ["hecho delito " + i,"hecho del delito " + i,"hecho " + i + " del delito"]
        };
    }
    for (var i = 1; i <= 8; i++) {
        MAESTRO_VARIABLES["diligencia_fiscalia_" + i] = {
            entryId: "diligencia_fiscalia_" + i, categoria: "FISCALIA", color: "#FFCDD2",
            aliases: ["diligencia fiscalia " + i,"diligencia " + i + " de fiscalia"]
        };
    }
    for (var i = 1; i <= 5; i++) {
        MAESTRO_VARIABLES["pericia_fiscalia_" + i] = {
            entryId: "pericia_fiscalia_" + i, categoria: "FISCALIA", color: "#FFCDD2",
            aliases: ["pericia fiscalia " + i,"pericia " + i + " de fiscalia"]
        };
    }
    for (var i = 1; i <= 10; i++) {
        MAESTRO_VARIABLES["documento_fiscalia_" + i] = {
            entryId: "documento_fiscalia_" + i, categoria: "FISCALIA", color: "#FFCDD2",
            aliases: ["documento fiscalia " + i,"documento " + i + " de fiscalia"]
        };
    }
})();

// ============================================================
// GENERADOR DINAMICO — ESCRITOS (HECHOS, PETICIONES, FUNDAMENTOS, DOCUMENTOS ADJUNTOS)
// ============================================================
(function() {
    for (var i = 1; i <= 8; i++) {
        MAESTRO_VARIABLES["hecho_escrito_" + i] = {
            entryId: "hecho_escrito_" + i, categoria: "ESCRITOS", color: "#E1BEE7",
            aliases: ["hecho del escrito " + i,"hecho escrito " + i,"hecho " + i + " del escrito"]
        };
        MAESTRO_VARIABLES["peticion_escrito_" + i] = {
            entryId: "peticion_escrito_" + i, categoria: "ESCRITOS", color: "#E1BEE7",
            aliases: ["peticion del escrito " + i,"peticion escrito " + i,"peticion " + i + " del escrito"]
        };
        MAESTRO_VARIABLES["documento_adjunto_" + i] = {
            entryId: "documento_adjunto_" + i, categoria: "ESCRITOS", color: "#E1BEE7",
            aliases: ["documento adjunto " + i,"documento adjunto numero " + i]
        };
    }
    for (var i = 1; i <= 6; i++) {
        MAESTRO_VARIABLES["fundamento_escrito_" + i] = {
            entryId: "fundamento_escrito_" + i, categoria: "ESCRITOS", color: "#E1BEE7",
            aliases: ["fundamento del escrito " + i,"fundamento escrito " + i,"fundamento " + i + " del escrito"]
        };
    }
})();

// ============================================================
// FUNCIONES DE UTILIDAD DEL MAESTRO
// ============================================================

function buscarEnMaestro(contenido) {
    var c = contenido.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\u2013\u2014\u2015]+/g, " ").trim();

    var normVar = contenido.toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\u2013\u2014\u2015]+/g, "_").replace(/[^A-Z0-9_]/g, "")
        .replace(/^_+|_+$/g, "");

    for (var varName in MAESTRO_VARIABLES) {
        if (!MAESTRO_VARIABLES.hasOwnProperty(varName)) continue;
        if (varName === normVar) {
            var def = MAESTRO_VARIABLES[varName];
            if (def.entryId) return { varName: varName, entryId: def.entryId, match: varName.toLowerCase() };
        }
    }

    var mejorMatch = null;
    var mejorLongitud = 0;

    for (var varName in MAESTRO_VARIABLES) {
        if (!MAESTRO_VARIABLES.hasOwnProperty(varName)) continue;
        var def = MAESTRO_VARIABLES[varName];
        if (!def.aliases) continue;
        for (var j = 0; j < def.aliases.length; j++) {
            var alias = def.aliases[j];
            var a = alias.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[\s\u2013\u2014\u2015]+/g, " ").trim();
            if (c === a) {
                return { varName: varName, entryId: def.entryId, match: a };
            }
        }
    }

    for (var varName in MAESTRO_VARIABLES) {
        if (!MAESTRO_VARIABLES.hasOwnProperty(varName)) continue;
        var def = MAESTRO_VARIABLES[varName];
        if (!def.aliases) continue;
        for (var j = 0; j < def.aliases.length; j++) {
            var alias = def.aliases[j];
            var a = alias.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[\s\u2013\u2014\u2015]+/g, " ").trim();
            if (c.indexOf(a) !== -1 || a.indexOf(c) !== -1) {
                if (a.length > mejorLongitud) {
                    mejorLongitud = a.length;
                    mejorMatch = { varName: varName, entryId: def.entryId, match: a };
                }
            }
        }
    }

    return mejorMatch;
}

function obtenerCategoriasMaestro() {
    var cats = [];
    for (var key in MAESTRO_CATEGORIAS) {
        if (MAESTRO_CATEGORIAS.hasOwnProperty(key)) cats.push(key);
    }
    return cats;
}

function contarVariablesPorCategoria(categoria) {
    var count = 0;
    for (var varName in MAESTRO_VARIABLES) {
        if (!MAESTRO_VARIABLES.hasOwnProperty(varName)) continue;
        if (MAESTRO_VARIABLES[varName].categoria === categoria) count++;
    }
    return count;
}

function validarSistemaVariables() {
    var reporte = {
        totalVariables: 0,
        totalAliases: 0,
        variablesConEntry: 0,
        variablesSinEntry: 0,
        aliasesSinMapeo: 0,
        duplicados: [],
        porCategoria: {},
        entriesEnHTML: [],
        entriesEnMaestro: []
    };

    var htmlSet = {};
    var maestroSet = {};

    if (typeof document !== "undefined") {
        document.querySelectorAll(".entry-input").forEach(function(input) {
            htmlSet[input.id] = true;
        });
    }

    for (var varName in MAESTRO_VARIABLES) {
        if (!MAESTRO_VARIABLES.hasOwnProperty(varName)) continue;
        var def = MAESTRO_VARIABLES[varName];
        reporte.totalVariables++;
        reporte.totalAliases += (def.aliases || []).length;
        if (def.entryId) {
            reporte.variablesConEntry++;
            maestroSet[def.entryId] = true;
            if (!htmlSet[def.entryId]) {
                reporte.aliasesSinMapeo++;
            }
        } else {
            reporte.variablesSinEntry++;
        }
        if (!reporte.porCategoria[def.categoria]) {
            reporte.porCategoria[def.categoria] = 0;
        }
        reporte.porCategoria[def.categoria]++;
    }

    for (var entry in maestroSet) {
        reporte.entriesEnMaestro.push(entry);
    }
    for (var entry in htmlSet) {
        reporte.entriesEnHTML.push(entry);
    }

    var seen = {};
    reporte.entriesEnMaestro.forEach(function(e) {
        if (seen[e]) reporte.duplicados.push(e);
        seen[e] = true;
    });

    return reporte;
}

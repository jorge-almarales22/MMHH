export const SP_CONFIG = {
    siteUrl: "https://glencore.sharepoint.com/sites/co-lmn-sgia/checklist",
    listTitle: "MMHH_DB"
};

export const AUTORIZADOS = [
    "isaac.jimenez@cerrejon.com",
    "jesus.padilla@cerrejon.com",
    "manuel.redondo@cerrejon.com",
    "francisco.silvera@cerrejon.com",
    "juan.a.valencia@cerrejon.com",
    "jorge.almarales.ext@cerrejon.com"
];

export const PROCESOS_COORDINADOR = {
    "Ensayo No destructivo": ["Visual", "Tintas Penetrantes", "Particulas Magneticas", "Ultra sonido", "Otro"],
    "Reparación": ["Alojamiento", "Superficie plana", "Superficie cilindrica", "Rosca interna", "Rosca Externa", "Centro Punto", "Puesto de sello", "Puesto de pista", "Otro"],
    "Evaluación": ["Reusabilidad de parte", "Torcedura de ejes", "Otro"],
    "Rectificado": ["Dimensional", "Bloque", "Cigüeñal", "Árbol de Levas", "Bielas", "Caja de Balancines", "Balancines", "Seguidores", "Eje De balancines", "Piñonería", "Carcasa Frontal", "Carcasa Trasera", "Multiples", "Otro"],
    "Fabricación": ["Según muestra", "Pieza con planos", "Pieza sin planos"],
    "Soldadura Soporte": ["Modificación de pieza", "Reparar grieta", "Retirar pistas", "Retirar rodamientos", "Retirar rotula", "Asegurar parte a base", "Calentado de parte", "Otro"],
    "Mecanizado portátil": ["Componente en taller NWS", "Equipo en Taller permanente", "Equipo en campo", "Otro"],
    "Taller Externo": ["Metalizado", "Reparación especial", "Otro"],
    "Soporte de Mantenimiento": ["Evaluación", "Reparación", "Inspección", "Otro"],
    "Otro": ["Otro"]
};

/* Areas de proceso disponibles por cada proceso requerido del coordinador */
export const AREAS_PROCESO = [
    "Mandrinadora", "Torno mayor", "Torno medio", "Torno menor", "Torno CNC",
    "Rectificador plano Mayor", "Rectificador plano Medio", "Rectificador plano Menor",
    "Rectificado cilindro externo", "Rectificado cilindro interno",
    "Taladro Mayor", "Taladro Menor", "Taladro portatil", "Taladro manual",
    "Torno Pórtatil", "Segueta", "Soldadura manual", "Rotosoldado", "END",
    "Soldadura soporte", "Alistamiento", "Evaluación dimensional", "Cepillo",
    "Fresadora", "Otro"
];

/* Estado del COMPONENTE: lo define el coordinador */
export const ESTADOS_COORDINADOR = [
    "En espera",
    "En proceso",
    "Pendiente por información",
    "Pendiente por herramientas",
    "Pendiente por Personal",
    "Pendiente por equipo",
    "Terminado",
    "Reportado cliente",
    "Entregado al cliente",
    "Entregado a recibo"
];

/* Estados que se consideran cierre del requerimiento (exigen comentario de cierre) */
export const ESTADOS_CIERRE = ["Entregado al cliente", "Entregado a recibo"];

/* Estado de la SOLICITUD: lo controla el sistema, nadie lo edita */
export const ESTADO_SOLICITUD = {
    PENDIENTE: "Pendiente",
    GESTIONADO: "Gestionado"
};

export const ESTADOS_SOLICITUD = [ESTADO_SOLICITUD.PENDIENTE, ESTADO_SOLICITUD.GESTIONADO];

export const SOPORTE_OPCIONES = {
    "Ensayo No destructivo": ["Visual", "Tintas Penetrantes", "Particulas Magneticas", "Ultra sonido", "Otro"],
    "Reparación": ["Alojamiento", "Superficie plana", "Superficie cilindrica", "Rosca interna", "Rosca Externa", "Centro Punto", "Puesto de sello", "Puesto de pista", "Otro"],
    "Evaluación": ["Reusabilidad de parte", "Torcedura de ejes", "Otro"],
    "Rectificado": ["Dimensional", "Bloque", "Cigüeñal", "Árbol de Levas", "Bielas", "Caja de Balancines", "Balancines", "Seguidores", "Eje De balancines", "Piñonería", "Carcasa Frontal", "Carcasa Trasera", "Multiples", "Otro"],
    "Fabricación": ["Según muestra", "Pieza con planos", "Pieza sin planos"],
    "Soldadura Soporte": ["Modificación de pieza", "Reparar grieta", "Retirar pistas", "Retirar rodamientos", "Retirar rotula", "Asegurar parte a base", "Calentado de parte", "Otro"],
    "Mecanizado portátil": ["Componente en taller NWS", "Equipo en Taller permanente", "Equipo en campo", "Otro"],
    "Taller Externo": ["Metalizado", "Reparación especial", "Otro"],
    "Soporte de Mantenimiento": ["Evaluación", "Reparación", "Inspección", "Otro"],
    "Otro": ["Otro"]
};

export const FLOTAS = [
    "793D", "789D", "789C", "793D EL", "3516", "C13", "C32", "777F",
    "777G", "16M", "16M3", "D9T", "D10T", "D10T2", "D11T", "834G",
    "854K", "854H", "EX3600", "EX5500", "R9150", "XPC", "L1350", "Otra"
];

export const PRIORIDADES = {
    "P0": 0, "P01": 1, "P02": 3, "P03": 5, "P1": 7, "P2": 30, "P3": 60, "P4": 90, "P5": 180, "PL": 365
};

/* Orden de severidad para el ranking de atencion (menor indice = mas urgente) */
export const PRIORIDAD_ORDEN = Object.keys(PRIORIDADES);

export const SUPERINTENDENCIAS = [
    "", "Acarreo electrico", "Acarreo mecanico", "Almacenes e inventario",
    "Cargue electrico", "Cargue hidraulico", "EALL", "Energia", "Ferrocarril",
    "Geotecnia e hidrologia", "Ingeniería, mtto instalaciones y servi",
    "Plantas de carbon", "Prevencion y control de emergencias", "Produccion",
    "Puerto bolivar", "Sin superintendencia", "Superintendencia de servicios eléctricos",
    "Tecnologia informacion", "TOR"
];

export const COORDINADORES_LISTA = ["Jesus Padilla", "Isaac Jimenez", "Manuel Redondo", "Francisco Silvera", "Otro"];
export const AREAS_ENTREGA = ["Mesa Amarilla", "Oficina de Coordinación", "Área Amarilla Mecanizado", "Área Amarilla de Bloques", "Área de END", "Área de vía 40", "Otra"];

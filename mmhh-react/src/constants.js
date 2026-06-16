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
    "Reparaci\u00F3n": ["Alojamiento", "Superficie plana", "Superficie cilindrica", "Rosca interna", "Rosca Externa", "Centro Punto", "Puesto de sello", "Puesto de pista", "Otro"],
    "Evaluaci\u00F3n": ["Reusabilidad de parte", "Torcedura de ejes", "Otro"],
    "Rectificado": ["Dimensional", "Bloque", "Cig\u00FCe\u00F1al", "\u00C1rbol de Levas", "Bielas", "Caja de Balancines", "Balancines", "Seguidores", "Eje De balancines", "Pi\u00F1oner\u00EDa", "Carcasa Frontal", "Carcasa Trasera", "Multiples", "Otro"],
    "Fabricaci\u00F3n": ["C\u00E1rter", "Pieza con planos", "Pieza sin planos"],
    "Soldadura Soporte": ["Modificaci\u00F3n de pieza", "Reparar grieta", "Retirar pistas", "Retirar rodamientos", "Retirar rotula", "Asegurar parte a base", "Calentado de parte", "Otro"],
    "Mecanizado port\u00E1til": ["Componente en taller NWS", "Equipo en Taller permanente", "Equipo en campo", "Otro"],
    "Taller Externo": ["Metalizado", "Reparaci\u00F3n especial", "Otro"],
    "Soporte de Mantenimiento": ["Evaluaci\u00F3n", "Reparaci\u00F3n", "Inspecci\u00F3n", "Otro"],
    "Otro": ["Otro"]
};

export const EQUIPOS_COORDINADOR = [
    "Bru\u00F1idora", "Cepillo Klopp", "Estibadora Elect", "Fresadora Jarbe", "Mandrinadora",
    "Prensa 11.2 ton", "Prensa 16 ton", "Rectificadora Bloques", "Rectificadora de Bielas",
    "Rectificadora de Bancada", "Rectificadora de cigue\u00F1ales", "Rectificadora Peque\u00F1a",
    "Rotosoldador #1", "Rotosoldador #2", "Rotosoldador #3", "Servo Motor 1", "Servo Motor 2",
    "Sierra Mecanica", "Taladro Foradia", "Taladro Ibarmia", "Taladro Soraluce (Rectificado)",
    "Taladro Soraluce (Pasillo)", "Taladro Soraluce (comedor)", "Torno Bulgaria", "Torno Namsun",
    "Torno peque\u00F1o", "Torno Pinacho CNC", "Torno Pinacho Convencional", "Torno Ticino 330",
    "Torno Ticino 520", "Torno Torrent", "Unidad Hidr\u00E1ulica 1", "Unidad Hidr\u00E1ulica 2",
    "Unidad Hidr\u00E1ulica 3", "Unidad Hidr\u00E1ulica 4", "Unidad Hidr\u00E1ulica 5", "Unidad Hidr\u00E1ulica 6",
    "Unidad Hidr\u00E1ulica 7", "No Requiere", "Equipo END"
];

export const ESTADOS_COORDINADOR = [
    "No gestionado", "Disponible en Maquinas y Herramientas", "Entregado"
];

export const SOPORTE_OPCIONES = {
    "Ensayo No destructivo": ["Visual", "Tintas Penetrantes", "Particulas Magneticas", "Ultra sonido", "Otro"],
    "Reparaci\u00F3n": ["Alojamiento", "Superficie plana", "Superficie cilindrica", "Rosca interna", "Rosca Externa", "Centro Punto", "Puesto de sello", "Puesto de pista", "Otro"],
    "Evaluaci\u00F3n": ["Reusabilidad de parte", "Torcedura de ejes", "Otro"],
    "Rectificado": ["Dimensional", "Bloque", "Cig\u00FCe\u00F1al", "\u00C1rbol de Levas", "Bielas", "Caja de Balancines", "Balancines", "Seguidores", "Eje De balancines", "Pi\u00F1oner\u00EDa", "Carcasa Frontal", "Carcasa Trasera", "Multiples", "Otro"],
    "Fabricaci\u00F3n": ["C\u00E1rter", "Pieza con planos", "Pieza sin planos"],
    "Soldadura Soporte": ["Modificaci\u00F3n de pieza", "Reparar grieta", "Retirar pistas", "Retirar rodamientos", "Retirar rotula", "Asegurar parte a base", "Calentado de parte", "Otro"],
    "Mecanizado port\u00E1til": ["Componente en taller NWS", "Equipo en Taller permanente", "Equipo en campo", "Otro"],
    "Taller Externo": ["Metalizado", "Reparaci\u00F3n especial", "Otro"],
    "Soporte de Mantenimiento": ["Evaluaci\u00F3n", "Reparaci\u00F3n", "Inspecci\u00F3n", "Otro"],
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

export const SUPERINTENDENCIAS = [
    "", "Acarreo electrico", "Acarreo mecanico", "Almacenes e inventario",
    "Cargue electrico", "Cargue hidraulico", "EALL", "Energia", "Ferrocarril",
    "Geotecnia e hidrologia", "Ingenier\u00EDa, mtto instalaciones y servi",
    "Plantas de carbon", "Prevencion y control de emergencias", "Produccion",
    "Puerto bolivar", "Sin superintendencia", "Superintendencia de servicios el\u00E9ctricos",
    "Tecnologia informacion", "TOR"
];

export const COORDINADORES_LISTA = ["Jesus Padilla", "Isaac Jimenez", "Manuel Redondo", "Francisco Silvera", "Otro"];
export const AREAS_ENTREGA = ["Mesa Amarilla", "Oficina de Coordinaci\u00F3n", "\u00C1rea Amarilla Mecanizado", "\u00C1rea Amarilla de Bloques", "\u00C1rea de END", "\u00C1rea de v\u00EDa 40", "Otra"];

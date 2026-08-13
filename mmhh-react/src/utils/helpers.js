import { ESTADO_SOLICITUD, PRIORIDAD_ORDEN, ESTADOS_COORDINADOR, ESTADOS_CIERRE } from '../constants';

export const getCurrentDate = () => new Date().toISOString().split('T')[0];

export const getCurrentDateTime = () => {
    const n = new Date();
    const p = (v) => String(v).padStart(2, '0');
    return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
};

/**
 * ID de solicitud numerico de 6 digitos, facil de memorizar y de dictar por radio.
 * Recibe los IDs ya existentes para evitar colisiones.
 */
export const generateSolicitudID = (existingIds = []) => {
    const usados = new Set((existingIds || []).map(id => String(id)));
    for (let intento = 0; intento < 200; intento++) {
        const id = String(Math.floor(100000 + Math.random() * 900000));
        if (!usados.has(id)) return id;
    }
    // Fallback determinista: siguiente numero libre a partir del mayor existente
    const numericos = [...usados].map(Number).filter(n => Number.isFinite(n) && n >= 100000 && n <= 999999);
    const base = numericos.length ? Math.max(...numericos) : 100000;
    for (let n = base + 1; n <= 999999; n++) {
        if (!usados.has(String(n))) return String(n);
    }
    return String(Math.floor(100000 + Math.random() * 900000));
};

/** Estado de la solicitud: controlado por el sistema, no editable por ningun usuario. */
export const getEstadoSolicitud = (d) => {
    if (!d) return ESTADO_SOLICITUD.PENDIENTE;
    if (d.EstadoSolicitud) return d.EstadoSolicitud;
    return d.Coordinador ? ESTADO_SOLICITUD.GESTIONADO : ESTADO_SOLICITUD.PENDIENTE;
};

/** Estado del componente definido por el coordinador (normalizado contra la lista vigente). */
export const getEstadoComponente = (d) => {
    const estado = d && d.Coordinador ? d.Coordinador.Estado : "";
    if (!estado) return "";
    return ESTADOS_COORDINADOR.includes(estado) ? estado : "En espera";
};

export const esEstadoCierre = (estado) => ESTADOS_CIERRE.includes(estado);

/**
 * Historial de comentarios normalizado. Los registros viejos guardaban un unico
 * campo `Comentario` de entrega: se conserva como comentario de cierre heredado
 * para que nada del historico se pierda.
 */
export const normalizarComentarios = (coordinador) => {
    if (!coordinador) return [];
    if (Array.isArray(coordinador.Comentarios)) return coordinador.Comentarios;
    if (coordinador.Comentario && String(coordinador.Comentario).trim()) {
        return [{
            Texto: String(coordinador.Comentario).trim(),
            Autor: coordinador.Nombre || "Coordinador",
            Email: coordinador.Email || "",
            Fecha: coordinador.FechaDiligenciado || "",
            EsCierre: true
        }];
    }
    return [];
};

/** La prioridad del coordinador manda para metricas; si aun no existe, se usa la del cliente. */
export const getPrioridadEfectiva = (d) => {
    if (d && d.Coordinador && d.Coordinador.PrioridadCoordinador) return d.Coordinador.PrioridadCoordinador;
    return (d && d.Prioridad) || "";
};

export const prioridadRank = (prioridad) => {
    const idx = PRIORIDAD_ORDEN.indexOf(prioridad);
    return idx === -1 ? PRIORIDAD_ORDEN.length : idx;
};

/** Ranking de atencion: mayor prioridad primero y, a igual prioridad, la solicitud mas antigua. */
export const compararPorPrioridadYFecha = (a, b) => {
    const ra = prioridadRank(getPrioridadEfectiva(a.parsedData));
    const rb = prioridadRank(getPrioridadEfectiva(b.parsedData));
    if (ra !== rb) return ra - rb;
    const fa = a.parsedData.Fecha || "9999-12-31";
    const fb = b.parsedData.Fecha || "9999-12-31";
    if (fa !== fb) return fa < fb ? -1 : 1;
    return 0;
};

/** Orden por defecto de la base de datos: fecha de solicitud, mas reciente primero. */
export const compararPorFecha = (a, b) => {
    const fa = a.parsedData.Fecha || "";
    const fb = b.parsedData.Fecha || "";
    if (fa !== fb) return fa < fb ? 1 : -1;
    return (b.Id || 0) - (a.Id || 0);
};

export const totalHorasHombre = (coordinador) => {
    if (!coordinador || !coordinador.Procesos) return Number(coordinador?.EstimadoHorasHombre) || 0;
    return coordinador.Procesos.reduce((acc, p) => acc + (Number(p.EstimadoHorasHombre) || 0), 0);
};

export const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
});

export const downloadCSV = (filteredItems) => {
    const headers = [
        "ID", "Fecha", "OT", "Flota", "Componente", "PN", "SC", "Soporte", "Tipo Requerimiento",
        "Prioridad Cliente", "Prioridad Coordinador", "Superintendencia", "Contacto", "Celular",
        "Coordinador Recibe", "Area Entrega", "Estado Solicitud", "Estado Componente",
        "Procesos", "Areas de Proceso", "H/H Estimadas Total", "Fecha Estimado",
        "Complemento MMHH", "Notificacion Cliente", "Demoras", "Comentarios", "Comentario de Cierre"
    ];
    const rows = filteredItems.map(item => {
        const d = item.parsedData;
        if (d.Error) return null;
        const c = d.Coordinador;
        const procesos = c && c.Procesos
            ? c.Procesos.map(p => `${p.ProcesoRequerido}${p.SubprocesoRequerido ? ": " + p.SubprocesoRequerido : ""}${p.EstimadoHorasHombre ? ` (${p.EstimadoHorasHombre} H/H)` : ""}`).join(" | ")
            : "";
        const areas = c && c.Procesos ? c.Procesos.map(p => p.AreaProceso || "").filter(Boolean).join(" | ") : "";
        const demoras = c && c.Demoras ? c.Demoras.map(dem => `${dem.Descripcion || ""} (${dem.Fecha || ""})`).join(" | ") : "";
        const historial = c && c.Comentarios
            ? c.Comentarios.filter(cm => !cm.EsCierre).map(cm => `[${cm.Fecha}] ${cm.Autor}: ${cm.Texto}`).join(" || ")
            : "";
        const cierre = c && c.Comentarios
            ? (c.Comentarios.filter(cm => cm.EsCierre).map(cm => `[${cm.Fecha}] ${cm.Autor}: ${cm.Texto}`).join(" || ") || (c.Comentario || ""))
            : "";
        return [
            d.SolicitudID || "", d.Fecha || "", d.OT || "", d.Flota || "", d.NombreComponente || "", d.PN || "", d.SC || "", d.Soporte || "",
            (d.TipoRequerimiento || []).join("; "), d.Prioridad || "", (c && c.PrioridadCoordinador) || "", d.Superintendencia || "",
            d.NombreContacto || "", d.Celular || "", d.CoordinadorRecibe || "", d.AreaEntrega || "",
            getEstadoSolicitud(d), c ? c.Estado : "",
            procesos, areas, totalHorasHombre(c), c ? c.FechaEstimado : "", c ? c.ComplementoMMHH : "", c ? c.NotificacionCliente : "",
            demoras, historial, cierre
        ];
    }).filter(Boolean);

    let csv = "﻿" + headers.join(",") + "\n";
    rows.forEach(row => {
        csv += row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MMHH_DB_${getCurrentDate()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

export const initialFormState = {
    SolicitudID: "",
    Fecha: getCurrentDate(),
    Soporte: "",
    SoporteCustom: "",
    TipoRequerimiento: [],
    TipoRequerimientoCustom: {},
    Flota: "793D",
    FlotaCustom: "",
    DetalleRequerimiento: "",
    NombreComponente: "",
    PN: "",
    SC: "",
    NombreContacto: "",
    Celular: "",
    OT: "",
    Prioridad: "P0",
    Cantidad: 1,
    CoordinadorRecibe: "Jesus Padilla",
    CoordinadorRecibeCustom: "",
    AreaEntrega: "Mesa Amarilla",
    AreaEntregaCustom: "",
    Superintendencia: "",
    EstadoSolicitud: ESTADO_SOLICITUD.PENDIENTE,
    ImagenesBase64: []
};

export const nuevoProceso = () => ({
    ProcesoRequerido: "Ensayo No destructivo",
    ProcesoRequeridoCustom: "",
    SubprocesoRequerido: "Visual",
    SubprocesoRequeridoCustom: "",
    AreaProceso: "Mandrinadora",
    AreaProcesoCustom: "",
    EstimadoHorasHombre: 0
});

export const initialCoordinatorFormState = {
    Procesos: [nuevoProceso()],
    ComplementoMMHH: "",
    Estado: "En espera",
    PrioridadCoordinador: "P0",
    FechaEstimado: getCurrentDate(),
    NotificacionCliente: "No",
    Demoras: [],
    Comentarios: [],
    NuevoComentario: "",
    ComentarioCierre: ""
};

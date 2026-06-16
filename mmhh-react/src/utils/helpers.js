export const getCurrentDate = () => new Date().toISOString().split('T')[0];

export const generateSolicitudID = () => {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const rnd = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `MMHH-${y}${m}${d}-${h}${mi}${s}-${rnd}`;
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
    const headers = ["ID", "Fecha", "OT", "Flota", "Componente", "PN", "SC", "Soporte", "Tipo Requerimiento", "Prioridad", "Superintendencia", "Contacto", "Celular", "Coordinador Recibe", "Area Entrega", "Estado Gestion", "Procesos", "Equipo", "H/H Estimadas", "Fecha Estimado", "Complemento MMHH", "Notificacion Cliente", "Demoras", "Comentario"];
    const rows = filteredItems.map(item => {
        const d = item.parsedData;
        if (d.Error) return null;
        const c = d.Coordinador;
        const procesos = c && c.Procesos ? c.Procesos.map(p => `${p.ProcesoRequerido}${p.SubprocesoRequerido ? ": " + p.SubprocesoRequerido : ""}`).join(" | ") : (c ? `${c.ProcesoRequerido || ""}${c.SubprocesoRequerido ? ": " + c.SubprocesoRequerido : ""}` : "");
        const demoras = c && c.Demoras ? c.Demoras.map(dem => `${dem.Descripcion || ""} (${dem.Fecha || ""})`).join(" | ") : "";
        return [
            d.SolicitudID || "", d.Fecha || "", d.OT || "", d.Flota || "", d.NombreComponente || "", d.PN || "", d.SC || "", d.Soporte || "",
            (d.TipoRequerimiento || []).join("; "), d.Prioridad || "", d.Superintendencia || "",
            d.NombreContacto || "", d.Celular || "", d.CoordinadorRecibe || "", d.AreaEntrega || "",
            c ? c.Estado : "Sin Asignar", procesos,
            c ? c.Equipo : "", c ? c.EstimadoHorasHombre : "", c ? c.FechaEstimado : "", c ? c.ComplementoMMHH : "", c ? c.NotificacionCliente : "",
            demoras, c ? c.Comentario : ""
        ];
    }).filter(Boolean);

    let csv = "\uFEFF" + headers.join(",") + "\n";
    rows.forEach(row => {
        csv += row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(",") + "\n";
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
    ImagenesBase64: []
};

export const initialCoordinatorFormState = {
    Procesos: [{ ProcesoRequerido: "Ensayo No destructivo", ProcesoRequeridoCustom: "", SubprocesoRequerido: "", SubprocesoRequeridoCustom: "" }],
    ComplementoMMHH: "",
    Equipo: "Bru\u00F1idora",
    Estado: "No gestionado",
    EstimadoHorasHombre: 0,
    FechaEstimado: getCurrentDate(),
    NotificacionCliente: "No",
    Demoras: [],
    Comentario: ""
};

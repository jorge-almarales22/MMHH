import { SP_CONFIG, ESTADO_SOLICITUD } from '../constants';
import { esEstadoCierre, getCurrentDateTime, normalizarComentarios } from './helpers';

export const authenticateUser = async () => {
    try {
        const response = await fetch(`${SP_CONFIG.siteUrl}/_api/web/currentuser`, {
            headers: { "Accept": "application/json;odata=verbose" }
        });
        if (!response.ok) throw new Error("Entorno local o fuera de SharePoint.");
        const data = await response.json();
        const spUser = data.d;
        return {
            authenticated: true,
            name: spUser.Title,
            email: spUser.Email,
        };
    } catch (err) {
        console.log("No se pudo autodetectar el usuario de SharePoint. Modo de simulacion local activo.");
        return {
            authenticated: false,
            name: "Usuario Desarrollador",
            email: "Isaac.Jimenez@cerrejon.com",
        };
    }
};

export const getRequestDigest = async () => {
    const response = await fetch(`${SP_CONFIG.siteUrl}/_api/contextinfo`, {
        method: 'POST',
        headers: { "Accept": "application/json;odata=verbose" }
    });
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
};

export const getEntityType = async (listName) => {
    const response = await fetch(`${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${listName}')?$select=ListItemEntityTypeFullName`, {
        headers: { "Accept": "application/json;odata=verbose" }
    });
    const data = await response.json();
    return data.d.ListItemEntityTypeFullName;
};

export const fetchItems = async () => {
    const response = await fetch(`${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SP_CONFIG.listTitle}')/items?$top=500&$orderby=Created desc`, {
        headers: { "Accept": "application/json;odata=verbose" }
    });
    if (!response.ok) throw new Error("Error de red al consultar los items.");
    const data = await response.json();
    return data.d.results.map(item => {
        try {
            return { ...item, parsedData: JSON.parse(item.Data) };
        } catch (e) {
            return { ...item, parsedData: { Error: "Formato JSON corrupto" } };
        }
    });
};

export const createItem = async (formData, evidenceFiles, compressImageFn, generateSolicitudIDFn, existingIds = []) => {
    const digest = await getRequestDigest();
    const entityType = await getEntityType(SP_CONFIG.listTitle);

    // El consecutivo se calcula contra la lista recien leida, no contra la copia
    // que el navegador tenga en pantalla, que puede llevar minutos de antiguedad.
    let idsVigentes = existingIds;
    try {
        const frescos = await fetchItems();
        idsVigentes = frescos.map(i => i.parsedData?.SolicitudID).filter(Boolean);
    } catch (e) {
        console.warn("No se pudo releer la lista; se numera con los datos en pantalla.", e);
    }

    const solicitudID = generateSolicitudIDFn(idsVigentes);

    let finalTipoRequerimiento = formData.TipoRequerimiento.map(req => {
        if (req === "Otro" && formData.TipoRequerimientoCustom["Otro"]) {
            return formData.TipoRequerimientoCustom["Otro"];
        }
        return req;
    });

    let finalDataObj = {
        ...formData,
        SolicitudID: solicitudID,
        TipoRequerimiento: finalTipoRequerimiento,
        // Estado de la solicitud: lo fija el sistema y nadie puede editarlo despues.
        EstadoSolicitud: ESTADO_SOLICITUD.PENDIENTE
    };
    if (formData.Flota === "Otra" && formData.FlotaCustom) finalDataObj.Flota = formData.FlotaCustom;
    if (formData.Soporte === "Otro" && formData.SoporteCustom) finalDataObj.Soporte = formData.SoporteCustom;
    if (formData.CoordinadorRecibe === "Otro" && formData.CoordinadorRecibeCustom) finalDataObj.CoordinadorRecibe = formData.CoordinadorRecibeCustom;
    if (formData.AreaEntrega === "Otra" && formData.AreaEntregaCustom) finalDataObj.AreaEntrega = formData.AreaEntregaCustom;

    let base64Images = [];
    for (let file of evidenceFiles) {
        const b64 = await compressImageFn(file);
        base64Images.push({ name: file.name, data: b64 });
    }
    finalDataObj.ImagenesBase64 = base64Images;

    const itemPayload = {
        "__metadata": { "type": entityType },
        Title: formData.OT,
        Data: JSON.stringify(finalDataObj)
    };

    const response = await fetch(`${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SP_CONFIG.listTitle}')/items`, {
        method: "POST",
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest
        },
        body: JSON.stringify(itemPayload)
    });

    if (!response.ok) throw new Error("Fallo al guardar en SharePoint. Valide el tamano de las imagenes.");
    return solicitudID;
};

export const updateCoordinatorData = async (manageModalItem, coordForm, coordEvidenceFiles, userAuth, compressImageFn, getCurrentDateFn) => {
    const digest = await getRequestDigest();
    const entityType = await getEntityType(SP_CONFIG.listTitle);

    let coordBase64Images = [];
    for (let file of coordEvidenceFiles) {
        const b64 = await compressImageFn(file);
        coordBase64Images.push({ name: file.name, data: b64 });
    }

    let finalProcesos = coordForm.Procesos.map(p => {
        let proceso = { ...p };
        if (p.ProcesoRequerido === "Otro" && p.ProcesoRequeridoCustom) proceso.ProcesoRequerido = p.ProcesoRequeridoCustom;
        if (p.SubprocesoRequerido === "Otro" && p.SubprocesoRequeridoCustom) proceso.SubprocesoRequerido = p.SubprocesoRequeridoCustom;
        if (p.AreaProceso === "Otro" && p.AreaProcesoCustom) proceso.AreaProceso = p.AreaProcesoCustom;
        proceso.EstimadoHorasHombre = Number(p.EstimadoHorasHombre) || 0;
        return proceso;
    });

    const coordinadorPrevio = manageModalItem.parsedData.Coordinador || {};

    // El historial se reconstruye desde lo ya persistido: el formulario solo puede
    // anexar, nunca reescribir ni borrar comentarios anteriores.
    const historialPrevio = [...normalizarComentarios(coordinadorPrevio)];
    const sello = getCurrentDateTime();

    const nuevoComentario = (coordForm.NuevoComentario || "").trim();
    if (nuevoComentario) {
        historialPrevio.push({
            Texto: nuevoComentario,
            Autor: userAuth.name,
            Email: userAuth.email,
            Fecha: sello,
            EsCierre: false
        });
    }

    const yaTieneCierre = historialPrevio.some(c => c.EsCierre);
    const comentarioCierre = (coordForm.ComentarioCierre || "").trim();
    if (esEstadoCierre(coordForm.Estado) && comentarioCierre && !yaTieneCierre) {
        historialPrevio.push({
            Texto: comentarioCierre,
            Autor: userAuth.name,
            Email: userAuth.email,
            Fecha: sello,
            EsCierre: true,
            EstadoCierre: coordForm.Estado
        });
    }

    // Las evidencias tambien se acumulan en lugar de reemplazarse.
    const imagenesPrevias = Array.isArray(coordinadorPrevio.ImagenesBase64) ? coordinadorPrevio.ImagenesBase64 : [];

    const updatedParsedData = {
        ...manageModalItem.parsedData,
        // Cualquier gestion guardada marca la solicitud como Gestionado. Es irreversible.
        EstadoSolicitud: ESTADO_SOLICITUD.GESTIONADO,
        Coordinador: {
            ...coordinadorPrevio,
            Email: userAuth.email,
            Nombre: userAuth.name,
            FechaDiligenciado: getCurrentDateFn(),
            Procesos: finalProcesos,
            ComplementoMMHH: coordForm.ComplementoMMHH,
            Estado: coordForm.Estado,
            PrioridadCoordinador: coordForm.PrioridadCoordinador,
            FechaEstimado: coordForm.FechaEstimado,
            NotificacionCliente: coordForm.NotificacionCliente,
            Demoras: coordForm.Demoras,
            // Se sella la fecha del primer cierre: es contra ella que se mide el plazo.
            FechaCierre: esEstadoCierre(coordForm.Estado)
                ? (coordinadorPrevio.FechaCierre || getCurrentDateFn())
                : undefined,
            Comentarios: historialPrevio,
            ImagenesBase64: [...imagenesPrevias, ...coordBase64Images]
        }
    };

    // Campo heredado que ya no se captura en el formulario.
    delete updatedParsedData.Coordinador.Equipo;
    delete updatedParsedData.Coordinador.EstimadoHorasHombre;

    const itemPayload = {
        "__metadata": { "type": entityType },
        Data: JSON.stringify(updatedParsedData)
    };

    const updateUrl = `${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SP_CONFIG.listTitle}')/items(${manageModalItem.Id})`;

    const response = await fetch(updateUrl, {
        method: "POST",
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*"
        },
        body: JSON.stringify(itemPayload)
    });

    if (!response.ok) throw new Error("No se pudo actualizar el registro con la informacion del coordinador.");
};

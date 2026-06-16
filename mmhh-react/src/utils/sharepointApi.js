import { SP_CONFIG } from '../constants';

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

export const createItem = async (formData, evidenceFiles, compressImageFn, generateSolicitudIDFn) => {
    const digest = await getRequestDigest();
    const entityType = await getEntityType(SP_CONFIG.listTitle);

    const solicitudID = generateSolicitudIDFn();

    let finalTipoRequerimiento = formData.TipoRequerimiento.map(req => {
        if (req === "Otro" && formData.TipoRequerimientoCustom["Otro"]) {
            return formData.TipoRequerimientoCustom["Otro"];
        }
        return req;
    });

    let finalDataObj = { ...formData, SolicitudID: solicitudID, TipoRequerimiento: finalTipoRequerimiento };
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
        return proceso;
    });

    const updatedParsedData = {
        ...manageModalItem.parsedData,
        Coordinador: {
            Email: userAuth.email,
            Nombre: userAuth.name,
            FechaDiligenciado: getCurrentDateFn(),
            Procesos: finalProcesos,
            ComplementoMMHH: coordForm.ComplementoMMHH,
            Equipo: coordForm.Equipo,
            Estado: coordForm.Estado,
            EstimadoHorasHombre: coordForm.EstimadoHorasHombre,
            FechaEstimado: coordForm.FechaEstimado,
            NotificacionCliente: coordForm.NotificacionCliente,
            Demoras: coordForm.Demoras,
            Comentario: coordForm.Comentario,
            ImagenesBase64: coordBase64Images
        }
    };

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

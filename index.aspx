<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base de Datos de MMHH - Cerrej&oacute;n SGIA</title>
    
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        cerrejon: { gold: '#E2B53C', orange: '#C77953', dark: '#1a202c' }
                    }
                }
            }
        }
    </script>
    
    <style>
        body, html {
            margin: 0; padding: 0; min-height: 100%;
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #1a202c;
            background-image: linear-gradient(to bottom right, #1a202c, #2d3748);
            background-size: cover; background-position: center center;
            background-attachment: fixed; background-repeat: no-repeat;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    </style>
</head>
<body class="antialiased text-gray-800">
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        const SP_CONFIG = {
            siteUrl: "https://glencore.sharepoint.com/sites/co-lmn-sgia/checklist",
            listTitle: "MMHH_DB"
        };

        const AUTORIZADOS = [
            "isaac.jimenez@cerrejon.com",
            "jesus.padilla@cerrejon.com",
            "manuel.redondo@cerrejon.com",
            "francisco.silvera@cerrejon.com",
            "juan.a.valencia@cerrejon.com",
            "jorge.almarales.ext@cerrejon.com"
        ];

        const PROCESOS_COORDINADOR = {
            "Ensayo No destructivo": ["Visual", "Tintas Penetrantes", "Particulas Magneticas", "Ultra sonido", "Otro"],
            "Reparaci\u00F3n": ["Alojamiento", "Superficie plana", "Superficie cilindrica", "Rosca interna", "Rosca Externa", "Centro Punto", "Puesto de sello", "Puesto de pista", "Otro"],
            "Evaluaci\u00F3n": ["Reusabilidad de parte", "Torcedura de ejes", "Otro"],
            "Rectificado": ["Dimensional", "Bloque", "Cig\u00FCe\u00F1al", "\u00C1rbol de Levas", "Bielas", "Caja de Balancines", "Balancines", "Seguidores", "Eje De balancines", "Pi\u00F1oner\u00EDa", "Carcasa Frontal", "Carcasa Trasera", "Multiples", "Otro"],
            "Fabricaci\u00F3n": ["C\u00E1rter", "Pieza con planos", "Pieza sin planos"],
            "Soldadura Soporte": ["Modificaci\u00F3n de pieza", "Reparar grieta", "Retirar pistas", "Retirar rodamientos", "Retirar rotula", "Asegurar parte a base", "Calentado de parte", "Otro"],
            "Mecanizado portatil": ["Componente en taller NWS", "Equipo en Taller permanente", "Equipo en campo", "Otro"],
            "Taller Externo": ["Metalizado", "Reparaci\u00F3n especial", "Otro"],
            "Soporte de Mantenimiento": ["Evaluaci\u00F3n", "Reparaci\u00F3n", "Inspecci\u00F3n", "Otro"],
            "Otro": ["Otro"]
        };

        const EQUIPOS_COORDINADOR = [
            "Bru\u00F1idora", "Cepillo Klopp", "Estibadora Elect", "Fresadora Jarbe", "Mandrinadora", 
            "Prensa 11.2 ton", "Prensa 16 ton", "Rectificadora Bloques", "Rectificadora de Bielas", 
            "Rectificadora de Bancada", "Rectificadora de cigue\u00F1ales", "Rectificadora Peque\u00F1a", 
            "Rotosoldador #1", "Rotosoldador #2", "Rotosoldador #3", "Servo Motor 1", "Servo Motor 2", 
            "Sierra Mecanica", "Taladro Foradia", "Taladro Ibarmia", "Taladro Soraluce (Rectificado)", 
            "Taladro Soraluce (Pasillo)", "Taladro Soraluce (comedor)", "Torno Bulgaria", "Torno Namsun", 
            "Torno peque\u00F1o", "Torno Pinacho CNC", "Torno Pinacho Convencional", "Torno Ticino 330", 
            "Torno Ticino 520", "Torno Torrent", "Unidad Hidr\u00E1ulica 1", "Unidad Hidr\u00E1ulica 2", 
            "Unidad Hidr\u00E1ulica 3", "Unidad Hidr\u00E1ulica 4", "Unidad Hidr\u00E1ulica 5", "Unidad Hidr\u00E1ulica 6", 
            "Unidad Hidr\u00E1ulica 7"
        ];

        const ESTADOS_COORDINADOR = [
            "En espera", "Premaquinado", "Mecanizado", "Relleno", "Terminado"
        ];

        const SOPORTE_OPCIONES = {
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

        const FLOTAS = [
            "793D", "789D", "789C", "793D EL", "3516", "C13", "C32", "777F", 
            "777G", "16M", "16M3", "D9T", "D10T", "D10T2", "D11T", "834G", 
            "854K", "854H", "EX3600", "EX5500", "R9150", "XPC", "L1350", "Otra"
        ];

        const PRIORIDADES = {
            "P0": 0, "P01": 1, "P02": 3, "P03": 5, "P1": 7, "P2": 30, "P3": 60, "P4": 90, "P5": 180, "PL": 365
        };

        const SUPERINTENDENCIAS = [
            "", "Acarreo electrico", "Acarreo mecanico", "Almacenes e inventario",
            "Cargue electrico", "Cargue hidraulico", "EALL", "Energia", "Ferrocarril",
            "Geotecnia e hidrologia", "Ingenier\u00EDa, mtto instalaciones y servi",
            "Plantas de carbon", "Prevencion y control de emergencias", "Produccion",
            "Puerto bolivar", "Sin superintendencia", "Superintendencia de servicios el\u00E9ctricos",
            "Tecnologia informacion", "TOR"
        ];

        const COORDINADORES_LISTA = ["Jesus Padilla", "Isaac Jimenez", "Manuel Redondo", "Francisco Silvera", "Otro"];
        const AREAS_ENTREGA = ["Mesa Amarilla", "Oficina de Coordinaci\u00F3n", "\u00C1rea Amarilla Mecanizado", "\u00C1rea Amarilla de Bloques", "\u00C1rea de END", "\u00C1rea de v\u00EDa 40", "Otra"];

        const getCurrentDate = () => new Date().toISOString().split('T')[0];

        const initialFormState = {
            Fecha: getCurrentDate(),
            Soporte: "",
            SoporteCustom: "",
            TipoRequerimiento: [], 
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

        const initialCoordinatorFormState = {
            ProcesoRequerido: "Ensayo No destructivo",
            ProcesoRequeridoCustom: "",
            SubprocesoRequerido: "",
            SubprocesoRequeridoCustom: "",
            ComplementoMMHH: "",
            Equipo: "Bru\u00F1idora",
            Estado: "En espera",
            EstimadoHorasHombre: 0,
            FechaEstimado: getCurrentDate(),
            NotificacionCliente: "No"
        };

        const compressImage = (file) => new Promise((resolve, reject) => {
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
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = error => reject(error);
            };
            reader.onerror = error => reject(error);
        });

        function App() {
            // Datos del Formulario Cliente
            const [formData, setFormData] = useState(initialFormState);
            const [evidenceFiles, setEvidenceFiles] = useState([]); 
            const [items, setItems] = useState([]);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);

            // Sistema de autenticación de SharePoint
            const [userAuth, setUserAuth] = useState({
                authenticated: false,
                name: "Cargando usuario...",
                email: "",
                isCoordinator: false
            });

            // Modales y Gestión de Coordinación
            const [viewModalItem, setViewModalItem] = useState(null); 
            const [manageModalItem, setManageModalItem] = useState(null); 
            const [coordForm, setCoordForm] = useState(initialCoordinatorFormState);
            const [coordEvidenceFiles, setCoordEvidenceFiles] = useState([]);

            const [modalImages, setModalImages] = useState(null);
            const [activeImageIndex, setActiveImageIndex] = useState(0);

            const fileInputRef = useRef(null);
            const coordFileInputRef = useRef(null);

            useEffect(() => {
                authenticateUser();
                fetchItems();
            }, []);

            // Consulta de usuario actual mediante API de SharePoint
            const authenticateUser = async () => {
                try {
                    const response = await fetch(`${SP_CONFIG.siteUrl}/_api/web/currentuser`, {
                        headers: { "Accept": "application/json;odata=verbose" }
                    });
                    if (!response.ok) throw new Error("Entorno local o fuera de SharePoint.");
                    const data = await response.json();
                    const spUser = data.d;
                    const email = (spUser.Email || "").toLowerCase().trim();
                    const isCoord = AUTORIZADOS.map(e => e.toLowerCase()).includes(email);
                    
                    setUserAuth({
                        authenticated: true,
                        name: spUser.Title,
                        email: spUser.Email,
                        isCoordinator: isCoord
                    });
                } catch (err) {
                    console.log("No se pudo autodetectar el usuario de SharePoint. Modo de simulación local activo.");
                    setUserAuth({
                        authenticated: false,
                        name: "Usuario Desarrollador",
                        email: "Isaac.Jimenez@cerrejon.com",
                        isCoordinator: true
                    });
                }
            };

            const getRequestDigest = async () => {
                const response = await fetch(`${SP_CONFIG.siteUrl}/_api/contextinfo`, { 
                    method: 'POST', 
                    headers: { "Accept": "application/json;odata=verbose" }
                });
                const data = await response.json();
                return data.d.GetContextWebInformation.FormDigestValue;
            };

            const getEntityType = async (listName) => {
                const response = await fetch(`${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${listName}')?$select=ListItemEntityTypeFullName`, { 
                    headers: { "Accept": "application/json;odata=verbose" }
                });
                const data = await response.json();
                return data.d.ListItemEntityTypeFullName;
            };

            const fetchItems = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`${SP_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SP_CONFIG.listTitle}')/items?$top=150&$orderby=Created desc`, { 
                        headers: { "Accept": "application/json;odata=verbose" }
                    });
                    if (!response.ok) throw new Error("Error de red al consultar los \u00EDtems.");
                    const data = await response.json();
                    const parsed = data.d.results.map(item => {
                        try { return { ...item, parsedData: JSON.parse(item.Data) }; } 
                        catch (e) { return { ...item, parsedData: { Error: "Formato JSON corrupto" } }; }
                    });
                    setItems(parsed);
                } catch (err) { 
                    setError("No se carg\u00F3 la base de datos de SharePoint: " + err.message); 
                } finally { 
                    setLoading(false); 
                }
            };

            const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => {
                    const updated = { ...prev, [name]: value };
                    if (name === "Soporte") {
                        updated.TipoRequerimiento = [];
                        updated.SoporteCustom = "";
                    }
                    if (name === "Flota" && value !== "Otra") updated.FlotaCustom = "";
                    if (name === "CoordinadorRecibe" && value !== "Otro") updated.CoordinadorRecibeCustom = "";
                    if (name === "AreaEntrega" && value !== "Otra") updated.AreaEntregaCustom = "";
                    return updated;
                });
            };

            const handleTipoRequerimientoToggle = (req) => {
                let updated = [...formData.TipoRequerimiento];
                if (updated.includes(req)) {
                    updated = updated.filter(r => r !== req);
                } else {
                    updated.push(req);
                }
                setFormData({ ...formData, TipoRequerimiento: updated });
            };

            const handleFileChange = (e) => {
                setEvidenceFiles(Array.from(e.target.files));
            };

            const handleCoordFileChange = (e) => {
                setCoordEvidenceFiles(Array.from(e.target.files));
            };

            const handleViewDetails = (item) => {
                setViewModalItem(item);
            };

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!formData.OT || formData.OT.length !== 8) return alert("La OT debe tener exactamente 8 caracteres.");
                if (formData.TipoRequerimiento.length === 0) return alert("Seleccione al menos un Tipo de Requerimiento.");
                
                setLoading(true); setError(null);

                try {
                    const digest = await getRequestDigest();
                    const entityType = await getEntityType(SP_CONFIG.listTitle);
                    
                    let finalDataObj = { ...formData };
                    if (formData.Flota === "Otra" && formData.FlotaCustom) finalDataObj.Flota = formData.FlotaCustom;
                    if (formData.Soporte === "Otro" && formData.SoporteCustom) finalDataObj.Soporte = formData.SoporteCustom;
                    if (formData.CoordinadorRecibe === "Otro" && formData.CoordinadorRecibeCustom) finalDataObj.CoordinadorRecibe = formData.CoordinadorRecibeCustom;
                    if (formData.AreaEntrega === "Otra" && formData.AreaEntregaCustom) finalDataObj.AreaEntrega = formData.AreaEntregaCustom;
                    let base64Images = [];
                    for (let file of evidenceFiles) {
                        const b64 = await compressImage(file);
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
                    
                    if (!response.ok) throw new Error("Fallo al guardar en SharePoint. Valide el tama\u00F1o de las im\u00E1genes.");
                    
                    setFormData(initialFormState);
                    setEvidenceFiles([]);
                    if(fileInputRef.current) fileInputRef.current.value = "";
                    await fetchItems();
                    alert("Solicitud guardada.");
                } catch (err) { setError(err.message); } 
                finally { setLoading(false); }
            };

            // Abrir formulario de gestión
            const handleOpenManageModal = (item) => {
                setManageModalItem(item);
                if (item.parsedData && item.parsedData.Coordinador) {
                    const c = item.parsedData.Coordinador;
                    setCoordForm({
                        ProcesoRequerido: c.ProcesoRequerido || "Ensayo No destructivo",
                        ProcesoRequeridoCustom: c.ProcesoRequeridoCustom || "",
                        SubprocesoRequerido: c.SubprocesoRequerido || "",
                        SubprocesoRequeridoCustom: c.SubprocesoRequeridoCustom || "",
                        ComplementoMMHH: c.ComplementoMMHH || "",
                        Equipo: c.Equipo || "Bru\u00F1idora",
                        Estado: c.Estado || "En espera",
                        EstimadoHorasHombre: c.EstimadoHorasHombre || 0,
                        FechaEstimado: c.FechaEstimado || getCurrentDate(),
                        NotificacionCliente: c.NotificacionCliente || "No"
                    });
                } else {
                    setCoordForm(initialCoordinatorFormState);
                }
                setCoordEvidenceFiles([]);
                if (coordFileInputRef.current) coordFileInputRef.current.value = "";
            };

            const handleCoordFormChange = (e) => {
                const { name, value } = e.target;
                setCoordForm(prev => {
                    const updated = { ...prev, [name]: value };
                    if (name === "ProcesoRequerido") {
                        const subs = PROCESOS_COORDINADOR[value] || [];
                        updated.SubprocesoRequerido = subs.length > 0 ? subs[0] : "";
                        updated.ProcesoRequeridoCustom = "";
                        updated.SubprocesoRequeridoCustom = "";
                    }
                    return updated;
                });
            };

            // Guardar respuesta del Coordinador en el mismo registro
            const handleSaveCoordResponse = async (e) => {
                e.preventDefault();
                setLoading(true); setError(null);
                try {
                    const digest = await getRequestDigest();
                    const entityType = await getEntityType(SP_CONFIG.listTitle);

                    let coordBase64Images = [];
                    for (let file of coordEvidenceFiles) {
                        const b64 = await compressImage(file);
                        coordBase64Images.push({ name: file.name, data: b64 });
                    }

                    let finalCoordForm = { ...coordForm };
                    if (coordForm.ProcesoRequerido === "Otro" && coordForm.ProcesoRequeridoCustom) finalCoordForm.ProcesoRequerido = coordForm.ProcesoRequeridoCustom;
                    if (coordForm.SubprocesoRequerido === "Otro" && coordForm.SubprocesoRequeridoCustom) finalCoordForm.SubprocesoRequerido = coordForm.SubprocesoRequeridoCustom;

                    const updatedParsedData = {
                        ...manageModalItem.parsedData,
                        Coordinador: {
                            Email: userAuth.email,
                            Nombre: userAuth.name,
                            FechaDiligenciado: getCurrentDate(),
                            ...finalCoordForm,
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

                    if (!response.ok) throw new Error("No se pudo actualizar el registro con la informaci\u00F3n del coordinador.");

                    setManageModalItem(null);
                    setCoordEvidenceFiles([]);
                    if (coordFileInputRef.current) coordFileInputRef.current.value = "";
                    await fetchItems();
                    alert("Gesti\u00F3n del Coordinador guardada correctamente.");
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            const glassCard = "bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl";
            const inputClass = "block w-full rounded-xl bg-white/60 border border-gray-300 focus:bg-white focus:border-cerrejon-orange focus:ring-2 focus:ring-cerrejon-orange/50 transition-all p-3 text-sm outline-none";
            const labelClass = "block text-xs font-bold text-gray-700 mb-2 uppercase tracking-widest";

            return (
                <div className="max-w-[1400px] mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col gap-10 relative">
                    
                    {/* ENCABEZADO */}
                    <header className={`${glassCard} p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cerrejon-gold via-cerrejon-orange to-red-600"></div>
                        <div className="flex items-center gap-5 z-10">
                            <div className="p-3 bg-white/80 rounded-xl shadow-sm backdrop-blur-sm">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="#1a202c" strokeWidth="2" strokeLinejoin="round"/>
                                    <path d="M12 7V17M7 12H17" stroke="#C77953" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Cerrej&oacute;n <span className="text-cerrejon-orange font-light">SGIA</span></h1>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em] mt-1">Gesti&oacute;n de Requerimientos de MMHH</p>
                            </div>
                        </div>

                        {/* SISTEMA DE AUTENTICACIÓN VISUAL */}
                        <div className="flex items-center gap-4 bg-gray-950/10 p-3 rounded-xl border border-white/20 z-10">
                            <div className="text-right">
                                <p className="text-xs font-black text-gray-900">{userAuth.name}</p>
                                <p className="text-[10px] text-gray-500 font-medium">{userAuth.email || "Sin correo"}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                {userAuth.isCoordinator ? (
                                    <span className="bg-green-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider">
                                        Coordinador
                                    </span>
                                ) : (
                                    <span className="bg-gray-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider">
                                        Cliente
                                    </span>
                                )}
                            </div>
                        </div>
                    </header>
 
                    {error && (
                        <div className="bg-red-500/90 backdrop-blur-md text-white border-l-4 border-white p-4 rounded-xl shadow-lg relative">
                            <button onClick={() => setError(null)} className="absolute top-2 right-4 text-white hover:text-gray-200 font-bold">&times;</button>
                            <p className="font-medium text-sm pr-6">{error}</p>
                        </div>
                    )}

                    {/* FORMULARIO DE CLIENTE (SOLICITUD) */}
                    <div className={`${glassCard} p-8 w-full`}>
                        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-6">Nuevo Requerimiento de Mantenimiento</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* GENERALES */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 bg-gray-50/50 p-5 rounded-xl border border-gray-200/50">
                                <div>
                                    <label className={labelClass}>Fecha Registro</label>
                                    <input type="date" name="Fecha" value={formData.Fecha} onChange={handleChange} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>OT (8 Caracteres)</label>
                                    <input type="text" name="OT" maxLength={8} value={formData.OT} onChange={handleChange} className={inputClass} placeholder="Ej. A0104599" required />
                                    {formData.OT && formData.OT.length !== 8 && (
                                        <p className="text-[10px] text-red-500 mt-1 font-bold">Debe contener exactamente 8 caracteres ({formData.OT.length}/8)</p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>Flota</label>
                                    <select name="Flota" value={formData.Flota} onChange={handleChange} className={inputClass} required>
                                        {FLOTAS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    {formData.Flota === "Otra" && (
                                        <input type="text" name="FlotaCustom" value={formData.FlotaCustom} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Especifique la flota..." required />
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>Cantidad</label>
                                    <input type="number" name="Cantidad" min="1" step="1" value={formData.Cantidad} onChange={(e) => setFormData({ ...formData, Cantidad: parseInt(e.target.value) || 1 })} className={inputClass} required />
                                </div>
                            </div>

                            {/* DINÁMICO: SOPORTE & TIPO REQUERIMIENTO */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/40 p-5 rounded-xl border border-white/50">
                                <div>
                                    <label className={labelClass}>Soporte (Categor&iacute;a Principal)</label>
                                    <select name="Soporte" value={formData.Soporte} onChange={handleChange} className={inputClass} required>
                                        <option value="">-- Seleccione Soporte --</option>
                                        {Object.keys(SOPORTE_OPCIONES).map(soporte => (
                                            <option key={soporte} value={soporte}>{soporte}</option>
                                        ))}
                                    </select>
                                    {formData.Soporte === "Otro" && (
                                        <input type="text" name="SoporteCustom" value={formData.SoporteCustom} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Especifique el soporte..." required />
                                    )}
                                </div>
                                <div className="lg:col-span-2 bg-gray-50/60 p-4 rounded-xl border border-gray-200">
                                    <label className={labelClass}>Tipo de Requerimiento (Selecci&oacute;n M&uacute;ltiple)</label>
                                    {!formData.Soporte ? (
                                        <p className="text-xs text-gray-500 italic mt-4">Seleccione una categor&iacute;a de Soporte para cargar los tipos de requerimiento.</p>
                                    ) : formData.Soporte === "Otro" ? (
                                        <input type="text" value={formData.TipoRequerimiento[0] || ""} onChange={(e) => setFormData({...formData, TipoRequerimiento: e.target.value ? [e.target.value] : []})} className={`${inputClass} mt-3`} placeholder="Especifique el tipo de requerimiento..." required />
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                            {SOPORTE_OPCIONES[formData.Soporte].map(req => (
                                                <label key={req} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-cerrejon-orange transition-colors shadow-sm select-none">
                                                    <input type="checkbox" checked={formData.TipoRequerimiento.includes(req)} onChange={() => handleTipoRequerimientoToggle(req)} className="w-4 h-4 accent-cerrejon-orange" />
                                                    <span className="text-xs font-bold text-gray-700">{req}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* COMPONENTES & CONTACTO */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 bg-white/40 p-5 rounded-xl border border-white/50">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Nombre de Componente / Parte</label>
                                    <input type="text" name="NombreComponente" value={formData.NombreComponente} onChange={handleChange} className={inputClass} placeholder="Ej. Cig&uuml;e&ntilde;al de Motor" required />
                                </div>
                                <div>
                                    <label className={labelClass}>PN (Part Number)</label>
                                    <input type="text" name="PN" value={formData.PN} onChange={handleChange} className={inputClass} placeholder="Ej. 104-599" required />
                                </div>
                                <div>
                                    <label className={labelClass}>SC (StockCode)</label>
                                    <input type="number" name="SC" value={formData.SC} onChange={handleChange} className={inputClass} placeholder="Ej. 12" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Nombre de quien solicita</label>
                                    <input type="text" name="NombreContacto" value={formData.NombreContacto} onChange={handleChange} className={inputClass} placeholder="Ej. Juan P&eacute;rez" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Celular</label>
                                    <input type="number" name="Celular" value={formData.Celular} onChange={handleChange} className={inputClass} placeholder="Ej. 3101234567" required />
                                </div>
                            </div>

                            {/* SUPERINTENDENCIA */}
                            <div className="bg-white/40 p-5 rounded-xl border border-white/50">
                                <div className="w-full md:w-1/2">
                                    <label className={labelClass}>Superintendencia</label>
                                    <select name="Superintendencia" value={formData.Superintendencia || ""} onChange={handleChange} className={inputClass} required>
                                        {SUPERINTENDENCIAS.map(s => <option key={s} value={s}>{s || "-- Seleccione Superintendencia --"}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* DETALLE & PRIORIDAD */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/40 p-5 rounded-xl border border-white/50">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Detalle del Requerimiento</label>
                                    <textarea name="DetalleRequerimiento" value={formData.DetalleRequerimiento} onChange={handleChange} rows="4" className={`${inputClass} resize-none`} placeholder="Descripci&oacute;n detallada de la solicitud..." required></textarea>
                                </div>
                                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 flex flex-col justify-between">
                                    <div>
                                        <label className={labelClass}>Prioridad</label>
                                        <div className="flex gap-2 items-start">
                                            <select name="Prioridad" value={formData.Prioridad} onChange={handleChange} className={`${inputClass} flex-1`} required>
                                                {Object.keys(PRIORIDADES).map(prio => (
                                                    <option key={prio} value={prio}>{prio}</option>
                                                ))}
                                            </select>
                                            <div className="text-[9px] flex-shrink-0 bg-white/70 rounded-lg border border-gray-200 overflow-hidden">
                                                <table className="border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="px-1.5 py-0.5 text-left font-bold text-gray-500">P</th>
                                                            <th className="px-1.5 py-0.5 text-right font-bold text-gray-500">D&iacute;as</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(PRIORIDADES).map(([prio, dias]) => (
                                                            <tr key={prio} className={`border-t border-gray-200/50 ${formData.Prioridad === prio ? 'bg-cerrejon-orange/10 font-bold' : ''}`}>
                                                                <td className="px-1.5 py-0.5 text-left text-gray-700">{prio}</td>
                                                                <td className="px-1.5 py-0.5 text-right text-gray-700">{dias}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-2 bg-white/80 rounded-lg border border-cerrejon-orange/30 text-center">
                                        <span className="block text-[10px] font-bold text-gray-500 uppercase">Tiempo de Soluci&oacute;n</span>
                                        <span className="text-lg font-black text-cerrejon-orange">
                                            {PRIORIDADES[formData.Prioridad]} {PRIORIDADES[formData.Prioridad] === 1 ? "D\u00EDa" : "D\u00EDas"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* COORDINACIÓN ENTREGA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white/40 p-5 rounded-xl border border-white/50">
                                <div>
                                    <label className={labelClass}>Coordinador de MMHH Quien Recibe</label>
                                    <select name="CoordinadorRecibe" value={formData.CoordinadorRecibe} onChange={handleChange} className={inputClass} required>
                                        {COORDINADORES_LISTA.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {formData.CoordinadorRecibe === "Otro" && (
                                        <input type="text" name="CoordinadorRecibeCustom" value={formData.CoordinadorRecibeCustom} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Especifique el coordinador..." required />
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>&Aacute;rea de Entrega</label>
                                    <select name="AreaEntrega" value={formData.AreaEntrega} onChange={handleChange} className={inputClass} required>
                                        {AREAS_ENTREGA.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                    {formData.AreaEntrega === "Otra" && (
                                        <input type="text" name="AreaEntregaCustom" value={formData.AreaEntregaCustom} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Especifique el &aacute;rea..." required />
                                    )}
                                </div>
                            </div>

                            {/* ARCHIVOS */}
                            <div className="bg-white/40 p-5 rounded-xl border border-dashed border-gray-400">
                                <label className={labelClass}>Documentos o Evidencias Fotogr&aacute;ficas (Opcional)</label>
                                <input type="file" accept="image/*" multiple onChange={handleFileChange} ref={fileInputRef} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-bold file:bg-cerrejon-orange file:text-white cursor-pointer" />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/30">
                                <button type="submit" disabled={loading} className="px-10 py-3 bg-gradient-to-r from-cerrejon-orange to-red-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50">
                                    {loading ? "Procesando Informaci\u00F3n..." : "Guardar Requerimiento"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* BASE DE DATOS - TABLA INFERIOR */}
                    <div className={`${glassCard} flex flex-col w-full overflow-hidden`}>
                        <div className="bg-gray-900/80 backdrop-blur-md px-6 py-5 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white uppercase tracking-widest">Base de Datos MMHH_DB</h2>
                        </div>
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-400/50 text-xs uppercase font-extrabold text-gray-800">
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">OT</th>
                                        <th className="p-4">Componente</th>
                                        <th className="p-4">Soporte</th>
                                        <th className="p-4 text-center">Estado Gesti&oacute;n</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center p-8 font-medium text-gray-300">No hay registros cargados.</td></tr>
                                    ) : (
                                        items.map((item) => {
                                            const d = item.parsedData;
                                            if (d.Error) return (<tr key={item.Id}><td colSpan="6" className="p-4 text-red-500">ID {item.Id}: {d.Error}</td></tr>);
                                            const gestionado = !!d.Coordinador;

                                            return (
                                                <tr key={item.Id} className="border-b border-gray-300/30 hover:bg-white/50 transition-colors align-middle">
                                                    <td className="p-4 font-medium text-gray-800">{d.Fecha}</td>
                                                    <td className="p-4 font-black text-cerrejon-orange">{d.OT}</td>
                                                    <td className="p-4 font-bold text-gray-800">{d.NombreComponente} <span className="text-xs font-normal text-gray-500 block">{d.Flota} | PN: {d.PN || "N/A"}</span></td>
                                                    <td className="p-4 font-bold text-gray-700">{d.Soporte}</td>
                                                    <td className="p-4 text-center">
                                                        {gestionado ? (
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                                {d.Coordinador.Estado || "Gestionado"}
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200">
                                                                Sin Asignar
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {/* Botón Ver Detalle */}
                                                            <button onClick={() => handleViewDetails(item)} title="Ver Detalle Completo" className="text-white bg-cerrejon-dark hover:bg-gray-700 p-2 rounded shadow transition-colors">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                                            </button>

                                                            {/* Botón Gestionar */}
                                                            {userAuth.isCoordinator && (
                                                                <button onClick={() => handleOpenManageModal(item)} title="Gestionar Requerimiento" className="text-white bg-cerrejon-orange hover:bg-red-600 p-2 rounded shadow transition-colors">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MODAL: REGISTRO/GESTIÓN DEL COORDINADOR */}
                    {manageModalItem && (() => {
                        const d = manageModalItem.parsedData;
                        const subprocessesDisponibles = PROCESOS_COORDINADOR[coordForm.ProcesoRequerido] || [];

                        return (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
                                <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col my-auto relative border-t-8 border-cerrejon-orange">
                                    <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-800">Gestionar Solicitud (Ficha de Coordinador)</h2>
                                            <p className="text-sm font-bold text-cerrejon-orange mt-1">OT: {d.OT} | Componente: {d.NombreComponente}</p>
                                        </div>
                                        <button onClick={() => setManageModalItem(null)} className="text-gray-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-200">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSaveCoordResponse} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                                        
                                        {/* SECCIÓN DINÁMICA: PROCESO Y SUBPROCESO */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-orange-50/50 p-5 rounded-xl border border-orange-200">
                                            <div>
                                                <label className={labelClass}>Proceso Requerido</label>
                                                <select name="ProcesoRequerido" value={coordForm.ProcesoRequerido} onChange={handleCoordFormChange} className={inputClass} required>
                                                    {Object.keys(PROCESOS_COORDINADOR).map(p => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                                {coordForm.ProcesoRequerido === "Otro" && (
                                                    <input type="text" name="ProcesoRequeridoCustom" value={coordForm.ProcesoRequeridoCustom} onChange={handleCoordFormChange} className={`${inputClass} mt-2`} placeholder="Especifique el proceso..." required />
                                                )}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Subproceso Requerido</label>
                                                {subprocessesDisponibles.length === 0 ? (
                                                    <input type="text" readOnly value="No requiere subproceso" className={`${inputClass} bg-gray-100 text-gray-400 cursor-not-allowed`} />
                                                ) : subprocessesDisponibles.length === 1 && subprocessesDisponibles[0] === "Otro" ? (
                                                    <input type="text" name="SubprocesoRequeridoCustom" value={coordForm.SubprocesoRequeridoCustom} onChange={handleCoordFormChange} className={inputClass} placeholder="Especifique el subproceso..." required />
                                                ) : (
                                                    <>
                                                        <select name="SubprocesoRequerido" value={coordForm.SubprocesoRequerido} onChange={handleCoordFormChange} className={inputClass} required>
                                                            {subprocessesDisponibles.map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                        {coordForm.SubprocesoRequerido === "Otro" && (
                                                            <input type="text" name="SubprocesoRequeridoCustom" value={coordForm.SubprocesoRequeridoCustom} onChange={handleCoordFormChange} className={`${inputClass} mt-2`} placeholder="Especifique el subproceso..." required />
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* DETALLES DE COMPLEMENTO Y EQUIPO */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-white/40">
                                            <div className="md:col-span-2">
                                                <label className={labelClass}>Complemento MMHH</label>
                                                <input type="text" name="ComplementoMMHH" value={coordForm.ComplementoMMHH} onChange={handleCoordFormChange} className={inputClass} placeholder="Informaci&oacute;n t&eacute;cnica complementaria..." />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Equipo Utilizado</label>
                                                <select name="Equipo" value={coordForm.Equipo} onChange={handleCoordFormChange} className={inputClass} required>
                                                    {EQUIPOS_COORDINADOR.map(eq => (
                                                        <option key={eq} value={eq}>{eq}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* ESTADOS Y TIEMPOS */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 bg-white/40">
                                            <div>
                                                <label className={labelClass}>Estado</label>
                                                <select name="Estado" value={coordForm.Estado} onChange={handleCoordFormChange} className={inputClass} required>
                                                    {ESTADOS_COORDINADOR.map(est => (
                                                        <option key={est} value={est}>{est}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Horas Hombre (Estimado)</label>
                                                <input type="number" name="EstimadoHorasHombre" min="0" value={coordForm.EstimadoHorasHombre} onChange={handleCoordFormChange} className={inputClass} required />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Fecha Estimada</label>
                                                <input type="date" name="FechaEstimado" value={coordForm.FechaEstimado} onChange={handleCoordFormChange} className={inputClass} required />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Notificaci&oacute;n a Cliente</label>
                                                <select name="NotificacionCliente" value={coordForm.NotificacionCliente} onChange={handleCoordFormChange} className={inputClass} required>
                                                    <option value="Si">S&iacute;</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* SUBIDA DE ARCHIVOS DEL COORDINADOR */}
                                        <div className="bg-white/40 p-5 rounded-xl border border-dashed border-gray-400">
                                            <label className={labelClass}>Documentos o Evidencias del Coordinador (Opcional)</label>
                                            <input type="file" accept="image/*" multiple onChange={handleCoordFileChange} ref={coordFileInputRef} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-bold file:bg-cerrejon-orange file:text-white cursor-pointer" />
                                        </div>

                                        {/* FIRMA AUTOMÁTICA DEL COORDINADOR */}
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-bold uppercase">Registrado por:</span>
                                            <span className="font-extrabold text-cerrejon-dark">{userAuth.name} ({userAuth.email})</span>
                                        </div>

                                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                            <button type="button" onClick={() => setManageModalItem(null)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">
                                                Cancelar
                                            </button>
                                            <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-cerrejon-orange to-red-600 text-white font-bold rounded-lg shadow-md hover:scale-[1.01] transition-all">
                                                {loading ? "Actualizando Registro..." : "Anexar Gesti\u00F3n"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        );
                    })()}

                    {/* MODAL: VER DETALLE COMPLETO (CLIENTE Y COORDINADOR APARTE) */}
                    {viewModalItem && (() => {
                        const d = viewModalItem.parsedData;
                        const allImages = d.ImagenesBase64 || [];
                        const hasImages = allImages.length > 0;
                        const c = d.Coordinador;

                        return (
                            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
                                <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col my-auto relative border-t-8 border-cerrejon-orange">
                                    <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-800">Ficha de Requerimiento de MMHH</h2>
                                            <p className="text-sm font-bold text-cerrejon-orange mt-1">OT: {d.OT} | Flota: {d.Flota}</p>
                                        </div>
                                        <button onClick={() => setViewModalItem(null)} className="text-gray-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-200">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    {/* CONTENIDO EN DOS COLUMNAS INDEPENDIENTES */}
                                    <div className="p-6 overflow-y-auto max-h-[75vh]">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            
                                            {/* PARTE DEL CLIENTE */}
                                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2 flex justify-between items-center">
                                                    <span>Informaci&oacute;n del Cliente</span>
                                                    <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Solicitante</span>
                                                </h3>
                                                
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Fecha Registro</span><span className="font-bold text-gray-800">{d.Fecha}</span></div>
                                                    <div><span className="block text-[10px] text-gray-400 uppercase font-bold">OT</span><span className="font-bold text-cerrejon-orange">{d.OT}</span></div>
                                                    <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Flota / Cantidad</span><span className="font-bold text-gray-800">{d.Flota} ({d.Cantidad || 1})</span></div>
                                                    <div><span className="block text-[10px] text-gray-400 uppercase font-bold">PN / SC</span><span className="font-bold text-gray-800">{d.PN || "N/A"} / {d.SC || "N/A"}</span></div>
                                                </div>

                                                <div className="text-xs pt-1">
                                                    <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Soporte</span>
                                                    <span className="font-extrabold text-gray-800 block">{d.Soporte}</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {(d.TipoRequerimiento || []).map((t, idx) => (
                                                            <span key={idx} className="bg-orange-100 text-cerrejon-orange text-[10px] font-bold px-2 py-0.5 rounded">{t}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="text-xs pt-1">
                                                    <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Detalle del Requerimiento</span>
                                                    <p className="p-3 bg-white rounded border border-gray-100 text-gray-800 whitespace-pre-wrap">{d.DetalleRequerimiento || "Sin detalle"}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                                                    <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Contacto</span><span className="font-medium text-gray-700 block">{d.NombreContacto || "N/A"}</span><span className="text-gray-500 font-medium">{d.Celular ? `Cel: ${d.Celular}` : ""}</span></div>
                                                    <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Recepci&oacute;n</span><span className="font-medium text-gray-700 block">{d.CoordinadorRecibe}</span><span className="text-gray-500 font-medium">{d.AreaEntrega}</span></div>
                                                </div>

                                                {/* EVIDENCIAS CLIENTE */}
                                                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Evidencias de Solicitud</span>
                                                    {hasImages ? (
                                                        <button onClick={() => { setModalImages(allImages); setActiveImageIndex(0); }} className="bg-cerrejon-dark text-white font-bold text-xs px-3 py-1.5 rounded hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
                                                            Ver {allImages.length} Foto(s)
                                                        </button>
                                                    ) : <span className="text-[10px] text-gray-400 italic">Sin evidencias</span>}
                                                </div>
                                            </div>

                                            {/* PARTE DEL COORDINADOR */}
                                            <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-200 space-y-4">
                                                <h3 className="text-sm font-black text-cerrejon-orange uppercase tracking-wider border-b border-orange-200 pb-2 flex justify-between items-center">
                                                    <span>Gesti&oacute;n de Coordinaci&oacute;n</span>
                                                    <span className="text-[10px] bg-cerrejon-orange text-white px-2 py-0.5 rounded">T&eacute;cnico</span>
                                                </h3>
                                                
                                                {c ? (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                                            <div><span className="block text-[10px] text-orange-400 uppercase font-bold">Estado</span><span className="font-bold text-gray-800">{c.Estado}</span></div>
                                                            <div><span className="block text-[10px] text-orange-400 uppercase font-bold">Fecha Estimada</span><span className="font-bold text-gray-800">{c.FechaEstimado}</span></div>
                                                            <div><span className="block text-[10px] text-orange-400 uppercase font-bold">Proceso</span><span className="font-bold text-gray-800">{c.ProcesoRequerido}</span></div>
                                                            <div><span className="block text-[10px] text-orange-400 uppercase font-bold">Subproceso</span><span className="font-bold text-gray-800">{c.SubprocesoRequerido || "N/A"}</span></div>
                                                            <div><span className="block text-[10px] text-orange-400 uppercase font-bold">Equipo</span><span className="font-bold text-gray-800">{c.Equipo}</span></div>
                                                            <div><span className="block text-[10px] text-orange-400 uppercase font-bold">H/H Estimadas</span><span className="font-bold text-gray-800">{c.EstimadoHorasHombre} H/H</span></div>
                                                            <div className="col-span-2"><span className="block text-[10px] text-orange-400 uppercase font-bold">Notificaci\u00F3n Cliente</span><span className="font-bold text-gray-800">{c.NotificacionCliente}</span></div>
                                                        </div>
                                                        
                                                        <div className="text-xs pt-1">
                                                            <span className="block text-[10px] text-orange-400 uppercase font-bold mb-1">Complemento MMHH</span>
                                                            <p className="p-3 bg-white rounded border border-orange-100 text-gray-800 whitespace-pre-wrap">{c.ComplementoMMHH || "Sin complemento ingresado."}</p>
                                                        </div>

                                                        <div className="text-[10px] text-gray-500 pt-2 border-t border-orange-200/50">
                                                            <div>Coordinador: <strong>{c.Nombre}</strong></div>
                                                            <div>Email: {c.Email}</div>
                                                            <div>Fecha de Acci\u00F3n: {c.FechaDiligenciado}</div>
                                                        </div>

                                                        {/* EVIDENCIAS COORDINADOR */}
                                                        <div className="border-t border-orange-200/50 pt-4 flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-orange-400 uppercase">Evidencias de Coordinaci\u00F3n</span>
                                                            {c.ImagenesBase64 && c.ImagenesBase64.length > 0 ? (
                                                                <button onClick={() => { setModalImages(c.ImagenesBase64); setActiveImageIndex(0); }} className="bg-cerrejon-orange text-white font-bold text-xs px-3 py-1.5 rounded hover:bg-orange-600 transition-colors flex items-center gap-1.5">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
                                                                    Ver {c.ImagenesBase64.length} Foto(s)
                                                                </button>
                                                            ) : <span className="text-[10px] text-gray-400 italic">Sin evidencias</span>}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-8 text-center text-xs text-gray-400 italic bg-white/50 rounded-xl border border-orange-100 flex flex-col items-center justify-center min-h-[220px]">
                                                        <svg className="h-8 w-8 text-orange-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                        </svg>
                                                        <span>Pendiente de asignaci&oacute;n por parte del Coordinador.</span>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* MODAL LIGHTBOX DE IMÁGENES */}
                    {modalImages && modalImages.length > 0 && activeImageIndex !== null && (
                        <div className="fixed inset-0 z-[120] flex flex-col bg-black/95 backdrop-blur-md animate-fade-in">
                            <div className="flex justify-between items-center p-4 text-white border-b border-white/10">
                                <div className="font-bold tracking-widest text-sm text-cerrejon-gold uppercase">Archivo: {modalImages[activeImageIndex].name} ({activeImageIndex + 1} de {modalImages.length})</div>
                                <button onClick={() => setModalImages(null)} className="bg-white/10 p-2 rounded-full hover:text-red-500"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="flex-1 flex items-center justify-center p-4 relative">
                                {modalImages.length > 1 && <button onClick={()=>setActiveImageIndex(p=>p===0?modalImages.length-1:p-1)} className="absolute left-4 p-3 bg-black/50 text-white rounded-full"><svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>}
                                <img src={modalImages[activeImageIndex].data} alt="Evidencia Decodificada" className="max-h-full max-w-full object-contain" />
                                {modalImages.length > 1 && <button onClick={()=>setActiveImageIndex(p=>p===modalImages.length-1?0:p+1)} className="absolute right-4 p-3 bg-black/50 text-white rounded-full"><svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button>}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>

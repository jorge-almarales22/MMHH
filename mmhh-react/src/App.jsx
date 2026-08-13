import React, { useState, useEffect, useMemo } from 'react';
import { AUTORIZADOS, ESTADOS_COORDINADOR, ESTADO_SOLICITUD } from './constants';
import {
    initialFormState, initialCoordinatorFormState, nuevoProceso, getCurrentDate,
    generateSolicitudID, compressImage, downloadCSV, getEstadoSolicitud,
    esEstadoCierre, normalizarComentarios, totalHorasHombre
} from './utils/helpers';
import { medirTolerancia } from './utils/tolerancia';
import { authenticateUser, fetchItems, createItem, updateCoordinatorData } from './utils/sharepointApi';
import Header from './components/Header';
import TabCliente from './components/TabCliente';
import TabCoordinador, { coordFilterVacio } from './components/TabCoordinador';
import TabBaseDatos, { dbFilterVacio } from './components/TabBaseDatos';
import ModalGestionCoord from './components/ModalGestionCoord';
import ModalDetalle from './components/ModalDetalle';
import ModalImagenes from './components/ModalImagenes';
import ModalExito from './components/ModalExito';
import { dial } from './ui';

/** Filtros compartidos por Coordinación y Base de Datos. */
const aplicaFiltros = (items, f) => {
    // Sin filtros se muestra todo, incluidos los registros con JSON dañado:
    // esconderlos haría que un dato corrupto pasara inadvertido.
    const hayFiltros = Object.entries(f).some(([k, v]) => k !== 'state' && v);
    if (!hayFiltros) return items;

    let out = items.filter(i => !i.parsedData.Error);

    if (f.search) {
        const s = f.search.toLowerCase();
        out = out.filter(({ parsedData: d }) =>
            [d.SolicitudID, d.OT, d.NombreComponente, d.Flota, d.Soporte, d.PN, d.SC,
            d.NombreContacto, d.CoordinadorRecibe, d.AreaEntrega, d.Superintendencia]
                .some(v => String(v || "").toLowerCase().includes(s)));
    }

    if (f.estadoSolicitud) out = out.filter(i => getEstadoSolicitud(i.parsedData) === f.estadoSolicitud);
    if (f.estadoComponente) out = out.filter(i => i.parsedData.Coordinador?.Estado === f.estadoComponente);
    if (f.prioridad) out = out.filter(i => i.parsedData.Prioridad === f.prioridad);
    if (f.prioridadCoordinador) out = out.filter(i => i.parsedData.Coordinador?.PrioridadCoordinador === f.prioridadCoordinador);
    if (f.areaProceso) out = out.filter(i => (i.parsedData.Coordinador?.Procesos || []).some(p => p.AreaProceso === f.areaProceso));
    if (f.superintendencia) out = out.filter(i => i.parsedData.Superintendencia === f.superintendencia);
    if (f.flota) out = out.filter(i => i.parsedData.Flota === f.flota);
    if (f.coordinadorRecibe) out = out.filter(i => i.parsedData.CoordinadorRecibe === f.coordinadorRecibe);
    if (f.areaEntrega) out = out.filter(i => i.parsedData.AreaEntrega === f.areaEntrega);
    if (f.fechaDesde) out = out.filter(i => (i.parsedData.Fecha || "") >= f.fechaDesde);
    if (f.fechaHasta) out = out.filter(i => (i.parsedData.Fecha || "") <= f.fechaHasta);

    return out;
};

const calcularResumen = (items) => {
    let pendientes = 0, enProceso = 0, entregadas = 0, fuera = 0, horas = 0;
    items.forEach(({ parsedData: d }) => {
        if (d.Error) return;
        const cerrada = esEstadoCierre(d.Coordinador?.Estado);
        if (getEstadoSolicitud(d) === ESTADO_SOLICITUD.PENDIENTE) pendientes++;
        if (cerrada) entregadas++;
        else enProceso++;
        const t = medirTolerancia(d);
        if (t && t.estado === 'fuera') fuera++;
        horas += totalHorasHombre(d.Coordinador);
    });
    return { total: items.length, pendientes, enProceso, entregadas, fuera, horas: Math.round(horas) };
};

/** Reparto de la cola abierta por estado de plazo, para la banda del encabezado. */
const calcularBanda = (items) => {
    let dentro = 0, limite = 0, fuera = 0, cerradas = 0;
    items.forEach(({ parsedData: d }) => {
        if (d.Error) return;
        if (esEstadoCierre(d.Coordinador?.Estado)) { cerradas++; return; }
        const t = medirTolerancia(d);
        if (!t) { dentro++; return; }
        if (t.estado === 'fuera') fuera++;
        else if (t.estado === 'limite') limite++;
        else dentro++;
    });
    return { dentro, limite, fuera, cerradas };
};

export default function App() {
    const [formData, setFormData] = useState(initialFormState);
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('cliente');
    const [dbFilter, setDbFilter] = useState(dbFilterVacio);
    const [coordFilter, setCoordFilter] = useState(coordFilterVacio);
    const [exito, setExito] = useState(null);

    const [userAuth, setUserAuth] = useState({ authenticated: false, name: "Cargando...", email: "", isCoordinator: false });
    const [viewModalItem, setViewModalItem] = useState(null);
    const [manageModalItem, setManageModalItem] = useState(null);
    const [coordForm, setCoordForm] = useState(initialCoordinatorFormState);
    const [coordEvidenceFiles, setCoordEvidenceFiles] = useState([]);
    const [modalImages, setModalImages] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => { initApp(); }, []);

    const initApp = async () => {
        const user = await authenticateUser();
        const email = (user.email || "").toLowerCase().trim();
        const isCoord = AUTORIZADOS.map(e => e.toLowerCase()).includes(email);
        setUserAuth({ ...user, isCoordinator: isCoord });
        if (isCoord) setActiveTab('coordinador');
        loadItems();
    };

    const loadItems = async () => {
        setLoading(true);
        try { setItems(await fetchItems()); }
        catch (err) { setError("No se pudo leer la base de datos de SharePoint. " + err.message); }
        finally { setLoading(false); }
    };

    const validos = useMemo(() => items.filter(i => !i.parsedData.Error), [items]);
    const banda = useMemo(() => calcularBanda(validos), [validos]);

    const dbItems = useMemo(() => aplicaFiltros(items, dbFilter), [items, dbFilter]);
    const dbResumen = useMemo(() => calcularResumen(dbItems), [dbItems]);

    const coordBase = useMemo(() => aplicaFiltros(items, coordFilter), [items, coordFilter]);

    const porSegmento = useMemo(() => {
        const abierta = (d) => !esEstadoCierre(d.Coordinador?.Estado);
        return {
            todos: (x) => true,
            no_gestionado: (d) => getEstadoSolicitud(d) === ESTADO_SOLICITUD.PENDIENTE,
            en_proceso: (d) => getEstadoSolicitud(d) === ESTADO_SOLICITUD.GESTIONADO && abierta(d),
            vencidas: (d) => abierta(d) && medirTolerancia(d)?.estado === 'fuera',
            entregados: (d) => esEstadoCierre(d.Coordinador?.Estado)
        };
    }, []);

    const conteos = useMemo(() => {
        const c = {};
        Object.entries(porSegmento).forEach(([k, test]) => {
            c[k] = coordBase.filter(i => !i.parsedData.Error && test(i.parsedData)).length;
        });
        return c;
    }, [coordBase, porSegmento]);

    const coordItems = useMemo(() => {
        const test = porSegmento[coordFilter.state] || porSegmento.todos;
        if (coordFilter.state === 'todos') return coordBase;
        return coordBase.filter(i => !i.parsedData.Error && test(i.parsedData));
    }, [coordBase, coordFilter.state, porSegmento]);

    const avisar = (msg) => { setError(msg); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const handleSubmitCliente = async (e) => {
        e.preventDefault();
        if (!formData.OT || formData.OT.length !== 8) return avisar("La OT necesita exactamente 8 caracteres.");
        if (formData.TipoRequerimiento.length === 0) return avisar("Marque al menos un tipo de requerimiento.");

        setLoading(true);
        setError(null);
        const idsExistentes = items.map(i => i.parsedData?.SolicitudID).filter(Boolean);
        const ot = formData.OT, componente = formData.NombreComponente;

        try {
            const id = await createItem(formData, evidenceFiles, compressImage, generateSolicitudID, idsExistentes);
            setFormData(initialFormState);
            setEvidenceFiles([]);
            await loadItems();
            setExito({ id, ot, componente });
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleOpenManageModal = (item) => {
        setError(null);
        setManageModalItem(item);
        const c = item.parsedData?.Coordinador;

        if (c) {
            const previos = (c.Procesos && c.Procesos.length > 0)
                ? c.Procesos
                : [{ ProcesoRequerido: c.ProcesoRequerido || "Ensayo No destructivo", SubprocesoRequerido: c.SubprocesoRequerido || "" }];

            setCoordForm({
                // Los procesos históricos no traían área ni horas: se completan con el default.
                Procesos: previos.map(p => ({ ...nuevoProceso(), ...p })),
                ComplementoMMHH: c.ComplementoMMHH || "",
                Estado: ESTADOS_COORDINADOR.includes(c.Estado) ? c.Estado : "En espera",
                PrioridadCoordinador: c.PrioridadCoordinador || item.parsedData.Prioridad || "P0",
                FechaEstimado: c.FechaEstimado || getCurrentDate(),
                NotificacionCliente: c.NotificacionCliente || "No",
                Demoras: c.Demoras || [],
                Comentarios: normalizarComentarios(c),
                NuevoComentario: "",
                ComentarioCierre: ""
            });
        } else {
            setCoordForm({
                ...initialCoordinatorFormState,
                Procesos: [nuevoProceso()],
                PrioridadCoordinador: item.parsedData?.Prioridad || "P0",
                Comentarios: []
            });
        }
        setCoordEvidenceFiles([]);
    };

    const handleSaveCoordResponse = async (e) => {
        e.preventDefault();
        const yaCerrada = (coordForm.Comentarios || []).some(c => c.EsCierre);
        if (esEstadoCierre(coordForm.Estado) && !yaCerrada && !coordForm.ComentarioCierre.trim()) {
            return setError(`Para dejar el componente en "${coordForm.Estado}" falta el comentario de cierre.`);
        }

        setLoading(true);
        setError(null);
        try {
            await updateCoordinatorData(manageModalItem, coordForm, coordEvidenceFiles, userAuth, compressImage, getCurrentDate);
            setManageModalItem(null);
            setCoordEvidenceFiles([]);
            await loadItems();
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const tabs = [
        { key: 'cliente', label: 'Cliente' },
        ...(userAuth.isCoordinator ? [{ key: 'coordinador', label: 'Coordinación' }] : []),
        { key: 'basedatos', label: 'Base de datos' }
    ];

    return (
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-3 py-4 sm:px-5 sm:py-6">
            <Header userAuth={userAuth} banda={banda} />

            {error && (
                <div className="flex items-start gap-3 border-l-2 border-alarm bg-alarm-wash px-4 py-3">
                    <svg className="mt-px h-4 w-4 shrink-0 text-alarm" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <circle cx="10" cy="10" r="7.5" /><path d="M10 6v5M10 13.5v.5" strokeLinecap="square" />
                    </svg>
                    <p className="flex-1 text-[13px] font-medium leading-relaxed text-alarm">{error}</p>
                    <button onClick={() => setError(null)} aria-label="Cerrar aviso" className="shrink-0 rounded-[3px] p-1 text-alarm/60 transition-colors hover:bg-white hover:text-alarm">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square"><path d="M5 5l10 10M15 5L5 15" /></svg>
                    </button>
                </div>
            )}

            <nav className="no-print flex gap-px overflow-hidden border border-iron-300 bg-iron-300">
                {tabs.map(t => (
                    <button
                        key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`dial flex-1 px-5 py-3 text-[11px] transition-colors ${activeTab === t.key
                            ? 'bg-dye text-white'
                            : 'bg-white text-iron-500 hover:bg-iron-50 hover:text-iron-900'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            {activeTab === 'cliente' && (
                <TabCliente
                    formData={formData} setFormData={setFormData}
                    evidenceFiles={evidenceFiles} loading={loading}
                    onFileChange={(e) => setEvidenceFiles(Array.from(e.target.files))}
                    onSubmit={handleSubmitCliente}
                />
            )}

            {activeTab === 'coordinador' && userAuth.isCoordinator && (
                <TabCoordinador
                    coordFilter={coordFilter} setCoordFilter={setCoordFilter}
                    items={coordItems} conteos={conteos}
                    onViewDetails={setViewModalItem} onOpenManageModal={handleOpenManageModal}
                />
            )}

            {activeTab === 'basedatos' && (
                <TabBaseDatos
                    dbFilter={dbFilter} setDbFilter={setDbFilter}
                    items={dbItems} resumen={dbResumen}
                    onDownloadCSV={() => downloadCSV(dbItems)}
                    onViewDetails={setViewModalItem} onOpenManageModal={handleOpenManageModal}
                    userAuth={userAuth}
                />
            )}

            <footer className={`${dial} no-print mt-auto pt-2 text-center !text-[9px] text-iron-400`}>
                Cerrejón SGIA · Máquinas y Herramientas
            </footer>

            <ModalGestionCoord
                manageModalItem={manageModalItem} setManageModalItem={setManageModalItem}
                coordForm={coordForm} setCoordForm={setCoordForm}
                coordEvidenceFiles={coordEvidenceFiles} setCoordEvidenceFiles={setCoordEvidenceFiles}
                loading={loading} error={error} userAuth={userAuth}
                onSaveCoordResponse={handleSaveCoordResponse}
            />

            <ModalDetalle
                viewModalItem={viewModalItem} setViewModalItem={setViewModalItem}
                setModalImages={setModalImages} setActiveImageIndex={setActiveImageIndex}
            />

            <ModalImagenes
                modalImages={modalImages} setModalImages={setModalImages}
                activeImageIndex={activeImageIndex} setActiveImageIndex={setActiveImageIndex}
            />

            <ModalExito data={exito} onClose={() => setExito(null)} />
        </div>
    );
}

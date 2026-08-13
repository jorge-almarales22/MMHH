import React, { useState, useEffect, useMemo } from 'react';
import { AUTORIZADOS, ESTADOS_COORDINADOR, ESTADO_SOLICITUD } from './constants';
import {
    initialFormState, initialCoordinatorFormState, nuevoProceso, getCurrentDate,
    generateSolicitudID, compressImage, downloadCSV, getEstadoSolicitud,
    esEstadoCierre, normalizarComentarios, totalHorasHombre, prioridadRank,
    getPrioridadEfectiva
} from './utils/helpers';
import { authenticateUser, fetchItems, createItem, updateCoordinatorData } from './utils/sharepointApi';
import Header from './components/Header';
import TabCliente from './components/TabCliente';
import TabCoordinador, { coordFilterVacio } from './components/TabCoordinador';
import TabBaseDatos, { dbFilterVacio } from './components/TabBaseDatos';
import ModalGestionCoord from './components/ModalGestionCoord';
import ModalDetalle from './components/ModalDetalle';
import ModalImagenes from './components/ModalImagenes';
import ModalExito from './components/ModalExito';

/** Filtros compartidos por los modulos Coordinador y Base de Datos. */
const aplicaFiltros = (items, f) => {
    // Sin filtros activos se muestra todo, incluidos los registros con JSON corrupto:
    // esconderlos haria que un dato dañado pasara inadvertido.
    const hayFiltros = Object.entries(f).some(([k, v]) => k !== 'state' && v);
    if (!hayFiltros) return items;

    let out = items.filter(item => !item.parsedData.Error);

    if (f.search) {
        const s = f.search.toLowerCase();
        out = out.filter(item => {
            const d = item.parsedData;
            return [d.SolicitudID, d.OT, d.NombreComponente, d.Flota, d.Soporte, d.PN, d.SC,
            d.NombreContacto, d.CoordinadorRecibe, d.AreaEntrega, d.Superintendencia]
                .some(v => String(v || "").toLowerCase().includes(s));
        });
    }

    if (f.estadoSolicitud) out = out.filter(item => getEstadoSolicitud(item.parsedData) === f.estadoSolicitud);
    if (f.estadoComponente) out = out.filter(item => item.parsedData.Coordinador?.Estado === f.estadoComponente);
    if (f.prioridad) out = out.filter(item => item.parsedData.Prioridad === f.prioridad);
    if (f.prioridadCoordinador) out = out.filter(item => item.parsedData.Coordinador?.PrioridadCoordinador === f.prioridadCoordinador);
    if (f.areaProceso) {
        out = out.filter(item => (item.parsedData.Coordinador?.Procesos || []).some(p => p.AreaProceso === f.areaProceso));
    }
    if (f.superintendencia) out = out.filter(item => item.parsedData.Superintendencia === f.superintendencia);
    if (f.flota) out = out.filter(item => item.parsedData.Flota === f.flota);
    if (f.coordinadorRecibe) out = out.filter(item => item.parsedData.CoordinadorRecibe === f.coordinadorRecibe);
    if (f.areaEntrega) out = out.filter(item => item.parsedData.AreaEntrega === f.areaEntrega);
    if (f.fechaDesde) out = out.filter(item => (item.parsedData.Fecha || "") >= f.fechaDesde);
    if (f.fechaHasta) out = out.filter(item => (item.parsedData.Fecha || "") <= f.fechaHasta);

    return out;
};

const calcularResumen = (items) => {
    let pendientes = 0, enProceso = 0, entregadas = 0, criticas = 0, horas = 0;
    items.forEach(item => {
        const d = item.parsedData;
        if (d.Error) return;
        const estadoSol = getEstadoSolicitud(d);
        const estadoComp = d.Coordinador?.Estado;
        if (estadoSol === ESTADO_SOLICITUD.PENDIENTE) pendientes++;
        if (esEstadoCierre(estadoComp)) entregadas++;
        else if (estadoSol === ESTADO_SOLICITUD.GESTIONADO) enProceso++;
        if (prioridadRank(getPrioridadEfectiva(d)) <= 2) criticas++;
        horas += totalHorasHombre(d.Coordinador);
    });
    return { total: items.length, pendientes, enProceso, entregadas, criticas, horas: Math.round(horas) };
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

    const [userAuth, setUserAuth] = useState({
        authenticated: false,
        name: "Cargando usuario...",
        email: "",
        isCoordinator: false
    });

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
        try {
            setItems(await fetchItems());
        } catch (err) {
            setError("No se cargó la base de datos de SharePoint: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const dbItems = useMemo(() => aplicaFiltros(items, dbFilter), [items, dbFilter]);
    const dbResumen = useMemo(() => calcularResumen(dbItems), [dbItems]);
    const resumenGlobal = useMemo(() => calcularResumen(items.filter(i => !i.parsedData.Error)), [items]);

    const coordItems = useMemo(() => {
        let out = aplicaFiltros(items, coordFilter);
        if (coordFilter.state === 'no_gestionado') {
            out = out.filter(i => getEstadoSolicitud(i.parsedData) === ESTADO_SOLICITUD.PENDIENTE);
        } else if (coordFilter.state === 'entregados') {
            out = out.filter(i => esEstadoCierre(i.parsedData.Coordinador?.Estado));
        } else if (coordFilter.state === 'en_proceso') {
            out = out.filter(i =>
                getEstadoSolicitud(i.parsedData) === ESTADO_SOLICITUD.GESTIONADO &&
                !esEstadoCierre(i.parsedData.Coordinador?.Estado)
            );
        }
        return out;
    }, [items, coordFilter]);

    const handleFileChange = (e) => setEvidenceFiles(Array.from(e.target.files));

    // El aviso vive al tope de la pagina; si el formulario esta desplazado hay que subir.
    const avisar = (msg) => {
        setError(msg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmitCliente = async (e) => {
        e.preventDefault();
        if (!formData.OT || formData.OT.length !== 8) return avisar("La OT debe tener exactamente 8 caracteres.");
        if (formData.TipoRequerimiento.length === 0) return avisar("Seleccione al menos un tipo de requerimiento.");

        setLoading(true);
        setError(null);

        const idsExistentes = items.map(i => i.parsedData?.SolicitudID).filter(Boolean);
        const otEnviada = formData.OT;
        const componenteEnviado = formData.NombreComponente;

        try {
            const solicitudID = await createItem(formData, evidenceFiles, compressImage, generateSolicitudID, idsExistentes);
            setFormData(initialFormState);
            setEvidenceFiles([]);
            await loadItems();
            setExito({ id: solicitudID, ot: otEnviada, componente: componenteEnviado });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenManageModal = (item) => {
        setError(null);
        setManageModalItem(item);
        const c = item.parsedData?.Coordinador;

        if (c) {
            const procesosPrevios = (c.Procesos && c.Procesos.length > 0)
                ? c.Procesos
                : [{ ProcesoRequerido: c.ProcesoRequerido || "Ensayo No destructivo", SubprocesoRequerido: c.SubprocesoRequerido || "" }];

            setCoordForm({
                // Los procesos historicos no traían área ni horas: se completan con el default.
                Procesos: procesosPrevios.map(p => ({ ...nuevoProceso(), ...p })),
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

        const yaTieneCierre = (coordForm.Comentarios || []).some(c => c.EsCierre);
        if (esEstadoCierre(coordForm.Estado) && !yaTieneCierre && !coordForm.ComentarioCierre.trim()) {
            return setError(`Para dejar el componente en "${coordForm.Estado}" debe registrar el comentario de cierre.`);
        }

        setLoading(true);
        setError(null);
        try {
            await updateCoordinatorData(manageModalItem, coordForm, coordEvidenceFiles, userAuth, compressImage, getCurrentDate);
            setManageModalItem(null);
            setCoordEvidenceFiles([]);
            await loadItems();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'cliente', label: 'Cliente' },
        ...(userAuth.isCoordinator ? [{ key: 'coordinador', label: 'Coordinador' }] : []),
        { key: 'basedatos', label: 'Base de Datos' }
    ];

    return (
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
            <Header userAuth={userAuth} resumen={resumenGlobal} />

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-9 4a1 1 0 112 0 1 1 0 01-2 0zm1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="flex-1 text-[13px] font-medium leading-relaxed text-red-800">{error}</p>
                    <button onClick={() => setError(null)} className="shrink-0 rounded p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-700" aria-label="Cerrar aviso">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

            <nav className="no-print flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                {tabs.map(t => (
                    <button
                        key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`flex-1 rounded-lg px-5 py-2.5 text-[13px] font-semibold transition-colors ${activeTab === t.key
                            ? 'bg-cerrejon-dark text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            {activeTab === 'cliente' && (
                <TabCliente
                    formData={formData}
                    setFormData={setFormData}
                    evidenceFiles={evidenceFiles}
                    setEvidenceFiles={setEvidenceFiles}
                    loading={loading}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmitCliente}
                />
            )}

            {activeTab === 'coordinador' && userAuth.isCoordinator && (
                <TabCoordinador
                    coordFilter={coordFilter}
                    setCoordFilter={setCoordFilter}
                    items={coordItems}
                    onViewDetails={setViewModalItem}
                    onOpenManageModal={handleOpenManageModal}
                />
            )}

            {activeTab === 'basedatos' && (
                <TabBaseDatos
                    dbFilter={dbFilter}
                    setDbFilter={setDbFilter}
                    items={dbItems}
                    resumen={dbResumen}
                    onDownloadCSV={() => downloadCSV(dbItems)}
                    onViewDetails={setViewModalItem}
                    onOpenManageModal={handleOpenManageModal}
                    userAuth={userAuth}
                />
            )}

            <footer className="no-print pb-2 pt-2 text-center text-[11px] text-slate-400">
                Cerrejón SGIA · Máquinas y Herramientas · Sistema de gestión de requerimientos
            </footer>

            <ModalGestionCoord
                manageModalItem={manageModalItem}
                setManageModalItem={setManageModalItem}
                coordForm={coordForm}
                setCoordForm={setCoordForm}
                coordEvidenceFiles={coordEvidenceFiles}
                setCoordEvidenceFiles={setCoordEvidenceFiles}
                loading={loading}
                error={error}
                userAuth={userAuth}
                onSaveCoordResponse={handleSaveCoordResponse}
            />

            <ModalDetalle
                viewModalItem={viewModalItem}
                setViewModalItem={setViewModalItem}
                setModalImages={setModalImages}
                setActiveImageIndex={setActiveImageIndex}
            />

            <ModalImagenes
                modalImages={modalImages}
                setModalImages={setModalImages}
                activeImageIndex={activeImageIndex}
                setActiveImageIndex={setActiveImageIndex}
            />

            <ModalExito data={exito} onClose={() => setExito(null)} />
        </div>
    );
}

import React, { useState, useEffect, useMemo } from 'react';
import { AUTORIZADOS, ESTADOS_COORDINADOR, ESTADO_SOLICITUD } from './constants';
import {
    initialFormState, initialCoordinatorFormState, nuevoProceso, normalizarProceso, getCurrentDate,
    generateSolicitudID, compressImage, downloadCSV, getEstadoSolicitud,
    esEstadoCierre, normalizarComentarios, totalHorasHombre, getTrabajos, resumirTrabajos, comentariosCliente
} from './utils/helpers';
import { medirTolerancia } from './utils/tolerancia';
import { authenticateUser, fetchItems, createItem, updateCoordinatorData, appendClientComment } from './utils/sharepointApi';
import Navbar from './components/Navbar';
import TabCliente from './components/TabCliente';
import TabCoordinador, { coordFilterVacio } from './components/TabCoordinador';
import TabBaseDatos, { dbFilterVacio } from './components/TabBaseDatos';
import ModalGestionCoord from './components/ModalGestionCoord';
import ModalDetalle from './components/ModalDetalle';
import ModalImagenes from './components/ModalImagenes';
import ModalExito from './components/ModalExito';

/** Filtros compartidos por Coordinación y Base de datos. */
const aplicaFiltros = (items, f) => {
    // Sin filtros se muestra todo, incluidos los registros con JSON dañado:
    // esconderlos haría que un dato corrupto pasara inadvertido.
    const hayFiltros = Object.entries(f).some(([k, v]) => k !== 'state' && v);
    if (!hayFiltros) return items;

    let out = items.filter(i => !i.parsedData.Error);

    if (f.search) {
        const s = f.search.toLowerCase();
        out = out.filter(({ parsedData: d }) =>
            [d.SolicitudID, d.OT, d.NombreComponente, d.Flota, resumirTrabajos(d), d.PN, d.SC,
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

export default function App() {
    const [formData, setFormData] = useState(initialFormState);
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cargandoUsuario, setCargandoUsuario] = useState(true);
    const [error, setError] = useState(null);
    const [vista, setVista] = useState('cliente');
    const [dbFilter, setDbFilter] = useState(dbFilterVacio);
    const [coordFilter, setCoordFilter] = useState(coordFilterVacio);
    const [exito, setExito] = useState(null);

    const [userAuth, setUserAuth] = useState({ authenticated: false, name: "", email: "", isCoordinator: false });
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
        setCargandoUsuario(false);
        if (isCoord) setVista('coordinador');
        loadItems();
    };

    const loadItems = async () => {
        setLoading(true);
        try { setItems(await fetchItems()); }
        catch (err) { setError("No se pudo leer la base de datos de SharePoint. " + err.message); }
        finally { setLoading(false); }
    };

    const dbItems = useMemo(() => aplicaFiltros(items, dbFilter), [items, dbFilter]);
    const dbResumen = useMemo(() => calcularResumen(dbItems), [dbItems]);
    const coordBase = useMemo(() => aplicaFiltros(items, coordFilter), [items, coordFilter]);

    const porSegmento = useMemo(() => {
        const abierta = (d) => !esEstadoCierre(d.Coordinador?.Estado);
        return {
            todos: () => true,
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
        if (coordFilter.state === 'todos') return coordBase;
        const test = porSegmento[coordFilter.state] || porSegmento.todos;
        return coordBase.filter(i => !i.parsedData.Error && test(i.parsedData));
    }, [coordBase, coordFilter.state, porSegmento]);

    const handleSubmitCliente = async (e) => {
        e.preventDefault();
        if (!formData.OT || formData.OT.length !== 8) return setError("La OT necesita exactamente 8 caracteres.");

        const trabajos = formData.Trabajos || [];
        if (trabajos.length === 0) return setError("Agrega al menos un trabajo requerido.");
        const incompleto = trabajos.findIndex(t => !t.Soporte || !String(t.TipoRequerimiento || "").trim());
        if (incompleto !== -1) return setError(`Al trabajo ${incompleto + 1} le falta el soporte o el tipo de requerimiento.`);

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

    /**
     * Comentario del cliente sobre una solicitud abierta.
     *
     * Se guarda de inmediato —el detalle no tiene boton de guardar— y el hilo en
     * pantalla se actualiza sin esperar a la recarga para que quien escribe vea
     * su comentario en el acto. El error se propaga: lo pinta el propio modal.
     */
    const handleAddClientComment = async (texto) => {
        const comentario = await appendClientComment(viewModalItem, texto, userAuth);
        setViewModalItem(prev => prev && ({
            ...prev,
            parsedData: {
                ...prev.parsedData,
                ComentariosCliente: [...comentariosCliente(prev.parsedData), comentario]
            }
        }));
        loadItems();
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
                // Los procesos históricos no traían área, horas reales ni comentarios:
                // normalizarProceso los completa para no romper los controles del formulario.
                Procesos: previos.map(normalizarProceso),
                Trabajos: getTrabajos(item.parsedData),
                ComplementoMMHH: c.ComplementoMMHH || "",
                Estado: ESTADOS_COORDINADOR.includes(c.Estado) ? c.Estado : "En espera",
                PrioridadCoordinador: c.PrioridadCoordinador || item.parsedData.Prioridad || "P0",
                FechaEstimado: c.FechaEstimado || getCurrentDate(),
                NotificacionCliente: c.NotificacionCliente || "No",
                Demoras: c.Demoras || [],
                Comentarios: normalizarComentarios(c),
                ComentarioCierre: ""
            });
        } else {
            setCoordForm({
                ...initialCoordinatorFormState,
                Procesos: [nuevoProceso()],
                Trabajos: getTrabajos(item.parsedData),
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

    if (cargandoUsuario) {
        return (
            <div className="min-h-full grid place-items-center bg-slate-50 text-slate-600">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-4 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-semibold">Autenticando con Microsoft 365...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'cliente', label: 'Nueva solicitud', corto: 'Solicitar' },
        ...(userAuth.isCoordinator ? [{ id: 'coordinador', label: 'Gestión de solicitudes', corto: 'Gestión' }] : []),
        { id: 'basedatos', label: 'Base de datos', corto: 'Datos' }
    ];

    return (
        <div className="min-h-full bg-slate-50 flex flex-col">
            <Navbar
                usuario={userAuth}
                vista={vista}
                onVista={setVista}
                tabs={tabs}
                modoDemo={!userAuth.authenticated}
            />

            <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                {error && vista !== 'cliente' && (
                    <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                        <span aria-hidden="true">⚠</span>
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="font-bold text-red-500 hover:text-red-800 cursor-pointer" aria-label="Cerrar aviso">×</button>
                    </div>
                )}

                {vista === 'cliente' && (
                    <TabCliente
                        formData={formData} setFormData={setFormData}
                        evidenceFiles={evidenceFiles} loading={loading} error={error}
                        onFileChange={(e) => setEvidenceFiles(Array.from(e.target.files))}
                        onSubmit={handleSubmitCliente}
                        onLimpiar={() => { setFormData(initialFormState); setEvidenceFiles([]); setError(null); }}
                    />
                )}

                {vista === 'coordinador' && userAuth.isCoordinator && (
                    <TabCoordinador
                        coordFilter={coordFilter} setCoordFilter={setCoordFilter}
                        items={coordItems} conteos={conteos}
                        onViewDetails={setViewModalItem} onOpenManageModal={handleOpenManageModal}
                    />
                )}

                {vista === 'basedatos' && (
                    <TabBaseDatos
                        dbFilter={dbFilter} setDbFilter={setDbFilter}
                        items={dbItems} resumen={dbResumen}
                        onDownloadCSV={() => downloadCSV(dbItems)}
                        onViewDetails={setViewModalItem} onOpenManageModal={handleOpenManageModal}
                        userAuth={userAuth}
                    />
                )}
            </main>

            <footer className="text-center text-xs text-slate-400 py-4 px-4">
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
                userAuth={userAuth} onAddComment={handleAddClientComment}
            />

            <ModalImagenes
                modalImages={modalImages} setModalImages={setModalImages}
                activeImageIndex={activeImageIndex} setActiveImageIndex={setActiveImageIndex}
            />

            <ModalExito data={exito} onClose={() => setExito(null)} />
        </div>
    );
}

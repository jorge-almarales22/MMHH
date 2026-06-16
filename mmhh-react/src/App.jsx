import React, { useState, useEffect } from 'react';
import { AUTORIZADOS } from './constants';
import { initialFormState, initialCoordinatorFormState, getCurrentDate, generateSolicitudID, compressImage, downloadCSV } from './utils/helpers';
import { authenticateUser, fetchItems, createItem, updateCoordinatorData } from './utils/sharepointApi';
import Header from './components/Header';
import TabCliente from './components/TabCliente';
import TabCoordinador from './components/TabCoordinador';
import TabBaseDatos from './components/TabBaseDatos';
import ModalGestionCoord from './components/ModalGestionCoord';
import ModalDetalle from './components/ModalDetalle';
import ModalImagenes from './components/ModalImagenes';

export default function App() {
    const [formData, setFormData] = useState(initialFormState);
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('cliente');
    const [dbFilter, setDbFilter] = useState({ search: '', estado: 'todos', fechaDesde: '', fechaHasta: '', prioridad: '', superintendencia: '', flota: '', coordinadorRecibe: '', areaEntrega: '' });
    const [coordFilter, setCoordFilter] = useState({ state: 'todos', search: '', superintendencia: '', prioridad: '', flota: '', coordinadorRecibe: '', areaEntrega: '', fechaDesde: '', fechaHasta: '' });

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

    useEffect(() => {
        initApp();
    }, []);

    const initApp = async () => {
        const user = await authenticateUser();
        const email = (user.email || "").toLowerCase().trim();
        const isCoord = AUTORIZADOS.map(e => e.toLowerCase()).includes(email);
        setUserAuth({
            ...user,
            isCoordinator: isCoord
        });
        if (isCoord) setActiveTab('coordinador');
        loadItems();
    };

    const loadItems = async () => {
        setLoading(true);
        try {
            const parsed = await fetchItems();
            setItems(parsed);
        } catch (err) {
            setError("No se cargo la base de datos de SharePoint: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setEvidenceFiles(Array.from(e.target.files));
    };

    const handleSubmitCliente = async (e) => {
        e.preventDefault();
        if (!formData.OT || formData.OT.length !== 8) return alert("La OT debe tener exactamente 8 caracteres.");
        if (formData.TipoRequerimiento.length === 0) return alert("Seleccione al menos un Tipo de Requerimiento.");

        setLoading(true);
        setError(null);

        try {
            const solicitudID = await createItem(formData, evidenceFiles, compressImage, generateSolicitudID);
            setFormData(initialFormState);
            setEvidenceFiles([]);
            await loadItems();
            alert("Solicitud guardada con ID: " + solicitudID);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenManageModal = (item) => {
        setManageModalItem(item);
        if (item.parsedData && item.parsedData.Coordinador) {
            const c = item.parsedData.Coordinador;
            setCoordForm({
                Procesos: (c.Procesos && c.Procesos.length > 0) ? c.Procesos : [{ ProcesoRequerido: c.ProcesoRequerido || "Ensayo No destructivo", ProcesoRequeridoCustom: c.ProcesoRequeridoCustom || "", SubprocesoRequerido: c.SubprocesoRequerido || "", SubprocesoRequeridoCustom: c.SubprocesoRequeridoCustom || "" }],
                ComplementoMMHH: c.ComplementoMMHH || "",
                Equipo: c.Equipo || "Bru\u00F1idora",
                Estado: c.Estado || "No gestionado",
                EstimadoHorasHombre: c.EstimadoHorasHombre || 0,
                FechaEstimado: c.FechaEstimado || getCurrentDate(),
                NotificacionCliente: c.NotificacionCliente || "No",
                Demoras: c.Demoras || [],
                Comentario: c.Comentario || ""
            });
        } else {
            setCoordForm(initialCoordinatorFormState);
        }
        setCoordEvidenceFiles([]);
    };

    const handleSaveCoordResponse = async (e) => {
        e.preventDefault();
        if (coordForm.Estado === "Entregado" && !coordForm.Comentario.trim()) {
            return alert("Debe dejar un comentario obligatorio cuando la solicitud pasa a estado 'Entregado'.");
        }
        setLoading(true);
        setError(null);
        try {
            await updateCoordinatorData(manageModalItem, coordForm, coordEvidenceFiles, userAuth, compressImage, getCurrentDate);
            setManageModalItem(null);
            setCoordEvidenceFiles([]);
            await loadItems();
            alert("Gesti\u00F3n del Coordinador guardada correctamente.");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredItems = () => {
        let filtered = [...items];

        if (dbFilter.search) {
            const s = dbFilter.search.toLowerCase();
            filtered = filtered.filter(item => {
                const d = item.parsedData;
                if (d.Error) return false;
                return (d.SolicitudID || "").toLowerCase().includes(s) ||
                    (d.OT || "").toLowerCase().includes(s) ||
                    (d.NombreComponente || "").toLowerCase().includes(s) ||
                    (d.Flota || "").toLowerCase().includes(s) ||
                    (d.Soporte || "").toLowerCase().includes(s) ||
                    (d.PN || "").toLowerCase().includes(s) ||
                    (d.NombreContacto || "").toLowerCase().includes(s) ||
                    (d.CoordinadorRecibe || "").toLowerCase().includes(s) ||
                    (d.Superintendencia || "").toLowerCase().includes(s);
            });
        }

        if (dbFilter.estado !== 'todos') {
            filtered = filtered.filter(item => {
                const d = item.parsedData;
                if (d.Error) return false;
                if (dbFilter.estado === 'sin_asignar') return !d.Coordinador;
                if (dbFilter.estado === 'gestionado') return !!d.Coordinador;
                return d.Coordinador && d.Coordinador.Estado === dbFilter.estado;
            });
        }

        if (dbFilter.fechaDesde) filtered = filtered.filter(item => item.parsedData.Fecha >= dbFilter.fechaDesde);
        if (dbFilter.fechaHasta) filtered = filtered.filter(item => item.parsedData.Fecha <= dbFilter.fechaHasta);
        if (dbFilter.prioridad) filtered = filtered.filter(item => item.parsedData.Prioridad === dbFilter.prioridad);
        if (dbFilter.superintendencia) filtered = filtered.filter(item => item.parsedData.Superintendencia === dbFilter.superintendencia);
        if (dbFilter.flota) filtered = filtered.filter(item => item.parsedData.Flota === dbFilter.flota);
        if (dbFilter.coordinadorRecibe) filtered = filtered.filter(item => item.parsedData.CoordinadorRecibe === dbFilter.coordinadorRecibe);
        if (dbFilter.areaEntrega) filtered = filtered.filter(item => item.parsedData.AreaEntrega === dbFilter.areaEntrega);

        return filtered;
    };

    const getCoordFilteredItems = () => {
        let filtered = [...items];
        if (coordFilter.state === 'en_proceso') {
            filtered = filtered.filter(item => {
                const d = item.parsedData;
                if (d.Error || !d.Coordinador) return false;
                return d.Coordinador.Estado !== "Entregado";
            });
        } else if (coordFilter.state === 'entregados') {
            filtered = filtered.filter(item => {
                const d = item.parsedData;
                if (d.Error || !d.Coordinador) return false;
                return d.Coordinador.Estado === "Entregado";
            });
        } else if (coordFilter.state === 'no_gestionado') {
            filtered = filtered.filter(item => {
                const d = item.parsedData;
                return d.Error ? false : (!d.Coordinador || d.Coordinador.Estado === "No gestionado");
            });
        }

        if (coordFilter.search) {
            const s = coordFilter.search.toLowerCase();
            filtered = filtered.filter(item => {
                const d = item.parsedData;
                if (d.Error) return false;
                return (d.SolicitudID || "").toLowerCase().includes(s) ||
                    (d.OT || "").toLowerCase().includes(s) ||
                    (d.NombreComponente || "").toLowerCase().includes(s) ||
                    (d.Flota || "").toLowerCase().includes(s) ||
                    (d.PN || "").toLowerCase().includes(s) ||
                    (d.SC || "").toLowerCase().includes(s) ||
                    (d.NombreContacto || "").toLowerCase().includes(s) ||
                    (d.CoordinadorRecibe || "").toLowerCase().includes(s) ||
                    (d.AreaEntrega || "").toLowerCase().includes(s) ||
                    (d.Superintendencia || "").toLowerCase().includes(s);
            });
        }
        if (coordFilter.superintendencia) filtered = filtered.filter(item => item.parsedData.Superintendencia === coordFilter.superintendencia);
        if (coordFilter.prioridad) filtered = filtered.filter(item => item.parsedData.Prioridad === coordFilter.prioridad);
        if (coordFilter.flota) filtered = filtered.filter(item => item.parsedData.Flota === coordFilter.flota);
        if (coordFilter.coordinadorRecibe) filtered = filtered.filter(item => item.parsedData.CoordinadorRecibe === coordFilter.coordinadorRecibe);
        if (coordFilter.areaEntrega) filtered = filtered.filter(item => item.parsedData.AreaEntrega === coordFilter.areaEntrega);
        if (coordFilter.fechaDesde) filtered = filtered.filter(item => item.parsedData.Fecha >= coordFilter.fechaDesde);
        if (coordFilter.fechaHasta) filtered = filtered.filter(item => item.parsedData.Fecha <= coordFilter.fechaHasta);
        return filtered;
    };

    const handleDownloadCSV = () => {
        downloadCSV(getFilteredItems());
    };

    return (
        <div className="max-w-[1400px] mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col gap-8 relative">
            <Header userAuth={userAuth} />

            {error && (
                <div className="bg-red-500/90 backdrop-blur-md text-white border-l-4 border-white p-4 rounded-xl shadow-lg relative">
                    <button onClick={() => setError(null)} className="absolute top-2 right-4 text-white hover:text-gray-200 font-bold">&times;</button>
                    <p className="font-medium text-sm pr-6">{error}</p>
                </div>
            )}

            {/* NAVEGACION POR PESTANAS */}
            <div className="flex gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-lg">
                <button onClick={() => setActiveTab('cliente')} className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'cliente' ? 'bg-cerrejon-orange text-white shadow-lg' : 'text-gray-600 hover:bg-white/50'}`}>
                    Cliente
                </button>
                {userAuth.isCoordinator && (
                    <button onClick={() => setActiveTab('coordinador')} className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'coordinador' ? 'bg-cerrejon-orange text-white shadow-lg' : 'text-gray-600 hover:bg-white/50'}`}>
                        Coordinador
                    </button>
                )}
                <button onClick={() => setActiveTab('basedatos')} className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'basedatos' ? 'bg-cerrejon-orange text-white shadow-lg' : 'text-gray-600 hover:bg-white/50'}`}>
                    Base de Datos
                </button>
            </div>

            {/* TAB CLIENTE */}
            {activeTab === 'cliente' && (
                <TabCliente
                    formData={formData}
                    setFormData={setFormData}
                    evidenceFiles={evidenceFiles}
                    setEvidenceFiles={setEvidenceFiles}
                    loading={loading}
                    error={error}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmitCliente}
                />
            )}

            {/* TAB COORDINADOR */}
            {activeTab === 'coordinador' && userAuth.isCoordinator && (
                <TabCoordinador
                    coordFilter={coordFilter}
                    setCoordFilter={setCoordFilter}
                    getCoordFilteredItems={getCoordFilteredItems}
                    onViewDetails={(item) => setViewModalItem(item)}
                    onOpenManageModal={handleOpenManageModal}
                />
            )}

            {/* TAB BASE DE DATOS */}
            {activeTab === 'basedatos' && (
                <TabBaseDatos
                    dbFilter={dbFilter}
                    setDbFilter={setDbFilter}
                    getFilteredItems={getFilteredItems}
                    onDownloadCSV={handleDownloadCSV}
                    onViewDetails={(item) => setViewModalItem(item)}
                    onOpenManageModal={handleOpenManageModal}
                    userAuth={userAuth}
                />
            )}

            {/* MODALES */}
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
        </div>
    );
}

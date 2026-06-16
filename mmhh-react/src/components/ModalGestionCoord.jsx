import React, { useRef } from 'react';
import { PROCESOS_COORDINADOR, EQUIPOS_COORDINADOR, ESTADOS_COORDINADOR } from '../constants';

const inputClass = "block w-full rounded-xl bg-white/60 border border-gray-300 focus:bg-white focus:border-cerrejon-orange focus:ring-2 focus:ring-cerrejon-orange/50 transition-all p-3 text-sm outline-none";
const labelClass = "block text-xs font-bold text-gray-700 mb-2 uppercase tracking-widest";

export default function ModalGestionCoord({
    manageModalItem, setManageModalItem,
    coordForm, setCoordForm,
    coordEvidenceFiles, setCoordEvidenceFiles,
    loading, error, userAuth,
    onSaveCoordResponse
}) {
    const coordFileInputRef = useRef(null);
    const d = manageModalItem?.parsedData;

    if (!manageModalItem) return null;

    const handleAddProceso = () => {
        setCoordForm(prev => ({
            ...prev,
            Procesos: [...prev.Procesos, { ProcesoRequerido: "Ensayo No destructivo", ProcesoRequeridoCustom: "", SubprocesoRequerido: "", SubprocesoRequeridoCustom: "" }]
        }));
    };

    const handleRemoveProceso = (index) => {
        if (coordForm.Procesos.length <= 1) return;
        setCoordForm(prev => ({
            ...prev,
            Procesos: prev.Procesos.filter((_, i) => i !== index)
        }));
    };

    const handleAddDemora = () => {
        setCoordForm(prev => ({
            ...prev,
            Demoras: [...prev.Demoras, { Descripcion: "", Fecha: new Date().toISOString().split('T')[0] }]
        }));
    };

    const handleRemoveDemora = (index) => {
        setCoordForm(prev => ({
            ...prev,
            Demoras: prev.Demoras.filter((_, i) => i !== index)
        }));
    };

    const handleDemoraChange = (index, name, value) => {
        setCoordForm(prev => {
            const newDemoras = [...prev.Demoras];
            newDemoras[index] = { ...newDemoras[index], [name]: value };
            return { ...prev, Demoras: newDemoras };
        });
    };

    const handleProcesoChange = (index, name, value) => {
        setCoordForm(prev => {
            const newProcesos = [...prev.Procesos];
            newProcesos[index] = { ...newProcesos[index], [name]: value };
            if (name === "ProcesoRequerido") {
                const subs = PROCESOS_COORDINADOR[value] || [];
                newProcesos[index].SubprocesoRequerido = subs.length > 0 ? subs[0] : "";
                newProcesos[index].ProcesoRequeridoCustom = "";
                newProcesos[index].SubprocesoRequeridoCustom = "";
            }
            return { ...prev, Procesos: newProcesos };
        });
    };

    const handleCoordFormChange = (e) => {
        const { name, value } = e.target;
        setCoordForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCoordFileChange = (e) => {
        setCoordEvidenceFiles(Array.from(e.target.files));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSaveCoordResponse(e);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col my-auto relative border-t-8 border-cerrejon-orange">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800">Gestionar Solicitud (Ficha de Coordinador)</h2>
                        <p className="text-sm font-bold text-cerrejon-orange mt-1">ID: {d.SolicitudID || "-"} | OT: {d.OT} | Componente: {d.NombreComponente}</p>
                    </div>
                    <button onClick={() => setManageModalItem(null)} className="text-gray-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-200">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                    {/* PROCESOS MULTIPLES */}
                    <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-200 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className={labelClass + " mb-0"}>Procesos Requeridos</label>
                            <button type="button" onClick={handleAddProceso} className="px-3 py-1.5 bg-cerrejon-orange text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                Agregar Proceso
                            </button>
                        </div>
                        {coordForm.Procesos.map((proc, idx) => {
                            const subsDisponibles = PROCESOS_COORDINADOR[proc.ProcesoRequerido] || [];
                            return (
                                <div key={idx} className="p-4 bg-white/70 rounded-xl border border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-black text-gray-600 uppercase">Proceso #{idx + 1}</span>
                                        {coordForm.Procesos.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveProceso(idx)} className="text-red-500 hover:text-red-700 text-xs font-bold">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Proceso Requerido</label>
                                            <select value={proc.ProcesoRequerido} onChange={(e) => handleProcesoChange(idx, "ProcesoRequerido", e.target.value)} className={`${inputClass} text-xs p-2`} required>
                                                {Object.keys(PROCESOS_COORDINADOR).map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            {proc.ProcesoRequerido === "Otro" && (
                                                <input type="text" value={proc.ProcesoRequeridoCustom} onChange={(e) => handleProcesoChange(idx, "ProcesoRequeridoCustom", e.target.value)} className={`${inputClass} mt-2 text-xs p-2`} placeholder="Especifique el proceso..." required />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Subproceso Requerido</label>
                                            {subsDisponibles.length === 0 ? (
                                                <input type="text" readOnly value="No requiere subproceso" className={`${inputClass} bg-gray-100 text-gray-400 cursor-not-allowed text-xs p-2`} />
                                            ) : subsDisponibles.length === 1 && subsDisponibles[0] === "Otro" ? (
                                                <input type="text" value={proc.SubprocesoRequeridoCustom} onChange={(e) => handleProcesoChange(idx, "SubprocesoRequeridoCustom", e.target.value)} className={`${inputClass} text-xs p-2`} placeholder="Especifique el subproceso..." required />
                                            ) : (
                                                <>
                                                    <select value={proc.SubprocesoRequerido} onChange={(e) => handleProcesoChange(idx, "SubprocesoRequerido", e.target.value)} className={`${inputClass} text-xs p-2`} required>
                                                        {subsDisponibles.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                    {proc.SubprocesoRequerido === "Otro" && (
                                                        <input type="text" value={proc.SubprocesoRequeridoCustom} onChange={(e) => handleProcesoChange(idx, "SubprocesoRequeridoCustom", e.target.value)} className={`${inputClass} mt-2 text-xs p-2`} placeholder="Especifique el subproceso..." required />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

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

                    {/* DEMORAS MULTIPLES */}
                    <div className="bg-red-50/50 p-5 rounded-xl border border-red-200 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className={labelClass + " mb-0"}>Demoras</label>
                            <button type="button" onClick={handleAddDemora} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                Agregar Demora
                            </button>
                        </div>
                        {coordForm.Demoras.map((dem, idx) => (
                            <div key={idx} className="p-3 bg-white/70 rounded-xl border border-red-100 flex gap-3 items-end">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Descripci&oacute;n #{idx + 1}</label>
                                    <input type="text" value={dem.Descripcion} onChange={(e) => handleDemoraChange(idx, "Descripcion", e.target.value)} className={`${inputClass} text-xs p-2`} placeholder="Describa la demora..." required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Fecha</label>
                                    <input type="date" value={dem.Fecha} onChange={(e) => handleDemoraChange(idx, "Fecha", e.target.value)} className={`${inputClass} text-xs p-2 w-36`} required />
                                </div>
                                <button type="button" onClick={() => handleRemoveDemora(idx)} className="text-red-500 hover:text-red-700 mb-1">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        {coordForm.Demoras.length === 0 && (
                            <p className="text-xs text-gray-400 italic text-center py-2">Sin demoras registradas. Use el bot&oacute;n para agregar.</p>
                        )}
                    </div>

                    {coordForm.Estado === "Entregado" && (
                        <div className="bg-green-50/50 p-5 rounded-xl border border-green-200">
                            <label className={labelClass}>Comentario <span className="text-red-500">*</span></label>
                            <textarea name="Comentario" value={coordForm.Comentario} onChange={handleCoordFormChange} rows="4" className={`${inputClass} resize-none`} placeholder="Describa detalladamente todo lo que se hizo en esta solicitud..." required></textarea>
                        </div>
                    )}

                    <div className="bg-white/40 p-5 rounded-xl border border-dashed border-gray-400">
                        <label className={labelClass}>Documentos o Evidencias del Coordinador (Opcional)</label>
                        <input type="file" accept="image/*" multiple onChange={handleCoordFileChange} ref={coordFileInputRef} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-bold file:bg-cerrejon-orange file:text-white cursor-pointer" />
                    </div>

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
}

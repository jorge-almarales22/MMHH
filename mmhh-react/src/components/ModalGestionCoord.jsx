import React, { useRef } from 'react';
import { PROCESOS_COORDINADOR, ESTADOS_COORDINADOR, AREAS_PROCESO, PRIORIDADES } from '../constants';
import { esEstadoCierre, getEstadoSolicitud, nuevoProceso } from '../utils/helpers';
import { input, inputSm, label, labelSm, btnPrimary, btnSecondary, sectionTitle, estadoSolicitudTono, pill } from '../ui';

function Panel({ titulo, descripcion, accion, tono = "slate", children }) {
    const tonos = {
        slate: "border-slate-200 bg-white",
        orange: "border-cerrejon-orange/25 bg-cerrejon-orangeSoft/50",
        red: "border-red-200 bg-red-50/50",
        emerald: "border-emerald-300 bg-emerald-50/60"
    };
    return (
        <section className={`rounded-xl border p-5 ${tonos[tono]}`}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className={sectionTitle}>{titulo}</h3>
                    {descripcion && <p className="mt-1 text-xs text-slate-500">{descripcion}</p>}
                </div>
                {accion}
            </div>
            {children}
        </section>
    );
}

const IconX = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
        <path d="M6 18L18 6M6 6l12 12" />
    </svg>
);

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

    const historial = coordForm.Comentarios || [];
    const comentarioCierreExistente = historial.find(c => c.EsCierre);
    const enCierre = esEstadoCierre(coordForm.Estado);
    const estadoSolicitud = getEstadoSolicitud(d);
    const totalHH = coordForm.Procesos.reduce((acc, p) => acc + (Number(p.EstimadoHorasHombre) || 0), 0);

    const handleAddProceso = () => {
        setCoordForm(prev => ({ ...prev, Procesos: [...prev.Procesos, nuevoProceso()] }));
    };

    const handleRemoveProceso = (index) => {
        if (coordForm.Procesos.length <= 1) return;
        setCoordForm(prev => ({ ...prev, Procesos: prev.Procesos.filter((_, i) => i !== index) }));
    };

    const handleAddDemora = () => {
        setCoordForm(prev => ({
            ...prev,
            Demoras: [...prev.Demoras, { Descripcion: "", Fecha: new Date().toISOString().split('T')[0] }]
        }));
    };

    const handleRemoveDemora = (index) => {
        setCoordForm(prev => ({ ...prev, Demoras: prev.Demoras.filter((_, i) => i !== index) }));
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
            if (name === "AreaProceso" && value !== "Otro") newProcesos[index].AreaProcesoCustom = "";
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

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in sm:p-6">
            <div className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/25">

                {/* ENCABEZADO */}
                <div className="border-b border-slate-200 bg-slate-50 px-7 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <span className={sectionTitle}>Gestión de coordinación</span>
                            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900">
                                {d.NombreComponente || "Requerimiento"}
                            </h2>
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
                                <span>Solicitud <strong className="tabular font-semibold text-cerrejon-orange">{d.SolicitudID || "—"}</strong></span>
                                <span>OT <strong className="tabular font-semibold text-slate-700">{d.OT}</strong></span>
                                <span>Flota <strong className="font-semibold text-slate-700">{d.Flota}</strong></span>
                                <span>Prioridad cliente <strong className="font-semibold text-slate-700">{d.Prioridad}</strong></span>
                            </div>
                        </div>
                        <button
                            onClick={() => setManageModalItem(null)} type="button"
                            className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                            aria-label="Cerrar"
                        >
                            <IconX className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <form id="form-gestion-coord" onSubmit={onSaveCoordResponse} className="thin-scroll max-h-[74vh] space-y-5 overflow-y-auto px-7 py-6">

                    {/* ESTADO DE LA SOLICITUD — SOLO LECTURA */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                        <div>
                            <span className={labelSm}>Estado de la solicitud</span>
                            <div className="mt-0.5 flex items-center gap-2">
                                <span className={`${pill} ${estadoSolicitudTono(estadoSolicitud)}`}>{estadoSolicitud}</span>
                                <span className="text-[11px] text-slate-500">Asignado por el sistema · no editable</span>
                            </div>
                        </div>
                        {estadoSolicitud === "Pendiente" && (
                            <p className="max-w-sm text-[11px] leading-relaxed text-slate-500">
                                Al guardar cualquier cambio, esta solicitud pasará automáticamente a <strong className="font-semibold text-slate-700">Gestionado</strong>.
                            </p>
                        )}
                    </div>

                    {/* PROCESOS */}
                    <Panel
                        tono="orange"
                        titulo="Procesos requeridos"
                        descripcion="Cada proceso lleva su área de ejecución y sus horas hombre estimadas."
                        accion={
                            <div className="flex items-center gap-3">
                                <span className="tabular rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                                    Total {totalHH} H/H
                                </span>
                                <button type="button" onClick={handleAddProceso} className="inline-flex items-center gap-1.5 rounded-lg bg-cerrejon-orange px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cerrejon-orangeDark">
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                    Agregar proceso
                                </button>
                            </div>
                        }
                    >
                        <div className="space-y-3">
                            {coordForm.Procesos.map((proc, idx) => {
                                const subsDisponibles = PROCESOS_COORDINADOR[proc.ProcesoRequerido] || [];
                                return (
                                    <div key={idx} className="rounded-lg border border-slate-200 bg-white p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                                <span className="tabular flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600">{idx + 1}</span>
                                                Proceso
                                            </span>
                                            {coordForm.Procesos.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveProceso(idx)} className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Quitar proceso">
                                                    <IconX className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            <div>
                                                <label className={labelSm}>Proceso requerido</label>
                                                <select value={proc.ProcesoRequerido} onChange={(e) => handleProcesoChange(idx, "ProcesoRequerido", e.target.value)} className={inputSm} required>
                                                    {Object.keys(PROCESOS_COORDINADOR).map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                                {proc.ProcesoRequerido === "Otro" && (
                                                    <input type="text" value={proc.ProcesoRequeridoCustom} onChange={(e) => handleProcesoChange(idx, "ProcesoRequeridoCustom", e.target.value)} className={`${inputSm} mt-2`} placeholder="Especifique el proceso..." required />
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelSm}>Subproceso requerido</label>
                                                {subsDisponibles.length === 0 ? (
                                                    <input type="text" readOnly value="No requiere subproceso" className={`${inputSm} bg-slate-100 text-slate-400`} />
                                                ) : subsDisponibles.length === 1 && subsDisponibles[0] === "Otro" ? (
                                                    <input type="text" value={proc.SubprocesoRequeridoCustom} onChange={(e) => handleProcesoChange(idx, "SubprocesoRequeridoCustom", e.target.value)} className={inputSm} placeholder="Especifique el subproceso..." required />
                                                ) : (
                                                    <>
                                                        <select value={proc.SubprocesoRequerido} onChange={(e) => handleProcesoChange(idx, "SubprocesoRequerido", e.target.value)} className={inputSm} required>
                                                            {subsDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                        {proc.SubprocesoRequerido === "Otro" && (
                                                            <input type="text" value={proc.SubprocesoRequeridoCustom} onChange={(e) => handleProcesoChange(idx, "SubprocesoRequeridoCustom", e.target.value)} className={`${inputSm} mt-2`} placeholder="Especifique el subproceso..." required />
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelSm}>Área de proceso requerido</label>
                                                <select value={proc.AreaProceso || ""} onChange={(e) => handleProcesoChange(idx, "AreaProceso", e.target.value)} className={inputSm} required>
                                                    {AREAS_PROCESO.map(a => <option key={a} value={a}>{a}</option>)}
                                                </select>
                                                {proc.AreaProceso === "Otro" && (
                                                    <input type="text" value={proc.AreaProcesoCustom || ""} onChange={(e) => handleProcesoChange(idx, "AreaProcesoCustom", e.target.value)} className={`${inputSm} mt-2`} placeholder="Especifique el área..." required />
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelSm}>Horas hombre estimado</label>
                                                <div className="relative">
                                                    <input
                                                        type="number" min="0" step="0.5"
                                                        value={proc.EstimadoHorasHombre ?? 0}
                                                        onChange={(e) => handleProcesoChange(idx, "EstimadoHorasHombre", e.target.value)}
                                                        className={`${inputSm} tabular pr-12`} required
                                                    />
                                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">H/H</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>

                    {/* SEGUIMIENTO */}
                    <Panel titulo="Seguimiento del componente">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className={labelSm}>Estado del componente</label>
                                <select name="Estado" value={coordForm.Estado} onChange={handleCoordFormChange} className={inputSm} required>
                                    {ESTADOS_COORDINADOR.map(est => <option key={est} value={est}>{est}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelSm}>Prioridad del coordinador</label>
                                <select name="PrioridadCoordinador" value={coordForm.PrioridadCoordinador} onChange={handleCoordFormChange} className={inputSm} required>
                                    {Object.keys(PRIORIDADES).map(p => (
                                        <option key={p} value={p}>{p} — {PRIORIDADES[p]} {PRIORIDADES[p] === 1 ? "día" : "días"}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[10px] text-slate-500">Es la prioridad que rige las métricas.</p>
                            </div>
                            <div>
                                <label className={labelSm}>Fecha estimada</label>
                                <input type="date" name="FechaEstimado" value={coordForm.FechaEstimado} onChange={handleCoordFormChange} className={`${inputSm} tabular`} required />
                            </div>
                            <div>
                                <label className={labelSm}>Notificación a cliente</label>
                                <select name="NotificacionCliente" value={coordForm.NotificacionCliente} onChange={handleCoordFormChange} className={inputSm} required>
                                    <option value="Si">Sí</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 lg:col-span-4">
                                <label className={labelSm}>Complemento MMHH</label>
                                <input type="text" name="ComplementoMMHH" value={coordForm.ComplementoMMHH} onChange={handleCoordFormChange} className={inputSm} placeholder="Información técnica complementaria..." />
                            </div>
                        </div>
                    </Panel>

                    {/* HISTORIAL DE COMENTARIOS */}
                    <Panel
                        titulo="Historial de comentarios"
                        descripcion="Registro permanente de la gestión. Los comentarios no se pueden editar ni eliminar."
                        accion={
                            <span className="tabular rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                {historial.length} registro{historial.length === 1 ? '' : 's'}
                            </span>
                        }
                    >
                        {historial.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                                Aún no hay comentarios registrados para este requerimiento.
                            </p>
                        ) : (
                            <ol className="thin-scroll max-h-64 space-y-2.5 overflow-y-auto pr-1">
                                {historial.map((c, i) => (
                                    <li
                                        key={i}
                                        className={`rounded-lg border px-4 py-3 ${c.EsCierre ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                                    >
                                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                            <span className="text-[12px] font-semibold text-slate-800">{c.Autor || "Coordinador"}</span>
                                            {c.EsCierre && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                                                    <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.3 3.29 6.8-6.79a1 1 0 011.9.5z" clipRule="evenodd" /></svg>
                                                    Cierre
                                                </span>
                                            )}
                                            <span className="tabular ml-auto text-[11px] text-slate-400">{c.Fecha}</span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">{c.Texto}</p>
                                    </li>
                                ))}
                            </ol>
                        )}

                        <div className="mt-4 border-t border-slate-200 pt-4">
                            <label className={labelSm}>Nuevo comentario</label>
                            <textarea
                                name="NuevoComentario" value={coordForm.NuevoComentario} onChange={handleCoordFormChange}
                                rows="3" className={`${inputSm} resize-none`}
                                placeholder="Describa la gestión realizada, hallazgos o acuerdos con el cliente..."
                            />
                            <p className="mt-1.5 text-[11px] text-slate-500">
                                Se registrará a nombre de <strong className="font-semibold text-slate-700">{userAuth.name}</strong> con la fecha de hoy.
                            </p>
                        </div>
                    </Panel>

                    {/* COMENTARIO DE CIERRE */}
                    {enCierre && (
                        <Panel
                            tono="emerald"
                            titulo="Comentario de cierre"
                            descripcion={`Obligatorio para dejar el componente en "${coordForm.Estado}". Queda marcado de forma diferenciada en el historial.`}
                        >
                            {comentarioCierreExistente ? (
                                <div className="rounded-lg border border-emerald-300 bg-white px-4 py-3">
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Cierre registrado</span>
                                        <span className="tabular ml-auto text-[11px] text-slate-400">{comentarioCierreExistente.Fecha}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">{comentarioCierreExistente.Texto}</p>
                                    <p className="mt-2 text-[11px] text-slate-500">Por {comentarioCierreExistente.Autor}</p>
                                </div>
                            ) : (
                                <textarea
                                    name="ComentarioCierre" value={coordForm.ComentarioCierre} onChange={handleCoordFormChange}
                                    rows="4" className={`${input} resize-none border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/15`}
                                    placeholder="Detalle el trabajo ejecutado, resultado final y condiciones de entrega del componente..."
                                    required
                                />
                            )}
                        </Panel>
                    )}

                    {/* DEMORAS */}
                    <Panel
                        tono="red"
                        titulo="Demoras"
                        descripcion="Eventos que afectaron el cumplimiento del tiempo estimado."
                        accion={
                            <button type="button" onClick={handleAddDemora} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                Agregar demora
                            </button>
                        }
                    >
                        {coordForm.Demoras.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-red-200 bg-white/60 px-4 py-5 text-center text-xs text-slate-500">
                                Sin demoras registradas.
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                {coordForm.Demoras.map((dem, idx) => (
                                    <div key={idx} className="flex items-end gap-3 rounded-lg border border-red-200 bg-white p-3">
                                        <div className="flex-1">
                                            <label className={labelSm}>Descripción {idx + 1}</label>
                                            <input type="text" value={dem.Descripcion} onChange={(e) => handleDemoraChange(idx, "Descripcion", e.target.value)} className={inputSm} placeholder="Describa la demora..." required />
                                        </div>
                                        <div className="w-40">
                                            <label className={labelSm}>Fecha</label>
                                            <input type="date" value={dem.Fecha} onChange={(e) => handleDemoraChange(idx, "Fecha", e.target.value)} className={`${inputSm} tabular`} required />
                                        </div>
                                        <button type="button" onClick={() => handleRemoveDemora(idx)} className="mb-1 rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Quitar demora">
                                            <IconX className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Panel>

                    {/* EVIDENCIAS */}
                    <Panel titulo="Evidencias de coordinación" descripcion="Se anexan al historial; las cargas anteriores se conservan.">
                        <input
                            type="file" accept="image/*" multiple onChange={handleCoordFileChange} ref={coordFileInputRef}
                            className="block w-full cursor-pointer text-[13px] text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white hover:file:bg-slate-700"
                        />
                        {coordEvidenceFiles.length > 0 && (
                            <p className="mt-2.5 text-[11px] font-medium text-emerald-700">
                                {coordEvidenceFiles.length} archivo{coordEvidenceFiles.length > 1 ? 's' : ''} listo{coordEvidenceFiles.length > 1 ? 's' : ''} para anexar
                            </p>
                        )}
                    </Panel>
                </form>

                {/* PIE FIJO */}
                {error && (
                    <div className="flex items-start gap-2.5 border-t border-red-200 bg-red-50 px-7 py-3">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-9 4a1 1 0 112 0 1 1 0 01-2 0zm1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-[12px] font-medium leading-relaxed text-red-800">{error}</p>
                    </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-7 py-4">
                    <p className="text-[11px] text-slate-500">
                        Registrado por <strong className="font-semibold text-slate-700">{userAuth.name}</strong>
                    </p>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setManageModalItem(null)} className={btnSecondary}>Cancelar</button>
                        <button type="submit" form="form-gestion-coord" disabled={loading} className={btnPrimary}>
                            {loading && (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                                </svg>
                            )}
                            {loading ? "Guardando..." : "Guardar gestión"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

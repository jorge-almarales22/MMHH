import React, { useRef } from 'react';
import { ESTADOS_COORDINADOR, PRIORIDADES } from '../constants';
import { esEstadoCierre, getEstadoSolicitud, nuevoProceso } from '../utils/helpers';
import { medirTolerancia, etiquetaDesvio, ETIQUETA_TOLERANCIA } from '../utils/tolerancia';
import { inputCls, selectCls, btnPrimario, btnSecundario, btnBorde, chip, chipSolicitud, chipPlazo } from '../ui';
import ProcesosTabla from './ProcesosTabla';
import TrabajosRevision from './TrabajosRevision';

const Seccion = ({ numero, titulo, descripcion, accion, children }) => (
    <section className="px-4 sm:px-6 py-5 border-b border-slate-100 last:border-b-0">
        <div className="flex gap-3 sm:gap-4">
            <span className="hidden sm:grid shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold place-items-center mt-0.5">
                {numero}
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                            <span className="sm:hidden text-slate-400">{numero}. </span>{titulo}
                        </h3>
                        {descripcion && <p className="text-xs text-slate-500 mt-0.5">{descripcion}</p>}
                    </div>
                    {accion}
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    </section>
);

const Campo = ({ label, ayuda, children }) => (
    <label className="block">
        <span className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</span>
        {children}
        {ayuda && <span className="block text-[11px] text-slate-400 mt-1">{ayuda}</span>}
    </label>
);

export default function ModalGestionCoord({
    manageModalItem, setManageModalItem,
    coordForm, setCoordForm,
    coordEvidenceFiles, setCoordEvidenceFiles,
    loading, error, userAuth,
    onSaveCoordResponse
}) {
    const fileRef = useRef(null);
    const d = manageModalItem?.parsedData;
    if (!manageModalItem) return null;

    const historial = coordForm.Comentarios || [];
    const cierrePrevio = historial.find(c => c.EsCierre);
    const enCierre = esEstadoCierre(coordForm.Estado);
    const estadoSol = getEstadoSolicitud(d);
    const totalHH = coordForm.Procesos.reduce((a, p) => a + (Number(p.EstimadoHorasHombre) || 0), 0);
    const totalReal = coordForm.Procesos.reduce((a, p) => a + (Number(p.HorasReales) || 0), 0);
    const hechos = coordForm.Procesos.filter(p => p.Realizado).length;
    const tol = medirTolerancia(d);

    const setCampo = (e) => setCoordForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const addProceso = () => setCoordForm(p => ({ ...p, Procesos: [...p.Procesos, nuevoProceso()] }));

    const addDemora = () => setCoordForm(p => ({ ...p, Demoras: [...p.Demoras, { Descripcion: "", Fecha: new Date().toISOString().split('T')[0] }] }));
    const delDemora = (i) => setCoordForm(p => ({ ...p, Demoras: p.Demoras.filter((_, x) => x !== i) }));
    const setDemora = (i, name, value) => setCoordForm(prev => {
        const ds = [...prev.Demoras];
        ds[i] = { ...ds[i], [name]: value };
        return { ...prev, Demoras: ds };
    });

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setManageModalItem(null)}
        >
            <div
                className="bg-white w-full sm:max-w-5xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabecera */}
                <div className="px-4 sm:px-6 py-4 border-b border-slate-200 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`${chip} ${chipSolicitud(estadoSol)}`}>{estadoSol}</span>
                                {tol && <span className={`${chip} ${chipPlazo(tol.estado)}`}>{ETIQUETA_TOLERANCIA[tol.estado]} · {etiquetaDesvio(tol)}</span>}
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 mt-2 truncate">
                                {d.NombreComponente || "Requerimiento"}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                                N.º {d.SolicitudID || "—"} · OT {d.OT} · {d.Flota} · ingreso {d.Fecha}
                            </p>
                        </div>
                        <button
                            type="button" onClick={() => setManageModalItem(null)} aria-label="Cerrar"
                            className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 grid place-items-center cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <form id="form-gestion-coord" onSubmit={onSaveCoordResponse} className="overflow-y-auto flex-1">

                    <div className="bg-blue-50 px-4 sm:px-6 py-3 flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" aria-hidden="true" />
                        <p>
                            {estadoSol === "Pendiente"
                                ? <>El estado de la solicitud lo asigna el sistema. Al guardar pasa a <strong>Gestionado</strong> y no se revierte.</>
                                : <>El estado de la solicitud lo asigna el sistema. Ya quedó como <strong>Gestionado</strong> y nadie puede devolverla a Pendiente.</>}
                        </p>
                    </div>

                    <Seccion
                        numero={1}
                        titulo="Trabajos que pidió el cliente"
                        descripcion="Si el taller no puede ejecutar alguno, descártalo dejando el motivo."
                    >
                        <TrabajosRevision
                            trabajos={coordForm.Trabajos}
                            onChange={(t) => setCoordForm(p => ({ ...p, Trabajos: t }))}
                            autor={userAuth.name}
                        />
                    </Seccion>

                    <Seccion
                        numero={2}
                        titulo="Procesos requeridos"
                        descripcion="Una fila por proceso: dónde se ejecuta, cuánto se estimó, si ya se hizo y qué pasó."
                        accion={
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500 tabular-nums px-2 py-1 rounded-full bg-slate-100">
                                    {hechos}/{coordForm.Procesos.length} hechos
                                </span>
                                <span className="text-[11px] font-bold text-slate-500 tabular-nums px-2 py-1 rounded-full bg-slate-100">
                                    {totalReal} de {totalHH} H/H
                                </span>
                                <button type="button" onClick={addProceso} className={btnBorde}>+ Agregar</button>
                            </div>
                        }
                    >
                        <ProcesosTabla
                            procesos={coordForm.Procesos}
                            onChange={(ps) => setCoordForm(p => ({ ...p, Procesos: ps }))}
                            autor={userAuth.name}
                        />
                    </Seccion>

                    <Seccion numero={3} titulo="Seguimiento" descripcion="La prioridad que fijes aquí es la que manda en la cola y en las métricas.">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <Campo label="Estado del componente">
                                <select name="Estado" value={coordForm.Estado} onChange={setCampo} className={selectCls} required>
                                    {ESTADOS_COORDINADOR.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </Campo>
                            <Campo label="Prioridad del coordinador">
                                <select name="PrioridadCoordinador" value={coordForm.PrioridadCoordinador} onChange={setCampo} className={selectCls} required>
                                    {Object.keys(PRIORIDADES).map(p => (
                                        <option key={p} value={p}>{p} — {PRIORIDADES[p]} {PRIORIDADES[p] === 1 ? "día" : "días"}</option>
                                    ))}
                                </select>
                            </Campo>
                            <Campo label="Fecha estimada">
                                <input type="date" name="FechaEstimado" value={coordForm.FechaEstimado} onChange={setCampo} className={inputCls} required />
                            </Campo>
                            <Campo label="Se avisó al cliente">
                                <select name="NotificacionCliente" value={coordForm.NotificacionCliente} onChange={setCampo} className={selectCls} required>
                                    <option value="Si">Sí</option>
                                    <option value="No">No</option>
                                </select>
                            </Campo>
                            <div className="sm:col-span-2 lg:col-span-4">
                                <Campo label="Complemento MMHH">
                                    <input type="text" name="ComplementoMMHH" value={coordForm.ComplementoMMHH} onChange={setCampo} className={inputCls} placeholder="Información técnica complementaria" />
                                </Campo>
                            </div>
                        </div>
                    </Seccion>

                    {enCierre && (
                        <Seccion
                            numero={4}
                            titulo="Comentario de cierre"
                            descripcion={`Obligatorio para dejar el componente en "${coordForm.Estado}".`}
                        >
                            {cierrePrevio ? (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">CIERRE REGISTRADO</span>
                                        <span className="ml-auto text-[11px] text-slate-400 tabular-nums">{cierrePrevio.Fecha}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{cierrePrevio.Texto}</p>
                                    <p className="text-[11px] text-slate-500 mt-2">Por {cierrePrevio.Autor}</p>
                                </div>
                            ) : (
                                <textarea
                                    name="ComentarioCierre" value={coordForm.ComentarioCierre} onChange={setCampo}
                                    rows="4" className={`${inputCls} resize-y border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200`}
                                    placeholder="Trabajo ejecutado, resultado final y condiciones en que se entrega el componente."
                                    required
                                />
                            )}
                        </Seccion>
                    )}

                    <Seccion
                        numero={enCierre ? 5 : 4}
                        titulo="Demoras"
                        descripcion="Lo que impidió cumplir el plazo estimado."
                        accion={<button type="button" onClick={addDemora} className={btnBorde}>+ Agregar</button>}
                    >
                        {coordForm.Demoras.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
                                <p className="text-xs text-slate-500">Sin demoras registradas.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {coordForm.Demoras.map((dem, i) => (
                                    <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-3 flex flex-col sm:flex-row gap-3 sm:items-end">
                                        <div className="flex-1">
                                            <Campo label="Qué pasó">
                                                <input type="text" value={dem.Descripcion} onChange={(e) => setDemora(i, "Descripcion", e.target.value)} className={inputCls} placeholder="Describe la demora" required />
                                            </Campo>
                                        </div>
                                        <div className="sm:w-44">
                                            <Campo label="Fecha">
                                                <input type="date" value={dem.Fecha} onChange={(e) => setDemora(i, "Fecha", e.target.value)} className={inputCls} required />
                                            </Campo>
                                        </div>
                                        <button
                                            type="button" onClick={() => delDemora(i)}
                                            className="text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer sm:mb-3"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Seccion>

                    <Seccion numero={enCierre ? 6 : 5} titulo="Evidencias" descripcion="Se suman a las que ya tenga la solicitud; nada se reemplaza.">
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                            <input
                                type="file" accept="image/*" multiple onChange={(e) => setCoordEvidenceFiles(Array.from(e.target.files))} ref={fileRef}
                                className="block w-full text-sm text-slate-600 cursor-pointer file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                            />
                            {coordEvidenceFiles.length > 0 && (
                                <p className="text-xs font-semibold text-emerald-700 mt-2">
                                    {coordEvidenceFiles.length} {coordEvidenceFiles.length > 1 ? 'fotos listas' : 'foto lista'} para anexar.
                                </p>
                            )}
                        </div>
                    </Seccion>
                </form>

                {error && (
                    <div className="mx-4 sm:mx-6 mb-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 shrink-0">
                        <span aria-hidden="true">⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
                    <button type="button" onClick={() => setManageModalItem(null)} className={btnSecundario}>Cancelar</button>
                    <button type="submit" form="form-gestion-coord" disabled={loading} className={btnPrimario}>
                        {loading && <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />}
                        {loading ? 'Guardando...' : 'Guardar gestión'}
                    </button>
                </div>
            </div>
        </div>
    );
}

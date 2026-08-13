import React, { useRef } from 'react';
import { PROCESOS_COORDINADOR, ESTADOS_COORDINADOR, AREAS_PROCESO, PRIORIDADES } from '../constants';
import { esEstadoCierre, getEstadoSolicitud, nuevoProceso } from '../utils/helpers';
import { medirTolerancia } from '../utils/tolerancia';
import { ToleranciaDetalle } from './Tolerancia';
import { campo, campoMini, rotulo, rotuloMini, btn, btnLinea, btnMini, dial, marca, marcaSolicitud } from '../ui';

const IconX = (p) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" {...p}>
        <path d="M5 5l10 10M15 5L5 15" />
    </svg>
);

const IconMas = (p) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" {...p}>
        <path d="M10 4v12M4 10h12" />
    </svg>
);

function Bloque({ titulo, nota, accion, children, ultimo = false }) {
    return (
        <section className={`px-6 py-5 ${ultimo ? '' : 'border-b border-iron-200'}`}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className={dial}>{titulo}</h3>
                    {nota && <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-iron-500">{nota}</p>}
                </div>
                {accion}
            </div>
            {children}
        </section>
    );
}

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
    const tol = medirTolerancia(d);

    const setCampo = (e) => setCoordForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const addProceso = () => setCoordForm(p => ({ ...p, Procesos: [...p.Procesos, nuevoProceso()] }));
    const delProceso = (i) => coordForm.Procesos.length > 1 && setCoordForm(p => ({ ...p, Procesos: p.Procesos.filter((_, x) => x !== i) }));

    const setProceso = (i, name, value) => setCoordForm(prev => {
        const ps = [...prev.Procesos];
        ps[i] = { ...ps[i], [name]: value };
        if (name === "ProcesoRequerido") {
            const subs = PROCESOS_COORDINADOR[value] || [];
            ps[i].SubprocesoRequerido = subs[0] || "";
            ps[i].ProcesoRequeridoCustom = "";
            ps[i].SubprocesoRequeridoCustom = "";
        }
        if (name === "AreaProceso" && value !== "Otro") ps[i].AreaProcesoCustom = "";
        return { ...prev, Procesos: ps };
    });

    const addDemora = () => setCoordForm(p => ({ ...p, Demoras: [...p.Demoras, { Descripcion: "", Fecha: new Date().toISOString().split('T')[0] }] }));
    const delDemora = (i) => setCoordForm(p => ({ ...p, Demoras: p.Demoras.filter((_, x) => x !== i) }));
    const setDemora = (i, name, value) => setCoordForm(prev => {
        const ds = [...prev.Demoras];
        ds[i] = { ...ds[i], [name]: value };
        return { ...prev, Demoras: ds };
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-dye-deep/70 p-3 backdrop-blur-[2px] animate-fade-in sm:p-6">
            <div className="my-auto w-full max-w-5xl border border-iron-300 bg-white shadow-2xl shadow-dye-deep/30 animate-card-in">

                {/* Cabecera: identidad de la pieza y lectura de plazo */}
                <div className="border-b border-iron-200 bg-dye px-6 py-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <span className="dial text-[10px] text-scribe">Hoja de ruta</span>
                            <h2 className="mt-1 truncate text-[20px] font-semibold leading-tight tracking-tight">
                                {d.NombreComponente || "Requerimiento"}
                            </h2>
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-white/50">
                                <span>N.º <strong className="num font-medium text-scribe">{d.SolicitudID || "—"}</strong></span>
                                <span>OT <strong className="num font-medium text-white">{d.OT}</strong></span>
                                <span>Flota <strong className="num font-medium text-white">{d.Flota}</strong></span>
                                <span>Ingreso <strong className="num font-medium text-white">{d.Fecha}</strong></span>
                            </div>
                        </div>
                        <button
                            type="button" onClick={() => setManageModalItem(null)} aria-label="Cerrar"
                            className="shrink-0 rounded-[3px] border border-white/15 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <IconX className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <form id="form-gestion-coord" onSubmit={onSaveCoordResponse} className="thin-scroll max-h-[70vh] overflow-y-auto">

                    {/* Estado de la solicitud + plazo */}
                    <div className="grid grid-cols-1 gap-5 border-b border-iron-200 bg-iron-50 px-6 py-5 sm:grid-cols-2">
                        <div>
                            <span className={rotuloMini}>Estado de la solicitud</span>
                            <div className="flex items-center gap-2.5">
                                <span className={`${marca} ${marcaSolicitud(estadoSol)}`}>{estadoSol}</span>
                                <span className="text-[11px] text-iron-500">Lo asigna el sistema</span>
                            </div>
                            <p className="mt-2 text-[12px] leading-relaxed text-iron-500">
                                {estadoSol === "Pendiente"
                                    ? "Al guardar, esta solicitud pasa a Gestionado. El cambio no se revierte."
                                    : "Quedó registrada como gestionada. Nadie puede devolverla a Pendiente."}
                            </p>
                        </div>
                        <div className="sm:border-l sm:border-iron-200 sm:pl-5">
                            <span className={rotuloMini}>Plazo</span>
                            <ToleranciaDetalle t={tol} />
                        </div>
                    </div>

                    {/* Ruta de operaciones: aquí la numeración sí informa, es una secuencia real. */}
                    <Bloque
                        titulo="Ruta de procesos"
                        nota="Cada operación lleva el área donde se ejecuta y las horas hombre que consume."
                        accion={
                            <div className="flex items-center gap-3">
                                <span className="num text-[12px] text-iron-500">{totalHH} H/H</span>
                                <button type="button" onClick={addProceso} className={btnMini}>
                                    <IconMas className="h-3.5 w-3.5" /> Agregar operación
                                </button>
                            </div>
                        }
                    >
                        <div className="border border-iron-200">
                            {coordForm.Procesos.map((proc, i) => {
                                const subs = PROCESOS_COORDINADOR[proc.ProcesoRequerido] || [];
                                return (
                                    <div key={i} className={`flex gap-4 p-4 ${i > 0 ? 'border-t border-iron-200' : ''}`}>
                                        <div className="flex flex-col items-center pt-1">
                                            <span className="num flex h-6 w-6 items-center justify-center border border-iron-300 bg-iron-50 text-[11px] font-medium text-iron-600">
                                                {i + 1}
                                            </span>
                                            {i < coordForm.Procesos.length - 1 && <span className="mt-1 w-px flex-1 bg-iron-200" aria-hidden="true" />}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                <div>
                                                    <label className={rotuloMini}>Proceso</label>
                                                    <select value={proc.ProcesoRequerido} onChange={(e) => setProceso(i, "ProcesoRequerido", e.target.value)} className={campoMini} required>
                                                        {Object.keys(PROCESOS_COORDINADOR).map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                    {proc.ProcesoRequerido === "Otro" && (
                                                        <input type="text" value={proc.ProcesoRequeridoCustom} onChange={(e) => setProceso(i, "ProcesoRequeridoCustom", e.target.value)} className={`${campoMini} mt-2`} placeholder="¿Qué proceso?" required />
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={rotuloMini}>Subproceso</label>
                                                    {subs.length === 0 ? (
                                                        <input type="text" readOnly value="No requiere" className={`${campoMini} !bg-iron-100 text-iron-400`} />
                                                    ) : subs.length === 1 && subs[0] === "Otro" ? (
                                                        <input type="text" value={proc.SubprocesoRequeridoCustom} onChange={(e) => setProceso(i, "SubprocesoRequeridoCustom", e.target.value)} className={campoMini} placeholder="¿Cuál subproceso?" required />
                                                    ) : (
                                                        <>
                                                            <select value={proc.SubprocesoRequerido} onChange={(e) => setProceso(i, "SubprocesoRequerido", e.target.value)} className={campoMini} required>
                                                                {subs.map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                            {proc.SubprocesoRequerido === "Otro" && (
                                                                <input type="text" value={proc.SubprocesoRequeridoCustom} onChange={(e) => setProceso(i, "SubprocesoRequeridoCustom", e.target.value)} className={`${campoMini} mt-2`} placeholder="¿Cuál subproceso?" required />
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={rotuloMini}>Área de proceso</label>
                                                    <select value={proc.AreaProceso || ""} onChange={(e) => setProceso(i, "AreaProceso", e.target.value)} className={campoMini} required>
                                                        {AREAS_PROCESO.map(a => <option key={a} value={a}>{a}</option>)}
                                                    </select>
                                                    {proc.AreaProceso === "Otro" && (
                                                        <input type="text" value={proc.AreaProcesoCustom || ""} onChange={(e) => setProceso(i, "AreaProcesoCustom", e.target.value)} className={`${campoMini} mt-2`} placeholder="¿Cuál área?" required />
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={rotuloMini}>Horas hombre estimado</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number" min="0" step="0.5" value={proc.EstimadoHorasHombre ?? 0}
                                                            onChange={(e) => setProceso(i, "EstimadoHorasHombre", e.target.value)}
                                                            className={`${campoMini} num sin-spinner !pr-11`} required
                                                        />
                                                        <span className="dial pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-iron-400">H/H</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {coordForm.Procesos.length > 1 && (
                                            <button
                                                type="button" onClick={() => delProceso(i)} aria-label={`Quitar operación ${i + 1}`}
                                                className="h-fit shrink-0 rounded-[3px] p-1.5 text-iron-400 transition-colors hover:bg-alarm-wash hover:text-alarm"
                                            >
                                                <IconX className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Bloque>

                    <Bloque titulo="Seguimiento" nota="La prioridad que fije aquí es la que manda en la cola y en las métricas.">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className={rotulo}>Estado del componente</label>
                                <select name="Estado" value={coordForm.Estado} onChange={setCampo} className={campoMini} required>
                                    {ESTADOS_COORDINADOR.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={rotulo}>Prioridad del coordinador</label>
                                <select name="PrioridadCoordinador" value={coordForm.PrioridadCoordinador} onChange={setCampo} className={campoMini} required>
                                    {Object.keys(PRIORIDADES).map(p => (
                                        <option key={p} value={p}>{p} — {PRIORIDADES[p]} {PRIORIDADES[p] === 1 ? "día" : "días"}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={rotulo}>Fecha estimada</label>
                                <input type="date" name="FechaEstimado" value={coordForm.FechaEstimado} onChange={setCampo} className={`${campoMini} num`} required />
                            </div>
                            <div>
                                <label className={rotulo}>Se avisó al cliente</label>
                                <select name="NotificacionCliente" value={coordForm.NotificacionCliente} onChange={setCampo} className={campoMini} required>
                                    <option value="Si">Sí</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 lg:col-span-4">
                                <label className={rotulo}>Complemento MMHH</label>
                                <input type="text" name="ComplementoMMHH" value={coordForm.ComplementoMMHH} onChange={setCampo} className={campoMini} placeholder="Información técnica complementaria" />
                            </div>
                        </div>
                    </Bloque>

                    {/* Historial: sellos sobre la hoja de ruta. No se editan ni se borran. */}
                    <Bloque
                        titulo="Historial de comentarios"
                        nota="Queda para siempre, con quién lo escribió y cuándo. No se edita ni se elimina."
                        accion={<span className="num text-[12px] text-iron-500">{historial.length}</span>}
                    >
                        {historial.length === 0 ? (
                            <p className="border border-dashed border-iron-300 bg-iron-50 px-4 py-5 text-center text-[12px] text-iron-500">
                                Todavía nadie ha comentado esta solicitud. El primer comentario abre el historial.
                            </p>
                        ) : (
                            <ol className="thin-scroll max-h-64 space-y-px overflow-y-auto border border-iron-200 bg-iron-200">
                                {historial.map((c, i) => (
                                    <li key={i} className={`px-4 py-3 ${c.EsCierre ? 'border-l-2 border-spec bg-spec-wash' : 'bg-white'}`}>
                                        <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
                                            <span className="text-[12px] font-semibold text-iron-800">{c.Autor || "Coordinador"}</span>
                                            {c.EsCierre && <span className="dial text-[9px] text-spec">Cierre</span>}
                                            <span className="num ml-auto text-[11px] text-iron-400">{c.Fecha}</span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-iron-700">{c.Texto}</p>
                                    </li>
                                ))}
                            </ol>
                        )}

                        <div className="mt-4">
                            <label className={rotulo}>Escribir un comentario</label>
                            <textarea
                                name="NuevoComentario" value={coordForm.NuevoComentario} onChange={setCampo}
                                rows="3" className={`${campoMini} resize-y`}
                                placeholder="Qué se hizo, qué se encontró o qué se acordó con el cliente."
                            />
                            <p className="mt-1.5 text-[11px] text-iron-500">
                                Se firma como <strong className="font-semibold text-iron-700">{userAuth.name}</strong> con la fecha de hoy.
                            </p>
                        </div>
                    </Bloque>

                    {enCierre && (
                        <Bloque
                            titulo="Comentario de cierre"
                            nota={`Obligatorio para dejar el componente en "${coordForm.Estado}". Queda marcado aparte en el historial.`}
                        >
                            {cierrePrevio ? (
                                <div className="border-l-2 border-spec bg-spec-wash px-4 py-3">
                                    <div className="mb-1.5 flex items-baseline gap-2">
                                        <span className="dial text-[9px] text-spec">Cierre registrado</span>
                                        <span className="num ml-auto text-[11px] text-iron-400">{cierrePrevio.Fecha}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-iron-700">{cierrePrevio.Texto}</p>
                                    <p className="mt-2 text-[11px] text-iron-500">Por {cierrePrevio.Autor}</p>
                                </div>
                            ) : (
                                <textarea
                                    name="ComentarioCierre" value={coordForm.ComentarioCierre} onChange={setCampo}
                                    rows="4" className={`${campo} resize-y border-l-2 !border-l-spec`}
                                    placeholder="Trabajo ejecutado, resultado final y condiciones en que se entrega el componente."
                                    required
                                />
                            )}
                        </Bloque>
                    )}

                    <Bloque
                        titulo="Demoras"
                        nota="Lo que impidió cumplir el plazo estimado."
                        accion={<button type="button" onClick={addDemora} className={btnMini}><IconMas className="h-3.5 w-3.5" /> Agregar demora</button>}
                    >
                        {coordForm.Demoras.length === 0 ? (
                            <p className="border border-dashed border-iron-300 bg-iron-50 px-4 py-5 text-center text-[12px] text-iron-500">
                                Sin demoras registradas.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {coordForm.Demoras.map((dem, i) => (
                                    <div key={i} className="flex items-end gap-3 border-l-2 border-alarm bg-alarm-wash/50 p-3">
                                        <div className="flex-1">
                                            <label className={rotuloMini}>Qué pasó</label>
                                            <input type="text" value={dem.Descripcion} onChange={(e) => setDemora(i, "Descripcion", e.target.value)} className={campoMini} placeholder="Describa la demora" required />
                                        </div>
                                        <div className="w-40">
                                            <label className={rotuloMini}>Fecha</label>
                                            <input type="date" value={dem.Fecha} onChange={(e) => setDemora(i, "Fecha", e.target.value)} className={`${campoMini} num`} required />
                                        </div>
                                        <button type="button" onClick={() => delDemora(i)} aria-label="Quitar demora" className="mb-1 rounded-[3px] p-1.5 text-iron-400 transition-colors hover:bg-white hover:text-alarm">
                                            <IconX className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Bloque>

                    <Bloque titulo="Evidencias" nota="Se suman a las que ya tenga la solicitud; nada se reemplaza." ultimo>
                        <div className="border border-dashed border-iron-300 bg-iron-50 px-4 py-4">
                            <input
                                type="file" accept="image/*" multiple onChange={(e) => setCoordEvidenceFiles(Array.from(e.target.files))} ref={fileRef}
                                className="block w-full cursor-pointer text-[13px] text-iron-600 file:mr-4 file:cursor-pointer file:rounded-[3px] file:border-0 file:bg-dye file:px-4 file:py-2 file:font-sans file:text-[13px] file:font-semibold file:text-white hover:file:bg-dye-mid"
                            />
                            {coordEvidenceFiles.length > 0 && (
                                <p className="mt-2 text-[12px] text-spec">
                                    {coordEvidenceFiles.length} {coordEvidenceFiles.length > 1 ? 'fotos listas' : 'foto lista'} para anexar.
                                </p>
                            )}
                        </div>
                    </Bloque>
                </form>

                {error && (
                    <div className="flex items-start gap-2.5 border-t border-alarm/30 bg-alarm-wash px-6 py-3">
                        <svg className="mt-px h-4 w-4 shrink-0 text-alarm" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <circle cx="10" cy="10" r="7.5" /><path d="M10 6v5M10 13.5v.5" strokeLinecap="square" />
                        </svg>
                        <p className="text-[12px] font-medium leading-relaxed text-alarm">{error}</p>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-iron-200 bg-iron-50 px-6 py-4">
                    <p className="text-[11px] text-iron-500">
                        Firma <strong className="font-semibold text-iron-700">{userAuth.name}</strong>
                    </p>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setManageModalItem(null)} className={btnLinea}>Cancelar</button>
                        <button type="submit" form="form-gestion-coord" disabled={loading} className={btn}>
                            {loading && (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
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

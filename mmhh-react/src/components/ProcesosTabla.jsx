import React, { useState } from 'react';
import { PROCESOS_COORDINADOR, AREAS_PROCESO } from '../constants';
import { getCurrentDateTime } from '../utils/helpers';
import { inputTabla, selectTabla, btnIcono } from '../ui';
import { HiloComentarios, CajaComentario } from './Comentarios';

/* Una sola definicion de rejilla para cabecera y filas: si cambia una columna,
   cambia en los dos sitios a la vez y nunca se desalinean. */
const REJILLA =
    "lg:grid lg:grid-cols-[1.5rem_minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(0,1.15fr)_3.6rem_2.6rem_3.6rem_2.8rem_1.6rem] lg:gap-2 lg:items-start";

const IconoQuitar = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Rotulo = ({ children }) => (
    <span className="block lg:hidden text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">{children}</span>
);

/**
 * Procesos requeridos, en tabla.
 *
 * Un componente puede llevar hasta diez procesos y cada uno arrastra ahora
 * ejecucion, horas reales y su propio hilo de comentarios. En tarjetas eso son
 * diez bloques altisimos dentro de un modal; en filas cabe todo y el estado del
 * trabajo se lee de una sola pasada por la columna "Hecho".
 */
export default function ProcesosTabla({ procesos, onChange, autor }) {
    const [abierto, setAbierto] = useState(null);

    const setProceso = (i, campo, valor) => {
        onChange(procesos.map((p, x) => {
            if (x !== i) return p;
            const u = { ...p, [campo]: valor };
            if (campo === "ProcesoRequerido") {
                const subs = PROCESOS_COORDINADOR[valor] || [];
                u.SubprocesoRequerido = subs[0] || "";
                u.ProcesoRequeridoCustom = "";
                u.SubprocesoRequeridoCustom = "";
            }
            if (campo === "AreaProceso" && valor !== "Otro") u.AreaProcesoCustom = "";
            // Al marcarlo hecho sin horas reales se propone el estimado: casi
            // siempre es el numero correcto y ahorra un campo por proceso.
            if (campo === "Realizado" && valor && !Number(u.HorasReales)) u.HorasReales = u.EstimadoHorasHombre || 0;
            return u;
        }));
    };

    const agregarComentario = (i) => {
        const texto = String(procesos[i].NuevoComentario || "").trim();
        if (!texto) return;
        onChange(procesos.map((p, x) => x !== i ? p : {
            ...p,
            Comentarios: [...(p.Comentarios || []), { Texto: texto, Autor: autor, Fecha: getCurrentDateTime(), Pendiente: true }],
            NuevoComentario: ""
        }));
    };

    const quitar = (i) => {
        if (procesos.length <= 1) return;
        onChange(procesos.filter((_, x) => x !== i));
        // Las filas de abajo suben una posicion: sin esto el panel abierto se
        // quedaria mostrando los comentarios del proceso equivocado.
        setAbierto(prev => prev === null || prev === i ? null : prev > i ? prev - 1 : prev);
    };

    return (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className={`hidden ${REJILLA} bg-slate-50 px-2.5 py-2 border-b border-slate-200 text-[10px] uppercase tracking-wide font-bold text-slate-500`}>
                <span>#</span>
                <span>Proceso</span>
                <span>Subproceso</span>
                <span>Área</span>
                <span className="text-right">H/H est</span>
                <span className="text-center" title="Marcar cuando el proceso ya se ejecutó">Hecho</span>
                <span className="text-right">H/H real</span>
                <span className="text-center">Notas</span>
                <span />
            </div>

            {procesos.map((p, i) => {
                const subs = PROCESOS_COORDINADOR[p.ProcesoRequerido] || [];
                const notas = (p.Comentarios || []).length;
                const expandido = abierto === i;

                const botonQuitar = (
                    <button
                        type="button" onClick={() => quitar(i)} disabled={procesos.length === 1}
                        className={btnIcono} aria-label={`Quitar proceso ${i + 1}`} title="Quitar este proceso"
                    >
                        <IconoQuitar />
                    </button>
                );

                return (
                    <div key={i} className={`border-b last:border-b-0 border-slate-100 ${p.Realizado ? 'bg-emerald-50/40' : ''}`}>
                        <div className={`px-2.5 py-2.5 ${REJILLA}`}>
                            <div className="flex items-center justify-between mb-2 lg:hidden">
                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Proceso {i + 1}</span>
                                {botonQuitar}
                            </div>

                            <span className="hidden lg:grid w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold place-items-center mt-1 tabular-nums">
                                {i + 1}
                            </span>

                            <div>
                                <Rotulo>Proceso</Rotulo>
                                <select value={p.ProcesoRequerido} onChange={(e) => setProceso(i, "ProcesoRequerido", e.target.value)} className={selectTabla} required aria-label={`Proceso ${i + 1}`}>
                                    {Object.keys(PROCESOS_COORDINADOR).map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                {p.ProcesoRequerido === "Otro" && (
                                    <input type="text" value={p.ProcesoRequeridoCustom || ""} onChange={(e) => setProceso(i, "ProcesoRequeridoCustom", e.target.value)} className={`${inputTabla} mt-1.5`} placeholder="¿Qué proceso?" required />
                                )}
                            </div>

                            <div className="mt-2 lg:mt-0">
                                <Rotulo>Subproceso</Rotulo>
                                {subs.length === 0 ? (
                                    <input type="text" readOnly value="No requiere" className={`${inputTabla} bg-slate-100 text-slate-400`} />
                                ) : subs.length === 1 && subs[0] === "Otro" ? (
                                    <input type="text" value={p.SubprocesoRequeridoCustom || ""} onChange={(e) => setProceso(i, "SubprocesoRequeridoCustom", e.target.value)} className={inputTabla} placeholder="¿Cuál subproceso?" required />
                                ) : (
                                    <>
                                        <select value={p.SubprocesoRequerido} onChange={(e) => setProceso(i, "SubprocesoRequerido", e.target.value)} className={selectTabla} required aria-label={`Subproceso ${i + 1}`}>
                                            {subs.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                        {p.SubprocesoRequerido === "Otro" && (
                                            <input type="text" value={p.SubprocesoRequeridoCustom || ""} onChange={(e) => setProceso(i, "SubprocesoRequeridoCustom", e.target.value)} className={`${inputTabla} mt-1.5`} placeholder="¿Cuál subproceso?" required />
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="mt-2 lg:mt-0">
                                <Rotulo>Área de proceso</Rotulo>
                                <select value={p.AreaProceso || ""} onChange={(e) => setProceso(i, "AreaProceso", e.target.value)} className={selectTabla} required aria-label={`Área del proceso ${i + 1}`}>
                                    {AREAS_PROCESO.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                {p.AreaProceso === "Otro" && (
                                    <input type="text" value={p.AreaProcesoCustom || ""} onChange={(e) => setProceso(i, "AreaProcesoCustom", e.target.value)} className={`${inputTabla} mt-1.5`} placeholder="¿Cuál área?" required />
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-2 lg:contents">
                                <div>
                                    <Rotulo>H/H est</Rotulo>
                                    <input
                                        type="number" min="0" step="0.5" value={p.EstimadoHorasHombre ?? 0}
                                        onChange={(e) => setProceso(i, "EstimadoHorasHombre", e.target.value)}
                                        className={`${inputTabla} text-right tabular-nums px-1.5`} required
                                        aria-label={`Horas hombre estimadas del proceso ${i + 1}`}
                                    />
                                </div>

                                <div className="lg:pt-1.5">
                                    <Rotulo>Hecho</Rotulo>
                                    <label className="flex items-center justify-center h-[30px] cursor-pointer" title="Marcar cuando el proceso ya se ejecutó">
                                        <input
                                            type="checkbox" checked={!!p.Realizado}
                                            onChange={(e) => setProceso(i, "Realizado", e.target.checked)}
                                            className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                            aria-label={`Proceso ${i + 1} realizado`}
                                        />
                                    </label>
                                </div>

                                <div>
                                    <Rotulo>H/H real</Rotulo>
                                    <input
                                        type="number" min="0" step="0.5" value={p.HorasReales ?? 0}
                                        onChange={(e) => setProceso(i, "HorasReales", e.target.value)}
                                        className={`${inputTabla} text-right tabular-nums px-1.5 ${p.Realizado ? 'border-emerald-300' : ''}`}
                                        aria-label={`Horas hombre reales del proceso ${i + 1}`}
                                    />
                                </div>
                            </div>

                            <div className="mt-2 lg:mt-0 lg:pt-1.5 lg:flex lg:justify-center">
                                <button
                                    type="button" onClick={() => setAbierto(expandido ? null : i)}
                                    aria-expanded={expandido}
                                    className={`inline-flex items-center gap-1 px-2 h-[30px] rounded-md border text-[11px] font-bold cursor-pointer transition ${notas > 0
                                        ? 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                                        : 'border-dashed border-slate-300 bg-white text-slate-400 hover:text-slate-600'}`}
                                    title={notas > 0 ? `${notas} comentario${notas > 1 ? 's' : ''}` : 'Agregar un comentario'}
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                                    </svg>
                                    <span className="tabular-nums">{notas || '+'}</span>
                                    <span className="lg:hidden">{expandido ? 'Ocultar comentarios' : 'Comentarios'}</span>
                                </button>
                            </div>

                            <div className="hidden lg:block lg:pt-1.5">{botonQuitar}</div>
                        </div>

                        {expandido && (
                            <div className="px-2.5 pb-3 lg:pl-[2.5rem]">
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                                        Comentarios del proceso {i + 1}
                                    </p>
                                    <HiloComentarios
                                        comentarios={p.Comentarios || []}
                                        vacio="Sin comentarios en este proceso."
                                        alto="max-h-48"
                                    />
                                    <div className="mt-2.5">
                                        <CajaComentario
                                            value={p.NuevoComentario}
                                            onChange={(v) => setProceso(i, "NuevoComentario", v)}
                                            onAdd={() => agregarComentario(i)}
                                            placeholder="Qué se hizo en este proceso, qué se encontró o por qué se detuvo."
                                            firma={`Se firma como ${autor}`}
                                            etiquetaBoton="Agregar"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

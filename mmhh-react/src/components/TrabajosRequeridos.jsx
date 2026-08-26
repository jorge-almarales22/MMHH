import React from 'react';
import { SOPORTE_OPCIONES, MAX_TRABAJOS_CLIENTE } from '../constants';
import { nuevoTrabajo } from '../utils/helpers';
import { inputTabla, selectTabla, btnBorde, btnIcono } from '../ui';

const IconoQuitar = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/* Rejilla compartida por la cabecera y las filas: un solo sitio donde cuadra. */
const REJILLA = "sm:grid sm:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)_1.75rem] sm:gap-2 sm:items-start";

/**
 * Trabajos requeridos del cliente.
 *
 * Una fila por trabajo: una categoria de soporte y un unico tipo de
 * requerimiento. Antes era una sola categoria con casillas multiples, lo que
 * impedia pedir, por ejemplo, una reparacion y un rectificado en la misma
 * solicitud. En forma de tabla seis trabajos siguen leyendose de un vistazo.
 */
export default function TrabajosRequeridos({ trabajos, onChange, max = MAX_TRABAJOS_CLIENTE }) {
    const lista = trabajos.length > 0 ? trabajos : [nuevoTrabajo()];
    const lleno = lista.length >= max;

    const setTrabajo = (i, campo, valor) => {
        const out = lista.map((t, x) => {
            if (x !== i) return t;
            const u = { ...t, [campo]: valor };
            // Cambiar de categoria invalida el tipo elegido: pertenecia a la anterior.
            if (campo === "Soporte") { u.TipoRequerimiento = ""; u.TipoRequerimientoCustom = ""; u.SoporteCustom = ""; }
            if (campo === "TipoRequerimiento" && valor !== "Otro") u.TipoRequerimientoCustom = "";
            return u;
        });
        onChange(out);
    };

    const agregar = () => !lleno && onChange([...lista, nuevoTrabajo()]);
    const quitar = (i) => lista.length > 1 && onChange(lista.filter((_, x) => x !== i));

    return (
        <div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className={`hidden ${REJILLA} bg-slate-50 px-3 py-2 border-b border-slate-200 text-[10px] uppercase tracking-wide font-bold text-slate-500`}>
                    <span>#</span>
                    <span>Soporte <span className="text-red-500">*</span></span>
                    <span>Tipo de requerimiento <span className="text-red-500">*</span></span>
                    <span />
                </div>

                {lista.map((t, i) => {
                    const opciones = SOPORTE_OPCIONES[t.Soporte] || [];
                    const libre = t.Soporte === "Otro";

                    const botonQuitar = (
                        <button
                            type="button" onClick={() => quitar(i)} disabled={lista.length === 1}
                            className={btnIcono} aria-label={`Quitar trabajo ${i + 1}`} title="Quitar este trabajo"
                        >
                            <IconoQuitar />
                        </button>
                    );

                    return (
                        <div key={i} className={`px-3 py-2.5 border-b last:border-b-0 border-slate-100 ${REJILLA}`}>
                            <div className="flex items-center justify-between mb-2 sm:hidden">
                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Trabajo {i + 1}</span>
                                {botonQuitar}
                            </div>

                            <span className="hidden sm:grid w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold place-items-center mt-1 tabular-nums">
                                {i + 1}
                            </span>

                            <div>
                                <select
                                    value={t.Soporte} onChange={(e) => setTrabajo(i, "Soporte", e.target.value)}
                                    className={selectTabla} required aria-label={`Soporte del trabajo ${i + 1}`}
                                >
                                    <option value="">Selecciona...</option>
                                    {Object.keys(SOPORTE_OPCIONES).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {libre && (
                                    <input
                                        type="text" value={t.SoporteCustom || ""} onChange={(e) => setTrabajo(i, "SoporteCustom", e.target.value)}
                                        className={`${inputTabla} mt-1.5`} placeholder="¿Qué soporte necesitas?" required
                                    />
                                )}
                            </div>

                            <div className="mt-2 sm:mt-0">
                                {!t.Soporte ? (
                                    <input type="text" readOnly value="Elige primero el soporte" className={`${inputTabla} bg-slate-100 text-slate-400 cursor-not-allowed`} />
                                ) : libre ? (
                                    <input
                                        type="text" value={t.TipoRequerimiento || ""} onChange={(e) => setTrabajo(i, "TipoRequerimiento", e.target.value)}
                                        className={inputTabla} placeholder="Describe el trabajo" required
                                    />
                                ) : (
                                    <>
                                        <select
                                            value={t.TipoRequerimiento || ""} onChange={(e) => setTrabajo(i, "TipoRequerimiento", e.target.value)}
                                            className={selectTabla} required aria-label={`Tipo de requerimiento del trabajo ${i + 1}`}
                                        >
                                            <option value="">Selecciona...</option>
                                            {opciones.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                        {t.TipoRequerimiento === "Otro" && (
                                            <input
                                                type="text" value={t.TipoRequerimientoCustom || ""} onChange={(e) => setTrabajo(i, "TipoRequerimientoCustom", e.target.value)}
                                                className={`${inputTabla} mt-1.5`} placeholder="¿Qué otro trabajo?" required
                                            />
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="hidden sm:block mt-0.5">{botonQuitar}</div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <p className="text-[11px] text-slate-400">
                    {lista.length} de {max} trabajos{lleno && ' · es el máximo por solicitud'}
                </p>
                <button type="button" onClick={agregar} disabled={lleno} className={`${btnBorde} disabled:opacity-40 disabled:cursor-not-allowed`}>
                    + Agregar trabajo
                </button>
            </div>
        </div>
    );
}

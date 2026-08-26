import React, { useState } from 'react';
import { getCurrentDateTime } from '../utils/helpers';
import { inputCls, btnBorde } from '../ui';

/**
 * Revision de los trabajos que pidio el cliente.
 *
 * El coordinador puede descartar los que el taller no puede ejecutar, pero
 * nunca en silencio: el motivo es obligatorio y queda firmado y fechado junto
 * al trabajo. El trabajo tampoco desaparece — se tacha — para que el cliente
 * vea que se leyo su peticion y por que no se hizo.
 */
export default function TrabajosRevision({ trabajos, onChange, autor }) {
    const [descartando, setDescartando] = useState(null);
    const [motivo, setMotivo] = useState("");

    if (trabajos.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
                <p className="text-xs text-slate-500">Esta solicitud no trae trabajos requeridos registrados.</p>
            </div>
        );
    }

    const abrir = (i) => { setDescartando(i); setMotivo(""); };
    const cerrar = () => { setDescartando(null); setMotivo(""); };

    const confirmar = (i) => {
        const texto = motivo.trim();
        if (!texto) return;
        onChange(trabajos.map((t, x) => x !== i ? t : {
            ...t,
            Descartado: { Motivo: texto, Autor: autor, Fecha: getCurrentDateTime() }
        }));
        cerrar();
    };

    const restaurar = (i) => onChange(trabajos.map((t, x) => {
        if (x !== i) return t;
        const { Descartado, ...resto } = t;
        return resto;
    }));

    const vigentes = trabajos.filter(t => !t.Descartado).length;

    return (
        <div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
                {trabajos.map((t, i) => {
                    const fuera = !!t.Descartado;
                    const enFormulario = descartando === i;

                    return (
                        <div key={i} className={`px-3 py-2.5 border-b last:border-b-0 border-slate-100 ${fuera ? 'bg-slate-50' : ''}`}>
                            <div className="flex items-start gap-3">
                                <span className={`grid shrink-0 w-6 h-6 rounded-full text-[11px] font-bold place-items-center mt-0.5 tabular-nums ${fuera ? 'bg-slate-300 text-white' : 'bg-slate-900 text-white'}`}>
                                    {i + 1}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${fuera ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                        <span className="font-semibold">{t.Soporte || "Sin soporte"}</span>
                                        {t.TipoRequerimiento && <span className="text-slate-500"> · {t.TipoRequerimiento}</span>}
                                    </p>

                                    {fuera && (
                                        <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">No se ejecuta</p>
                                            <p className="text-[13px] text-slate-700 whitespace-pre-wrap mt-0.5">{t.Descartado.Motivo}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 tabular-nums">
                                                {t.Descartado.Autor} · {t.Descartado.Fecha}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {fuera ? (
                                    <button type="button" onClick={() => restaurar(i)} className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer">
                                        Restaurar
                                    </button>
                                ) : !enFormulario && (
                                    <button type="button" onClick={() => abrir(i)} className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer">
                                        Descartar
                                    </button>
                                )}
                            </div>

                            {enFormulario && (
                                <div className="mt-2.5 ml-9 rounded-lg border border-red-200 bg-red-50 p-2.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-red-700 mb-1.5">
                                        Por qué no se puede hacer
                                    </label>
                                    <textarea
                                        value={motivo} onChange={(e) => setMotivo(e.target.value)} rows="2" autoFocus
                                        className={`${inputCls} resize-y border-red-300 focus:border-red-500 focus:ring-red-200`}
                                        placeholder="Ej. la pieza no admite ese mecanizado por el desgaste que trae."
                                    />
                                    <div className="flex flex-wrap justify-end gap-2 mt-2">
                                        <button type="button" onClick={cerrar} className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white cursor-pointer">
                                            Cancelar
                                        </button>
                                        <button
                                            type="button" onClick={() => confirmar(i)} disabled={!motivo.trim()}
                                            className={`${btnBorde} text-xs border-red-300 text-red-700 hover:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed`}
                                        >
                                            Descartar trabajo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
                {vigentes} de {trabajos.length} trabajos siguen vigentes. El motivo del descarte queda visible para el cliente.
            </p>
        </div>
    );
}

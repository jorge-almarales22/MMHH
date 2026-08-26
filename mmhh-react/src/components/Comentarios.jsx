import React from 'react';
import { inputCls, btnBorde } from '../ui';

/**
 * Hilo de comentarios.
 *
 * Un comentario es un hecho fechado y firmado: no se edita ni se borra. Los que
 * todavia no se han guardado se marcan como pendientes para que nadie confunda
 * lo que ya quedo en la base con lo que se perderia al cancelar.
 */
export const HiloComentarios = ({ comentarios = [], vacio = "Todavía no hay comentarios.", alto = "max-h-56" }) => {
    if (comentarios.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center">
                <p className="text-xs text-slate-500">{vacio}</p>
            </div>
        );
    }

    return (
        <ol className={`space-y-2 overflow-y-auto ${alto}`}>
            {comentarios.map((c, i) => (
                <li
                    key={i}
                    className={`rounded-lg border px-3 py-2 ${c.EsCierre
                        ? 'border-emerald-200 bg-emerald-50'
                        : c.Pendiente
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-slate-200 bg-white'}`}
                >
                    <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-slate-800">{c.Autor || "Sin autor"}</span>
                        {c.EsCierre && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">CIERRE</span>
                        )}
                        {c.Pendiente && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-400 text-slate-900">SIN GUARDAR</span>
                        )}
                        <span className="ml-auto text-[10px] text-slate-400 tabular-nums">{c.Fecha}</span>
                    </div>
                    <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-snug">{c.Texto}</p>
                </li>
            ))}
        </ol>
    );
};

/** Caja para redactar: el boton queda inhabilitado mientras no haya texto. */
export const CajaComentario = ({ value, onChange, onAdd, placeholder, firma, etiquetaBoton = "Agregar comentario", enviando = false }) => {
    const vacio = !String(value || "").trim();

    const alTeclear = (e) => {
        // Ctrl+Enter envia: escribir varios comentarios seguidos sin soltar el teclado.
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !vacio) { e.preventDefault(); onAdd(); }
    };

    return (
        <div>
            <textarea
                value={value || ""} onChange={(e) => onChange(e.target.value)} onKeyDown={alTeclear}
                rows="2" className={`${inputCls} resize-y`} placeholder={placeholder}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                {firma && <span className="text-[11px] text-slate-400">{firma}</span>}
                <button
                    type="button" onClick={onAdd} disabled={vacio || enviando}
                    className={`${btnBorde} ml-auto disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    {enviando ? 'Guardando...' : etiquetaBoton}
                </button>
            </div>
        </div>
    );
};

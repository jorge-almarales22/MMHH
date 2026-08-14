import React from 'react';
import { inputCls, selectCls } from '../ui';

/** Tile de conteo: es el filtro rapido de la cabecera. */
export const Tile = ({ label, valor, color, activo, onClick }) => {
    const contenido = (
        <>
            <p className="text-lg sm:text-2xl font-bold tabular-nums" style={{ color: color || '#0f172a' }}>{valor}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold leading-tight mt-0.5">{label}</p>
        </>
    );
    const base = 'text-left px-3 sm:px-4 py-2.5 rounded-xl border bg-white transition';

    if (!onClick) return <div className={`${base} border-slate-200`}>{contenido}</div>;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={activo}
            className={`${base} cursor-pointer ${activo ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'}`}
        >
            {contenido}
        </button>
    );
};

/** Pildoras excluyentes. */
export const Pildoras = ({ opciones, valor, onChange }) => (
    <div className="flex gap-1 overflow-x-auto -mx-1 px-1">
        {opciones.map(o => (
            <button
                key={o.id || 'todas'}
                type="button"
                onClick={() => onChange(o.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition cursor-pointer ${
                    valor === o.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                }`}
            >
                {o.label}
            </button>
        ))}
    </div>
);

/** Control segmentado sobre fondo gris. */
export const Segmentado = ({ opciones, valor, onChange }) => (
    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {opciones.map(o => (
            <button
                key={o.id}
                type="button"
                onClick={() => onChange(o.id)}
                aria-pressed={valor === o.id}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                    valor === o.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
                {o.label}
            </button>
        ))}
    </div>
);

export const SelectFiltro = ({ titulo, value, onChange, opciones, todos = "Todos" }) => (
    <label className="block">
        <span className="block text-[11px] font-semibold text-slate-600 mb-1">{titulo}</span>
        <select value={value} onChange={onChange} className={selectCls}>
            <option value="">{todos}</option>
            {opciones.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </label>
);

export const FechaFiltro = ({ titulo, value, onChange }) => (
    <label className="block">
        <span className="block text-[11px] font-semibold text-slate-600 mb-1">{titulo}</span>
        <input type="date" value={value} onChange={onChange} className={inputCls} />
    </label>
);

/** Panel de filtros avanzados, plegado por defecto. */
export const FiltrosAvanzados = ({ abierto, onToggle, activos, onLimpiar, children }) => (
    <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between gap-3">
            <button
                type="button"
                onClick={onToggle}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                aria-expanded={abierto}
            >
                <svg className={`w-3 h-3 transition-transform ${abierto ? 'rotate-90' : ''}`} viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                    <path d="M4 2l5 4-5 4z" />
                </svg>
                Más filtros
                {activos > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] tabular-nums">{activos}</span>
                )}
            </button>
            {activos > 0 && (
                <button type="button" onClick={onLimpiar} className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer">
                    Limpiar filtros
                </button>
            )}
        </div>

        {abierto && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mt-3">
                {children}
            </div>
        )}
    </div>
);

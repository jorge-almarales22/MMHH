import React from 'react';
import { filterInput, labelSm, btnGhostSm } from '../ui';

export function Campo({ titulo, ancho = "", children }) {
    return (
        <div className={ancho}>
            <label className={labelSm}>{titulo}</label>
            {children}
        </div>
    );
}

export function SelectFiltro({ titulo, value, onChange, opciones, todos = "Todos", ancho = "" }) {
    return (
        <Campo titulo={titulo} ancho={ancho}>
            <select value={value} onChange={onChange} className={`${filterInput} w-full`}>
                <option value="">{todos}</option>
                {opciones.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </Campo>
    );
}

export function TextoFiltro({ titulo, value, onChange, placeholder, ancho = "" }) {
    return (
        <Campo titulo={titulo} ancho={ancho}>
            <div className="relative">
                <svg className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 103.4 9.85l3.62 3.63a.75.75 0 101.06-1.06l-3.63-3.63A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd" />
                </svg>
                <input type="text" value={value} onChange={onChange} placeholder={placeholder} className={`${filterInput} w-full pl-8`} />
            </div>
        </Campo>
    );
}

export function FechaFiltro({ titulo, value, onChange, ancho = "" }) {
    return (
        <Campo titulo={titulo} ancho={ancho}>
            <input type="date" value={value} onChange={onChange} className={`${filterInput} tabular w-full`} />
        </Campo>
    );
}

export function BarraFiltros({ children, onLimpiar, activos = 0 }) {
    return (
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.6 4.4A1 1 0 013.5 3h13a1 1 0 01.8 1.6l-4.9 6.3v4.4a1 1 0 01-.55.9l-2.5 1.25A1 1 0 018 16.5v-5.6L3.1 4.6a1 1 0 01-.5-.2z" clipRule="evenodd" /></svg>
                    Filtros
                    {activos > 0 && (
                        <span className="tabular rounded-full bg-cerrejon-orange px-1.5 py-0.5 text-[10px] font-bold text-white">{activos}</span>
                    )}
                </span>
                <button type="button" onClick={onLimpiar} className={btnGhostSm}>Limpiar filtros</button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {children}
            </div>
        </div>
    );
}

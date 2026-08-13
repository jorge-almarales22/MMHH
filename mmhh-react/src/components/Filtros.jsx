import React, { useState } from 'react';
import { campoFiltro, rotuloMini, btnTexto } from '../ui';

export function Campo({ titulo, ancho = "", children }) {
    return (
        <div className={ancho}>
            <label className={rotuloMini}>{titulo}</label>
            {children}
        </div>
    );
}

export function SelectFiltro({ titulo, value, onChange, opciones, todos = "Todos", ancho = "" }) {
    return (
        <Campo titulo={titulo} ancho={ancho}>
            <select value={value} onChange={onChange} className={`${campoFiltro} w-full`}>
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
                <svg className="pointer-events-none absolute left-2.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-iron-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="8.5" cy="8.5" r="5" />
                    <path d="M12.5 12.5L17 17" strokeLinecap="square" />
                </svg>
                <input
                    type="text" value={value} onChange={onChange} placeholder={placeholder}
                    className={`${campoFiltro} w-full !pl-8 !pr-2.5`}
                />
            </div>
        </Campo>
    );
}

export function FechaFiltro({ titulo, value, onChange, ancho = "" }) {
    return (
        <Campo titulo={titulo} ancho={ancho}>
            <input type="date" value={value} onChange={onChange} className={`${campoFiltro} num w-full !pr-2.5`} />
        </Campo>
    );
}

/**
 * Los filtros ocupan mucho y se usan poco: quedan plegados tras una linea que
 * dice cuantos hay puestos. Se abren solos si ya hay alguno activo.
 */
export function BarraFiltros({ children, onLimpiar, activos = 0 }) {
    const [abierto, setAbierto] = useState(false);
    const visible = abierto || activos > 0;

    return (
        <div className="no-print border-b border-iron-200 bg-iron-50">
            <div className="flex items-center justify-between gap-4 px-5 py-2.5">
                <button
                    type="button" onClick={() => setAbierto(v => !v)}
                    className="dial inline-flex items-center gap-2 text-[10px] text-iron-500 transition-colors hover:text-iron-900"
                    aria-expanded={visible}
                >
                    <svg
                        className={`h-3 w-3 transition-transform ${visible ? 'rotate-90' : ''}`}
                        viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
                    >
                        <path d="M4 2l5 4-5 4z" />
                    </svg>
                    Filtros
                    {activos > 0 && (
                        <span className="num rounded-[2px] bg-brand px-1.5 py-px text-[10px] font-medium text-white">
                            {activos}
                        </span>
                    )}
                </button>
                {activos > 0 && (
                    <button type="button" onClick={onLimpiar} className={btnTexto}>Limpiar filtros</button>
                )}
            </div>

            {visible && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-iron-200 px-5 py-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {children}
                </div>
            )}
        </div>
    );
}

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

/** Ventana de paginas alrededor de la actual: con 40 paginas no caben todas. */
const ventanaPaginas = (actual, total, ancho = 5) => {
    if (total <= ancho) return Array.from({ length: total }, (_, i) => i + 1);
    let inicio = Math.max(1, actual - Math.floor(ancho / 2));
    const fin = Math.min(total, inicio + ancho - 1);
    inicio = Math.max(1, fin - ancho + 1);
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
};

const btnPagina = "min-w-[2rem] h-8 px-2 rounded-lg border text-xs font-bold cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed";

/**
 * Paginacion de la lista.
 *
 * La cola del taller pasa de las cien solicitudes y desplazarse por todas para
 * llegar al final no es forma de trabajar. El tamano de pagina es del usuario:
 * quien revisa una por una quiere 10, quien busca un patron quiere 100.
 */
export const Paginacion = ({ pagina, porPagina, total, onPagina, onPorPagina, opcionesTamano = [10, 25, 50, 100] }) => {
    const paginas = Math.max(1, Math.ceil(total / porPagina));
    const desde = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
    const hasta = Math.min(pagina * porPagina, total);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 no-print">
            <p className="text-xs text-slate-500 tabular-nums">
                Mostrando <strong className="text-slate-700">{desde}–{hasta}</strong> de{' '}
                <strong className="text-slate-700">{total}</strong> solicitudes
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="hidden sm:inline">Por página</span>
                    <select
                        value={porPagina}
                        onChange={(e) => onPorPagina(Number(e.target.value))}
                        className="rounded-lg border border-slate-300 bg-white pl-2 pr-7 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-[position:right_0.35rem_center] bg-[size:14px]"
                    >
                        {opcionesTamano.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </label>

                {paginas > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            type="button" onClick={() => onPagina(pagina - 1)} disabled={pagina <= 1}
                            className={`${btnPagina} border-slate-300 bg-white text-slate-600 hover:border-slate-400`}
                            aria-label="Página anterior"
                        >
                            ‹
                        </button>

                        {ventanaPaginas(pagina, paginas)[0] > 1 && (
                            <>
                                <button type="button" onClick={() => onPagina(1)} className={`${btnPagina} border-slate-300 bg-white text-slate-600 hover:border-slate-400`}>1</button>
                                <span className="text-xs text-slate-400 px-0.5">…</span>
                            </>
                        )}

                        {ventanaPaginas(pagina, paginas).map(n => (
                            <button
                                key={n} type="button" onClick={() => onPagina(n)} aria-current={n === pagina ? 'page' : undefined}
                                className={`${btnPagina} tabular-nums ${n === pagina
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'}`}
                            >
                                {n}
                            </button>
                        ))}

                        {ventanaPaginas(pagina, paginas).slice(-1)[0] < paginas && (
                            <>
                                <span className="text-xs text-slate-400 px-0.5">…</span>
                                <button type="button" onClick={() => onPagina(paginas)} className={`${btnPagina} border-slate-300 bg-white text-slate-600 hover:border-slate-400 tabular-nums`}>{paginas}</button>
                            </>
                        )}

                        <button
                            type="button" onClick={() => onPagina(pagina + 1)} disabled={pagina >= paginas}
                            className={`${btnPagina} border-slate-300 bg-white text-slate-600 hover:border-slate-400`}
                            aria-label="Página siguiente"
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

import React from 'react';
import { th, theadCls, theadTr, chip, chipEstado, chipSolicitud, chipPrioridad, chipPlazo, tarjetaVacia } from '../ui';
import { getEstadoSolicitud, getPrioridadEfectiva, totalHorasHombre } from '../utils/helpers';
import { medirTolerancia, etiquetaDesvio } from '../utils/tolerancia';

const ChipPlazo = ({ t }) => {
    if (!t) return <span className="text-[11px] text-slate-400">—</span>;
    return (
        <span className={`${chip} ${chipPlazo(t.estado)}`} title={`${t.dias} de ${t.permitidos} días`}>
            {etiquetaDesvio(t)}
        </span>
    );
};

const Acciones = ({ item, onViewDetails, onOpenManageModal, puedeGestionar }) => (
    <div className="flex items-center justify-end gap-1.5">
        <button
            onClick={() => onViewDetails(item)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:border-slate-400 cursor-pointer"
        >
            Ver
        </button>
        {puedeGestionar && (
            <button
                onClick={() => onOpenManageModal(item)}
                className="px-2.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-bold cursor-pointer"
            >
                Gestionar
            </button>
        )}
    </div>
);

export default function TablaSolicitudes({ items, onViewDetails, onOpenManageModal, puedeGestionar, mostrarOrden = false, vacio }) {
    if (items.length === 0) {
        return (
            <div className={tarjetaVacia}>
                <p className="text-sm font-semibold text-slate-600">{vacio || "No hay solicitudes para este filtro"}</p>
                <p className="text-xs text-slate-400 mt-1">Cambia el periodo o el estado para ver otras.</p>
            </div>
        );
    }

    return (
        <>
            {/* ---- Tabla (pantallas medianas y grandes) ---- */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className={theadCls}>
                            <tr className={theadTr}>
                                {mostrarOrden && <th className={th}>Turno</th>}
                                <th className={th}>N.º</th>
                                <th className={th}>Componente</th>
                                <th className={th}>OT</th>
                                <th className={th}>Prioridad</th>
                                <th className={th}>Plazo</th>
                                <th className={th}>Solicitud</th>
                                <th className={th}>Estado</th>
                                <th className={th}>H/H</th>
                                <th className={`${th} text-right`}>Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item, idx) => {
                                const d = item.parsedData;
                                if (d.Error) {
                                    return (
                                        <tr key={item.Id}>
                                            <td colSpan={mostrarOrden ? 10 : 9} className="px-4 py-3 text-xs text-red-700">
                                                Registro {item.Id}: {d.Error}
                                            </td>
                                        </tr>
                                    );
                                }
                                const estadoSol = getEstadoSolicitud(d);
                                const estadoComp = d.Coordinador ? d.Coordinador.Estado : "";
                                const prioridad = getPrioridadEfectiva(d);
                                const pCoord = d.Coordinador && d.Coordinador.PrioridadCoordinador;
                                const reclasificada = !!(pCoord && pCoord !== d.Prioridad);
                                const hh = totalHorasHombre(d.Coordinador);
                                const t = medirTolerancia(d);
                                const vencida = t && t.estado === 'fuera';

                                return (
                                    <tr
                                        key={item.Id}
                                        onDoubleClick={() => onViewDetails(item)}
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter') onViewDetails(item); }}
                                        title="Doble clic para abrir"
                                        className={`hover:bg-slate-50 focus:bg-slate-50 focus:outline-none cursor-pointer select-none ${vencida ? 'bg-red-50/50' : ''}`}
                                    >
                                        {mostrarOrden && (
                                            <td className="px-4 py-3 align-top">
                                                <span className="text-xs font-bold text-slate-400 tabular-nums">{idx + 1}</span>
                                            </td>
                                        )}
                                        <td className="px-4 py-3 whitespace-nowrap align-top">
                                            <span className="font-bold text-slate-900 tabular-nums">{d.SolicitudID || "—"}</span>
                                            <span className="block text-[10px] text-slate-400 tabular-nums">{d.Fecha}</span>
                                        </td>
                                        <td className="px-4 py-3 max-w-[240px] align-top">
                                            <span className="text-slate-800">{d.NombreComponente}</span>
                                            <span className="block text-[10px] text-slate-400 mt-0.5">
                                                {d.Flota} · {d.Soporte}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className="text-xs font-semibold text-slate-700 tabular-nums">{d.OT}</span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span
                                                className={`${chip} ${chipPrioridad(prioridad)}`}
                                                title={reclasificada ? `El coordinador la cambió desde ${d.Prioridad}` : undefined}
                                            >
                                                {prioridad || "—"}{reclasificada && ' *'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-top"><ChipPlazo t={t} /></td>
                                        <td className="px-4 py-3 align-top">
                                            <span className={`${chip} ${chipSolicitud(estadoSol)}`}>{estadoSol}</span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            {estadoComp
                                                ? <span className={`${chip} ${chipEstado(estadoComp)}`}>{estadoComp}</span>
                                                : <span className="text-[11px] text-slate-400">Sin asignar</span>}
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className="text-xs font-semibold text-slate-700 tabular-nums">{hh || "—"}</span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <Acciones item={item} onViewDetails={onViewDetails} onOpenManageModal={onOpenManageModal} puedeGestionar={puedeGestionar} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ---- Tarjetas (pantallas pequenas) ---- */}
            <div className="md:hidden space-y-2">
                {items.map((item, idx) => {
                    const d = item.parsedData;
                    if (d.Error) {
                        return (
                            <div key={item.Id} className="bg-white rounded-2xl border border-red-200 p-3 text-xs text-red-700">
                                Registro {item.Id}: {d.Error}
                            </div>
                        );
                    }
                    const estadoSol = getEstadoSolicitud(d);
                    const estadoComp = d.Coordinador ? d.Coordinador.Estado : "";
                    const prioridad = getPrioridadEfectiva(d);
                    const hh = totalHorasHombre(d.Coordinador);
                    const t = medirTolerancia(d);
                    const vencida = t && t.estado === 'fuera';

                    return (
                        <div
                            key={item.Id}
                            className={`bg-white rounded-2xl border p-3 ${vencida ? 'border-red-200 bg-red-50/40' : 'border-slate-200'}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        {mostrarOrden && <span className="text-[11px] font-bold text-slate-400 tabular-nums">#{idx + 1}</span>}
                                        <span className="font-bold text-slate-900 tabular-nums">{d.SolicitudID || "—"}</span>
                                        <span className={`${chip} ${chipPrioridad(prioridad)}`}>{prioridad}</span>
                                    </div>
                                    <p className="text-sm text-slate-800 mt-1 truncate">{d.NombreComponente}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                                        {d.OT} · {d.Flota} · {d.Fecha}
                                    </p>
                                </div>
                                <ChipPlazo t={t} />
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-3">
                                <span className={`${chip} ${chipSolicitud(estadoSol)}`}>{estadoSol}</span>
                                {estadoComp && <span className={`${chip} ${chipEstado(estadoComp)}`}>{estadoComp}</span>}
                                {hh > 0 && <span className="text-[11px] font-semibold text-slate-500 tabular-nums">{hh} H/H</span>}
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <Acciones item={item} onViewDetails={onViewDetails} onOpenManageModal={onOpenManageModal} puedeGestionar={puedeGestionar} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

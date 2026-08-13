import React from 'react';
import { th, td, pill, estadoTono, estadoSolicitudTono, prioridadTono } from '../ui';
import { getEstadoSolicitud, getPrioridadEfectiva, totalHorasHombre } from '../utils/helpers';

const IconOjo = () => (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const IconGestion = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" />
    </svg>
);

export default function TablaSolicitudes({ items, onViewDetails, onOpenManageModal, puedeGestionar, mostrarRanking = false, vacio }) {
    return (
        <div className="thin-scroll overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead className="border-b border-slate-200 bg-slate-50/60">
                    <tr>
                        {mostrarRanking && <th className={`${th} w-12 text-center`}>#</th>}
                        <th className={th}>Solicitud</th>
                        <th className={th}>Fecha</th>
                        <th className={th}>OT</th>
                        <th className={th}>Componente</th>
                        <th className={th}>Soporte</th>
                        <th className={`${th} text-center`}>Prioridad</th>
                        <th className={`${th} text-center`}>Estado solicitud</th>
                        <th className={th}>Estado componente</th>
                        <th className={`${th} text-right`}>H/H</th>
                        <th className={`${th} text-center`}>Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={mostrarRanking ? 11 : 10} className="px-4 py-16 text-center">
                                <svg className="mx-auto mb-3 h-9 w-9 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h7M9 9h6M9 13h4" />
                                    <circle cx="17.5" cy="17.5" r="3.5" />
                                </svg>
                                <p className="text-[13px] font-medium text-slate-500">{vacio || "No hay registros que coincidan con los filtros."}</p>
                            </td>
                        </tr>
                    ) : (
                        items.map((item, idx) => {
                            const d = item.parsedData;
                            if (d.Error) {
                                return (
                                    <tr key={item.Id}>
                                        <td colSpan={mostrarRanking ? 11 : 10} className="px-4 py-3 text-[13px] text-red-600">
                                            Registro {item.Id}: {d.Error}
                                        </td>
                                    </tr>
                                );
                            }
                            const estadoSol = getEstadoSolicitud(d);
                            const estadoComp = d.Coordinador ? d.Coordinador.Estado : "";
                            const prioridad = getPrioridadEfectiva(d);
                            const esDelCoordinador = !!(d.Coordinador && d.Coordinador.PrioridadCoordinador);
                            const hh = totalHorasHombre(d.Coordinador);

                            return (
                                <tr key={item.Id} className="transition-colors hover:bg-slate-50">
                                    {mostrarRanking && (
                                        <td className={`${td} text-center`}>
                                            <span className={`tabular inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${idx < 3 ? 'bg-cerrejon-orange text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                    )}
                                    <td className={`${td} tabular font-semibold text-slate-900`}>{d.SolicitudID || "—"}</td>
                                    <td className={`${td} tabular whitespace-nowrap text-slate-500`}>{d.Fecha}</td>
                                    <td className={`${td} tabular font-semibold text-cerrejon-orangeDark`}>{d.OT}</td>
                                    <td className={td}>
                                        <span className="block max-w-[15rem] truncate font-medium text-slate-900" title={d.NombreComponente}>{d.NombreComponente}</span>
                                        <span className="mt-0.5 block text-[11px] text-slate-500">{d.Flota} · PN {d.PN || "N/A"}</span>
                                    </td>
                                    <td className={td}>
                                        <span className="block max-w-[11rem] truncate text-slate-600" title={d.Soporte}>{d.Soporte}</span>
                                    </td>
                                    <td className={`${td} text-center`}>
                                        <span className={`${pill} ${prioridadTono(prioridad)}`}>{prioridad || "—"}</span>
                                        <span className="mt-1 block text-[10px] text-slate-400">
                                            {esDelCoordinador ? "coordinador" : "cliente"}
                                        </span>
                                    </td>
                                    <td className={`${td} text-center`}>
                                        <span className={`${pill} ${estadoSolicitudTono(estadoSol)}`}>{estadoSol}</span>
                                    </td>
                                    <td className={td}>
                                        {estadoComp
                                            ? <span className={`${pill} ${estadoTono(estadoComp)}`}>{estadoComp}</span>
                                            : <span className="text-[11px] italic text-slate-400">Sin asignar</span>}
                                    </td>
                                    <td className={`${td} tabular text-right font-medium text-slate-700`}>{hh || "—"}</td>
                                    <td className={td}>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button onClick={() => onViewDetails(item)} title="Ver detalle" className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900">
                                                <IconOjo />
                                            </button>
                                            {puedeGestionar && (
                                                <button onClick={() => onOpenManageModal(item)} title="Gestionar" className="rounded-md bg-cerrejon-orange p-1.5 text-white transition-colors hover:bg-cerrejon-orangeDark">
                                                    <IconGestion />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

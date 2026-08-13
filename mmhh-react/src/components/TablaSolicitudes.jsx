import React from 'react';
import { th, td, marca, marcaEstado, marcaSolicitud, marcaPrioridad } from '../ui';
import { getEstadoSolicitud, getPrioridadEfectiva, totalHorasHombre } from '../utils/helpers';
import { medirTolerancia } from '../utils/tolerancia';
import Tolerancia from './Tolerancia';

const IconFicha = () => (
    <svg className="h-[15px] w-[15px]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3.5" y="2.5" width="13" height="15" />
        <path d="M6.5 6.5h7M6.5 10h7M6.5 13.5h4" strokeLinecap="square" />
    </svg>
);

/* Correderas: "ajustar la gestión" se lee mejor que un engranaje decorativo. */
const IconGestion = () => (
    <svg className="h-[15px] w-[15px]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 6h5M12 6h5M3 14h9M16 14h1" strokeLinecap="square" />
        <path d="M10 3.5v5M14 11.5v5" strokeLinecap="square" />
    </svg>
);

const Vacio = ({ vacio }) => (
    <div className="px-4 py-16 text-center">
        <svg className="mx-auto mb-4 h-10 w-10 text-iron-300" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="7" y="5" width="26" height="30" />
            <path d="M12 12h16M12 19h16M12 26h9" strokeLinecap="square" />
        </svg>
        <p className="text-[13px] font-medium text-iron-600">{vacio || "Ninguna solicitud coincide con los filtros."}</p>
        <p className="mt-1 text-[12px] text-iron-400">Ajuste o limpie los filtros para ver más registros.</p>
    </div>
);

/** En pantalla angosta una tabla de once columnas no se lee: cada solicitud pasa a ficha. */
function Tarjeta({ item, idx, onViewDetails, onOpenManageModal, puedeGestionar, mostrarOrden }) {
    const d = item.parsedData;
    if (d.Error) return <li className="px-4 py-3 text-[12px] text-alarm">Registro {item.Id}: {d.Error}</li>;

    const estadoSol = getEstadoSolicitud(d);
    const estadoComp = d.Coordinador ? d.Coordinador.Estado : "";
    const prioridad = getPrioridadEfectiva(d);
    const hh = totalHorasHombre(d.Coordinador);
    const t = medirTolerancia(d);
    const critico = t && t.estado === 'fuera';

    return (
        <li className={`border-l-2 px-4 py-3.5 ${critico ? 'border-alarm bg-alarm-wash/35' : 'border-transparent bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                        {mostrarOrden && <span className="num text-[11px] text-iron-400">#{idx + 1}</span>}
                        <span className="num text-[13px] font-medium text-iron-900">{d.SolicitudID || "—"}</span>
                        <span className={`${marca} ${marcaPrioridad(prioridad)}`}>{prioridad}</span>
                    </div>
                    <p className="mt-1 truncate text-[14px] font-medium text-iron-900">{d.NombreComponente}</p>
                    <p className="num mt-0.5 text-[11px] text-iron-500">{d.OT} · {d.Flota} · {d.Fecha}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                    <button onClick={() => onViewDetails(item)} title="Ver ficha" className="rounded-[3px] border border-iron-300 bg-white p-1.5 text-iron-600">
                        <IconFicha />
                    </button>
                    {puedeGestionar && (
                        <button onClick={() => onOpenManageModal(item)} title="Gestionar" className="rounded-[3px] border border-brand bg-brand p-1.5 text-white">
                            <IconGestion />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className={`${marca} ${marcaSolicitud(estadoSol)}`}>{estadoSol}</span>
                {estadoComp && <span className={`${marca} ${marcaEstado(estadoComp)}`}>{estadoComp}</span>}
                {hh > 0 && <span className="num text-[11px] text-iron-500">{hh} H/H</span>}
            </div>

            <div className="mt-3"><Tolerancia t={t} ancho="w-24" /></div>
        </li>
    );
}

export default function TablaSolicitudes({ items, onViewDetails, onOpenManageModal, puedeGestionar, mostrarOrden = false, vacio }) {
    const cols = mostrarOrden ? 11 : 10;

    return (
        <>
        {/* Fichas hasta lg; tabla completa de ahí en adelante. */}
        <ul className="divide-y divide-iron-100 lg:hidden">
            {items.length === 0
                ? <li><Vacio vacio={vacio} /></li>
                : items.map((item, idx) => (
                    <Tarjeta
                        key={item.Id} item={item} idx={idx}
                        onViewDetails={onViewDetails} onOpenManageModal={onOpenManageModal}
                        puedeGestionar={puedeGestionar} mostrarOrden={mostrarOrden}
                    />
                ))}
        </ul>

        <div className="thin-scroll hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-y border-iron-200 bg-iron-50">
                        {mostrarOrden && <th className={`${th} w-10 text-center`}>Turno</th>}
                        <th className={th}>N.º</th>
                        <th className={th}>Ingreso</th>
                        <th className={th}>OT</th>
                        <th className={th}>Componente</th>
                        <th className={`${th} text-center`}>Prioridad</th>
                        <th className={th}>Plazo</th>
                        <th className={`${th} text-center`}>Solicitud</th>
                        <th className={th}>Estado</th>
                        <th className={`${th} text-right`}>H/H</th>
                        <th className={`${th} text-center`}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr><td colSpan={cols}><Vacio vacio={vacio} /></td></tr>
                    ) : (
                        items.map((item, idx) => {
                            const d = item.parsedData;
                            if (d.Error) {
                                return (
                                    <tr key={item.Id} className="border-b border-iron-100">
                                        <td colSpan={cols} className="px-3 py-3 text-[12px] text-alarm">
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
                            const critico = t && t.estado === 'fuera';
                            // Filo rojo al borde de la fila: la pieza vencida se ve sin leerla.
                            const filo = `border-l-2 ${critico ? 'border-alarm' : 'border-transparent'}`;

                            return (
                                <tr
                                    key={item.Id}
                                    className={`border-b border-iron-100 transition-colors hover:bg-brand-wash/45 ${critico ? 'bg-alarm-wash/35' : ''}`}
                                >
                                    {mostrarOrden && (
                                        <td className={`${td} ${filo} text-center`}>
                                            <span className="num text-[12px] font-medium text-iron-400">{idx + 1}</span>
                                        </td>
                                    )}

                                    <td className={`${td} num font-medium text-iron-900 ${mostrarOrden ? '' : filo}`}>
                                        {d.SolicitudID || "—"}
                                    </td>

                                    <td className={`${td} num whitespace-nowrap text-iron-500`}>{d.Fecha}</td>
                                    <td className={`${td} num font-medium text-brand-deep`}>{d.OT}</td>

                                    <td className={td}>
                                        <span className="block max-w-[15rem] truncate font-medium text-iron-900" title={d.NombreComponente}>
                                            {d.NombreComponente}
                                        </span>
                                        <span className="mt-0.5 block truncate text-[11px] text-iron-500" title={d.Soporte}>
                                            <span className="num">{d.Flota}</span> · {d.Soporte}
                                        </span>
                                    </td>

                                    {/* Solo se anota la procedencia cuando el coordinador cambió la prioridad
                                        del cliente: repetir "coord" en cada fila no informa nada. */}
                                    <td className={`${td} text-center`}>
                                        <span
                                            className={`${marca} ${marcaPrioridad(prioridad)}`}
                                            title={reclasificada ? `El coordinador la subió o bajó desde ${d.Prioridad}` : undefined}
                                        >
                                            {prioridad || "—"}
                                            {reclasificada && <span className="ml-1 opacity-70">*</span>}
                                        </span>
                                    </td>

                                    <td className={td}><Tolerancia t={t} /></td>

                                    <td className={`${td} text-center`}>
                                        <span className={`${marca} ${marcaSolicitud(estadoSol)}`}>{estadoSol}</span>
                                    </td>

                                    <td className={td}>
                                        {estadoComp
                                            ? <span className={`${marca} ${marcaEstado(estadoComp)}`}>{estadoComp}</span>
                                            : <span className="text-[11px] text-iron-400">Sin asignar</span>}
                                    </td>

                                    <td className={`${td} num text-right text-iron-700`}>{hh || "—"}</td>

                                    <td className={td}>
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => onViewDetails(item)} title="Ver ficha"
                                                className="rounded-[3px] border border-iron-300 bg-white p-1.5 text-iron-600 transition-colors hover:border-iron-400 hover:bg-iron-50 hover:text-iron-900"
                                            >
                                                <IconFicha />
                                            </button>
                                            {puedeGestionar && (
                                                <button
                                                    onClick={() => onOpenManageModal(item)} title="Gestionar"
                                                    className="rounded-[3px] border border-brand bg-brand p-1.5 text-white transition-colors hover:border-brand-deep hover:bg-brand-deep"
                                                >
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
        </>
    );
}

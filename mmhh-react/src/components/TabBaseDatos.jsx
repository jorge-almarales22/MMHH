import React from 'react';
import { SUPERINTENDENCIAS, PRIORIDADES, FLOTAS, COORDINADORES_LISTA, AREAS_ENTREGA, ESTADOS_COORDINADOR } from '../constants';

const glassCard = "bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl";

export default function TabBaseDatos({ dbFilter, setDbFilter, getFilteredItems, onDownloadCSV, onViewDetails, onOpenManageModal, userAuth }) {
    return (
        <div className={`${glassCard} flex flex-col w-full overflow-hidden`}>
            <div className="bg-gray-900/80 backdrop-blur-md px-6 py-5 flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Base de Datos MMHH_DB</h2>
                <button onClick={onDownloadCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Descargar CSV
                </button>
            </div>

            <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex flex-wrap gap-3 items-end">
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Buscar</label>
                    <input type="text" value={dbFilter.search} onChange={(e) => setDbFilter({ ...dbFilter, search: e.target.value })} className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white w-48 outline-none focus:border-cerrejon-orange focus:ring-1 focus:ring-cerrejon-orange/50" placeholder="ID, OT, Componente, Flota..." />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Estado</label>
                    <select value={dbFilter.estado} onChange={(e) => setDbFilter({ ...dbFilter, estado: e.target.value })} className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-cerrejon-orange">
                        <option value="todos">Todos</option>
                        <option value="sin_asignar">Sin Asignar</option>
                        <option value="gestionado">Gestionado</option>
                        {ESTADOS_COORDINADOR.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Superintendencia</label>
                    <select value={dbFilter.superintendencia} onChange={(e) => setDbFilter({ ...dbFilter, superintendencia: e.target.value })} className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-cerrejon-orange">
                        <option value="">Todas</option>
                        {SUPERINTENDENCIAS.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Prioridad</label>
                    <select value={dbFilter.prioridad} onChange={(e) => setDbFilter({ ...dbFilter, prioridad: e.target.value })} className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-cerrejon-orange">
                        <option value="">Todas</option>
                        {Object.keys(PRIORIDADES).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Flota</label>
                    <select value={dbFilter.flota} onChange={(e) => setDbFilter({ ...dbFilter, flota: e.target.value })} className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-cerrejon-orange">
                        <option value="">Todas</option>
                        {FLOTAS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Coord. Recibe</label>
                    <select value={dbFilter.coordinadorRecibe} onChange={(e) => setDbFilter({ ...dbFilter, coordinadorRecibe: e.target.value })} className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-cerrejon-orange">
                        <option value="">Todos</option>
                        {COORDINADORES_LISTA.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Area Entrega</label>
                    <select value={dbFilter.areaEntrega} onChange={(e) => setDbFilter({ ...dbFilter, areaEntrega: e.target.value })} className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-cerrejon-orange">
                        <option value="">Todas</option>
                        {AREAS_ENTREGA.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Desde</label>
                    <input type="date" value={dbFilter.fechaDesde} onChange={(e) => setDbFilter({ ...dbFilter, fechaDesde: e.target.value })} className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-cerrejon-orange" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Hasta</label>
                    <input type="date" value={dbFilter.fechaHasta} onChange={(e) => setDbFilter({ ...dbFilter, fechaHasta: e.target.value })} className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-cerrejon-orange" />
                </div>
                <button onClick={() => setDbFilter({ search: '', estado: 'todos', fechaDesde: '', fechaHasta: '', prioridad: '', superintendencia: '', flota: '', coordinadorRecibe: '', areaEntrega: '' })} className="px-4 py-2 text-xs font-bold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 uppercase">Limpiar</button>
            </div>

            <div className="overflow-x-auto p-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-400/50 text-xs uppercase font-extrabold text-gray-800">
                            <th className="p-3">ID</th>
                            <th className="p-3">Fecha</th>
                            <th className="p-3">OT</th>
                            <th className="p-3">Componente</th>
                            <th className="p-3">Soporte</th>
                            <th className="p-3">Prioridad</th>
                            <th className="p-3 text-center">Estado</th>
                            <th className="p-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredItems().length === 0 ? (
                            <tr><td colSpan="8" className="text-center p-8 font-medium text-gray-400">No hay registros que coincidan con los filtros.</td></tr>
                        ) : (
                            getFilteredItems().map((item) => {
                                const d = item.parsedData;
                                if (d.Error) return (<tr key={item.Id}><td colSpan="8" className="p-4 text-red-500">ID {item.Id}: {d.Error}</td></tr>);
                                const gestionado = !!d.Coordinador;
                                return (
                                    <tr key={item.Id} className="border-b border-gray-300/30 hover:bg-white/50 transition-colors align-middle">
                                        <td className="p-3 font-mono font-bold text-gray-600 text-[10px]">{d.SolicitudID || "-"}</td>
                                        <td className="p-3 font-medium text-gray-800 text-xs">{d.Fecha}</td>
                                        <td className="p-3 font-black text-cerrejon-orange text-xs">{d.OT}</td>
                                        <td className="p-3 font-bold text-gray-800 text-xs">{d.NombreComponente} <span className="font-normal text-gray-500 block text-[10px]">{d.Flota} | PN: {d.PN || "N/A"}</span></td>
                                        <td className="p-3 font-bold text-gray-700 text-xs">{d.Soporte}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-cerrejon-orange">{d.Prioridad}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                            {gestionado ? (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${d.Coordinador.Estado === 'Entregado' ? 'bg-green-100 text-green-800 border border-green-200' : d.Coordinador.Estado === 'No gestionado' ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                                                    {d.Coordinador.Estado || "Gestionado"}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400 border border-gray-200">Sin Asignar</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => onViewDetails(item)} title="Ver Detalle" className="text-white bg-cerrejon-dark hover:bg-gray-700 p-2 rounded shadow transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                                </button>
                                                {userAuth.isCoordinator && (
                                                    <button onClick={() => onOpenManageModal(item)} title="Gestionar" className="text-white bg-cerrejon-orange hover:bg-red-600 p-2 rounded shadow transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
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
        </div>
    );
}

import React from 'react';
import {
    SUPERINTENDENCIAS, PRIORIDADES, FLOTAS, COORDINADORES_LISTA, AREAS_ENTREGA,
    ESTADOS_COORDINADOR, ESTADOS_SOLICITUD, AREAS_PROCESO
} from '../constants';
import { card, sectionTitle } from '../ui';
import { BarraFiltros, SelectFiltro, TextoFiltro, FechaFiltro } from './Filtros';
import TablaSolicitudes from './TablaSolicitudes';

const SEGMENTOS = [
    { key: 'todos', label: 'Todos' },
    { key: 'no_gestionado', label: 'Sin gestionar' },
    { key: 'en_proceso', label: 'En proceso' },
    { key: 'entregados', label: 'Entregados' }
];

export const coordFilterVacio = {
    state: 'todos', search: '', superintendencia: '', prioridad: '', prioridadCoordinador: '',
    estadoComponente: '', estadoSolicitud: '', areaProceso: '', flota: '',
    coordinadorRecibe: '', areaEntrega: '', fechaDesde: '', fechaHasta: ''
};

export default function TabCoordinador({ coordFilter, setCoordFilter, items, onViewDetails, onOpenManageModal }) {
    const set = (campo) => (e) => setCoordFilter(prev => ({ ...prev, [campo]: e.target.value }));
    const activos = Object.entries(coordFilter).filter(([k, v]) => k !== 'state' && v).length;

    return (
        <div className={`${card} w-full overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                    <span className={sectionTitle}>Módulo Coordinador</span>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Gestión de solicitudes</h2>
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                    {SEGMENTOS.map(s => (
                        <button
                            key={s.key} type="button"
                            onClick={() => setCoordFilter(prev => ({ ...prev, state: s.key }))}
                            className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${coordFilter.state === s.key
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <BarraFiltros activos={activos} onLimpiar={() => setCoordFilter({ ...coordFilterVacio, state: coordFilter.state })}>
                <TextoFiltro titulo="Buscar" value={coordFilter.search} onChange={set('search')} placeholder="ID, OT, componente..." ancho="col-span-2" />
                <SelectFiltro titulo="Estado solicitud" value={coordFilter.estadoSolicitud} onChange={set('estadoSolicitud')} opciones={ESTADOS_SOLICITUD} />
                <SelectFiltro titulo="Estado componente" value={coordFilter.estadoComponente} onChange={set('estadoComponente')} opciones={ESTADOS_COORDINADOR} />
                <SelectFiltro titulo="Prioridad coordinador" value={coordFilter.prioridadCoordinador} onChange={set('prioridadCoordinador')} opciones={Object.keys(PRIORIDADES)} todos="Todas" />
                <SelectFiltro titulo="Prioridad cliente" value={coordFilter.prioridad} onChange={set('prioridad')} opciones={Object.keys(PRIORIDADES)} todos="Todas" />
                <SelectFiltro titulo="Área de proceso" value={coordFilter.areaProceso} onChange={set('areaProceso')} opciones={AREAS_PROCESO} todos="Todas" />
                <SelectFiltro titulo="Superintendencia" value={coordFilter.superintendencia} onChange={set('superintendencia')} opciones={SUPERINTENDENCIAS.filter(Boolean)} todos="Todas" />
                <SelectFiltro titulo="Flota" value={coordFilter.flota} onChange={set('flota')} opciones={FLOTAS} todos="Todas" />
                <SelectFiltro titulo="Coord. recibe" value={coordFilter.coordinadorRecibe} onChange={set('coordinadorRecibe')} opciones={COORDINADORES_LISTA} />
                <SelectFiltro titulo="Área entrega" value={coordFilter.areaEntrega} onChange={set('areaEntrega')} opciones={AREAS_ENTREGA} todos="Todas" />
                <FechaFiltro titulo="Desde" value={coordFilter.fechaDesde} onChange={set('fechaDesde')} />
                <FechaFiltro titulo="Hasta" value={coordFilter.fechaHasta} onChange={set('fechaHasta')} />
            </BarraFiltros>

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2.5">
                <span className="tabular text-[11px] font-medium text-slate-500">
                    {items.length} solicitud{items.length === 1 ? '' : 'es'}
                </span>
            </div>

            <TablaSolicitudes
                items={items}
                onViewDetails={onViewDetails}
                onOpenManageModal={onOpenManageModal}
                puedeGestionar
                vacio="No hay solicitudes que mostrar con los filtros aplicados."
            />
        </div>
    );
}

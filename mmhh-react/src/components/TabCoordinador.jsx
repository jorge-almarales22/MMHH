import React from 'react';
import {
    SUPERINTENDENCIAS, PRIORIDADES, FLOTAS, COORDINADORES_LISTA, AREAS_ENTREGA,
    ESTADOS_COORDINADOR, ESTADOS_SOLICITUD, AREAS_PROCESO
} from '../constants';
import { placa, dial } from '../ui';
import { BarraFiltros, SelectFiltro, TextoFiltro, FechaFiltro } from './Filtros';
import TablaSolicitudes from './TablaSolicitudes';

const SEGMENTOS = [
    { key: 'todos', label: 'Todas' },
    { key: 'no_gestionado', label: 'Sin gestionar' },
    { key: 'en_proceso', label: 'En proceso' },
    { key: 'vencidas', label: 'Fuera de plazo' },
    { key: 'entregados', label: 'Entregadas' }
];

export const coordFilterVacio = {
    state: 'todos', search: '', superintendencia: '', prioridad: '', prioridadCoordinador: '',
    estadoComponente: '', estadoSolicitud: '', areaProceso: '', flota: '',
    coordinadorRecibe: '', areaEntrega: '', fechaDesde: '', fechaHasta: ''
};

export default function TabCoordinador({ coordFilter, setCoordFilter, items, conteos, onViewDetails, onOpenManageModal }) {
    const set = (c) => (e) => setCoordFilter(prev => ({ ...prev, [c]: e.target.value }));
    const activos = Object.entries(coordFilter).filter(([k, v]) => k !== 'state' && v).length;

    return (
        <div className={`${placa} w-full animate-card-in`}>
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-iron-200 px-5 py-4">
                <div>
                    <span className={dial}>Coordinación</span>
                    <h2 className="mt-1 text-[19px] font-semibold leading-tight tracking-tight text-iron-900">
                        Cola del taller
                    </h2>
                </div>

                {/* Selector de estación: cada segmento lleva su conteo. No envuelve —
                    al envolver quedaban huecos del fondo entre los botones. */}
                <div className="thin-scroll -mx-1 flex max-w-full flex-nowrap gap-px overflow-x-auto rounded-[3px] border border-iron-300 bg-iron-300 sm:mx-0">
                    {SEGMENTOS.map(s => {
                        const activo = coordFilter.state === s.key;
                        return (
                            <button
                                key={s.key} type="button"
                                onClick={() => setCoordFilter(prev => ({ ...prev, state: s.key }))}
                                className={`dial flex shrink-0 items-baseline gap-1.5 whitespace-nowrap px-3 py-2 text-[10px] transition-colors ${activo
                                    ? 'bg-dye text-white'
                                    : 'bg-white text-iron-500 hover:bg-iron-50 hover:text-iron-900'}`}
                            >
                                {s.label}
                                <span className={`num text-[11px] font-medium ${activo ? 'text-scribe' : 'text-iron-400'}`}>
                                    {conteos[s.key] ?? 0}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <BarraFiltros activos={activos} onLimpiar={() => setCoordFilter({ ...coordFilterVacio, state: coordFilter.state })}>
                <TextoFiltro titulo="Buscar" value={coordFilter.search} onChange={set('search')} placeholder="N.º, OT, componente..." ancho="col-span-2" />
                <SelectFiltro titulo="Estado solicitud" value={coordFilter.estadoSolicitud} onChange={set('estadoSolicitud')} opciones={ESTADOS_SOLICITUD} />
                <SelectFiltro titulo="Estado componente" value={coordFilter.estadoComponente} onChange={set('estadoComponente')} opciones={ESTADOS_COORDINADOR} />
                <SelectFiltro titulo="Prioridad coordinador" value={coordFilter.prioridadCoordinador} onChange={set('prioridadCoordinador')} opciones={Object.keys(PRIORIDADES)} todos="Todas" />
                <SelectFiltro titulo="Prioridad cliente" value={coordFilter.prioridad} onChange={set('prioridad')} opciones={Object.keys(PRIORIDADES)} todos="Todas" />
                <SelectFiltro titulo="Área de proceso" value={coordFilter.areaProceso} onChange={set('areaProceso')} opciones={AREAS_PROCESO} todos="Todas" />
                <SelectFiltro titulo="Superintendencia" value={coordFilter.superintendencia} onChange={set('superintendencia')} opciones={SUPERINTENDENCIAS.filter(Boolean)} todos="Todas" />
                <SelectFiltro titulo="Flota" value={coordFilter.flota} onChange={set('flota')} opciones={FLOTAS} todos="Todas" />
                <SelectFiltro titulo="Coordinador recibe" value={coordFilter.coordinadorRecibe} onChange={set('coordinadorRecibe')} opciones={COORDINADORES_LISTA} />
                <SelectFiltro titulo="Área de entrega" value={coordFilter.areaEntrega} onChange={set('areaEntrega')} opciones={AREAS_ENTREGA} todos="Todas" />
                <FechaFiltro titulo="Ingreso desde" value={coordFilter.fechaDesde} onChange={set('fechaDesde')} />
                <FechaFiltro titulo="Ingreso hasta" value={coordFilter.fechaHasta} onChange={set('fechaHasta')} />
            </BarraFiltros>

            <TablaSolicitudes
                items={items}
                onViewDetails={onViewDetails}
                onOpenManageModal={onOpenManageModal}
                puedeGestionar
                vacio="Ninguna solicitud en este estado."
            />
        </div>
    );
}

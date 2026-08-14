import React, { useState } from 'react';
import {
    SUPERINTENDENCIAS, PRIORIDADES, FLOTAS, COORDINADORES_LISTA, AREAS_ENTREGA,
    ESTADOS_COORDINADOR, ESTADOS_SOLICITUD, AREAS_PROCESO
} from '../constants';
import { inputCls, TINTA } from '../ui';
import { Tile, Pildoras, SelectFiltro, FechaFiltro, FiltrosAvanzados } from './Filtros';
import TablaSolicitudes from './TablaSolicitudes';

const SEGMENTOS = [
    { id: 'todos', label: 'Todas' },
    { id: 'no_gestionado', label: 'Sin gestionar' },
    { id: 'en_proceso', label: 'En proceso' },
    { id: 'vencidas', label: 'Fuera de plazo' },
    { id: 'entregados', label: 'Entregadas' }
];

export const coordFilterVacio = {
    state: 'todos', search: '', superintendencia: '', prioridad: '', prioridadCoordinador: '',
    estadoComponente: '', estadoSolicitud: '', areaProceso: '', flota: '',
    coordinadorRecibe: '', areaEntrega: '', fechaDesde: '', fechaHasta: ''
};

export default function TabCoordinador({ coordFilter, setCoordFilter, items, conteos, onViewDetails, onOpenManageModal }) {
    const [avanzados, setAvanzados] = useState(false);
    const set = (c) => (e) => setCoordFilter(prev => ({ ...prev, [c]: e.target.value }));
    const activos = Object.entries(coordFilter).filter(([k, v]) => k !== 'state' && k !== 'search' && v).length;

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestión de solicitudes</h2>
            <p className="text-sm text-slate-500 mt-1">
                Cola del taller · doble clic sobre una fila para abrirla
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 my-4">
                <Tile label="Todas" valor={conteos.todos} activo={coordFilter.state === 'todos'} onClick={() => setCoordFilter(p => ({ ...p, state: 'todos' }))} />
                <Tile label="Sin gestionar" valor={conteos.no_gestionado} color={TINTA.pendiente} activo={coordFilter.state === 'no_gestionado'} onClick={() => setCoordFilter(p => ({ ...p, state: 'no_gestionado' }))} />
                <Tile label="En proceso" valor={conteos.en_proceso} color={TINTA.proceso} activo={coordFilter.state === 'en_proceso'} onClick={() => setCoordFilter(p => ({ ...p, state: 'en_proceso' }))} />
                <Tile label="Fuera de plazo" valor={conteos.vencidas} color={TINTA.vencida} activo={coordFilter.state === 'vencidas'} onClick={() => setCoordFilter(p => ({ ...p, state: 'vencidas' }))} />
                <Tile label="Entregadas" valor={conteos.entregados} color={TINTA.entregada} activo={coordFilter.state === 'entregados'} onClick={() => setCoordFilter(p => ({ ...p, state: 'entregados' }))} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <Pildoras
                        opciones={SEGMENTOS}
                        valor={coordFilter.state}
                        onChange={(id) => setCoordFilter(p => ({ ...p, state: id }))}
                    />
                    <input
                        value={coordFilter.search}
                        onChange={set('search')}
                        placeholder="Buscar por N.º, OT, componente, PN o contacto..."
                        className={`${inputCls} flex-1 sm:min-w-[240px]`}
                    />
                </div>

                <FiltrosAvanzados
                    abierto={avanzados}
                    onToggle={() => setAvanzados(v => !v)}
                    activos={activos}
                    onLimpiar={() => setCoordFilter({ ...coordFilterVacio, state: coordFilter.state, search: coordFilter.search })}
                >
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
                </FiltrosAvanzados>
            </div>

            <TablaSolicitudes
                items={items}
                onViewDetails={onViewDetails}
                onOpenManageModal={onOpenManageModal}
                puedeGestionar
                vacio="No hay solicitudes para este filtro"
            />
        </div>
    );
}

import React, { useState } from 'react';
import {
    SUPERINTENDENCIAS, PRIORIDADES, FLOTAS, COORDINADORES_LISTA, AREAS_ENTREGA,
    ESTADOS_COORDINADOR, ESTADOS_SOLICITUD, AREAS_PROCESO
} from '../constants';
import { card, sectionTitle } from '../ui';
import { BarraFiltros, SelectFiltro, TextoFiltro, FechaFiltro } from './Filtros';
import TablaSolicitudes from './TablaSolicitudes';
import { compararPorFecha, compararPorPrioridadYFecha } from '../utils/helpers';

export const dbFilterVacio = {
    search: '', estadoSolicitud: '', estadoComponente: '', fechaDesde: '', fechaHasta: '',
    prioridad: '', prioridadCoordinador: '', areaProceso: '', superintendencia: '',
    flota: '', coordinadorRecibe: '', areaEntrega: ''
};

const VISTAS = [
    {
        key: 'historico',
        label: 'Registro histórico',
        detalle: 'Ordenado por fecha de solicitud, de la más reciente a la más antigua.',
        orden: compararPorFecha
    },
    {
        key: 'atencion',
        label: 'Cola de atención',
        detalle: 'Ordenado por prioridad del coordinador y, a igual prioridad, por la solicitud más antigua.',
        orden: compararPorPrioridadYFecha
    }
];

function Kpi({ valor, etiqueta, acento }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className={`tabular text-2xl font-semibold leading-none ${acento}`}>{valor}</div>
            <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{etiqueta}</div>
        </div>
    );
}

export default function TabBaseDatos({ dbFilter, setDbFilter, items, resumen, onDownloadCSV, onViewDetails, onOpenManageModal, userAuth }) {
    const [vista, setVista] = useState('historico');
    const set = (campo) => (e) => setDbFilter(prev => ({ ...prev, [campo]: e.target.value }));
    const activos = Object.values(dbFilter).filter(Boolean).length;

    const vistaActual = VISTAS.find(v => v.key === vista);
    const ordenados = [...items].sort(vistaActual.orden);

    return (
        <div className={`${card} w-full overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                    <span className={sectionTitle}>Módulo Base de Datos</span>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Consolidado de requerimientos</h2>
                </div>
                <button onClick={onDownloadCSV} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Descargar CSV
                </button>
            </div>

            {/* RESUMEN SOBRE LO FILTRADO */}
            <div className="grid grid-cols-2 gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-4 sm:grid-cols-3 lg:grid-cols-6">
                <Kpi valor={resumen.total} etiqueta="Solicitudes" acento="text-slate-900" />
                <Kpi valor={resumen.pendientes} etiqueta="Pendientes" acento="text-orange-600" />
                <Kpi valor={resumen.enProceso} etiqueta="En gestión" acento="text-sky-600" />
                <Kpi valor={resumen.entregadas} etiqueta="Entregadas" acento="text-emerald-600" />
                <Kpi valor={resumen.criticas} etiqueta="Críticas P0–P02" acento="text-red-600" />
                <Kpi valor={resumen.horas} etiqueta="H/H estimadas" acento="text-slate-900" />
            </div>

            <BarraFiltros activos={activos} onLimpiar={() => setDbFilter({ ...dbFilterVacio })}>
                <TextoFiltro titulo="Buscar" value={dbFilter.search} onChange={set('search')} placeholder="ID, OT, componente..." ancho="col-span-2" />
                <SelectFiltro titulo="Estado solicitud" value={dbFilter.estadoSolicitud} onChange={set('estadoSolicitud')} opciones={ESTADOS_SOLICITUD} />
                <SelectFiltro titulo="Estado componente" value={dbFilter.estadoComponente} onChange={set('estadoComponente')} opciones={ESTADOS_COORDINADOR} />
                <SelectFiltro titulo="Prioridad coordinador" value={dbFilter.prioridadCoordinador} onChange={set('prioridadCoordinador')} opciones={Object.keys(PRIORIDADES)} todos="Todas" />
                <SelectFiltro titulo="Prioridad cliente" value={dbFilter.prioridad} onChange={set('prioridad')} opciones={Object.keys(PRIORIDADES)} todos="Todas" />
                <SelectFiltro titulo="Área de proceso" value={dbFilter.areaProceso} onChange={set('areaProceso')} opciones={AREAS_PROCESO} todos="Todas" />
                <SelectFiltro titulo="Superintendencia" value={dbFilter.superintendencia} onChange={set('superintendencia')} opciones={SUPERINTENDENCIAS.filter(Boolean)} todos="Todas" />
                <SelectFiltro titulo="Flota" value={dbFilter.flota} onChange={set('flota')} opciones={FLOTAS} todos="Todas" />
                <SelectFiltro titulo="Coord. recibe" value={dbFilter.coordinadorRecibe} onChange={set('coordinadorRecibe')} opciones={COORDINADORES_LISTA} />
                <SelectFiltro titulo="Área entrega" value={dbFilter.areaEntrega} onChange={set('areaEntrega')} opciones={AREAS_ENTREGA} todos="Todas" />
                <FechaFiltro titulo="Desde" value={dbFilter.fechaDesde} onChange={set('fechaDesde')} />
                <FechaFiltro titulo="Hasta" value={dbFilter.fechaHasta} onChange={set('fechaHasta')} />
            </BarraFiltros>

            {/* PESTANAS DE ORDENAMIENTO */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6">
                <div className="flex">
                    {VISTAS.map(v => (
                        <button
                            key={v.key} type="button" onClick={() => setVista(v.key)}
                            className={`-mb-px border-b-2 px-4 py-3 text-[13px] font-semibold transition-colors ${vista === v.key
                                ? 'border-cerrejon-orange text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
                <span className="tabular py-3 text-[11px] font-medium text-slate-500">
                    {ordenados.length} registro{ordenados.length === 1 ? '' : 's'}
                </span>
            </div>

            <p className="border-b border-slate-100 bg-white px-6 py-2.5 text-[11px] text-slate-500">
                {vistaActual.detalle}
            </p>

            <TablaSolicitudes
                items={ordenados}
                onViewDetails={onViewDetails}
                onOpenManageModal={onOpenManageModal}
                puedeGestionar={userAuth.isCoordinator}
                mostrarRanking={vista === 'atencion'}
            />
        </div>
    );
}

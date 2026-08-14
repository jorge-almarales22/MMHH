import React, { useState } from 'react';
import {
    SUPERINTENDENCIAS, PRIORIDADES, FLOTAS, COORDINADORES_LISTA, AREAS_ENTREGA,
    ESTADOS_COORDINADOR, ESTADOS_SOLICITUD, AREAS_PROCESO
} from '../constants';
import { inputCls, btnBorde, TINTA } from '../ui';
import { Tile, Segmentado, SelectFiltro, FechaFiltro, FiltrosAvanzados } from './Filtros';
import TablaSolicitudes from './TablaSolicitudes';
import { compararPorFecha, compararPorPrioridadYFecha } from '../utils/helpers';

export const dbFilterVacio = {
    search: '', estadoSolicitud: '', estadoComponente: '', fechaDesde: '', fechaHasta: '',
    prioridad: '', prioridadCoordinador: '', areaProceso: '', superintendencia: '',
    flota: '', coordinadorRecibe: '', areaEntrega: ''
};

const VISTAS = [
    {
        id: 'historico',
        label: 'Registro',
        detalle: 'Todas las solicitudes por fecha de ingreso, de la más reciente a la más antigua.',
        orden: compararPorFecha
    },
    {
        id: 'atencion',
        label: 'Orden de atención',
        detalle: 'Manda la prioridad del coordinador; a igual prioridad, entra primero la solicitud más antigua.',
        orden: compararPorPrioridadYFecha
    }
];

export default function TabBaseDatos({ dbFilter, setDbFilter, items, resumen, onDownloadCSV, onViewDetails, onOpenManageModal, userAuth }) {
    const [vista, setVista] = useState('historico');
    const [avanzados, setAvanzados] = useState(false);
    const set = (c) => (e) => setDbFilter(prev => ({ ...prev, [c]: e.target.value }));
    const activos = Object.entries(dbFilter).filter(([k, v]) => k !== 'search' && v).length;

    const vistaActual = VISTAS.find(v => v.id === vista);
    const ordenados = [...items].sort(vistaActual.orden);

    return (
        <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Base de datos</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Consolidado de requerimientos · doble clic sobre una fila para abrirla
                    </p>
                </div>
                <button onClick={onDownloadCSV} className={`${btnBorde} no-print`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Descargar CSV
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 my-4">
                <Tile label="Solicitudes" valor={resumen.total} />
                <Tile label="Sin gestionar" valor={resumen.pendientes} color={TINTA.pendiente} />
                <Tile label="En taller" valor={resumen.enProceso} color={TINTA.proceso} />
                <Tile label="Entregadas" valor={resumen.entregadas} color={TINTA.entregada} />
                <Tile label="Fuera de plazo" valor={resumen.fuera} color={TINTA.vencida} />
                <Tile label="H/H comprometidas" valor={resumen.horas} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Segmentado
                        opciones={VISTAS.map(v => ({ id: v.id, label: v.label }))}
                        valor={vista}
                        onChange={setVista}
                    />
                    <input
                        value={dbFilter.search}
                        onChange={set('search')}
                        placeholder="Buscar por N.º, OT, componente, PN o contacto..."
                        className={`${inputCls} flex-1 sm:min-w-[240px]`}
                    />
                </div>

                <p className="text-xs text-slate-500">{vistaActual.detalle}</p>

                <FiltrosAvanzados
                    abierto={avanzados}
                    onToggle={() => setAvanzados(v => !v)}
                    activos={activos}
                    onLimpiar={() => setDbFilter({ ...dbFilterVacio, search: dbFilter.search })}
                >
                    <SelectFiltro titulo="Estado solicitud" value={dbFilter.estadoSolicitud} onChange={set('estadoSolicitud')} opciones={ESTADOS_SOLICITUD} />
                    <SelectFiltro titulo="Estado componente" value={dbFilter.estadoComponente} onChange={set('estadoComponente')} opciones={ESTADOS_COORDINADOR} />
                    <SelectFiltro titulo="Prioridad coordinador" value={dbFilter.prioridadCoordinador} onChange={set('prioridadCoordinador')} opciones={Object.keys(PRIORIDADES)} todos="Todas" />
                    <SelectFiltro titulo="Prioridad cliente" value={dbFilter.prioridad} onChange={set('prioridad')} opciones={Object.keys(PRIORIDADES)} todos="Todas" />
                    <SelectFiltro titulo="Área de proceso" value={dbFilter.areaProceso} onChange={set('areaProceso')} opciones={AREAS_PROCESO} todos="Todas" />
                    <SelectFiltro titulo="Superintendencia" value={dbFilter.superintendencia} onChange={set('superintendencia')} opciones={SUPERINTENDENCIAS.filter(Boolean)} todos="Todas" />
                    <SelectFiltro titulo="Flota" value={dbFilter.flota} onChange={set('flota')} opciones={FLOTAS} todos="Todas" />
                    <SelectFiltro titulo="Coordinador recibe" value={dbFilter.coordinadorRecibe} onChange={set('coordinadorRecibe')} opciones={COORDINADORES_LISTA} />
                    <SelectFiltro titulo="Área de entrega" value={dbFilter.areaEntrega} onChange={set('areaEntrega')} opciones={AREAS_ENTREGA} todos="Todas" />
                    <FechaFiltro titulo="Ingreso desde" value={dbFilter.fechaDesde} onChange={set('fechaDesde')} />
                    <FechaFiltro titulo="Ingreso hasta" value={dbFilter.fechaHasta} onChange={set('fechaHasta')} />
                </FiltrosAvanzados>
            </div>

            <TablaSolicitudes
                items={ordenados}
                onViewDetails={onViewDetails}
                onOpenManageModal={onOpenManageModal}
                puedeGestionar={userAuth.isCoordinator}
                mostrarOrden={vista === 'atencion'}
            />
        </div>
    );
}

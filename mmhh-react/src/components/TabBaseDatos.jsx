import React, { useState } from 'react';
import {
    SUPERINTENDENCIAS, PRIORIDADES, FLOTAS, COORDINADORES_LISTA, AREAS_ENTREGA,
    ESTADOS_COORDINADOR, ESTADOS_SOLICITUD, AREAS_PROCESO
} from '../constants';
import { placa, dial, btnLinea } from '../ui';
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
        label: 'Registro',
        detalle: 'Todas las solicitudes por fecha de ingreso, de la más reciente a la más antigua.',
        orden: compararPorFecha
    },
    {
        key: 'atencion',
        label: 'Orden de atención',
        detalle: 'Manda la prioridad del coordinador; a igual prioridad, entra primero la solicitud más antigua.',
        orden: compararPorPrioridadYFecha
    }
];

/* Lectura de instrumento: cifra en mono, rotulo grabado debajo. */
function Lectura({ valor, etiqueta, sufijo, tono = "text-iron-900", filo = "border-iron-200" }) {
    return (
        <div className={`border-l-2 pl-3 ${filo}`}>
            <div className={`num text-[22px] font-medium leading-none ${tono}`}>
                {valor}<span className="text-[13px] text-iron-400">{sufijo}</span>
            </div>
            <div className="dial mt-1.5 text-[10px] text-iron-500">{etiqueta}</div>
        </div>
    );
}

export default function TabBaseDatos({ dbFilter, setDbFilter, items, resumen, onDownloadCSV, onViewDetails, onOpenManageModal, userAuth }) {
    const [vista, setVista] = useState('historico');
    const set = (c) => (e) => setDbFilter(prev => ({ ...prev, [c]: e.target.value }));
    const activos = Object.values(dbFilter).filter(Boolean).length;

    const vistaActual = VISTAS.find(v => v.key === vista);
    const ordenados = [...items].sort(vistaActual.orden);

    return (
        <div className={`${placa} w-full animate-card-in`}>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-iron-200 px-5 py-4">
                <div>
                    <span className={dial}>Base de datos</span>
                    <h2 className="mt-1 text-[19px] font-semibold leading-tight tracking-tight text-iron-900">
                        Consolidado de requerimientos
                    </h2>
                </div>
                <button onClick={onDownloadCSV} className={`${btnLinea} no-print`}>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M10 2.5v10m0 0l-3.5-3.5M10 12.5l3.5-3.5M3.5 15.5v2h13v-2" strokeLinecap="square" />
                    </svg>
                    Descargar CSV
                </button>
            </div>

            {/* Tablero de lecturas sobre el conjunto filtrado */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-5 border-b border-iron-200 px-5 py-5 sm:grid-cols-3 lg:grid-cols-6">
                <Lectura valor={resumen.total} etiqueta="Solicitudes" />
                <Lectura valor={resumen.pendientes} etiqueta="Sin gestionar" tono="text-brand-deep" filo="border-brand/50" />
                <Lectura valor={resumen.enProceso} etiqueta="En taller" tono="text-dye-mid" filo="border-dye-line/50" />
                <Lectura valor={resumen.entregadas} etiqueta="Entregadas" tono="text-spec" filo="border-spec/50" />
                <Lectura valor={resumen.fuera} etiqueta="Fuera de plazo" tono="text-alarm" filo="border-alarm/60" />
                <Lectura valor={resumen.horas} sufijo=" h" etiqueta="H/H comprometidas" />
            </div>

            <BarraFiltros activos={activos} onLimpiar={() => setDbFilter({ ...dbFilterVacio })}>
                <TextoFiltro titulo="Buscar" value={dbFilter.search} onChange={set('search')} placeholder="N.º, OT, componente..." ancho="col-span-2" />
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
            </BarraFiltros>

            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-iron-200 px-5">
                <div className="flex gap-6">
                    {VISTAS.map(v => (
                        <button
                            key={v.key} type="button" onClick={() => setVista(v.key)}
                            className={`dial -mb-px border-b-2 py-3 text-[10px] transition-colors ${vista === v.key
                                ? 'border-brand text-iron-900'
                                : 'border-transparent text-iron-400 hover:text-iron-700'}`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
                <span className="num py-3 text-[12px] text-iron-400">
                    {ordenados.length} {ordenados.length === 1 ? 'registro' : 'registros'}
                </span>
            </div>

            <p className="border-b border-iron-100 px-5 py-2.5 text-[12px] text-iron-500">
                {vistaActual.detalle}
            </p>

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

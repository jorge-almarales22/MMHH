import React from 'react';
import { chip, chipEstado, chipSolicitud, chipPrioridad, chipPlazo, btnBorde } from '../ui';
import { getEstadoSolicitud, totalHorasHombre } from '../utils/helpers';
import { medirTolerancia, etiquetaDesvio, ETIQUETA_TOLERANCIA } from '../utils/tolerancia';

const Dato = ({ label, children }) => (
    <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{label}</p>
        <div className="text-sm text-slate-800 mt-0.5">{children}</div>
    </div>
);

const Bloque = ({ titulo, accion, children }) => (
    <section className="px-4 sm:px-6 py-5 border-b border-slate-100 last:border-b-0">
        <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-bold text-slate-900 text-sm">{titulo}</h3>
            {accion}
        </div>
        {children}
    </section>
);

const BotonFotos = ({ imagenes, onVer }) => (
    imagenes && imagenes.length > 0
        ? <button onClick={onVer} className={btnBorde}>Ver {imagenes.length} {imagenes.length > 1 ? 'fotos' : 'foto'}</button>
        : <span className="text-xs text-slate-400">Sin fotos</span>
);

export default function ModalDetalle({ viewModalItem, setViewModalItem, setModalImages, setActiveImageIndex }) {
    if (!viewModalItem) return null;

    const d = viewModalItem.parsedData;
    const c = d.Coordinador;
    const fotosCliente = d.ImagenesBase64 || [];
    const estadoSol = getEstadoSolicitud(d);
    const historial = (c && c.Comentarios) || [];
    const tol = medirTolerancia(d);

    const abrirFotos = (lista) => { setModalImages(lista); setActiveImageIndex(0); };

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setViewModalItem(null)}
        >
            <div
                className="bg-white w-full sm:max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 sm:px-6 py-4 border-b border-slate-200 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`${chip} ${chipSolicitud(estadoSol)}`}>{estadoSol}</span>
                                {c && c.Estado && <span className={`${chip} ${chipEstado(c.Estado)}`}>{c.Estado}</span>}
                                {tol && <span className={`${chip} ${chipPlazo(tol.estado)}`}>{ETIQUETA_TOLERANCIA[tol.estado]} · {etiquetaDesvio(tol)}</span>}
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 mt-2 truncate">
                                {d.NombreComponente || "Requerimiento"}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                                N.º {d.SolicitudID || "—"} · OT {d.OT} · {d.Flota} · ingreso {d.Fecha}
                            </p>
                        </div>
                        <button
                            onClick={() => setViewModalItem(null)} aria-label="Cerrar"
                            className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 grid place-items-center cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    <Bloque titulo="Lo que pidió el cliente" accion={<BotonFotos imagenes={fotosCliente} onVer={() => abrirFotos(fotosCliente)} />}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <Dato label="Flota / cantidad"><span className="tabular-nums">{d.Flota}</span> ×{d.Cantidad || 1}</Dato>
                            <Dato label="PN / SC"><span className="tabular-nums">{d.PN || "N/A"} / {d.SC || "N/A"}</span></Dato>
                            <Dato label="Prioridad del cliente">
                                <span className={`${chip} ${chipPrioridad(d.Prioridad)}`}>{d.Prioridad}</span>
                            </Dato>
                            <Dato label="Superintendencia">{d.Superintendencia || "N/A"}</Dato>
                            <Dato label="Contacto">
                                {d.NombreContacto || "N/A"}
                                {d.Celular && <span className="block text-xs text-slate-500 tabular-nums">{d.Celular}</span>}
                            </Dato>
                            <Dato label="Entrega">
                                {d.CoordinadorRecibe}
                                <span className="block text-xs text-slate-500">{d.AreaEntrega}</span>
                            </Dato>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <Dato label="Soporte">{d.Soporte}</Dato>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {(d.TipoRequerimiento || []).map((t, i) => (
                                    <span key={i} className="text-[11px] font-semibold px-2 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">{t}</span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Qué hay que hacerle</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                                {d.DetalleRequerimiento || "Sin detalle"}
                            </p>
                        </div>
                    </Bloque>

                    {c ? (
                        <>
                            <Bloque titulo="Lo que hizo el taller" accion={<BotonFotos imagenes={c.ImagenesBase64} onVer={() => abrirFotos(c.ImagenesBase64)} />}>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <Dato label="Prioridad del coordinador">
                                        {c.PrioridadCoordinador
                                            ? <span className={`${chip} ${chipPrioridad(c.PrioridadCoordinador)}`}>{c.PrioridadCoordinador}</span>
                                            : <span className="text-xs text-slate-400">Sin definir</span>}
                                    </Dato>
                                    <Dato label="Fecha estimada"><span className="tabular-nums">{c.FechaEstimado}</span></Dato>
                                    <Dato label="Horas hombre"><span className="tabular-nums">{totalHorasHombre(c)}</span> H/H</Dato>
                                    <Dato label="Se avisó al cliente">{c.NotificacionCliente}</Dato>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-2">Procesos requeridos</p>
                                    <ol className="space-y-2">
                                        {(c.Procesos || []).map((p, i) => (
                                            <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 flex items-start gap-3">
                                                <span className="w-5 h-5 shrink-0 rounded-full bg-slate-900 text-white text-[10px] font-bold grid place-items-center mt-0.5">{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {p.ProcesoRequerido}
                                                        {p.SubprocesoRequerido && <span className="font-normal text-slate-500"> · {p.SubprocesoRequerido}</span>}
                                                    </p>
                                                    {p.AreaProceso && <p className="text-xs text-slate-500 mt-0.5">{p.AreaProceso}</p>}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 tabular-nums shrink-0">{Number(p.EstimadoHorasHombre) || 0} H/H</span>
                                            </li>
                                        ))}
                                        {(!c.Procesos || c.Procesos.length === 0) && (
                                            <li className="text-xs text-slate-400">Sin procesos registrados.</li>
                                        )}
                                    </ol>
                                </div>

                                {c.ComplementoMMHH && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Complemento MMHH</p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">{c.ComplementoMMHH}</p>
                                    </div>
                                )}

                                {c.Demoras && c.Demoras.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-2">Demoras ({c.Demoras.length})</p>
                                        <div className="space-y-2">
                                            {c.Demoras.map((dem, i) => (
                                                <div key={i} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                                                    <p className="text-sm text-slate-800">{dem.Descripcion || "Sin descripción"}</p>
                                                    <span className="block text-[11px] text-slate-500 tabular-nums mt-0.5">{dem.Fecha}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <p className="text-[11px] text-slate-500 mt-4 pt-4 border-t border-slate-100">
                                    Última gestión de <strong className="text-slate-700">{c.Nombre}</strong>
                                    <span className="tabular-nums"> · {c.FechaDiligenciado}</span>
                                </p>
                            </Bloque>

                            {historial.length > 0 && (
                                <Bloque titulo={`Historial de comentarios (${historial.length})`}>
                                    <ol className="space-y-2 max-h-64 overflow-y-auto">
                                        {historial.map((cm, i) => (
                                            <li
                                                key={i}
                                                className={`rounded-lg border px-3 py-2.5 ${cm.EsCierre ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                                            >
                                                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-800">{cm.Autor}</span>
                                                    {cm.EsCierre && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">CIERRE</span>
                                                    )}
                                                    <span className="ml-auto text-[11px] text-slate-400 tabular-nums">{cm.Fecha}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{cm.Texto}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </Bloque>
                            )}
                        </>
                    ) : (
                        <Bloque titulo="Lo que hizo el taller">
                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-10 px-4 text-center">
                                <p className="text-sm font-semibold text-slate-600">Todavía sin gestión</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    El coordinador aún no ha registrado trabajo sobre esta solicitud.
                                </p>
                            </div>
                        </Bloque>
                    )}
                </div>
            </div>
        </div>
    );
}

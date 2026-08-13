import React from 'react';
import { pill, estadoTono, estadoSolicitudTono, prioridadTono, sectionTitle } from '../ui';
import { getEstadoSolicitud, totalHorasHombre } from '../utils/helpers';

function Dato({ titulo, children, ancho = "" }) {
    return (
        <div className={ancho}>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">{titulo}</span>
            <span className="mt-0.5 block text-[13px] font-medium text-slate-800">{children}</span>
        </div>
    );
}

export default function ModalDetalle({ viewModalItem, setViewModalItem, setModalImages, setActiveImageIndex }) {
    if (!viewModalItem) return null;

    const d = viewModalItem.parsedData;
    const allImages = d.ImagenesBase64 || [];
    const hasImages = allImages.length > 0;
    const c = d.Coordinador;
    const estadoSolicitud = getEstadoSolicitud(d);
    const historial = (c && c.Comentarios) || [];

    return (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in sm:p-6">
            <div className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/25">

                <div className="border-b border-slate-200 bg-slate-50 px-7 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <span className={sectionTitle}>Ficha de requerimiento</span>
                            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900">{d.NombreComponente || "Requerimiento"}</h2>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                <span className="tabular rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-cerrejon-orangeDark ring-1 ring-inset ring-slate-200">
                                    Solicitud {d.SolicitudID || "—"}
                                </span>
                                <span className={`${pill} ${estadoSolicitudTono(estadoSolicitud)}`}>{estadoSolicitud}</span>
                                {c && c.Estado && <span className={`${pill} ${estadoTono(c.Estado)}`}>{c.Estado}</span>}
                            </div>
                        </div>
                        <button onClick={() => setViewModalItem(null)} className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700" aria-label="Cerrar">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="thin-scroll max-h-[76vh] overflow-y-auto p-6">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                        {/* CLIENTE */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5">
                            <h3 className={`${sectionTitle} border-b border-slate-200 pb-3`}>Información del cliente</h3>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <Dato titulo="Fecha de registro"><span className="tabular">{d.Fecha}</span></Dato>
                                <Dato titulo="OT"><span className="tabular text-cerrejon-orangeDark">{d.OT}</span></Dato>
                                <Dato titulo="Flota / cantidad">{d.Flota} ({d.Cantidad || 1})</Dato>
                                <Dato titulo="PN / SC"><span className="tabular">{d.PN || "N/A"} / {d.SC || "N/A"}</span></Dato>
                                <Dato titulo="Prioridad del cliente">
                                    <span className={`${pill} ${prioridadTono(d.Prioridad)}`}>{d.Prioridad}</span>
                                </Dato>
                                <Dato titulo="Superintendencia">{d.Superintendencia || "N/A"}</Dato>
                            </div>

                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <Dato titulo="Soporte">{d.Soporte}</Dato>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {(d.TipoRequerimiento || []).map((t, idx) => (
                                        <span key={idx} className="rounded-md bg-cerrejon-orangeSoft px-2 py-1 text-[11px] font-semibold text-cerrejon-orangeDark">{t}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Detalle del requerimiento</span>
                                <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-700">
                                    {d.DetalleRequerimiento || "Sin detalle"}
                                </p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                <Dato titulo="Contacto">
                                    {d.NombreContacto || "N/A"}
                                    {d.Celular && <span className="tabular mt-0.5 block text-[11px] font-normal text-slate-500">Cel. {d.Celular}</span>}
                                </Dato>
                                <Dato titulo="Recepción">
                                    {d.CoordinadorRecibe}
                                    <span className="mt-0.5 block text-[11px] font-normal text-slate-500">{d.AreaEntrega}</span>
                                </Dato>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Evidencias de solicitud</span>
                                {hasImages ? (
                                    <button onClick={() => { setModalImages(allImages); setActiveImageIndex(0); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
                                        Ver {allImages.length} foto{allImages.length > 1 ? 's' : ''}
                                    </button>
                                ) : <span className="text-[11px] italic text-slate-400">Sin evidencias</span>}
                            </div>
                        </section>

                        {/* COORDINADOR */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5">
                            <h3 className={`${sectionTitle} border-b border-slate-200 pb-3`}>Gestión de coordinación</h3>

                            {c ? (
                                <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Dato titulo="Estado del componente">
                                            <span className={`${pill} ${estadoTono(c.Estado)}`}>{c.Estado}</span>
                                        </Dato>
                                        <Dato titulo="Prioridad del coordinador">
                                            {c.PrioridadCoordinador
                                                ? <span className={`${pill} ${prioridadTono(c.PrioridadCoordinador)}`}>{c.PrioridadCoordinador}</span>
                                                : <span className="text-[11px] italic text-slate-400">Sin definir</span>}
                                        </Dato>
                                        <Dato titulo="Fecha estimada"><span className="tabular">{c.FechaEstimado}</span></Dato>
                                        <Dato titulo="H/H estimadas (total)"><span className="tabular">{totalHorasHombre(c)} H/H</span></Dato>
                                        <Dato titulo="Notificación a cliente">{c.NotificacionCliente}</Dato>
                                    </div>

                                    <div className="border-t border-slate-100 pt-4">
                                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Procesos requeridos</span>
                                        <div className="mt-2 space-y-1.5">
                                            {(c.Procesos || []).map((p, idx) => (
                                                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="text-[13px] font-semibold text-slate-800">
                                                            {p.ProcesoRequerido}
                                                            {p.SubprocesoRequerido && <span className="font-normal text-slate-500"> → {p.SubprocesoRequerido}</span>}
                                                        </span>
                                                        <span className="tabular shrink-0 rounded bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                                                            {Number(p.EstimadoHorasHombre) || 0} H/H
                                                        </span>
                                                    </div>
                                                    {p.AreaProceso && (
                                                        <span className="mt-1 block text-[11px] text-slate-500">Área: {p.AreaProceso}</span>
                                                    )}
                                                </div>
                                            ))}
                                            {(!c.Procesos || c.Procesos.length === 0) && (
                                                <p className="text-[12px] italic text-slate-400">Sin procesos registrados.</p>
                                            )}
                                        </div>
                                    </div>

                                    {c.ComplementoMMHH && (
                                        <div className="border-t border-slate-100 pt-4">
                                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Complemento MMHH</span>
                                            <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] text-slate-700">{c.ComplementoMMHH}</p>
                                        </div>
                                    )}

                                    {historial.length > 0 && (
                                        <div className="border-t border-slate-100 pt-4">
                                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                Historial de comentarios ({historial.length})
                                            </span>
                                            <ol className="thin-scroll mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
                                                {historial.map((cm, idx) => (
                                                    <li key={idx} className={`rounded-lg border px-3 py-2.5 ${cm.EsCierre ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                                            <span className="text-[12px] font-semibold text-slate-800">{cm.Autor}</span>
                                                            {cm.EsCierre && (
                                                                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Cierre</span>
                                                            )}
                                                            <span className="tabular ml-auto text-[11px] text-slate-400">{cm.Fecha}</span>
                                                        </div>
                                                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">{cm.Texto}</p>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {c.Demoras && c.Demoras.length > 0 && (
                                        <div className="border-t border-slate-100 pt-4">
                                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Demoras ({c.Demoras.length})</span>
                                            <div className="mt-2 space-y-1.5">
                                                {c.Demoras.map((dem, idx) => (
                                                    <div key={idx} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                                                        <span className="text-[13px] font-medium text-slate-800">{dem.Descripcion || "Sin descripción"}</span>
                                                        <span className="tabular mt-0.5 block text-[11px] text-slate-500">{dem.Fecha}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-slate-100 pt-4 text-[11px] leading-relaxed text-slate-500">
                                        <div>Coordinador: <strong className="font-semibold text-slate-700">{c.Nombre}</strong></div>
                                        <div>{c.Email}</div>
                                        <div className="tabular">Última acción: {c.FechaDiligenciado}</div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Evidencias de coordinación</span>
                                        {c.ImagenesBase64 && c.ImagenesBase64.length > 0 ? (
                                            <button onClick={() => { setModalImages(c.ImagenesBase64); setActiveImageIndex(0); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
                                                Ver {c.ImagenesBase64.length} foto{c.ImagenesBase64.length > 1 ? 's' : ''}
                                            </button>
                                        ) : <span className="text-[11px] italic text-slate-400">Sin evidencias</span>}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <svg className="mb-3 h-8 w-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="9" />
                                        <path strokeLinecap="round" d="M12 7v5l3 2" />
                                    </svg>
                                    <p className="text-[13px] font-medium text-slate-600">Pendiente de asignación</p>
                                    <p className="mt-1 text-xs text-slate-500">El coordinador aún no ha registrado gestión sobre este requerimiento.</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

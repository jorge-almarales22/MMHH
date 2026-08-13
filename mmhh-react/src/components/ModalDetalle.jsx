import React from 'react';
import { marca, marcaPrioridad, marcaOscura, puntoEstado, dial, btnMini } from '../ui';
import { getEstadoSolicitud, totalHorasHombre } from '../utils/helpers';
import { medirTolerancia } from '../utils/tolerancia';
import { ToleranciaDetalle } from './Tolerancia';

function Dato({ titulo, children, ancho = "" }) {
    return (
        <div className={ancho}>
            <dt className="dial text-[10px] text-iron-400">{titulo}</dt>
            <dd className="mt-1 text-[13px] font-medium text-iron-800">{children}</dd>
        </div>
    );
}

function Seccion({ titulo, children, ultimo = false }) {
    return (
        <section className={`px-5 py-5 ${ultimo ? '' : 'border-b border-iron-200'}`}>
            <h3 className={`${dial} mb-3.5`}>{titulo}</h3>
            {children}
        </section>
    );
}

const BotonFotos = ({ imagenes, onVer }) => (
    imagenes && imagenes.length > 0
        ? <button onClick={onVer} className={btnMini}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2.5" y="4" width="15" height="12" /><path d="M2.5 13l4-4 3.5 3.5 3-2.5 4.5 4" strokeLinecap="square" />
            </svg>
            Ver {imagenes.length} {imagenes.length > 1 ? 'fotos' : 'foto'}
        </button>
        : <span className="text-[11px] text-iron-400">Sin fotos</span>
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
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-dye-deep/70 p-3 backdrop-blur-[2px] animate-fade-in sm:p-6">
            <div className="my-auto w-full max-w-5xl border border-iron-300 bg-white shadow-2xl shadow-dye-deep/30 animate-card-in">

                <div className="border-b border-iron-200 bg-dye px-6 py-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <span className="dial text-[10px] text-scribe">Ficha de requerimiento</span>
                            <h2 className="mt-1 truncate text-[20px] font-semibold leading-tight tracking-tight">
                                {d.NombreComponente || "Requerimiento"}
                            </h2>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                <span className="num border border-white/20 px-2 py-[3px] text-[11px] font-medium text-scribe">
                                    N.º {d.SolicitudID || "—"}
                                </span>
                                <span className={`${marca} ${marcaOscura}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${estadoSol === 'Gestionado' ? 'bg-scribe' : 'bg-brand'}`} />
                                    {estadoSol}
                                </span>
                                {c && c.Estado && (
                                    <span className={`${marca} ${marcaOscura}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${puntoEstado(c.Estado)}`} />
                                        {c.Estado}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setViewModalItem(null)} aria-label="Cerrar"
                            className="shrink-0 rounded-[3px] border border-white/15 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square"><path d="M5 5l10 10M15 5L5 15" /></svg>
                        </button>
                    </div>
                </div>

                {/* Plazo primero: es lo que decide si esta pieza necesita atencion. */}
                <div className="border-b border-iron-200 bg-iron-50 px-6 py-4">
                    <div className="max-w-md"><ToleranciaDetalle t={tol} /></div>
                </div>

                <div className="thin-scroll max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-iron-200">

                        {/* Lo que pidió el cliente */}
                        <div>
                            <Seccion titulo="Lo que pidió el cliente">
                                <dl className="grid grid-cols-2 gap-4">
                                    <Dato titulo="Ingreso"><span className="num">{d.Fecha}</span></Dato>
                                    <Dato titulo="OT"><span className="num text-brand-deep">{d.OT}</span></Dato>
                                    <Dato titulo="Flota / cantidad"><span className="num">{d.Flota}</span> ×{d.Cantidad || 1}</Dato>
                                    <Dato titulo="PN / SC"><span className="num">{d.PN || "N/A"} / {d.SC || "N/A"}</span></Dato>
                                    <Dato titulo="Prioridad del cliente">
                                        <span className={`${marca} ${marcaPrioridad(d.Prioridad)}`}>{d.Prioridad}</span>
                                    </Dato>
                                    <Dato titulo="Superintendencia">{d.Superintendencia || "N/A"}</Dato>
                                </dl>

                                <div className="mt-4 border-t border-iron-100 pt-4">
                                    <dt className="dial text-[10px] text-iron-400">Soporte</dt>
                                    <p className="mt-1 text-[13px] font-medium text-iron-800">{d.Soporte}</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {(d.TipoRequerimiento || []).map((t, i) => (
                                            <span key={i} className="border border-brand/35 bg-brand-wash px-2 py-[3px] text-[11px] font-medium text-brand-deep">{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-iron-100 pt-4">
                                    <dt className="dial text-[10px] text-iron-400">Qué hay que hacerle</dt>
                                    <p className="mt-1.5 whitespace-pre-wrap border-l-2 border-iron-200 bg-iron-50 px-3 py-2.5 text-[13px] leading-relaxed text-iron-700">
                                        {d.DetalleRequerimiento || "Sin detalle"}
                                    </p>
                                </div>

                                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-iron-100 pt-4">
                                    <Dato titulo="Contacto">
                                        {d.NombreContacto || "N/A"}
                                        {d.Celular && <span className="num mt-0.5 block text-[11px] font-normal text-iron-500">{d.Celular}</span>}
                                    </Dato>
                                    <Dato titulo="Entrega">
                                        {d.CoordinadorRecibe}
                                        <span className="mt-0.5 block text-[11px] font-normal text-iron-500">{d.AreaEntrega}</span>
                                    </Dato>
                                </dl>

                                <div className="mt-4 flex items-center justify-between border-t border-iron-100 pt-4">
                                    <span className="dial text-[10px] text-iron-400">Fotos del cliente</span>
                                    <BotonFotos imagenes={fotosCliente} onVer={() => abrirFotos(fotosCliente)} />
                                </div>
                            </Seccion>
                        </div>

                        {/* Lo que hizo el taller */}
                        <div>
                            {c ? (
                                <>
                                    <Seccion titulo="Lo que hizo el taller">
                                        <dl className="grid grid-cols-2 gap-4">
                                            <Dato titulo="Prioridad del coordinador">
                                                {c.PrioridadCoordinador
                                                    ? <span className={`${marca} ${marcaPrioridad(c.PrioridadCoordinador)}`}>{c.PrioridadCoordinador}</span>
                                                    : <span className="text-[11px] font-normal text-iron-400">Sin definir</span>}
                                            </Dato>
                                            <Dato titulo="Fecha estimada"><span className="num">{c.FechaEstimado}</span></Dato>
                                            <Dato titulo="Horas hombre"><span className="num">{totalHorasHombre(c)}</span> H/H</Dato>
                                            <Dato titulo="Se avisó al cliente">{c.NotificacionCliente}</Dato>
                                        </dl>

                                        <div className="mt-4 border-t border-iron-100 pt-4">
                                            <dt className="dial mb-2 text-[10px] text-iron-400">Ruta de procesos</dt>
                                            <ol className="space-y-px border border-iron-200 bg-iron-200">
                                                {(c.Procesos || []).map((p, i) => (
                                                    <li key={i} className="flex items-start gap-3 bg-white px-3 py-2.5">
                                                        <span className="num mt-px flex h-5 w-5 shrink-0 items-center justify-center border border-iron-300 bg-iron-50 text-[10px] text-iron-500">{i + 1}</span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[13px] font-medium text-iron-800">
                                                                {p.ProcesoRequerido}
                                                                {p.SubprocesoRequerido && <span className="font-normal text-iron-500"> · {p.SubprocesoRequerido}</span>}
                                                            </p>
                                                            {p.AreaProceso && <p className="mt-0.5 text-[11px] text-iron-500">{p.AreaProceso}</p>}
                                                        </div>
                                                        <span className="num shrink-0 text-[11px] text-iron-600">{Number(p.EstimadoHorasHombre) || 0} H/H</span>
                                                    </li>
                                                ))}
                                                {(!c.Procesos || c.Procesos.length === 0) && (
                                                    <li className="bg-white px-3 py-3 text-[12px] text-iron-400">Sin procesos registrados.</li>
                                                )}
                                            </ol>
                                        </div>

                                        {c.ComplementoMMHH && (
                                            <div className="mt-4 border-t border-iron-100 pt-4">
                                                <dt className="dial text-[10px] text-iron-400">Complemento MMHH</dt>
                                                <p className="mt-1.5 whitespace-pre-wrap border-l-2 border-iron-200 bg-iron-50 px-3 py-2.5 text-[13px] text-iron-700">{c.ComplementoMMHH}</p>
                                            </div>
                                        )}

                                        {c.Demoras && c.Demoras.length > 0 && (
                                            <div className="mt-4 border-t border-iron-100 pt-4">
                                                <dt className="dial mb-2 text-[10px] text-iron-400">Demoras ({c.Demoras.length})</dt>
                                                <div className="space-y-2">
                                                    {c.Demoras.map((dem, i) => (
                                                        <div key={i} className="border-l-2 border-alarm bg-alarm-wash/50 px-3 py-2">
                                                            <p className="text-[13px] text-iron-800">{dem.Descripcion || "Sin descripción"}</p>
                                                            <span className="num mt-0.5 block text-[11px] text-iron-500">{dem.Fecha}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center justify-between border-t border-iron-100 pt-4">
                                            <span className="dial text-[10px] text-iron-400">Fotos del taller</span>
                                            <BotonFotos imagenes={c.ImagenesBase64} onVer={() => abrirFotos(c.ImagenesBase64)} />
                                        </div>

                                        <p className="mt-4 border-t border-iron-100 pt-4 text-[11px] leading-relaxed text-iron-500">
                                            Última gestión de <strong className="font-semibold text-iron-700">{c.Nombre}</strong>
                                            <span className="num"> · {c.FechaDiligenciado}</span>
                                        </p>
                                    </Seccion>

                                    {historial.length > 0 && (
                                        <Seccion titulo={`Historial de comentarios (${historial.length})`} ultimo>
                                            <ol className="thin-scroll max-h-60 space-y-px overflow-y-auto border border-iron-200 bg-iron-200">
                                                {historial.map((cm, i) => (
                                                    <li key={i} className={`px-3 py-2.5 ${cm.EsCierre ? 'border-l-2 border-spec bg-spec-wash' : 'bg-white'}`}>
                                                        <div className="mb-1 flex flex-wrap items-baseline gap-2">
                                                            <span className="text-[12px] font-semibold text-iron-800">{cm.Autor}</span>
                                                            {cm.EsCierre && <span className="dial text-[9px] text-spec">Cierre</span>}
                                                            <span className="num ml-auto text-[11px] text-iron-400">{cm.Fecha}</span>
                                                        </div>
                                                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-iron-700">{cm.Texto}</p>
                                                    </li>
                                                ))}
                                            </ol>
                                        </Seccion>
                                    )}
                                </>
                            ) : (
                                <Seccion titulo="Lo que hizo el taller" ultimo>
                                    <div className="flex min-h-[220px] flex-col items-center justify-center border border-dashed border-iron-300 bg-iron-50 px-6 text-center">
                                        <svg className="mb-3 h-9 w-9 text-iron-300" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
                                            <circle cx="20" cy="20" r="14" /><path d="M20 11v9l6 4" strokeLinecap="square" />
                                        </svg>
                                        <p className="text-[13px] font-medium text-iron-600">Todavía sin gestión</p>
                                        <p className="mt-1 max-w-xs text-[12px] text-iron-500">
                                            El coordinador aún no ha abierto la hoja de ruta de esta pieza.
                                        </p>
                                    </div>
                                </Seccion>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

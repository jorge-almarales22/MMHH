import React, { useState, useEffect } from 'react';
import { chip, chipEstado, chipSolicitud, chipPrioridad, chipPlazo, btnBorde } from '../ui';
import { getEstadoSolicitud, totalHorasHombre, totalHorasReales, avanceProcesos, getTrabajos, comentariosCliente } from '../utils/helpers';
import { medirTolerancia, etiquetaDesvio, ETIQUETA_TOLERANCIA } from '../utils/tolerancia';
import { HiloComentarios, CajaComentario } from './Comentarios';

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

export default function ModalDetalle({ viewModalItem, setViewModalItem, setModalImages, setActiveImageIndex, userAuth, onAddComment }) {
    const [borrador, setBorrador] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [errorComentario, setErrorComentario] = useState(null);

    // Cada solicitud abre con su caja limpia: un borrador no puede saltar de un
    // componente a otro.
    const idAbierto = viewModalItem?.Id;
    useEffect(() => { setBorrador(""); setErrorComentario(null); }, [idAbierto]);

    if (!viewModalItem) return null;

    const d = viewModalItem.parsedData;
    const c = d.Coordinador;
    const fotosCliente = d.ImagenesBase64 || [];
    const estadoSol = getEstadoSolicitud(d);
    const historial = ((c && c.Comentarios) || []).filter(cm => cm.EsCierre);
    const trabajos = getTrabajos(d);
    const delCliente = comentariosCliente(d);
    const avance = avanceProcesos(c);
    const tol = medirTolerancia(d);
    const puedeComentar = typeof onAddComment === 'function';

    const abrirFotos = (lista) => { setModalImages(lista); setActiveImageIndex(0); };

    const enviarComentario = async () => {
        if (!borrador.trim()) return;
        setEnviando(true);
        setErrorComentario(null);
        try {
            await onAddComment(borrador);
            setBorrador("");
        } catch (err) {
            setErrorComentario(err.message || "No se pudo guardar el comentario.");
        } finally {
            setEnviando(false);
        }
    };

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
                            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-2">
                                Trabajos requeridos ({trabajos.length})
                            </p>
                            {trabajos.length === 0 ? (
                                <p className="text-xs text-slate-400">Sin trabajos registrados.</p>
                            ) : (
                                <ol className="space-y-1.5">
                                    {trabajos.map((t, i) => (
                                        <li
                                            key={i}
                                            className={`rounded-lg border px-3 py-2 ${t.Descartado ? 'border-slate-200 bg-slate-50' : 'border-yellow-200 bg-yellow-50'}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className={`grid shrink-0 w-5 h-5 rounded-full text-[10px] font-bold place-items-center mt-0.5 tabular-nums ${t.Descartado ? 'bg-slate-300 text-white' : 'bg-yellow-400 text-slate-900'}`}>
                                                    {i + 1}
                                                </span>
                                                <p className={`text-sm flex-1 min-w-0 ${t.Descartado ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                    <span className="font-semibold">{t.Soporte}</span>
                                                    {t.TipoRequerimiento && <span className="text-slate-600"> · {t.TipoRequerimiento}</span>}
                                                </p>
                                            </div>
                                            {t.Descartado && (
                                                <div className="mt-1.5 ml-7 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5">
                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">No se ejecuta</p>
                                                    <p className="text-[13px] text-slate-700 whitespace-pre-wrap mt-0.5">{t.Descartado.Motivo}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1 tabular-nums">{t.Descartado.Autor} · {t.Descartado.Fecha}</p>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            )}
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
                                    <Dato label="Horas hombre">
                                        <span className="tabular-nums">{totalHorasReales(c)}</span>
                                        <span className="text-slate-400"> de {totalHorasHombre(c)} H/H</span>
                                    </Dato>
                                    <Dato label="Procesos ejecutados">
                                        <span className="tabular-nums">{avance.hechos} de {avance.total}</span>
                                    </Dato>
                                    <Dato label="Se avisó al cliente">{c.NotificacionCliente}</Dato>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-2">Procesos requeridos</p>
                                    <ol className="space-y-2">
                                        {(c.Procesos || []).map((p, i) => (
                                            <li key={i} className={`rounded-lg border px-3 py-2.5 ${p.Realizado ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                                <div className="flex items-start gap-3">
                                                    <span className={`w-5 h-5 shrink-0 rounded-full text-[10px] font-bold grid place-items-center mt-0.5 ${p.Realizado ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
                                                        {p.Realizado ? '✓' : i + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {p.ProcesoRequerido}
                                                            {p.SubprocesoRequerido && <span className="font-normal text-slate-500"> · {p.SubprocesoRequerido}</span>}
                                                        </p>
                                                        {p.AreaProceso && <p className="text-xs text-slate-500 mt-0.5">{p.AreaProceso}</p>}
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <span className="block text-xs font-bold text-slate-700 tabular-nums">
                                                            {Number(p.HorasReales) || 0} / {Number(p.EstimadoHorasHombre) || 0} H/H
                                                        </span>
                                                        <span className={`block text-[10px] font-bold uppercase mt-0.5 ${p.Realizado ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                            {p.Realizado ? 'Hecho' : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {(p.Comentarios || []).length > 0 && (
                                                    <ul className="mt-2 ml-8 space-y-1.5">
                                                        {p.Comentarios.map((cm, j) => (
                                                            <li key={j} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
                                                                <div className="flex flex-wrap items-baseline gap-2">
                                                                    <span className="text-[11px] font-bold text-slate-700">{cm.Autor}</span>
                                                                    <span className="ml-auto text-[10px] text-slate-400 tabular-nums">{cm.Fecha}</span>
                                                                </div>
                                                                <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-snug">{cm.Texto}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
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
                                <Bloque titulo="Cierre del requerimiento">
                                    <HiloComentarios comentarios={historial} alto="max-h-64" />
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

                    <Bloque
                        titulo="Comentarios sobre la solicitud"
                        accion={<span className="text-xs font-bold text-slate-500 tabular-nums">{delCliente.length}</span>}
                    >
                        <p className="text-xs text-slate-500 -mt-1 mb-3">
                            Aquí el cliente y el taller se hablan. Cada comentario queda con autor y fecha; no se edita ni se elimina.
                        </p>

                        <HiloComentarios
                            comentarios={delCliente}
                            vacio="Todavía nadie ha comentado esta solicitud."
                            alto="max-h-72"
                        />

                        {puedeComentar && (
                            <div className="mt-3">
                                <CajaComentario
                                    value={borrador}
                                    onChange={setBorrador}
                                    onAdd={enviarComentario}
                                    enviando={enviando}
                                    placeholder="Escribe una novedad, una pregunta al taller o una aclaración sobre la pieza."
                                    firma={`Se firma como ${userAuth?.name || "usuario"} y se guarda de inmediato.`}
                                    etiquetaBoton="Publicar comentario"
                                />
                                {errorComentario && (
                                    <p className="text-[11px] text-red-600 mt-1.5">{errorComentario}</p>
                                )}
                            </div>
                        )}
                    </Bloque>
                </div>
            </div>
        </div>
    );
}

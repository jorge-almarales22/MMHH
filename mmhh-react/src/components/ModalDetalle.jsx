import React from 'react';

export default function ModalDetalle({ viewModalItem, setViewModalItem, setModalImages, setActiveImageIndex }) {
    if (!viewModalItem) return null;

    const d = viewModalItem.parsedData;
    const allImages = d.ImagenesBase64 || [];
    const hasImages = allImages.length > 0;
    const c = d.Coordinador;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col my-auto relative border-t-8 border-cerrejon-orange">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800">Ficha de Requerimiento de MMHH</h2>
                        <p className="text-sm font-bold text-cerrejon-orange mt-1">ID: {d.SolicitudID || "-"} | OT: {d.OT} | Flota: {d.Flota}</p>
                    </div>
                    <button onClick={() => setViewModalItem(null)} className="text-gray-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-200">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[75vh]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* PARTE DEL CLIENTE */}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2 flex justify-between items-center">
                                <span>Informaci&oacute;n del Cliente</span>
                                <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Solicitante</span>
                            </h3>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div><span className="block text-[10px] text-gray-400 uppercase font-bold">ID Solicitud</span><span className="font-bold font-mono text-gray-800 text-[10px]">{d.SolicitudID || "-"}</span></div>
                                <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Fecha Registro</span><span className="font-bold text-gray-800">{d.Fecha}</span></div>
                                <div><span className="block text-[10px] text-gray-400 uppercase font-bold">OT</span><span className="font-bold text-cerrejon-orange">{d.OT}</span></div>
                                <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Flota / Cantidad</span><span className="font-bold text-gray-800">{d.Flota} ({d.Cantidad || 1})</span></div>
                                <div><span className="block text-[10px] text-gray-400 uppercase font-bold">PN / SC</span><span className="font-bold text-gray-800">{d.PN || "N/A"} / {d.SC || "N/A"}</span></div>
                            </div>

                            <div className="text-xs pt-1">
                                <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Soporte</span>
                                <span className="font-extrabold text-gray-800 block">{d.Soporte}</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(d.TipoRequerimiento || []).map((t, idx) => (
                                        <span key={idx} className="bg-orange-100 text-cerrejon-orange text-[10px] font-bold px-2 py-0.5 rounded">{t}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="text-xs pt-1">
                                <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Detalle del Requerimiento</span>
                                <p className="p-3 bg-white rounded border border-gray-100 text-gray-800 whitespace-pre-wrap">{d.DetalleRequerimiento || "Sin detalle"}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                                <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Contacto</span><span className="font-medium text-gray-700 block">{d.NombreContacto || "N/A"}</span><span className="text-gray-500 font-medium">{d.Celular ? `Cel: ${d.Celular}` : ""}</span></div>
                                <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Recepci&oacute;n</span><span className="font-medium text-gray-700 block">{d.CoordinadorRecibe}</span><span className="text-gray-500 font-medium">{d.AreaEntrega}</span></div>
                            </div>

                            {d.Superintendencia && (
                                <div className="text-xs pt-1">
                                    <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Superintendencia</span>
                                    <span className="font-bold text-gray-800 block">{d.Superintendencia}</span>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Evidencias de Solicitud</span>
                                {hasImages ? (
                                    <button onClick={() => { setModalImages(allImages); setActiveImageIndex(0); }} className="bg-cerrejon-dark text-white font-bold text-xs px-3 py-1.5 rounded hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
                                        Ver {allImages.length} Foto(s)
                                    </button>
                                ) : <span className="text-[10px] text-gray-400 italic">Sin evidencias</span>}
                            </div>
                        </div>

                        {/* PARTE DEL COORDINADOR */}
                        <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-200 space-y-4">
                            <h3 className="text-sm font-black text-cerrejon-orange uppercase tracking-wider border-b border-orange-200 pb-2 flex justify-between items-center">
                                <span>Gesti&oacute;n de Coordinaci&oacute;n</span>
                                <span className="text-[10px] bg-cerrejon-orange text-white px-2 py-0.5 rounded">T&eacute;cnico</span>
                            </h3>

                            {c ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div><span className="block text-[10px] text-orange-400 uppercase font-bold">Estado</span><span className="font-bold text-gray-800">{c.Estado}</span></div>
                                        <div><span className="block text-[10px] text-orange-400 uppercase font-bold">Fecha Estimada</span><span className="font-bold text-gray-800">{c.FechaEstimado}</span></div>
                                        <div><span className="block text-[10px] text-orange-400 uppercase font-bold">Equipo</span><span className="font-bold text-gray-800">{c.Equipo}</span></div>
                                        <div><span className="block text-[10px] text-orange-400 uppercase font-bold">H/H Estimadas</span><span className="font-bold text-gray-800">{c.EstimadoHorasHombre} H/H</span></div>
                                        <div className="col-span-2"><span className="block text-[10px] text-orange-400 uppercase font-bold">Notificaci&oacute;n Cliente</span><span className="font-bold text-gray-800">{c.NotificacionCliente}</span></div>
                                    </div>

                                    <div className="text-xs pt-1">
                                        <span className="block text-[10px] text-orange-400 uppercase font-bold mb-1">Procesos</span>
                                        {(c.Procesos || [{ ProcesoRequerido: c.ProcesoRequerido || "N/A", SubprocesoRequerido: c.SubprocesoRequerido }]).map((p, idx) => (
                                            <div key={idx} className="p-2 bg-white rounded border border-orange-100 mb-1">
                                                <span className="font-bold text-gray-800">{p.ProcesoRequerido}</span>
                                                {p.SubprocesoRequerido && <span className="text-gray-500"> &rarr; {p.SubprocesoRequerido}</span>}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-xs pt-1">
                                        <span className="block text-[10px] text-orange-400 uppercase font-bold mb-1">Complemento MMHH</span>
                                        <p className="p-3 bg-white rounded border border-orange-100 text-gray-800 whitespace-pre-wrap">{c.ComplementoMMHH || "Sin complemento ingresado."}</p>
                                    </div>

                                    {c.Demoras && c.Demoras.length > 0 && (
                                        <div className="text-xs pt-1">
                                            <span className="block text-[10px] text-orange-400 uppercase font-bold mb-1">Demoras ({c.Demoras.length})</span>
                                            <div className="space-y-1">
                                                {c.Demoras.map((dem, idx) => (
                                                    <div key={idx} className="p-2 bg-red-50 rounded border border-red-100">
                                                        <span className="font-bold text-gray-800">{dem.Descripcion || "Sin descripci\u00F3n"}</span>
                                                        <span className="text-gray-500 block text-[9px]">{dem.Fecha}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {c.Comentario && (
                                        <div className="text-xs pt-1">
                                            <span className="block text-[10px] text-green-400 uppercase font-bold mb-1">Comentario de Entrega</span>
                                            <p className="p-3 bg-green-50 rounded border border-green-100 text-gray-800 whitespace-pre-wrap">{c.Comentario}</p>
                                        </div>
                                    )}

                                    <div className="text-[10px] text-gray-500 pt-2 border-t border-orange-200/50">
                                        <div>Coordinador: <strong>{c.Nombre}</strong></div>
                                        <div>Email: {c.Email}</div>
                                        <div>Fecha de Acci&oacute;n: {c.FechaDiligenciado}</div>
                                    </div>

                                    <div className="border-t border-orange-200/50 pt-4 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-orange-400 uppercase">Evidencias de Coordinaci&oacute;n</span>
                                        {c.ImagenesBase64 && c.ImagenesBase64.length > 0 ? (
                                            <button onClick={() => { setModalImages(c.ImagenesBase64); setActiveImageIndex(0); }} className="bg-cerrejon-orange text-white font-bold text-xs px-3 py-1.5 rounded hover:bg-orange-600 transition-colors flex items-center gap-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
                                                Ver {c.ImagenesBase64.length} Foto(s)
                                            </button>
                                        ) : <span className="text-[10px] text-gray-400 italic">Sin evidencias</span>}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-xs text-gray-400 italic bg-white/50 rounded-xl border border-orange-100 flex flex-col items-center justify-center min-h-[220px]">
                                    <svg className="h-8 w-8 text-orange-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    <span>Pendiente de asignaci&oacute;n por parte del Coordinador.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { btn, btnMini, dial } from '../ui';

/**
 * Confirmación de ingreso. El número es lo único que el solicitante debe
 * llevarse, así que se estampa: entra a escala grande y asienta, como el
 * troquel que marca la pieza al recibirla.
 */
export default function ModalExito({ data, onClose }) {
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        if (!data) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [data, onClose]);

    useEffect(() => { setCopiado(false); }, [data]);

    if (!data) return null;

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(data.id);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch { setCopiado(false); }
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-dye-deep/75 p-4 backdrop-blur-[2px] animate-fade-in"
            onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="exito-titulo"
        >
            <div
                className="w-full max-w-sm border border-iron-300 bg-white shadow-2xl shadow-dye-deep/40 animate-card-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-iron-200 bg-dye px-6 py-3">
                    <span className="dial text-[10px] text-scribe">Solicitud registrada</span>
                </div>

                <div className="px-6 py-7 text-center">
                    <h3 id="exito-titulo" className={`${dial} !text-iron-500`}>Número de solicitud</h3>

                    <div className="mt-3 animate-stamp">
                        <span className="num inline-block border-y-2 border-brand px-4 py-1.5 text-[44px] font-medium leading-none tracking-[0.08em] text-brand-deep">
                            {data.id}
                        </span>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <button type="button" onClick={copiar} className={btnMini}>
                            {copiado ? (
                                <>
                                    <svg className="h-3.5 w-3.5 text-spec" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10.5l4 4 8-9" strokeLinecap="square" /></svg>
                                    Copiado
                                </>
                            ) : (
                                <>
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="7" y="3" width="10" height="12" /><path d="M13 17H3V5" strokeLinecap="square" /></svg>
                                    Copiar número
                                </>
                            )}
                        </button>
                    </div>

                    <p className="mt-5 text-[13px] leading-relaxed text-iron-600">
                        Anote este número: con él consulta el avance de la pieza en el taller.
                    </p>

                    <dl className="mt-5 space-y-px border border-iron-200 bg-iron-200 text-left">
                        {data.ot && (
                            <div className="flex justify-between gap-3 bg-white px-3 py-2">
                                <dt className="dial text-[10px] text-iron-500">OT</dt>
                                <dd className="num text-[12px] font-medium text-iron-800">{data.ot}</dd>
                            </div>
                        )}
                        {data.componente && (
                            <div className="flex justify-between gap-3 bg-white px-3 py-2">
                                <dt className="dial text-[10px] text-iron-500">Componente</dt>
                                <dd className="truncate text-[12px] font-medium text-iron-800">{data.componente}</dd>
                            </div>
                        )}
                        <div className="flex justify-between gap-3 bg-white px-3 py-2">
                            <dt className="dial text-[10px] text-iron-500">Estado</dt>
                            <dd className="text-[12px] font-medium text-brand-deep">Pendiente</dd>
                        </div>
                    </dl>
                </div>

                <div className="border-t border-iron-200 bg-iron-50 px-6 py-4">
                    <button type="button" onClick={onClose} className={`${btn} w-full`} autoFocus>Listo</button>
                </div>
            </div>
        </div>
    );
}

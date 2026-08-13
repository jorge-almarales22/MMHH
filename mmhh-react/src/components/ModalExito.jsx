import React, { useEffect, useState } from 'react';

/**
 * Confirmacion de solicitud creada. El ID es el dato que el usuario debe
 * llevarse, asi que ocupa el centro optico y se puede copiar de un clic.
 */
export default function ModalExito({ data, onClose }) {
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        if (!data) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [data, onClose]);

    useEffect(() => { setCopiado(false); }, [data]);

    if (!data) return null;

    const copiarID = async () => {
        try {
            await navigator.clipboard.writeText(data.id);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            setCopiado(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-slate-900/25 animate-pop-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-8 pt-9 pb-7 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
                        <svg className="h-9 w-9 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4.5 12.5l5 5 10-11" strokeDasharray="48" strokeDashoffset="48" className="animate-draw-check" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-slate-900">Solicitud registrada</h3>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Su requerimiento fue enviado a Coordinación de MMHH.
                    </p>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-5">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Número de solicitud
                        </span>
                        <div className="mt-2 flex items-center justify-center gap-3">
                            <span className="tabular text-4xl font-bold tracking-[0.12em] text-cerrejon-orange">
                                {data.id}
                            </span>
                            <button
                                type="button"
                                onClick={copiarID}
                                title="Copiar número"
                                className="rounded-lg border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                            >
                                {copiado ? (
                                    <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.3 3.29 6.8-6.79a1 1 0 011.9.5z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2H7z" /><path d="M3 7a2 2 0 012-2v9a3 3 0 003 3h6a2 2 0 01-2 2H7a4 4 0 01-4-4V7z" /></svg>
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-[11px] font-medium text-slate-500">
                            {copiado ? "Copiado al portapapeles" : "Consérvelo para hacer seguimiento"}
                        </p>
                    </div>

                    {(data.ot || data.componente) && (
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-slate-500">
                            {data.ot && <span>OT <strong className="tabular font-semibold text-slate-700">{data.ot}</strong></span>}
                            {data.componente && <span className="max-w-[16rem] truncate">{data.componente}</span>}
                        </div>
                    )}

                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-semibold text-orange-700 ring-1 ring-inset ring-orange-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        Estado de la solicitud: Pendiente
                    </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-lg bg-cerrejon-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cerrejon-orangeDark focus:outline-none focus:ring-4 focus:ring-cerrejon-orange/25"
                        autoFocus
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}

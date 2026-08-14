import React, { useEffect, useState } from 'react';
import { btnPrimario, btnBorde } from '../ui';

/** Confirmacion de solicitud creada: el numero es lo unico que hay que llevarse. */
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
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4"
            onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="exito-titulo"
        >
            <div
                className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 pt-7 pb-6 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 grid place-items-center mb-4">
                        <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4.5 12.5l5 5 10-11" />
                        </svg>
                    </div>

                    <h3 id="exito-titulo" className="text-lg font-bold text-slate-900">Solicitud registrada</h3>
                    <p className="text-sm text-slate-500 mt-1">Ya está en la cola del taller.</p>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Número de solicitud</p>
                        <p className="text-4xl font-bold text-slate-900 tabular-nums mt-1">{data.id}</p>
                        <div className="mt-3 flex justify-center">
                            <button type="button" onClick={copiar} className={btnBorde}>
                                {copiado ? 'Copiado' : 'Copiar número'}
                            </button>
                        </div>
                    </div>

                    <dl className="mt-4 space-y-1.5 text-left">
                        {data.ot && (
                            <div className="flex justify-between gap-3 text-xs">
                                <dt className="text-slate-500">OT</dt>
                                <dd className="font-semibold text-slate-800 tabular-nums">{data.ot}</dd>
                            </div>
                        )}
                        {data.componente && (
                            <div className="flex justify-between gap-3 text-xs">
                                <dt className="text-slate-500">Componente</dt>
                                <dd className="font-semibold text-slate-800 truncate">{data.componente}</dd>
                            </div>
                        )}
                        <div className="flex justify-between gap-3 text-xs">
                            <dt className="text-slate-500">Estado</dt>
                            <dd className="font-semibold text-orange-700">Pendiente</dd>
                        </div>
                    </dl>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
                    <button type="button" onClick={onClose} className={`${btnPrimario} w-full`} autoFocus>Listo</button>
                </div>
            </div>
        </div>
    );
}

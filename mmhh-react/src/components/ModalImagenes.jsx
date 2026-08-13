import React, { useEffect } from 'react';

export default function ModalImagenes({ modalImages, setModalImages, activeImageIndex, setActiveImageIndex }) {
    const abierto = !!(modalImages && modalImages.length > 0 && activeImageIndex !== null);
    const total = modalImages ? modalImages.length : 0;

    useEffect(() => {
        if (!abierto) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setModalImages(null);
            if (e.key === 'ArrowLeft') setActiveImageIndex(p => (p === 0 ? total - 1 : p - 1));
            if (e.key === 'ArrowRight') setActiveImageIndex(p => (p === total - 1 ? 0 : p + 1));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [abierto, total, setModalImages, setActiveImageIndex]);

    if (!abierto) return null;

    const flecha = "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/20";

    return (
        <div className="fixed inset-0 z-[130] flex flex-col bg-slate-950/95 backdrop-blur-md animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">{modalImages[activeImageIndex].name}</p>
                    <p className="tabular mt-0.5 text-[11px] text-slate-400">Evidencia {activeImageIndex + 1} de {total}</p>
                </div>
                <button onClick={() => setModalImages(null)} className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20" aria-label="Cerrar">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center p-6">
                {total > 1 && (
                    <button onClick={() => setActiveImageIndex(p => (p === 0 ? total - 1 : p - 1))} className={`${flecha} left-5`} aria-label="Anterior">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                    </button>
                )}
                <img src={modalImages[activeImageIndex].data} alt="Evidencia" className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
                {total > 1 && (
                    <button onClick={() => setActiveImageIndex(p => (p === total - 1 ? 0 : p + 1))} className={`${flecha} right-5`} aria-label="Siguiente">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
}

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

    const flecha = "absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white grid place-items-center hover:bg-white/20 cursor-pointer";

    return (
        <div className="fixed inset-0 z-[70] bg-slate-900/95 flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{modalImages[activeImageIndex].name}</p>
                    <p className="text-[11px] text-white/50 tabular-nums mt-0.5">Foto {activeImageIndex + 1} de {total}</p>
                </div>
                <button
                    onClick={() => setModalImages(null)} aria-label="Cerrar"
                    className="w-8 h-8 rounded-lg bg-white/10 text-white grid place-items-center hover:bg-white/20 cursor-pointer shrink-0"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="relative flex-1 grid place-items-center p-4 sm:p-6">
                {total > 1 && (
                    <button onClick={() => setActiveImageIndex(p => (p === 0 ? total - 1 : p - 1))} className={`${flecha} left-4`} aria-label="Anterior">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                    </button>
                )}
                <img src={modalImages[activeImageIndex].data} alt="Evidencia" className="max-h-full max-w-full object-contain rounded-lg" />
                {total > 1 && (
                    <button onClick={() => setActiveImageIndex(p => (p === total - 1 ? 0 : p + 1))} className={`${flecha} right-4`} aria-label="Siguiente">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
}

import React from 'react';

export default function ModalImagenes({ modalImages, setModalImages, activeImageIndex, setActiveImageIndex }) {
    if (!modalImages || modalImages.length === 0 || activeImageIndex === null) return null;

    return (
        <div className="fixed inset-0 z-[120] flex flex-col bg-black/95 backdrop-blur-md animate-fade-in">
            <div className="flex justify-between items-center p-4 text-white border-b border-white/10">
                <div className="font-bold tracking-widest text-sm text-cerrejon-gold uppercase">
                    Archivo: {modalImages[activeImageIndex].name} ({activeImageIndex + 1} de {modalImages.length})
                </div>
                <button onClick={() => setModalImages(null)} className="bg-white/10 p-2 rounded-full hover:text-red-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 relative">
                {modalImages.length > 1 && (
                    <button onClick={() => setActiveImageIndex(p => p === 0 ? modalImages.length - 1 : p - 1)} className="absolute left-4 p-3 bg-black/50 text-white rounded-full">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                )}
                <img src={modalImages[activeImageIndex].data} alt="Evidencia Decodificada" className="max-h-full max-w-full object-contain" />
                {modalImages.length > 1 && (
                    <button onClick={() => setActiveImageIndex(p => p === modalImages.length - 1 ? 0 : p + 1)} className="absolute right-4 p-3 bg-black/50 text-white rounded-full">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
}

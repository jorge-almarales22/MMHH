import React, { useState } from 'react';
import { btnBorde } from '../ui';

/**
 * Descarga del formato en papel.
 *
 * jsPDF se carga solo cuando alguien pide el formato: son unos 350 KB que no
 * tienen por que pesar en el arranque de una app que se usa a diario desde el
 * taller.
 */
export default function FormatoImpreso({ className = "" }) {
    const [estado, setEstado] = useState('listo');

    const descargar = async () => {
        setEstado('generando');
        try {
            const { descargarFormatoPDF } = await import('../utils/formatoPdf');
            descargarFormatoPDF();
            setEstado('listo');
        } catch (e) {
            console.error("No se pudo generar el formato en PDF.", e);
            setEstado('error');
        }
    };

    return (
        <div className={className}>
            <button type="button" onClick={descargar} disabled={estado === 'generando'} className={`${btnBorde} no-print`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
                </svg>
                {estado === 'generando' ? 'Generando...' : 'Formato en papel (PDF)'}
            </button>
            {estado === 'error' && (
                <p className="text-[11px] text-red-600 mt-1">No se pudo generar el PDF. Intenta de nuevo.</p>
            )}
        </div>
    );
}

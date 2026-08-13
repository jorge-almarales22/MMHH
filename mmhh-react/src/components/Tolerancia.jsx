import React from 'react';
import { TONO_TOLERANCIA, etiquetaDesvio } from '../utils/tolerancia';

/* La marca de especificación cae a dos tercios del recorrido: a la izquierda el
   plazo concedido, a la derecha el excedente. */
const LIMITE = 66;

/**
 * El excedente se comprime de forma asintótica. Sin esto una pieza con 4 días de
 * atraso y otra con 61 pintan la misma barra llena, que es justo lo que la escala
 * tiene que diferenciar.
 */
const anchoRelleno = (razon) => {
    if (razon <= 1) return Math.max(2, razon * LIMITE);
    const exceso = razon - 1;
    return LIMITE + (100 - LIMITE) * (exceso / (exceso + 1));
};

/**
 * Escala de tolerancia — elemento firma.
 *
 * Se lee como un instrumento: zona de plazo, marca de especificación y aguja.
 * Cuando la pieza rebasa la marca, el relleno invade la zona de excedente.
 */
export default function Tolerancia({ t, ancho = 'w-28', mostrarTexto = true }) {
    if (!t) return <span className="num text-[11px] text-iron-300">—</span>;

    const tono = TONO_TOLERANCIA[t.estado];
    const relleno = anchoRelleno(t.razon);
    const restantes = t.permitidos - t.dias;

    return (
        // flex y no inline-flex: con inline-flex el contenedor se encoge al contenido
        // y un hijo w-full colapsa a cero.
        <div className="flex items-center gap-2.5">
            <div
                className={`relative ${ancho}`}
                title={`${tono.etiqueta} · ${t.dias} de ${t.permitidos} días`}
            >
                {/* Zona de plazo y zona de excedente, separadas por la marca. */}
                <div className="flex h-[7px] w-full overflow-hidden rounded-[1px]">
                    <div className="h-full bg-iron-200" style={{ width: `${LIMITE}%` }} />
                    <div className="h-full flex-1 bg-iron-100" />
                </div>

                <div className="absolute inset-0 flex items-center">
                    <div
                        className={`h-[7px] origin-left rounded-[1px] ${tono.barra} animate-sweep`}
                        style={{ width: `${relleno}%` }}
                    />
                </div>

                {/* Marca de especificación: el plazo que concede la prioridad. */}
                <span
                    className="absolute -top-[3px] h-[13px] w-[2px] bg-iron-700"
                    style={{ left: `${LIMITE}%` }}
                    aria-hidden="true"
                />
            </div>

            {mostrarTexto && (
                <span className={`num w-11 text-[11px] font-medium leading-none ${tono.texto}`}>
                    {t.desvio > 0 ? `+${t.desvio}` : restantes}
                    <span className="text-iron-400">d</span>
                </span>
            )}
        </div>
    );
}

/** Versión expandida para las fichas. */
export function ToleranciaDetalle({ t }) {
    if (!t) {
        return <p className="text-[13px] text-iron-500">Falta la fecha o la prioridad para medir el plazo.</p>;
    }
    const tono = TONO_TOLERANCIA[t.estado];

    return (
        <div>
            <div className="flex items-baseline justify-between gap-3">
                <span className={`dial text-[11px] ${tono.texto}`}>{tono.etiqueta}</span>
                <span className={`num text-[12px] font-medium ${tono.texto}`}>{etiquetaDesvio(t)}</span>
            </div>
            <div className="mt-2.5">
                <Tolerancia t={t} ancho="w-full grow" mostrarTexto={false} />
            </div>
            <div className="mt-2 flex justify-between">
                <span className="num text-[11px] text-iron-500">
                    {t.dias} {t.dias === 1 ? 'día' : 'días'} en taller
                </span>
                <span className="num text-[11px] text-iron-500">
                    plazo {t.prioridad}: {t.permitidos} d
                </span>
            </div>
        </div>
    );
}

import { PRIORIDADES, ESTADOS_CIERRE } from '../constants';
import { getPrioridadEfectiva } from './helpers';

const MS_DIA = 86400000;

const aFecha = (s) => {
    if (!s) return null;
    const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return null;
    return Date.UTC(y, m - 1, d);
};

const hoyUTC = () => {
    const n = new Date();
    return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
};

export const diasEntre = (desde, hasta) => {
    const a = aFecha(desde), b = aFecha(hasta);
    if (a === null || b === null) return null;
    return Math.round((b - a) / MS_DIA);
};

/**
 * Mide una solicitud contra su especificacion de plazo.
 *
 * La prioridad no es una etiqueta: PRIORIDADES la traduce a un numero de dias
 * permitidos. Comparado con los dias que la pieza lleva en el taller, eso es una
 * medicion contra tolerancia, y se reporta como tal.
 *
 * Devuelve null cuando no hay con que medir (sin fecha o sin prioridad valida).
 */
export const medirTolerancia = (d) => {
    if (!d || d.Error) return null;

    const prioridad = getPrioridadEfectiva(d);
    const permitidos = PRIORIDADES[prioridad];
    if (permitidos === undefined) return null;
    if (!aFecha(d.Fecha)) return null;

    const c = d.Coordinador;
    const cerrado = !!(c && ESTADOS_CIERRE.includes(c.Estado));
    // Al cerrar se sella FechaCierre; los registros viejos caen a la ultima accion.
    const fechaFin = cerrado ? (c.FechaCierre || c.FechaDiligenciado || null) : null;

    const transcurridos = cerrado
        ? (diasEntre(d.Fecha, fechaFin) ?? diasEntre(d.Fecha, new Date().toISOString().slice(0, 10)) ?? 0)
        : (diasEntre(d.Fecha, new Date(hoyUTC()).toISOString().slice(0, 10)) ?? 0);

    const dias = Math.max(0, transcurridos);
    const desvio = dias - permitidos;

    // P0 exige atencion inmediata: su ventana es cero, cualquier dia ya es desvio.
    const razon = permitidos > 0 ? dias / permitidos : (dias > 0 ? 1 + dias : 0);

    let estado;
    if (desvio > 0) estado = cerrado ? 'cerrado-fuera' : 'fuera';
    else if (cerrado) estado = 'cerrado-dentro';
    else if (razon >= 0.8) estado = 'limite';
    else estado = 'dentro';

    return { prioridad, permitidos, dias, desvio, razon, cerrado, estado };
};

export const TONO_TOLERANCIA = {
    'dentro': { texto: 'text-spec', barra: 'bg-spec', etiqueta: 'En tolerancia' },
    'limite': { texto: 'text-brand-deep', barra: 'bg-brand', etiqueta: 'Al límite' },
    'fuera': { texto: 'text-alarm', barra: 'bg-alarm', etiqueta: 'Fuera de tolerancia' },
    'cerrado-dentro': { texto: 'text-iron-500', barra: 'bg-iron-400', etiqueta: 'Cerrada en plazo' },
    'cerrado-fuera': { texto: 'text-iron-500', barra: 'bg-iron-400', etiqueta: 'Cerrada fuera de plazo' }
};

/** Texto corto del desvio, en el vocabulario del taller. */
export const etiquetaDesvio = (t) => {
    if (!t) return '—';
    if (t.desvio > 0) return `+${t.desvio} d`;
    if (t.desvio === 0) return 'al límite';
    return `${Math.abs(t.desvio)} d de margen`;
};

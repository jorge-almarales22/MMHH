/**
 * Tokens de interfaz.
 *
 * Replican el sistema visual de App-GCOM: superficie slate-50, tarjetas blancas
 * rounded-2xl, cromo slate-900 y acento amarillo. Un solo lugar los define para
 * que los tres modulos se lean como la misma aplicacion.
 */

/* --- superficies --- */
export const tarjeta = "bg-white rounded-2xl border border-slate-200";
export const tarjetaVacia = "bg-white rounded-2xl border border-dashed border-slate-300 py-14 px-4 text-center";

/* --- campos --- */
export const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 ' +
    'placeholder:text-slate-400 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200';

/* El chevron vive en index.css, sobre el propio elemento select. */
export const selectCls = inputCls;

/* Campos dentro de una fila de tabla: mismo lenguaje, menos aire, porque la
   densidad es justamente lo que hace legible una lista de diez procesos. */
export const inputTabla =
    'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[13px] text-slate-900 ' +
    'placeholder:text-slate-400 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200';

export const selectTabla = inputTabla + ' pr-7 bg-[position:right_0.35rem_center] bg-[size:14px]';

/* --- botones --- */
export const btnPrimario =
    "px-5 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-sm font-bold cursor-pointer " +
    "disabled:opacity-60 disabled:cursor-wait inline-flex items-center justify-center gap-2";

export const btnSecundario =
    "px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer";

export const btnBorde =
    "px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 " +
    "hover:border-slate-400 cursor-pointer inline-flex items-center gap-2";

/* Boton de icono: quitar filas sin robarle ancho a los campos. */
export const btnIcono =
    "w-7 h-7 shrink-0 grid place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 " +
    "cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400";

export const btnOscuro =
    "px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold cursor-pointer hover:bg-slate-800";

/* --- tabla --- */
export const th = "px-4 py-3 font-bold";
export const thCompacto = "px-2 py-2 font-bold";
export const theadCls = "bg-slate-50 text-left";
export const theadTr = "text-[10px] uppercase tracking-wide text-slate-500";

/* --- chips --- */
export const chip = "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full border whitespace-nowrap";

const ESTADO_CHIP = {
    "En espera": "bg-slate-100 text-slate-600 border-slate-200",
    "En proceso": "bg-blue-50 text-blue-700 border-blue-200",
    "Pendiente por información": "bg-amber-50 text-amber-700 border-amber-200",
    "Pendiente por herramientas": "bg-amber-50 text-amber-700 border-amber-200",
    "Pendiente por Personal": "bg-amber-50 text-amber-700 border-amber-200",
    "Pendiente por equipo": "bg-amber-50 text-amber-700 border-amber-200",
    "Terminado": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Reportado cliente": "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Entregado al cliente": "bg-emerald-600 text-white border-emerald-600",
    "Entregado a recibo": "bg-emerald-600 text-white border-emerald-600"
};

export const chipEstado = (e) => ESTADO_CHIP[e] || "bg-slate-100 text-slate-500 border-slate-200";

export const chipSolicitud = (e) =>
    e === "Gestionado"
        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
        : "bg-orange-50 text-orange-700 border-orange-200";

export const chipPrioridad = (p) => {
    if (p === "P0") return "bg-red-600 text-white border-red-600";
    if (p === "P01" || p === "P02") return "bg-red-50 text-red-700 border-red-200";
    if (p === "P03" || p === "P1") return "bg-amber-50 text-amber-700 border-amber-200";
    if (p === "P2" || p === "P3") return "bg-sky-50 text-sky-700 border-sky-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
};

/* Plazo: el color reserva el rojo para lo que de verdad esta vencido. */
export const chipPlazo = (estado) => ({
    'dentro': "bg-emerald-50 text-emerald-700 border-emerald-200",
    'limite': "bg-amber-50 text-amber-700 border-amber-200",
    'fuera': "bg-red-50 text-red-700 border-red-200",
    'cerrado-dentro': "bg-slate-100 text-slate-500 border-slate-200",
    'cerrado-fuera': "bg-slate-100 text-slate-500 border-slate-200"
}[estado] || "bg-slate-100 text-slate-500 border-slate-200");

/* --- tinta de los tiles --- */
export const TINTA = {
    total: '#0f172a',
    pendiente: '#2563eb',
    proceso: '#0891b2',
    entregada: '#059669',
    vencida: '#b91c1c',
    horas: '#0f172a'
};

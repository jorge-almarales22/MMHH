/**
 * Tokens de interfaz compartidos.
 * Un solo lugar define superficies, campos y etiquetas para que los tres modulos
 * (Cliente / Coordinador / Base de Datos) se lean como un mismo producto.
 */

export const card = "bg-white border border-slate-200 rounded-xl shadow-sm";
export const cardElevated = "bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5";

export const sectionTitle = "text-[11px] font-semibold text-slate-500 uppercase tracking-[0.14em]";
export const label = "block text-[11px] font-semibold text-slate-600 mb-1.5";
export const labelSm = "block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1";

export const input =
    "block w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 " +
    "px-3 py-2.5 text-sm outline-none transition-shadow " +
    "focus:border-cerrejon-orange focus:ring-4 focus:ring-cerrejon-orange/15 " +
    "disabled:bg-slate-100 disabled:text-slate-500";

export const inputSm =
    "block w-full rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 " +
    "px-2.5 py-2 text-[13px] outline-none transition-shadow " +
    "focus:border-cerrejon-orange focus:ring-4 focus:ring-cerrejon-orange/15";

export const filterInput =
    "rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[13px] text-slate-800 outline-none " +
    "transition-shadow focus:border-cerrejon-orange focus:ring-4 focus:ring-cerrejon-orange/15";

export const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-cerrejon-orange px-5 py-2.5 text-sm font-semibold " +
    "text-white shadow-sm transition-colors hover:bg-cerrejon-orangeDark focus:outline-none " +
    "focus:ring-4 focus:ring-cerrejon-orange/25 disabled:opacity-55 disabled:cursor-not-allowed";

export const btnSecondary =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 " +
    "text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none " +
    "focus:ring-4 focus:ring-slate-200";

export const btnGhostSm =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 " +
    "transition-colors hover:bg-slate-100 hover:text-slate-900";

export const th = "px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500";
export const td = "px-4 py-3 text-[13px] text-slate-700 align-middle";

export const pill = "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap";

/** Color semantico por estado del componente. */
const ESTADO_TONO = {
    "En espera": "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
    "En proceso": "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    "Pendiente por información": "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    "Pendiente por herramientas": "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    "Pendiente por Personal": "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    "Pendiente por equipo": "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    "Terminado": "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    "Reportado cliente": "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
    "Entregado al cliente": "bg-emerald-600 text-white ring-1 ring-inset ring-emerald-600",
    "Entregado a recibo": "bg-emerald-600 text-white ring-1 ring-inset ring-emerald-600"
};

export const estadoTono = (estado) =>
    ESTADO_TONO[estado] || "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200";

/** Estado de la solicitud (controlado por el sistema). */
export const estadoSolicitudTono = (estado) =>
    estado === "Gestionado"
        ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
        : "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";

/** P0 y P01 son criticas; el degradado baja hasta gris para prioridades largas. */
export const prioridadTono = (p) => {
    if (p === "P0") return "bg-red-600 text-white ring-1 ring-inset ring-red-600";
    if (p === "P01" || p === "P02") return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    if (p === "P03" || p === "P1") return "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200";
    if (p === "P2" || p === "P3") return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";
    return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
};

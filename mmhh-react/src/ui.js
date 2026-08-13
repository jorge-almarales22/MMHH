/**
 * Tokens de interfaz.
 *
 * Direccion: taller de maquinas y herramientas. El cromo se pinta con azul de
 * trazado, los rotulos se graban en condensada como los diales de las maquinas y
 * todo numero se compone en mono. Nada de sombras difusas ni degradados: las
 * superficies se separan con filo de 1px, como piezas mecanizadas.
 */

/* --- superficies --- */
export const placa = "bg-white border border-iron-200";
export const placaSuave = "bg-iron-50 border border-iron-200";

/* --- rotulos --- */
export const dial = "dial text-[11px] text-iron-500";
export const dialClaro = "dial text-[11px] text-scribe";
export const rotulo = "block text-[11px] font-medium text-iron-600 mb-1.5";
export const rotuloMini = "dial block text-[10px] text-iron-500 mb-1";

/* --- campos --- */
const campoBase =
    "block w-full rounded-[3px] border bg-white text-iron-900 placeholder:text-iron-400 " +
    "outline-none transition-colors border-iron-300 " +
    "hover:border-iron-400 focus:border-brand focus:ring-2 focus:ring-brand/20 " +
    "disabled:bg-iron-100 disabled:text-iron-400";

export const campo = `${campoBase} px-3 py-2.5 text-[14px]`;
export const campoMini = `${campoBase} px-2.5 py-2 text-[13px]`;
export const campoFiltro = `${campoBase} px-2.5 py-[7px] text-[13px]`;

/* --- botones --- */
export const btn =
    "inline-flex items-center justify-center gap-2 rounded-[3px] bg-brand px-5 py-2.5 text-[13px] " +
    "font-semibold text-white transition-colors hover:bg-brand-deep " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

export const btnLinea =
    "inline-flex items-center justify-center gap-2 rounded-[3px] border border-iron-300 bg-white px-4 py-2.5 " +
    "text-[13px] font-semibold text-iron-700 transition-colors hover:border-iron-400 hover:bg-iron-50";

export const btnMini =
    "inline-flex items-center gap-1.5 rounded-[3px] border border-iron-300 bg-white px-2.5 py-1.5 " +
    "text-[12px] font-semibold text-iron-700 transition-colors hover:border-iron-400 hover:bg-iron-50";

export const btnTexto =
    "inline-flex items-center gap-1.5 text-[12px] font-medium text-iron-500 underline-offset-4 " +
    "transition-colors hover:text-iron-900 hover:underline";

/* --- tabla --- */
export const th = "dial px-3 py-2.5 text-left text-[10px] text-iron-500 whitespace-nowrap";
export const td = "px-3 py-3 text-[13px] text-iron-700 align-middle";

/* --- marcas de estado ---
   Placa grabada: filo de 1px y fondo plano. Sin pildoras redondeadas. */
export const marca = "inline-flex items-center rounded-[2px] px-2 py-[3px] text-[11px] font-medium whitespace-nowrap border";

const ESTADO_MARCA = {
    "En espera": "border-iron-300 bg-iron-100 text-iron-600",
    "En proceso": "border-dye-line/35 bg-dye/[0.07] text-dye-mid",
    "Pendiente por información": "border-brand/40 bg-brand-wash text-brand-deep",
    "Pendiente por herramientas": "border-brand/40 bg-brand-wash text-brand-deep",
    "Pendiente por Personal": "border-brand/40 bg-brand-wash text-brand-deep",
    "Pendiente por equipo": "border-brand/40 bg-brand-wash text-brand-deep",
    "Terminado": "border-spec/40 bg-spec-wash text-spec",
    "Reportado cliente": "border-dye-line/35 bg-dye/[0.07] text-dye-mid",
    "Entregado al cliente": "border-spec bg-spec text-white",
    "Entregado a recibo": "border-spec bg-spec text-white"
};

export const marcaEstado = (e) => ESTADO_MARCA[e] || "border-iron-300 bg-iron-100 text-iron-500";

/* Sobre azul de trazado las marcas claras se apagan: allí se usa la variante en
   negativo, con un punto que conserva la semántica del color. */
export const marcaOscura = "border-white/25 bg-white/10 text-white gap-1.5";

export const puntoEstado = (e) => {
    if (["Entregado al cliente", "Entregado a recibo", "Terminado"].includes(e)) return "bg-spec";
    if (String(e).startsWith("Pendiente")) return "bg-brand";
    if (e === "En proceso" || e === "Reportado cliente") return "bg-scribe";
    return "bg-iron-300";
};

export const marcaSolicitud = (e) =>
    e === "Gestionado"
        ? "border-dye-line/40 bg-dye/[0.07] text-dye-mid"
        : "border-brand/45 bg-brand-wash text-brand-deep";

/* Prioridad: escala de severidad, no diez colores distintos. */
export const marcaPrioridad = (p) => {
    if (p === "P0") return "border-alarm bg-alarm text-white";
    if (p === "P01" || p === "P02") return "border-alarm/45 bg-alarm-wash text-alarm";
    if (p === "P03" || p === "P1") return "border-brand/45 bg-brand-wash text-brand-deep";
    return "border-iron-300 bg-iron-100 text-iron-600";
};

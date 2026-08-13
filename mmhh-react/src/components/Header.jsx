import React from 'react';

/**
 * Encabezado. La tesis no es "cuántas solicitudes hay" sino "cuánto del taller
 * está fuera de plazo": la banda reparte la cola abierta entre dentro, al límite
 * y fuera de tolerancia, con la misma gramática visual que la escala de las filas.
 */
export default function Header({ userAuth, banda }) {
    const iniciales = (userAuth.name || "")
        .split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "··";

    const abiertas = banda.dentro + banda.limite + banda.fuera;
    const pct = (n) => (abiertas ? (n / abiertas) * 100 : 0);

    const segmentos = [
        { n: banda.dentro, color: 'bg-spec', texto: 'text-spec', etiqueta: 'En tolerancia' },
        { n: banda.limite, color: 'bg-brand', texto: 'text-brand', etiqueta: 'Al límite' },
        { n: banda.fuera, color: 'bg-alarm', texto: 'text-alarm', etiqueta: 'Fuera' }
    ];

    return (
        <header className="border border-dye-deep bg-dye text-white">
            <div className="flex flex-col gap-6 px-5 py-5 lg:flex-row lg:items-center lg:gap-10 lg:px-7">

                {/* Identidad */}
                <div className="flex items-center gap-3.5">
                    <Marca />
                    <div className="leading-none">
                        <h1 className="dial text-[17px] tracking-plate text-white">
                            Cerrejón <span className="text-scribe">MMHH</span>
                        </h1>
                        <p className="mt-1.5 text-[11px] text-white/45">
                            Máquinas y Herramientas · Coordinación de taller
                        </p>
                    </div>
                </div>

                {/* Banda de tolerancia de la cola abierta */}
                <div className="min-w-0 flex-1 lg:max-w-2xl">
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                        <span className="dial text-[10px] text-white/45">Cola abierta · plazo</span>
                        <span className="num text-[11px] text-white/45">
                            {abiertas} en taller · {banda.cerradas} cerradas
                        </span>
                    </div>

                    <div className="flex h-2 w-full overflow-hidden rounded-[1px] bg-white/10">
                        {abiertas === 0
                            ? <div className="w-full bg-white/10" />
                            : segmentos.map((s, i) => s.n > 0 && (
                                <div
                                    key={i}
                                    className={`${s.color} origin-left animate-sweep`}
                                    style={{ width: `${pct(s.n)}%`, animationDelay: `${i * 70}ms` }}
                                    title={`${s.etiqueta}: ${s.n}`}
                                />
                            ))}
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
                        {segmentos.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-[1px] ${s.color}`} />
                                <span className="num text-[12px] font-medium text-white">{s.n}</span>
                                <span className="text-[11px] text-white/45">{s.etiqueta}</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Usuario */}
                <div className="flex items-center gap-3 lg:ml-auto">
                    <div className="text-right leading-tight">
                        <p className="text-[13px] font-medium text-white">{userAuth.name}</p>
                        <p className="dial mt-0.5 text-[9px] text-white/40">
                            {userAuth.isCoordinator ? "Coordinador" : "Cliente"}
                        </p>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[3px] border text-[12px] font-semibold ${userAuth.isCoordinator
                        ? 'border-scribe/40 bg-scribe/15 text-scribe'
                        : 'border-white/15 bg-white/5 text-white/70'}`}>
                        {iniciales}
                    </div>
                </div>
            </div>
        </header>
    );
}

/* Marca: una linea rayada sobre azul de trazado, que es literalmente como se
   marca una pieza antes de mecanizarla. */
function Marca() {
    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-scribe/25 bg-dye-deep">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path d="M3 15.5 L19 4" stroke="#93C6D4" strokeWidth="1.5" strokeLinecap="square" />
                <path d="M3 19 L19 7.5" stroke="#C77953" strokeWidth="1.5" strokeLinecap="square" />
                <path d="M6.5 3v5M4 5.5h5" stroke="#93C6D4" strokeWidth="1.2" strokeLinecap="square" opacity=".55" />
            </svg>
        </div>
    );
}

import React from 'react';

export default function Header({ userAuth, resumen }) {
    const iniciales = (userAuth.name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0])
        .join("")
        .toUpperCase() || "··";

    return (
        <header className="rounded-xl border border-slate-200 bg-cerrejon-dark shadow-lg shadow-slate-900/10 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-cerrejon-gold via-cerrejon-orange to-cerrejon-orangeDark" />

            <div className="flex flex-col gap-6 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/15">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M4 19V7.5a1 1 0 01.55-.9l6-3a1 1 0 01.9 0l6 3a1 1 0 01.55.9V19" stroke="#E2B53C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 19h18M9 19v-4.5h4V19" stroke="#C77953" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-white">
                            Cerrejón <span className="font-normal text-slate-400">SGIA</span>
                        </h1>
                        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                            Gestión de Requerimientos de MMHH
                        </p>
                    </div>
                </div>

                {resumen && (
                    <div className="flex items-stretch gap-6 border-y border-white/10 py-4 lg:border-y-0 lg:py-0">
                        <Metrica valor={resumen.total} etiqueta="Solicitudes" />
                        <Divisor />
                        <Metrica valor={resumen.pendientes} etiqueta="Pendientes" acento="text-cerrejon-gold" />
                        <Divisor />
                        <Metrica valor={resumen.enProceso} etiqueta="En gestión" acento="text-sky-300" />
                        <Divisor />
                        <Metrica valor={resumen.entregadas} etiqueta="Entregadas" acento="text-emerald-300" />
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[13px] font-semibold leading-tight text-white">{userAuth.name}</p>
                        <p className="text-[11px] leading-tight text-slate-400">{userAuth.email || "Sin correo"}</p>
                    </div>
                    <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/15">
                            {iniciales}
                        </div>
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-cerrejon-dark ${userAuth.isCoordinator ? 'bg-emerald-400' : 'bg-slate-400'}`}
                            title={userAuth.isCoordinator ? "Coordinador" : "Cliente"}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}

const Divisor = () => <div className="w-px self-stretch bg-white/10" />;

function Metrica({ valor, etiqueta, acento = "text-white" }) {
    return (
        <div className="min-w-[4.5rem]">
            <div className={`tabular text-xl font-semibold leading-none ${acento}`}>{valor}</div>
            <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">{etiqueta}</div>
        </div>
    );
}

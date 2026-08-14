import React from 'react';

const Avatar = ({ nombre, size = 'w-8 h-8' }) => {
    const iniciales = (nombre || '')
        .split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '··';
    return (
        <span className={`${size} rounded-full bg-slate-700 text-white grid place-items-center text-[11px] font-bold shrink-0`}>
            {iniciales}
        </span>
    );
};

const Navbar = ({ usuario, vista, onVista, tabs, modoDemo }) => (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-yellow-400 text-slate-900 grid place-items-center font-black shrink-0">
                        MH
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-bold leading-tight truncate text-sm sm:text-base">
                            Máquinas y Herramientas
                        </h1>
                        <p className="text-[11px] text-white/50 leading-tight truncate">
                            Cerrejón SGIA · Gestión de requerimientos
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                        <Avatar nombre={usuario.name} />
                        <div className="leading-tight">
                            <p className="text-xs font-semibold">{usuario.name}</p>
                            <p className="text-[10px] text-white/50">
                                {usuario.isCoordinator ? 'Coordinador' : 'Cliente'}
                            </p>
                        </div>
                    </div>
                    <Avatar nombre={usuario.name} size="w-8 h-8 sm:hidden" />
                </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => onVista(t.id)}
                        className={`px-3 sm:px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
                            vista === t.id
                                ? 'border-yellow-400 text-yellow-400'
                                : 'border-transparent text-white/60 hover:text-white'
                        }`}
                    >
                        <span className="hidden sm:inline">{t.label}</span>
                        <span className="sm:hidden">{t.corto}</span>
                    </button>
                ))}
            </nav>
        </div>

        {modoDemo && (
            <div className="bg-amber-500/90 text-slate-900 text-[11px] text-center py-1 px-3 font-semibold">
                Modo de pruebas: sin sesión de SharePoint. Los datos no se están guardando.
            </div>
        )}
    </header>
);

export default Navbar;

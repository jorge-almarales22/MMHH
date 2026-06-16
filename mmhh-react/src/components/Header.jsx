import React from 'react';

export default function Header({ userAuth }) {
    return (
        <header className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cerrejon-gold via-cerrejon-orange to-red-600"></div>
            <div className="flex items-center gap-5 z-10">
                <div className="p-3 bg-white/80 rounded-xl shadow-sm backdrop-blur-sm">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="#1a202c" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 7V17M7 12H17" stroke="#C77953" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Cerrej&oacute;n <span className="text-cerrejon-orange font-light">SGIA</span></h1>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em] mt-1">Gesti&oacute;n de Requerimientos de MMHH</p>
                </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-950/10 p-3 rounded-xl border border-white/20 z-10">
                <div className="text-right">
                    <p className="text-xs font-black text-gray-900">{userAuth.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{userAuth.email || "Sin correo"}</p>
                </div>
                <div className="flex flex-col items-center">
                    {userAuth.isCoordinator ? (
                        <span className="bg-green-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider">Coordinador</span>
                    ) : (
                        <span className="bg-gray-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider">Cliente</span>
                    )}
                </div>
            </div>
        </header>
    );
}

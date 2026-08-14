import React, { useRef } from 'react';
import { FLOTAS, SOPORTE_OPCIONES, PRIORIDADES, SUPERINTENDENCIAS, COORDINADORES_LISTA, AREAS_ENTREGA } from '../constants';
import { inputCls, selectCls, btnPrimario, btnSecundario } from '../ui';

/** Bloque numerado: da al formulario un orden de lectura evidente. */
const Seccion = ({ numero, titulo, descripcion, children }) => (
    <section className="px-4 sm:px-6 py-5 border-b border-slate-100 last:border-b-0">
        <div className="flex gap-3 sm:gap-4">
            <span className="hidden sm:grid shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold place-items-center mt-0.5">
                {numero}
            </span>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm">
                    <span className="sm:hidden text-slate-400">{numero}. </span>{titulo}
                </h3>
                {descripcion && <p className="text-xs text-slate-500 mt-0.5 mb-4">{descripcion}</p>}
                <div className={descripcion ? '' : 'mt-4'}>{children}</div>
            </div>
        </div>
    </section>
);

const Campo = ({ label, requerido, ayuda, children }) => (
    <label className="block">
        <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label} {requerido && <span className="text-red-500">*</span>}
        </span>
        {children}
        {ayuda && <span className="block text-[11px] text-slate-400 mt-1">{ayuda}</span>}
    </label>
);

export default function TabCliente({ formData, setFormData, evidenceFiles, loading, error, onFileChange, onSubmit, onLimpiar }) {
    const fileInputRef = useRef(null);

    const set = (campo, valor) => {
        setFormData(prev => {
            const u = { ...prev, [campo]: valor };
            if (campo === "Soporte") { u.TipoRequerimiento = []; u.TipoRequerimientoCustom = {}; u.SoporteCustom = ""; }
            if (campo === "Flota" && valor !== "Otra") u.FlotaCustom = "";
            if (campo === "CoordinadorRecibe" && valor !== "Otro") u.CoordinadorRecibeCustom = "";
            if (campo === "AreaEntrega" && valor !== "Otra") u.AreaEntregaCustom = "";
            return u;
        });
    };

    const handleChange = (e) => set(e.target.name, e.target.value);

    const toggleTipo = (req) => {
        let lista = [...formData.TipoRequerimiento];
        let custom = { ...formData.TipoRequerimientoCustom };
        if (lista.includes(req)) { lista = lista.filter(r => r !== req); delete custom[req]; }
        else { lista.push(req); if (req === "Otro") custom[req] = ""; }
        setFormData({ ...formData, TipoRequerimiento: lista, TipoRequerimientoCustom: custom });
    };

    const otValida = formData.OT.length === 8;
    const plazo = PRIORIDADES[formData.Prioridad];

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Nueva solicitud a Máquinas y Herramientas</h2>
            <p className="text-sm text-slate-500 mt-1">
                Registra la pieza y el trabajo que necesita. El taller la recibe con la prioridad que indiques.
            </p>

            <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-4 overflow-hidden">
                <div className="bg-blue-50 px-4 sm:px-6 py-3 flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" aria-hidden="true" />
                    <p>
                        Al guardar, la solicitud recibe un <strong>número consecutivo</strong> y queda en estado{' '}
                        <strong>Pendiente</strong> hasta que un coordinador la gestione.
                    </p>
                </div>

                <Seccion numero={1} titulo="Orden de trabajo" descripcion="Identifica la pieza dentro del sistema de mantenimiento.">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Campo label="OT" requerido ayuda={formData.OT && !otValida ? `Van ${formData.OT.length} de 8 caracteres` : 'Ocho caracteres'}>
                            <input
                                type="text" name="OT" maxLength={8} value={formData.OT} onChange={handleChange}
                                className={`${inputCls} uppercase ${formData.OT && !otValida ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                                placeholder="A0104599" required
                            />
                        </Campo>
                        <Campo label="Flota" requerido>
                            <select name="Flota" value={formData.Flota} onChange={handleChange} className={selectCls} required>
                                {FLOTAS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            {formData.Flota === "Otra" && (
                                <input type="text" name="FlotaCustom" value={formData.FlotaCustom} onChange={handleChange} className={`${inputCls} mt-2`} placeholder="¿Cuál flota?" required />
                            )}
                        </Campo>
                        <Campo label="Cantidad" requerido>
                            <input
                                type="number" name="Cantidad" min="1" step="1" value={formData.Cantidad}
                                onChange={(e) => set('Cantidad', parseInt(e.target.value) || 1)}
                                className={inputCls} required
                            />
                        </Campo>
                    </div>
                </Seccion>

                <Seccion numero={2} titulo="Trabajo requerido" descripcion="Elige la categoría y marca todo lo que aplique.">
                    <div className="space-y-4">
                        <div className="sm:max-w-xs">
                            <Campo label="Soporte" requerido>
                                <select name="Soporte" value={formData.Soporte} onChange={handleChange} className={selectCls} required>
                                    <option value="">Selecciona una categoría...</option>
                                    {Object.keys(SOPORTE_OPCIONES).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Campo>
                            {formData.Soporte === "Otro" && (
                                <input type="text" name="SoporteCustom" value={formData.SoporteCustom} onChange={handleChange} className={`${inputCls} mt-2`} placeholder="¿Qué soporte necesitas?" required />
                            )}
                        </div>

                        <div>
                            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Tipo de requerimiento <span className="text-red-500">*</span>
                                {formData.TipoRequerimiento.length > 0 && (
                                    <span className="ml-2 font-normal text-slate-400">
                                        {formData.TipoRequerimiento.length} marcado{formData.TipoRequerimiento.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </span>

                            {!formData.Soporte ? (
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
                                    <p className="text-xs text-slate-500">
                                        Elige primero una categoría de soporte y aquí aparecerán los trabajos disponibles.
                                    </p>
                                </div>
                            ) : formData.Soporte === "Otro" ? (
                                <input
                                    type="text" value={formData.TipoRequerimiento[0] || ""}
                                    onChange={(e) => setFormData({ ...formData, TipoRequerimiento: e.target.value ? [e.target.value] : [] })}
                                    className={inputCls} placeholder="Describe el trabajo requerido" required
                                />
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                                        {SOPORTE_OPCIONES[formData.Soporte].map(req => {
                                            const on = formData.TipoRequerimiento.includes(req);
                                            return (
                                                <label
                                                    key={req}
                                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition ${on
                                                        ? 'border-yellow-400 bg-yellow-50 font-semibold text-slate-900'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                                                >
                                                    <input type="checkbox" checked={on} onChange={() => toggleTipo(req)} className="w-4 h-4 shrink-0 accent-yellow-500" />
                                                    <span className="leading-tight">{req}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {formData.TipoRequerimiento.includes("Otro") && (
                                        <input
                                            type="text" value={formData.TipoRequerimientoCustom["Otro"] || ""}
                                            onChange={(e) => setFormData(p => ({ ...p, TipoRequerimientoCustom: { ...p.TipoRequerimientoCustom, Otro: e.target.value } }))}
                                            className={inputCls} placeholder="¿Qué otro trabajo necesitas?" required
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Seccion>

                <Seccion numero={3} titulo="La pieza" descripcion="Datos que permiten identificarla al recibirla.">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                            <Campo label="Componente" requerido>
                                <input type="text" name="NombreComponente" value={formData.NombreComponente} onChange={handleChange} className={inputCls} placeholder="Ej. Cigüeñal de motor 3516" required />
                            </Campo>
                        </div>
                        <Campo label="Part number" requerido>
                            <input type="text" name="PN" value={formData.PN} onChange={handleChange} className={inputCls} placeholder="104-599" required />
                        </Campo>
                        <Campo label="Stock code">
                            <input type="number" name="SC" value={formData.SC} onChange={handleChange} className={inputCls} placeholder="12" />
                        </Campo>
                        <div className="sm:col-span-4">
                            <Campo label="Qué hay que hacerle" requerido>
                                <textarea
                                    name="DetalleRequerimiento" value={formData.DetalleRequerimiento} onChange={handleChange}
                                    rows="4" className={`${inputCls} resize-y`}
                                    placeholder="Síntoma observado, alcance esperado y cualquier condición especial de manejo."
                                    required
                                />
                            </Campo>
                        </div>
                    </div>
                </Seccion>

                <Seccion numero={4} titulo="Prioridad" descripcion="Fija los días de que dispone el taller. Contra ese número se mide el cumplimiento.">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                        <Campo label="Prioridad" requerido>
                            <select name="Prioridad" value={formData.Prioridad} onChange={handleChange} className={selectCls} required>
                                {Object.keys(PRIORIDADES).map(p => (
                                    <option key={p} value={p}>{p} — {PRIORIDADES[p]} {PRIORIDADES[p] === 1 ? "día" : "días"}</option>
                                ))}
                            </select>
                        </Campo>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
                            <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{plazo}</span>
                            <div>
                                <p className="text-xs font-bold text-slate-700 uppercase">
                                    {plazo === 1 ? "día calendario" : "días calendario"}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {plazo === 0
                                        ? "Atención inmediata: cualquier día de espera ya es incumplimiento."
                                        : "Plazo para entregar desde el ingreso de la pieza."}
                                </p>
                            </div>
                        </div>
                    </div>
                </Seccion>

                <Seccion numero={5} titulo="Quién solicita" descripcion="A quién buscar si el taller necesita aclarar algo.">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Campo label="Nombre" requerido>
                            <input type="text" name="NombreContacto" value={formData.NombreContacto} onChange={handleChange} className={inputCls} placeholder="Ej. Juan Pérez" required />
                        </Campo>
                        <Campo label="Celular" requerido>
                            <input type="number" name="Celular" value={formData.Celular} onChange={handleChange} className={inputCls} placeholder="3101234567" required />
                        </Campo>
                        <Campo label="Superintendencia" requerido>
                            <select name="Superintendencia" value={formData.Superintendencia || ""} onChange={handleChange} className={selectCls} required>
                                {SUPERINTENDENCIAS.map(s => <option key={s} value={s}>{s || "Selecciona una..."}</option>)}
                            </select>
                        </Campo>
                    </div>
                </Seccion>

                <Seccion numero={6} titulo="Entrega y soportes" descripcion="Dónde queda la pieza y con qué evidencia llega.">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Campo label="Coordinador que recibe" requerido>
                            <select name="CoordinadorRecibe" value={formData.CoordinadorRecibe} onChange={handleChange} className={selectCls} required>
                                {COORDINADORES_LISTA.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {formData.CoordinadorRecibe === "Otro" && (
                                <input type="text" name="CoordinadorRecibeCustom" value={formData.CoordinadorRecibeCustom} onChange={handleChange} className={`${inputCls} mt-2`} placeholder="¿Quién recibe?" required />
                            )}
                        </Campo>
                        <Campo label="Área de entrega" requerido>
                            <select name="AreaEntrega" value={formData.AreaEntrega} onChange={handleChange} className={selectCls} required>
                                {AREAS_ENTREGA.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                            {formData.AreaEntrega === "Otra" && (
                                <input type="text" name="AreaEntregaCustom" value={formData.AreaEntregaCustom} onChange={handleChange} className={`${inputCls} mt-2`} placeholder="¿Cuál área?" required />
                            )}
                        </Campo>
                        <div className="sm:col-span-2">
                            <Campo label="Fotos de la pieza" ayuda="Opcional. Ayudan al taller a evaluar antes de recibir la pieza.">
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                                    <input
                                        type="file" accept="image/*" multiple onChange={onFileChange} ref={fileInputRef}
                                        className="block w-full text-sm text-slate-600 cursor-pointer file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                                    />
                                    {evidenceFiles.length > 0 && (
                                        <p className="text-xs font-semibold text-emerald-700 mt-2">
                                            {evidenceFiles.length} {evidenceFiles.length > 1 ? 'fotos listas' : 'foto lista'} para adjuntar.
                                        </p>
                                    )}
                                </div>
                            </Campo>
                        </div>
                    </div>
                </Seccion>

                {error && (
                    <div className="mx-4 sm:mx-6 mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                        <span aria-hidden="true">⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <button type="button" onClick={onLimpiar} className={btnSecundario}>Limpiar</button>
                    <button type="submit" disabled={loading} className={btnPrimario}>
                        {loading && <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />}
                        {loading ? 'Guardando...' : 'Guardar solicitud'}
                    </button>
                </div>
            </form>
        </div>
    );
}

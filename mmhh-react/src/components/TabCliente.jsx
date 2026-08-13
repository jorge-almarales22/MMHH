import React, { useRef } from 'react';
import { FLOTAS, SOPORTE_OPCIONES, PRIORIDADES, SUPERINTENDENCIAS, COORDINADORES_LISTA, AREAS_ENTREGA } from '../constants';
import { card, input, label, btnPrimary, sectionTitle } from '../ui';

function Seccion({ paso, titulo, descripcion, children }) {
    return (
        <section className="border-t border-slate-200 pt-7 first:border-t-0 first:pt-0">
            <div className="mb-5 flex items-baseline gap-3">
                <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cerrejon-orangeSoft text-[11px] font-bold text-cerrejon-orangeDark">
                    {paso}
                </span>
                <div>
                    <h3 className="text-sm font-semibold tracking-tight text-slate-900">{titulo}</h3>
                    {descripcion && <p className="mt-0.5 text-xs text-slate-500">{descripcion}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

export default function TabCliente({ formData, setFormData, evidenceFiles, loading, onFileChange, onSubmit }) {
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === "Soporte") {
                updated.TipoRequerimiento = [];
                updated.TipoRequerimientoCustom = {};
                updated.SoporteCustom = "";
            }
            if (name === "Flota" && value !== "Otra") updated.FlotaCustom = "";
            if (name === "CoordinadorRecibe" && value !== "Otro") updated.CoordinadorRecibeCustom = "";
            if (name === "AreaEntrega" && value !== "Otra") updated.AreaEntregaCustom = "";
            return updated;
        });
    };

    const handleTipoRequerimientoToggle = (req) => {
        let updated = [...formData.TipoRequerimiento];
        let updatedCustom = { ...formData.TipoRequerimientoCustom };
        if (updated.includes(req)) {
            updated = updated.filter(r => r !== req);
            delete updatedCustom[req];
        } else {
            updated.push(req);
            if (req === "Otro") updatedCustom[req] = "";
        }
        setFormData({ ...formData, TipoRequerimiento: updated, TipoRequerimientoCustom: updatedCustom });
    };

    const handleTipoReqCustomChange = (req, value) => {
        setFormData(prev => ({
            ...prev,
            TipoRequerimientoCustom: { ...prev.TipoRequerimientoCustom, [req]: value }
        }));
    };

    const otValida = formData.OT.length === 8;

    return (
        <div className={`${card} w-full`}>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 px-8 py-6">
                <div>
                    <span className={sectionTitle}>Módulo Cliente</span>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Nuevo requerimiento de mantenimiento</h2>
                </div>
                <p className="text-xs text-slate-500">
                    Los campos marcados con <span className="font-semibold text-cerrejon-orange">*</span> son obligatorios
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-7 px-8 py-7">

                <Seccion paso="1" titulo="Identificación del trabajo" descripcion="Orden de trabajo, flota y cantidad de piezas.">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <label className={label}>OT <span className="text-cerrejon-orange">*</span></label>
                            <input
                                type="text" name="OT" maxLength={8} value={formData.OT} onChange={handleChange}
                                className={`${input} tabular uppercase ${formData.OT && !otValida ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                                placeholder="A0104599" required
                            />
                            <p className={`mt-1.5 text-[11px] font-medium ${formData.OT && !otValida ? 'text-red-600' : 'text-slate-400'}`}>
                                {formData.OT && !otValida ? `Debe tener exactamente 8 caracteres (${formData.OT.length}/8)` : 'Exactamente 8 caracteres'}
                            </p>
                        </div>
                        <div>
                            <label className={label}>Flota <span className="text-cerrejon-orange">*</span></label>
                            <select name="Flota" value={formData.Flota} onChange={handleChange} className={input} required>
                                {FLOTAS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            {formData.Flota === "Otra" && (
                                <input type="text" name="FlotaCustom" value={formData.FlotaCustom} onChange={handleChange} className={`${input} mt-2`} placeholder="Especifique la flota..." required />
                            )}
                        </div>
                        <div>
                            <label className={label}>Cantidad <span className="text-cerrejon-orange">*</span></label>
                            <input type="number" name="Cantidad" min="1" step="1" value={formData.Cantidad} onChange={(e) => setFormData({ ...formData, Cantidad: parseInt(e.target.value) || 1 })} className={`${input} tabular`} required />
                        </div>
                    </div>
                </Seccion>

                <Seccion paso="2" titulo="Tipo de soporte requerido" descripcion="Elija la categoría y marque todos los requerimientos que apliquen.">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div>
                            <label className={label}>Soporte (categoría principal) <span className="text-cerrejon-orange">*</span></label>
                            <select name="Soporte" value={formData.Soporte} onChange={handleChange} className={input} required>
                                <option value="">Seleccione soporte</option>
                                {Object.keys(SOPORTE_OPCIONES).map(soporte => (
                                    <option key={soporte} value={soporte}>{soporte}</option>
                                ))}
                            </select>
                            {formData.Soporte === "Otro" && (
                                <input type="text" name="SoporteCustom" value={formData.SoporteCustom} onChange={handleChange} className={`${input} mt-2`} placeholder="Especifique el soporte..." required />
                            )}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className={`${label} mb-0`}>Tipo de requerimiento (selección múltiple)</label>
                                {formData.TipoRequerimiento.length > 0 && (
                                    <span className="rounded-full bg-cerrejon-orangeSoft px-2 py-0.5 text-[11px] font-semibold text-cerrejon-orangeDark">
                                        {formData.TipoRequerimiento.length} seleccionado{formData.TipoRequerimiento.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {!formData.Soporte ? (
                                <p className="mt-4 text-xs text-slate-500">
                                    Seleccione una categoría de soporte para cargar los tipos de requerimiento.
                                </p>
                            ) : formData.Soporte === "Otro" ? (
                                <input
                                    type="text" value={formData.TipoRequerimiento[0] || ""}
                                    onChange={(e) => setFormData({ ...formData, TipoRequerimiento: e.target.value ? [e.target.value] : [] })}
                                    className={`${input} mt-3`} placeholder="Especifique el tipo de requerimiento..." required
                                />
                            ) : (
                                <div className="mt-3 space-y-3">
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                        {SOPORTE_OPCIONES[formData.Soporte].map(req => {
                                            const activo = formData.TipoRequerimiento.includes(req);
                                            return (
                                                <label
                                                    key={req}
                                                    className={`flex cursor-pointer select-none items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] transition-colors ${activo
                                                        ? 'border-cerrejon-orange bg-cerrejon-orangeSoft font-semibold text-cerrejon-orangeDark'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                                                >
                                                    <input
                                                        type="checkbox" checked={activo}
                                                        onChange={() => handleTipoRequerimientoToggle(req)}
                                                        className="h-4 w-4 shrink-0 rounded accent-cerrejon-orange"
                                                    />
                                                    <span className="leading-tight">{req}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {formData.TipoRequerimiento.includes("Otro") && (
                                        <input type="text" value={formData.TipoRequerimientoCustom["Otro"] || ""} onChange={(e) => handleTipoReqCustomChange("Otro", e.target.value)} className={input} placeholder="Especifique el tipo de requerimiento..." required />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Seccion>

                <Seccion paso="3" titulo="Componente y contacto" descripcion="Datos de la pieza y de quien realiza la solicitud.">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <label className={label}>Nombre de componente / parte <span className="text-cerrejon-orange">*</span></label>
                            <input type="text" name="NombreComponente" value={formData.NombreComponente} onChange={handleChange} className={input} placeholder="Ej. Cigüeñal de motor" required />
                        </div>
                        <div>
                            <label className={label}>PN (part number) <span className="text-cerrejon-orange">*</span></label>
                            <input type="text" name="PN" value={formData.PN} onChange={handleChange} className={`${input} tabular`} placeholder="104-599" required />
                        </div>
                        <div>
                            <label className={label}>SC (stock code)</label>
                            <input type="number" name="SC" value={formData.SC} onChange={handleChange} className={`${input} tabular`} placeholder="12" />
                        </div>
                        <div className="md:col-span-2">
                            <label className={label}>Nombre de quien solicita <span className="text-cerrejon-orange">*</span></label>
                            <input type="text" name="NombreContacto" value={formData.NombreContacto} onChange={handleChange} className={input} placeholder="Ej. Juan Pérez" required />
                        </div>
                        <div>
                            <label className={label}>Celular <span className="text-cerrejon-orange">*</span></label>
                            <input type="number" name="Celular" value={formData.Celular} onChange={handleChange} className={`${input} tabular`} placeholder="3101234567" required />
                        </div>
                        <div>
                            <label className={label}>Superintendencia <span className="text-cerrejon-orange">*</span></label>
                            <select name="Superintendencia" value={formData.Superintendencia || ""} onChange={handleChange} className={input} required>
                                {SUPERINTENDENCIAS.map(s => <option key={s} value={s}>{s || "Seleccione superintendencia"}</option>)}
                            </select>
                        </div>
                    </div>
                </Seccion>

                <Seccion paso="4" titulo="Detalle y prioridad" descripcion="Describa el trabajo requerido y su nivel de urgencia.">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <label className={label}>Detalle del requerimiento <span className="text-cerrejon-orange">*</span></label>
                            <textarea name="DetalleRequerimiento" value={formData.DetalleRequerimiento} onChange={handleChange} rows="6" className={`${input} resize-none`} placeholder="Descripción detallada de la solicitud: síntoma, alcance esperado, condiciones especiales..." required></textarea>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                            <label className={label}>Prioridad <span className="text-cerrejon-orange">*</span></label>
                            <select name="Prioridad" value={formData.Prioridad} onChange={handleChange} className={input} required>
                                {Object.keys(PRIORIDADES).map(prio => (
                                    <option key={prio} value={prio}>{prio} — {PRIORIDADES[prio]} {PRIORIDADES[prio] === 1 ? "día" : "días"}</option>
                                ))}
                            </select>
                            <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-4 text-center">
                                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tiempo de solución</span>
                                <span className="tabular mt-1 block text-3xl font-semibold text-cerrejon-orange">
                                    {PRIORIDADES[formData.Prioridad]}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500">
                                    {PRIORIDADES[formData.Prioridad] === 1 ? "día calendario" : "días calendario"}
                                </span>
                            </div>
                        </div>
                    </div>
                </Seccion>

                <Seccion paso="5" titulo="Entrega y evidencias" descripcion="Quién recibe la pieza y soportes fotográficos opcionales.">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className={label}>Coordinador de MMHH que recibe <span className="text-cerrejon-orange">*</span></label>
                            <select name="CoordinadorRecibe" value={formData.CoordinadorRecibe} onChange={handleChange} className={input} required>
                                {COORDINADORES_LISTA.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {formData.CoordinadorRecibe === "Otro" && (
                                <input type="text" name="CoordinadorRecibeCustom" value={formData.CoordinadorRecibeCustom} onChange={handleChange} className={`${input} mt-2`} placeholder="Especifique el coordinador..." required />
                            )}
                        </div>
                        <div>
                            <label className={label}>Área de entrega <span className="text-cerrejon-orange">*</span></label>
                            <select name="AreaEntrega" value={formData.AreaEntrega} onChange={handleChange} className={input} required>
                                {AREAS_ENTREGA.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                            {formData.AreaEntrega === "Otra" && (
                                <input type="text" name="AreaEntregaCustom" value={formData.AreaEntregaCustom} onChange={handleChange} className={`${input} mt-2`} placeholder="Especifique el área..." required />
                            )}
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
                        <label className={label}>Documentos o evidencias fotográficas (opcional)</label>
                        <input
                            type="file" accept="image/*" multiple onChange={onFileChange} ref={fileInputRef}
                            className="block w-full cursor-pointer text-[13px] text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white hover:file:bg-slate-700"
                        />
                        {evidenceFiles.length > 0 && (
                            <p className="mt-2.5 text-[11px] font-medium text-emerald-700">
                                {evidenceFiles.length} archivo{evidenceFiles.length > 1 ? 's' : ''} listo{evidenceFiles.length > 1 ? 's' : ''} para adjuntar
                            </p>
                        )}
                    </div>
                </Seccion>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
                    <p className="text-xs text-slate-500">
                        Al guardar, el sistema asigna un número de solicitud y la deja en estado <strong className="font-semibold text-slate-700">Pendiente</strong>.
                    </p>
                    <button type="submit" disabled={loading} className={btnPrimary}>
                        {loading && (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                            </svg>
                        )}
                        {loading ? "Procesando..." : "Guardar requerimiento"}
                    </button>
                </div>
            </form>
        </div>
    );
}

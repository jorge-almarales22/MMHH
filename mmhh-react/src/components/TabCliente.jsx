import React, { useRef } from 'react';
import { FLOTAS, SOPORTE_OPCIONES, PRIORIDADES, SUPERINTENDENCIAS, COORDINADORES_LISTA, AREAS_ENTREGA } from '../constants';

const glassCard = "bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl";
const inputClass = "block w-full rounded-xl bg-white/60 border border-gray-300 focus:bg-white focus:border-cerrejon-orange focus:ring-2 focus:ring-cerrejon-orange/50 transition-all p-3 text-sm outline-none";
const labelClass = "block text-xs font-bold text-gray-700 mb-2 uppercase tracking-widest";

export default function TabCliente({ formData, setFormData, evidenceFiles, setEvidenceFiles, loading, error, onFileChange, onSubmit }) {
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

    return (
        <div className={`${glassCard} p-8 w-full`}>
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-6">Nuevo Requerimiento de Mantenimiento</h2>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 bg-gray-50/50 p-5 rounded-xl border border-gray-200/50">
                    <div>
                        <label className={labelClass}>OT (8 Caracteres)</label>
                        <input type="text" name="OT" maxLength={8} value={formData.OT} onChange={handleChange} className={inputClass} placeholder="Ej. A0104599" required />
                        {formData.OT && formData.OT.length !== 8 && (
                            <p className="text-[10px] text-red-500 mt-1 font-bold">Debe contener exactamente 8 caracteres ({formData.OT.length}/8)</p>
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>Flota</label>
                        <select name="Flota" value={formData.Flota} onChange={handleChange} className={inputClass} required>
                            {FLOTAS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        {formData.Flota === "Otra" && (
                            <input type="text" name="FlotaCustom" value={formData.FlotaCustom} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Especifique la flota..." required />
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>Cantidad</label>
                        <input type="number" name="Cantidad" min="1" step="1" value={formData.Cantidad} onChange={(e) => setFormData({ ...formData, Cantidad: parseInt(e.target.value) || 1 })} className={inputClass} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/40 p-5 rounded-xl border border-white/50">
                    <div>
                        <label className={labelClass}>Soporte (Categor&iacute;a Principal)</label>
                        <select name="Soporte" value={formData.Soporte} onChange={handleChange} className={inputClass} required>
                            <option value="">-- Seleccione Soporte --</option>
                            {Object.keys(SOPORTE_OPCIONES).map(soporte => (
                                <option key={soporte} value={soporte}>{soporte}</option>
                            ))}
                        </select>
                        {formData.Soporte === "Otro" && (
                            <input type="text" name="SoporteCustom" value={formData.SoporteCustom} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Especifique el soporte..." required />
                        )}
                    </div>
                    <div className="lg:col-span-2 bg-gray-50/60 p-4 rounded-xl border border-gray-200">
                        <label className={labelClass}>Tipo de Requerimiento (Selecci&oacute;n M&uacute;ltiple)</label>
                        {!formData.Soporte ? (
                            <p className="text-xs text-gray-500 italic mt-4">Seleccione una categor&iacute;a de Soporte para cargar los tipos de requerimiento.</p>
                        ) : formData.Soporte === "Otro" ? (
                            <input type="text" value={formData.TipoRequerimiento[0] || ""} onChange={(e) => setFormData({ ...formData, TipoRequerimiento: e.target.value ? [e.target.value] : [] })} className={`${inputClass} mt-3`} placeholder="Especifique el tipo de requerimiento..." required />
                        ) : (
                            <div className="space-y-3 mt-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {SOPORTE_OPCIONES[formData.Soporte].map(req => (
                                        <label key={req} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-cerrejon-orange transition-colors shadow-sm select-none">
                                            <input type="checkbox" checked={formData.TipoRequerimiento.includes(req)} onChange={() => handleTipoRequerimientoToggle(req)} className="w-4 h-4 accent-cerrejon-orange" />
                                            <span className="text-xs font-bold text-gray-700">{req}</span>
                                        </label>
                                    ))}
                                </div>
                                {formData.TipoRequerimiento.includes("Otro") && (
                                    <input type="text" value={formData.TipoRequerimientoCustom["Otro"] || ""} onChange={(e) => handleTipoReqCustomChange("Otro", e.target.value)} className={inputClass} placeholder="Especifique el tipo de requerimiento..." required />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 bg-white/40 p-5 rounded-xl border border-white/50">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nombre de Componente / Parte</label>
                        <input type="text" name="NombreComponente" value={formData.NombreComponente} onChange={handleChange} className={inputClass} placeholder="Ej. Cig&uuml;e&ntilde;al de Motor" required />
                    </div>
                    <div>
                        <label className={labelClass}>PN (Part Number)</label>
                        <input type="text" name="PN" value={formData.PN} onChange={handleChange} className={inputClass} placeholder="Ej. 104-599" required />
                    </div>
                    <div>
                        <label className={labelClass}>SC (StockCode)</label>
                        <input type="number" name="SC" value={formData.SC} onChange={handleChange} className={inputClass} placeholder="Ej. 12" />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nombre de quien solicita</label>
                        <input type="text" name="NombreContacto" value={formData.NombreContacto} onChange={handleChange} className={inputClass} placeholder="Ej. Juan P&eacute;rez" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Celular</label>
                        <input type="number" name="Celular" value={formData.Celular} onChange={handleChange} className={inputClass} placeholder="Ej. 3101234567" required />
                    </div>
                </div>

                <div className="bg-white/40 p-5 rounded-xl border border-white/50">
                    <div className="w-full md:w-1/2">
                        <label className={labelClass}>Superintendencia</label>
                        <select name="Superintendencia" value={formData.Superintendencia || ""} onChange={handleChange} className={inputClass} required>
                            {SUPERINTENDENCIAS.map(s => <option key={s} value={s}>{s || "-- Seleccione Superintendencia --"}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/40 p-5 rounded-xl border border-white/50">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Detalle del Requerimiento</label>
                        <textarea name="DetalleRequerimiento" value={formData.DetalleRequerimiento} onChange={handleChange} rows="4" className={`${inputClass} resize-none`} placeholder="Descripci&oacute;n detallada de la solicitud..." required></textarea>
                    </div>
                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 flex flex-col justify-between">
                        <div>
                            <label className={labelClass}>Prioridad</label>
                            <select name="Prioridad" value={formData.Prioridad} onChange={handleChange} className={inputClass} required>
                                {Object.keys(PRIORIDADES).map(prio => (
                                    <option key={prio} value={prio}>{prio} -{'>'} {PRIORIDADES[prio]} {PRIORIDADES[prio] === 1 ? "d\u00EDa" : "d\u00EDas"}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-3 p-2 bg-white/80 rounded-lg border border-cerrejon-orange/30 text-center">
                            <span className="block text-[10px] font-bold text-gray-500 uppercase">Tiempo de Soluci&oacute;n</span>
                            <span className="text-lg font-black text-cerrejon-orange">
                                {PRIORIDADES[formData.Prioridad]} {PRIORIDADES[formData.Prioridad] === 1 ? "D\u00EDa" : "D\u00EDas"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white/40 p-5 rounded-xl border border-white/50">
                    <div>
                        <label className={labelClass}>Coordinador de MMHH Quien Recibe</label>
                        <select name="CoordinadorRecibe" value={formData.CoordinadorRecibe} onChange={handleChange} className={inputClass} required>
                            {COORDINADORES_LISTA.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {formData.CoordinadorRecibe === "Otro" && (
                            <input type="text" name="CoordinadorRecibeCustom" value={formData.CoordinadorRecibeCustom} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Especifique el coordinador..." required />
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>&Aacute;rea de Entrega</label>
                        <select name="AreaEntrega" value={formData.AreaEntrega} onChange={handleChange} className={inputClass} required>
                            {AREAS_ENTREGA.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        {formData.AreaEntrega === "Otra" && (
                            <input type="text" name="AreaEntregaCustom" value={formData.AreaEntregaCustom} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Especifique el &aacute;rea..." required />
                        )}
                    </div>
                </div>

                <div className="bg-white/40 p-5 rounded-xl border border-dashed border-gray-400">
                    <label className={labelClass}>Documentos o Evidencias Fotogr&aacute;ficas (Opcional)</label>
                    <input type="file" accept="image/*" multiple onChange={onFileChange} ref={fileInputRef} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-bold file:bg-cerrejon-orange file:text-white cursor-pointer" />
                </div>

                <div className="flex justify-end pt-4 border-t border-white/30">
                    <button type="submit" disabled={loading} className="px-10 py-3 bg-gradient-to-r from-cerrejon-orange to-red-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50">
                        {loading ? "Procesando Informaci&oacute;n..." : "Guardar Requerimiento"}
                    </button>
                </div>
            </form>
        </div>
    );
}

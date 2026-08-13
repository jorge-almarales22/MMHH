import React, { useRef } from 'react';
import { FLOTAS, SOPORTE_OPCIONES, PRIORIDADES, SUPERINTENDENCIAS, COORDINADORES_LISTA, AREAS_ENTREGA } from '../constants';
import { placa, campo, rotulo, btn, dial } from '../ui';

/* Riel de rótulos a la izquierda, campos a la derecha: la hoja de ruta impresa
   que acompaña a la pieza tiene exactamente esa estructura. */
function Bloque({ titulo, nota, children, ultimo = false }) {
    return (
        <section className={`grid grid-cols-1 gap-x-10 gap-y-4 px-5 py-6 lg:grid-cols-[190px_1fr] lg:px-7 ${ultimo ? '' : 'border-b border-iron-200'}`}>
            <div>
                <h3 className={dial}>{titulo}</h3>
                {nota && <p className="mt-1.5 text-[12px] leading-relaxed text-iron-500">{nota}</p>}
            </div>
            <div>{children}</div>
        </section>
    );
}

const Obligatorio = () => <span className="text-brand" aria-hidden="true">*</span>;

export default function TabCliente({ formData, setFormData, evidenceFiles, loading, onFileChange, onSubmit }) {
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const u = { ...prev, [name]: value };
            if (name === "Soporte") { u.TipoRequerimiento = []; u.TipoRequerimientoCustom = {}; u.SoporteCustom = ""; }
            if (name === "Flota" && value !== "Otra") u.FlotaCustom = "";
            if (name === "CoordinadorRecibe" && value !== "Otro") u.CoordinadorRecibeCustom = "";
            if (name === "AreaEntrega" && value !== "Otra") u.AreaEntregaCustom = "";
            return u;
        });
    };

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
        <div className={`${placa} w-full animate-card-in`}>
            <div className="border-b border-iron-200 px-5 py-4 lg:px-7">
                <span className={dial}>Cliente</span>
                <h2 className="mt-1 text-[19px] font-semibold leading-tight tracking-tight text-iron-900">
                    Ingresar una pieza al taller
                </h2>
                <p className="mt-1.5 max-w-2xl text-[13px] text-iron-500">
                    Al guardar, la solicitud recibe un número de seis dígitos y entra a la cola en estado Pendiente.
                </p>
            </div>

            <form onSubmit={onSubmit}>

                <Bloque titulo="Orden de trabajo" nota="Identifica la pieza dentro del sistema de mantenimiento.">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className={rotulo}>OT <Obligatorio /></label>
                            <input
                                type="text" name="OT" maxLength={8} value={formData.OT} onChange={handleChange}
                                className={`${campo} num uppercase ${formData.OT && !otValida ? '!border-alarm focus:!ring-alarm/20' : ''}`}
                                placeholder="A0104599" required
                            />
                            <p className={`mt-1.5 text-[11px] ${formData.OT && !otValida ? 'text-alarm' : 'text-iron-400'}`}>
                                {formData.OT && !otValida
                                    ? `Faltan caracteres: van ${formData.OT.length} de 8`
                                    : 'Ocho caracteres'}
                            </p>
                        </div>
                        <div>
                            <label className={rotulo}>Flota <Obligatorio /></label>
                            <select name="Flota" value={formData.Flota} onChange={handleChange} className={campo} required>
                                {FLOTAS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            {formData.Flota === "Otra" && (
                                <input type="text" name="FlotaCustom" value={formData.FlotaCustom} onChange={handleChange} className={`${campo} mt-2`} placeholder="¿Cuál flota?" required />
                            )}
                        </div>
                        <div>
                            <label className={rotulo}>Cantidad <Obligatorio /></label>
                            <input
                                type="number" name="Cantidad" min="1" step="1" value={formData.Cantidad}
                                onChange={(e) => setFormData({ ...formData, Cantidad: parseInt(e.target.value) || 1 })}
                                className={`${campo} num`} required
                            />
                        </div>
                    </div>
                </Bloque>

                <Bloque titulo="Trabajo requerido" nota="Elija la categoría y marque todo lo que aplique.">
                    <div className="space-y-4">
                        <div className="sm:max-w-xs">
                            <label className={rotulo}>Soporte <Obligatorio /></label>
                            <select name="Soporte" value={formData.Soporte} onChange={handleChange} className={campo} required>
                                <option value="">Elija una categoría</option>
                                {Object.keys(SOPORTE_OPCIONES).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {formData.Soporte === "Otro" && (
                                <input type="text" name="SoporteCustom" value={formData.SoporteCustom} onChange={handleChange} className={`${campo} mt-2`} placeholder="¿Qué soporte necesita?" required />
                            )}
                        </div>

                        <div className="border-t border-iron-100 pt-4">
                            <div className="mb-3 flex items-center justify-between">
                                <label className={`${rotulo} mb-0`}>Tipo de requerimiento <Obligatorio /></label>
                                {formData.TipoRequerimiento.length > 0 && (
                                    <span className="num text-[11px] text-iron-500">
                                        {formData.TipoRequerimiento.length} marcado{formData.TipoRequerimiento.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {!formData.Soporte ? (
                                <p className="border border-dashed border-iron-300 bg-iron-50 px-4 py-5 text-center text-[12px] text-iron-500">
                                    Elija primero una categoría de soporte y aquí aparecerán los trabajos disponibles.
                                </p>
                            ) : formData.Soporte === "Otro" ? (
                                <input
                                    type="text" value={formData.TipoRequerimiento[0] || ""}
                                    onChange={(e) => setFormData({ ...formData, TipoRequerimiento: e.target.value ? [e.target.value] : [] })}
                                    className={campo} placeholder="Describa el trabajo requerido" required
                                />
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[3px] border border-iron-200 bg-iron-200 sm:grid-cols-2 xl:grid-cols-3">
                                        {SOPORTE_OPCIONES[formData.Soporte].map(req => {
                                            const on = formData.TipoRequerimiento.includes(req);
                                            return (
                                                <label
                                                    key={req}
                                                    className={`flex cursor-pointer select-none items-center gap-2.5 px-3 py-2.5 text-[13px] transition-colors ${on
                                                        ? 'bg-brand-wash font-medium text-brand-deep'
                                                        : 'bg-white text-iron-700 hover:bg-iron-50'}`}
                                                >
                                                    <input type="checkbox" checked={on} onChange={() => toggleTipo(req)} className="h-[15px] w-[15px] shrink-0 rounded-[2px] accent-brand" />
                                                    <span className="leading-tight">{req}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {formData.TipoRequerimiento.includes("Otro") && (
                                        <input
                                            type="text" value={formData.TipoRequerimientoCustom["Otro"] || ""}
                                            onChange={(e) => setFormData(p => ({ ...p, TipoRequerimientoCustom: { ...p.TipoRequerimientoCustom, Otro: e.target.value } }))}
                                            className={campo} placeholder="¿Qué otro trabajo necesita?" required
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Bloque>

                <Bloque titulo="La pieza" nota="Datos que permiten identificarla al recibirla.">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                            <label className={rotulo}>Componente <Obligatorio /></label>
                            <input type="text" name="NombreComponente" value={formData.NombreComponente} onChange={handleChange} className={campo} placeholder="Cigüeñal de motor" required />
                        </div>
                        <div>
                            <label className={rotulo}>Part number <Obligatorio /></label>
                            <input type="text" name="PN" value={formData.PN} onChange={handleChange} className={`${campo} num`} placeholder="104-599" required />
                        </div>
                        <div>
                            <label className={rotulo}>Stock code</label>
                            <input type="number" name="SC" value={formData.SC} onChange={handleChange} className={`${campo} num`} placeholder="12" />
                        </div>
                        <div className="sm:col-span-4">
                            <label className={rotulo}>Qué hay que hacerle <Obligatorio /></label>
                            <textarea
                                name="DetalleRequerimiento" value={formData.DetalleRequerimiento} onChange={handleChange}
                                rows="4" className={`${campo} resize-y`}
                                placeholder="Síntoma observado, alcance esperado y cualquier condición especial de manejo."
                                required
                            />
                        </div>
                    </div>
                </Bloque>

                <Bloque titulo="Plazo" nota="La prioridad fija los días de que dispone el taller. Contra ese número se mide el cumplimiento.">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={rotulo}>Prioridad <Obligatorio /></label>
                            <select name="Prioridad" value={formData.Prioridad} onChange={handleChange} className={campo} required>
                                {Object.keys(PRIORIDADES).map(p => (
                                    <option key={p} value={p}>{p} — {PRIORIDADES[p]} {PRIORIDADES[p] === 1 ? "día" : "días"}</option>
                                ))}
                            </select>
                        </div>
                        {/* Lectura del plazo elegido, en el lenguaje del instrumento. */}
                        <div className="flex items-center gap-4 border-l-2 border-brand bg-brand-wash/60 px-4 py-3">
                            <div className="num text-[30px] font-medium leading-none text-brand-deep">{plazo}</div>
                            <div>
                                <div className="dial text-[10px] text-brand-deep">
                                    {plazo === 1 ? "día calendario" : "días calendario"}
                                </div>
                                <div className="mt-1 text-[12px] text-iron-600">
                                    {plazo === 0
                                        ? "Atención inmediata: cualquier día de espera ya es incumplimiento."
                                        : `Plazo para entregar desde el ingreso de la pieza.`}
                                </div>
                            </div>
                        </div>
                    </div>
                </Bloque>

                <Bloque titulo="Quién solicita" nota="A quién buscar si el taller necesita aclarar algo.">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className={rotulo}>Nombre <Obligatorio /></label>
                            <input type="text" name="NombreContacto" value={formData.NombreContacto} onChange={handleChange} className={campo} placeholder="Juan Pérez" required />
                        </div>
                        <div>
                            <label className={rotulo}>Celular <Obligatorio /></label>
                            <input type="number" name="Celular" value={formData.Celular} onChange={handleChange} className={`${campo} num`} placeholder="3101234567" required />
                        </div>
                        <div>
                            <label className={rotulo}>Superintendencia <Obligatorio /></label>
                            <select name="Superintendencia" value={formData.Superintendencia || ""} onChange={handleChange} className={campo} required>
                                {SUPERINTENDENCIAS.map(s => <option key={s} value={s}>{s || "Elija una"}</option>)}
                            </select>
                        </div>
                    </div>
                </Bloque>

                <Bloque titulo="Entrega y soportes" nota="Dónde queda la pieza y con qué evidencia llega." ultimo>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={rotulo}>Coordinador que recibe <Obligatorio /></label>
                            <select name="CoordinadorRecibe" value={formData.CoordinadorRecibe} onChange={handleChange} className={campo} required>
                                {COORDINADORES_LISTA.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {formData.CoordinadorRecibe === "Otro" && (
                                <input type="text" name="CoordinadorRecibeCustom" value={formData.CoordinadorRecibeCustom} onChange={handleChange} className={`${campo} mt-2`} placeholder="¿Quién recibe?" required />
                            )}
                        </div>
                        <div>
                            <label className={rotulo}>Área de entrega <Obligatorio /></label>
                            <select name="AreaEntrega" value={formData.AreaEntrega} onChange={handleChange} className={campo} required>
                                {AREAS_ENTREGA.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                            {formData.AreaEntrega === "Otra" && (
                                <input type="text" name="AreaEntregaCustom" value={formData.AreaEntregaCustom} onChange={handleChange} className={`${campo} mt-2`} placeholder="¿Cuál área?" required />
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <label className={rotulo}>Fotos de la pieza</label>
                            <div className="border border-dashed border-iron-300 bg-iron-50 px-4 py-4">
                                <input
                                    type="file" accept="image/*" multiple onChange={onFileChange} ref={fileInputRef}
                                    className="block w-full cursor-pointer text-[13px] text-iron-600 file:mr-4 file:cursor-pointer file:rounded-[3px] file:border-0 file:bg-dye file:px-4 file:py-2 file:font-sans file:text-[13px] file:font-semibold file:text-white hover:file:bg-dye-mid"
                                />
                                <p className="mt-2 text-[12px] text-iron-500">
                                    {evidenceFiles.length > 0
                                        ? `${evidenceFiles.length} ${evidenceFiles.length > 1 ? 'fotos listas' : 'foto lista'} para adjuntar.`
                                        : 'Opcional. Ayudan al taller a evaluar antes de recibir la pieza.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </Bloque>

                <div className="flex flex-wrap items-center justify-end gap-4 border-t border-iron-200 bg-iron-50 px-5 py-4 lg:px-7">
                    <button type="submit" disabled={loading} className={btn}>
                        {loading && (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                            </svg>
                        )}
                        {loading ? "Guardando..." : "Guardar solicitud"}
                    </button>
                </div>
            </form>
        </div>
    );
}

import React, { useState } from 'react';
import { X, Plus, Trash2, Clock, Sparkles } from 'lucide-react';
import { DIAS, CATEGORIAS_CONFIG } from '../data/seedData';

export default function ActivityFormModal({
  isOpen,
  onClose,
  onSave,
  diaDefaultId,
  actividadEditar,
}) {
  const [diaId, setDiaId] = useState(actividadEditar ? actividadEditar.diaId : diaDefaultId || 'lunes');
  const [titulo, setTitulo] = useState(actividadEditar ? actividadEditar.titulo : '');
  const [categoria, setCategoria] = useState(actividadEditar ? actividadEditar.categoria : 'Cuidado Personal');
  const [horaInicio, setHoraInicio] = useState(actividadEditar ? actividadEditar.horaInicio : '08:00');
  const [horaFin, setHoraFin] = useState(actividadEditar ? actividadEditar.horaFin : '09:00');
  const [alerta10Min, setAlerta10Min] = useState(actividadEditar ? !!actividadEditar.alerta10Min : false);
  const [subtareas, setSubtareas] = useState(
    actividadEditar && actividadEditar.detalleChecklist
      ? actividadEditar.detalleChecklist.map((s) => s.texto)
      : ['']
  );

  if (!isOpen) return null;

  // Formateo de display para 12 horas
  const formatearDisplay12h = (hora24) => {
    if (!hora24) return '';
    const [hStr, mStr] = hora24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'p.m.' : 'a.m.';
    h = h % 12;
    h = h ? h : 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  };

  const handleSubtareaChange = (index, valor) => {
    const list = [...subtareas];
    list[index] = valor;
    setSubtareas(list);
  };

  const agregarFilaSubtarea = () => {
    setSubtareas([...subtareas, '']);
  };

  const eliminarFilaSubtarea = (index) => {
    setSubtareas(subtareas.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const checklistItems = subtareas
      .filter((s) => s.trim().length > 0)
      .map((s, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        texto: s.trim(),
        completado: false,
      }));

    const nuevaActividad = {
      id: actividadEditar ? actividadEditar.id : `act-${Date.now()}`,
      diaId,
      horaInicio,
      horaFin,
      horaInicioDisplay: formatearDisplay12h(horaInicio),
      horaFinDisplay: formatearDisplay12h(horaFin),
      titulo: titulo.trim(),
      categoria,
      detalleChecklist: checklistItems,
      completado: actividadEditar ? actividadEditar.completado : false,
      alerta10Min,
    };

    onSave(nuevaActividad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-dark-900 border border-rose-500/20 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-rose-950/40 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" />
            {actividadEditar ? 'Editar Actividad' : 'Nueva Actividad'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-dark-850 hover:bg-dark-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 smooth-scroll flex-1">
          {/* Día */}
          <div>
            <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
              Día de la semana
            </label>
            <select
              value={diaId}
              onChange={(e) => setDiaId(e.target.value)}
              className="w-full bg-dark-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-rose-500/20 focus:outline-none focus:border-rose-400"
            >
              {DIAS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
              Título de la Actividad
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Ejercicio matutino o Skincare"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-dark-950 text-white placeholder-neutral-500 text-xs px-3.5 py-2.5 rounded-xl border border-rose-500/20 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
              Categoría
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(CATEGORIAS_CONFIG).map((catKey) => {
                const conf = CATEGORIAS_CONFIG[catKey];
                const isSelected = categoria === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategoria(catKey)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center gap-2 ${
                      isSelected
                        ? `${conf.badgeBg} ${conf.badgeText} ${conf.badgeBorder} shadow-sm`
                        : 'bg-dark-950 text-neutral-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: conf.colorHex }}
                    />
                    <span className="truncate">{catKey}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horas de Inicio y Fin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
                Hora Inicio
              </label>
              <input
                type="time"
                required
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full bg-dark-950 text-white text-xs px-3 py-2 rounded-xl border border-rose-500/20 focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
                Hora Fin
              </label>
              <input
                type="time"
                required
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full bg-dark-950 text-white text-xs px-3 py-2 rounded-xl border border-rose-500/20 focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>
          </div>

          {/* Subtareas / Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-rose-200/80 uppercase tracking-wider">
                Detalle / Lista de Tareas
              </label>
              <button
                type="button"
                onClick={agregarFilaSubtarea}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir paso</span>
              </button>
            </div>

            <div className="space-y-2">
              {subtareas.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Paso ${idx + 1}...`}
                    value={sub}
                    onChange={(e) => handleSubtareaChange(idx, e.target.value)}
                    className="flex-1 bg-dark-950 text-white placeholder-neutral-600 text-xs px-3 py-2 rounded-xl border border-white/5 focus:outline-none focus:border-rose-400"
                  />
                  {subtareas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarFilaSubtarea(idx)}
                      className="text-neutral-500 hover:text-rose-400 p-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Switch de Alerta 10 min antes */}
          <div className="bg-dark-850/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Recordatorio 10 min antes</p>
              <p className="text-[11px] text-neutral-400">Sonido y notificación previa</p>
            </div>
            <input
              type="checkbox"
              checked={alerta10Min}
              onChange={(e) => setAlerta10Min(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-300 text-xs font-semibold border border-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-dark-950 font-bold text-xs transition-all shadow-md shadow-rose-950/40"
            >
              Guardar Actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

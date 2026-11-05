import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Circle,
  Bell,
  BellOff,
  Sparkles,
  GraduationCap,
  Briefcase,
  Cat,
  Home,
  Plus,
  Trash2,
  Edit3,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIAS_CONFIG } from '../data/seedData';

function renderCategoriaIcon(iconName, className) {
  switch (iconName) {
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Cat':
      return <Cat className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Sparkles':
    default:
      return <Sparkles className={className} />;
  }
}

export default function ActivityDetailModal({
  actividad,
  diaNombre,
  isOpen,
  onClose,
  onToggleCompletado,
  onToggleSubtask,
  onAddSubtask,
  onEditActividad,
  onEliminarActividad,
}) {
  const [nuevaSubtarea, setNuevaSubtarea] = useState('');
  const [mostrarInputSubtarea, setMostrarInputSubtarea] = useState(false);

  if (!isOpen || !actividad) return null;

  const cat = CATEGORIAS_CONFIG[actividad.categoria] || CATEGORIAS_CONFIG['Cuidado Personal'];
  const totalSubtareas = actividad.detalleChecklist ? actividad.detalleChecklist.length : 0;
  const subtareasCompletadas = actividad.detalleChecklist
    ? actividad.detalleChecklist.filter((s) => s.completado).length
    : 0;

  const handleCompletarPrincipal = () => {
    const nuevoEstado = !actividad.completado;
    onToggleCompletado(actividad.id);

    if (nuevoEstado) {
      // Disparar confeti sutil en tonos rosados
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f472b6', '#fda4af', '#fbcfe8', '#e2847a', '#ffffff'],
        });
      } catch (e) {}
    }
  };

  const handleAgregarSubtarea = (e) => {
    e.preventDefault();
    if (!nuevaSubtarea.trim()) return;
    onAddSubtask(actividad.id, nuevaSubtarea.trim());
    setNuevaSubtarea('');
    setMostrarInputSubtarea(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-md bg-dark-900 border border-rose-500/20 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera modal */}
        <div className="px-6 pt-6 pb-4 border-b border-rose-950/40 relative">
          <div className="flex items-center justify-between gap-3 mb-2">
            {/* Categoría Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}
            >
              {renderCategoriaIcon(cat.icon, 'w-3.5 h-3.5')}
              {actividad.categoria}
            </span>

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-dark-850 hover:bg-dark-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Título de la tarea */}
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            {actividad.titulo}
          </h2>

          {/* Rango de horario y Día */}
          <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-rose-200/80 font-mono">
            <div className="flex items-center gap-1.5 bg-dark-950/80 px-2.5 py-1 rounded-lg border border-white/5">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>{actividad.horaInicioDisplay} - {actividad.horaFinDisplay}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-dark-950/80 px-2.5 py-1 rounded-lg border border-white/5 font-sans">
              <Calendar className="w-3.5 h-3.5 text-rose-300" />
              <span className="capitalize">{diaNombre}</span>
            </div>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 smooth-scroll">
          {/* Botón principal de completar tarea */}
          <div className="bg-dark-850/90 rounded-2xl p-4 border border-rose-500/15 shadow-card-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-rose-300/70">
                  Estado de la actividad
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {actividad.completado ? '¡Actividad Completada!' : 'Pendiente de realizar'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCompletarPrincipal}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide flex items-center gap-2 transition-all shadow-md ${
                  actividad.completado
                    ? 'bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 border border-rose-500/40'
                    : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-dark-950 font-bold'
                }`}
              >
                {actividad.completado ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-rose-300" />
                    <span>Completada</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Marcar Lista</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sección de Detalle_Checklist (Lista de tareas / subtareas) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-100 uppercase tracking-wider">
                  Detalles y Tareas
                </h3>
                {totalSubtareas > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-dark-850 text-rose-300 border border-white/5">
                    {subtareasCompletadas}/{totalSubtareas}
                  </span>
                )}
              </div>

              {!mostrarInputSubtarea && (
                <button
                  type="button"
                  onClick={() => setMostrarInputSubtarea(true)}
                  className="text-xs font-semibold text-rose-300 hover:text-rose-200 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir paso</span>
                </button>
              )}
            </div>

            {/* Input para nueva subtarea */}
            {mostrarInputSubtarea && (
              <form onSubmit={handleAgregarSubtarea} className="mb-3 flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Ej: Lavar cara con barra Cetaphil..."
                  value={nuevaSubtarea}
                  onChange={(e) => setNuevaSubtarea(e.target.value)}
                  className="flex-1 bg-dark-950 text-white placeholder-neutral-500 text-xs px-3.5 py-2.5 rounded-xl border border-rose-500/30 focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="px-3 py-2.5 rounded-xl bg-rose-500 text-dark-950 font-bold text-xs hover:bg-rose-400 transition-colors"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarInputSubtarea(false)}
                  className="px-2.5 py-2.5 rounded-xl bg-dark-850 text-neutral-400 hover:text-white text-xs border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Lista de subtareas interactivas */}
            <div className="space-y-2">
              {actividad.detalleChecklist && actividad.detalleChecklist.length > 0 ? (
                actividad.detalleChecklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleSubtask(actividad.id, item.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                      item.completado
                        ? 'bg-dark-950/40 border-white/5 opacity-65'
                        : 'bg-dark-850/70 hover:bg-dark-800 border-white/5 hover:border-rose-500/20'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      {item.completado ? (
                        <CheckCircle2 className="w-4 h-4 text-rose-400 fill-rose-500/20" />
                      ) : (
                        <Circle className="w-4 h-4 text-neutral-600" />
                      )}
                    </button>
                    <span
                      className={`text-xs leading-relaxed ${
                        item.completado ? 'line-through text-neutral-400' : 'text-neutral-200'
                      }`}
                    >
                      {item.texto}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 italic p-3 bg-dark-950/40 rounded-xl border border-white/5">
                  No hay tareas secundarias definidas. Haz clic en "Añadir paso" para agregar detalles específicos.
                </p>
              )}
            </div>
          </div>

          {/* Configuración de Notificación 10 min antes */}
          <div className="bg-dark-850/60 rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                {actividad.alerta10Min ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Alerta 10 minutos antes</p>
                <p className="text-[11px] text-neutral-400">
                  {actividad.alerta10Min
                    ? 'Activada (recibirás sonido y aviso antes)'
                    : 'Desactivada para esta tarea'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onEditActividad({
                  ...actividad,
                  alerta10Min: !actividad.alerta10Min,
                })
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                actividad.alerta10Min
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-dark-950 text-neutral-400 border-neutral-800'
              }`}
            >
              {actividad.alerta10Min ? 'Activada' : 'Activar'}
            </button>
          </div>
        </div>

        {/* Footer con opciones de edición y eliminación */}
        <div className="px-6 py-4 bg-dark-950 border-t border-rose-950/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onEliminarActividad(actividad.id)}
            className="p-2.5 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-rose-200 text-xs font-semibold border border-white/5 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

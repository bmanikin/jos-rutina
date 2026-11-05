import React from 'react';
import { Check, Clock, Bell, CheckCircle2, Circle, ChevronRight, Sparkles, GraduationCap, Briefcase, Cat, Home } from 'lucide-react';
import { CATEGORIAS_CONFIG } from '../data/seedData';

// Mapeo dinámico de iconos
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

export default function ActivityCard({ actividad, isEnCurso, onToggleCompletado, onClickDetalles }) {
  const cat = CATEGORIAS_CONFIG[actividad.categoria] || CATEGORIAS_CONFIG['Cuidado Personal'];
  const totalSubtareas = actividad.detalleChecklist ? actividad.detalleChecklist.length : 0;
  const subtareasCompletadas = actividad.detalleChecklist
    ? actividad.detalleChecklist.filter((s) => s.completado).length
    : 0;

  return (
    <div
      onClick={onClickDetalles}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
        actividad.completado
          ? 'bg-dark-900/60 border-white/5 opacity-65 hover:opacity-90'
          : isEnCurso
          ? 'bg-gradient-to-r from-dark-850 to-dark-900 border-rose-500/40 shadow-rose-glow scale-[1.01]'
          : 'bg-dark-850/90 hover:bg-dark-800/90 border-white/5 hover:border-rose-500/20 shadow-card-soft'
      }`}
    >
      {/* Indicador de categoría al margen izquierdo */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: cat.colorHex }}
      />

      <div className="flex items-start justify-between gap-3 pl-2">
        {/* Información principal */}
        <div className="flex-1 min-w-0">
          {/* Horario y Categoría */}
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            {/* Rango de hora */}
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-200/90 font-mono">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>{actividad.horaInicioDisplay}</span>
              <span className="text-neutral-500">-</span>
              <span>{actividad.horaFinDisplay}</span>
            </div>

            {/* Badge de categoría (tonos no brillantes) */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}
            >
              {renderCategoriaIcon(cat.icon, 'w-3 h-3')}
              {actividad.categoria}
            </span>

            {/* Indicador "En curso" */}
            {isEnCurso && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                En Curso
              </span>
            )}

            {/* Icono de campana si tiene alerta 10 min */}
            {actividad.alerta10Min && (
              <span title="Alerta 10 min antes activada" className="text-rose-400/80">
                <Bell className="w-3.5 h-3.5 fill-rose-500/20" />
              </span>
            )}
          </div>

          {/* Título de la actividad */}
          <h3
            className={`text-base font-semibold leading-snug transition-colors ${
              actividad.completado
                ? 'line-through text-neutral-400'
                : 'text-white group-hover:text-rose-100'
            }`}
          >
            {actividad.titulo}
          </h3>

          {/* Resumen de Checklist de subtareas */}
          {totalSubtareas > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="text-[11px] font-medium text-rose-300/80">
                  {subtareasCompletadas}/{totalSubtareas} subtareas
                </span>
                {/* Minibarra de progreso de la tarea */}
                <div className="w-16 bg-dark-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-rose-400/80 rounded-full transition-all"
                    style={{ width: `${(subtareasCompletadas / totalSubtareas) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón Checkbox rápido */}
        <div className="flex items-center gap-1 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompletado(actividad.id);
            }}
            title={actividad.completado ? 'Marcar como pendiente' : 'Marcar como completada'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              actividad.completado
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-dark-950 hover:bg-dark-800 text-neutral-500 hover:text-rose-300 border border-neutral-800 hover:border-rose-500/30'
            }`}
          >
            {actividad.completado ? (
              <Check className="w-4 h-4 text-rose-400 stroke-[3]" />
            ) : (
              <div className="w-4 h-4 rounded-md border border-neutral-600 hover:border-rose-400" />
            )}
          </button>

          <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-rose-300 transition-colors hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

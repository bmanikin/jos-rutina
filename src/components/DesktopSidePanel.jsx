import React from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Download,
  Bell,
  Check,
  Calendar,
} from 'lucide-react';
import { CATEGORIAS_CONFIG, DIAS } from '../data/seedData';
import { getActividadesPorDia, exportarDatosJSON } from '../services/storageService';

export default function DesktopSidePanel({
  hoyId,
  actividadesHoy,
  horaMinutoActual,
  onToggleCompletado,
  onToggleSubtask,
  onOpenDetalles,
  onOpenNewActivity,
  onOpenStats,
  onProbarAlerta,
}) {
  // Buscar actividad en curso
  const actividadEnCurso = actividadesHoy.find(
    (act) =>
      horaMinutoActual >= act.horaInicio && horaMinutoActual < act.horaFin
  );

  // Si no hay actividad en curso, buscar la próxima
  const proximaActividad = !actividadEnCurso
    ? actividadesHoy.find((act) => act.horaInicio > horaMinutoActual && !act.completado)
    : null;

  const actividadEnfoque = actividadEnCurso || proximaActividad || actividadesHoy[0];

  const catEnfoque = actividadEnfoque
    ? CATEGORIAS_CONFIG[actividadEnfoque.categoria] || CATEGORIAS_CONFIG['Cuidado Personal']
    : null;

  // Estadísticas rápidas de la semana
  const resumenSemana = DIAS.map((d) => {
    const acts = getActividadesPorDia(d.id);
    const comps = acts.filter((a) => a.completado).length;
    return {
      ...d,
      pct: acts.length > 0 ? Math.round((comps / acts.length) * 100) : 0,
      isHoy: d.id === hoyId,
    };
  });

  const handleExportar = () => {
    const jsonStr = exportarDatosJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jos_rutina_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="space-y-5">
      {/* Tarjeta Enfoque / Actividad Actual */}
      <div className="bg-dark-900/90 rounded-3xl p-5 border border-rose-500/30 shadow-rose-glow relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            {actividadEnCurso ? 'En Curso Ahora' : 'Próximo Enfoque'}
          </span>

          {catEnfoque && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${catEnfoque.badgeBg} ${catEnfoque.badgeText} ${catEnfoque.badgeBorder}`}
            >
              {actividadEnfoque.categoria}
            </span>
          )}
        </div>

        {actividadEnfoque ? (
          <div>
            <h3 className="text-lg font-bold text-white leading-snug">
              {actividadEnfoque.titulo}
            </h3>

            <div className="flex items-center gap-2 mt-1 text-xs text-rose-200/90 font-mono">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {actividadEnfoque.horaInicioDisplay} - {actividadEnfoque.horaFinDisplay}
              </span>
            </div>

            {/* Checklist interactivo directo desde el panel de escritorio */}
            {actividadEnfoque.detalleChecklist &&
              actividadEnfoque.detalleChecklist.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300/80">
                    Checklist de pasos
                  </p>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto smooth-scroll">
                    {actividadEnfoque.detalleChecklist.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => onToggleSubtask(actividadEnfoque.id, sub.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer text-xs transition-colors border ${
                          sub.completado
                            ? 'bg-dark-950/40 border-white/5 line-through text-neutral-500'
                            : 'bg-dark-850 hover:bg-dark-800 border-white/5 text-neutral-200'
                        }`}
                      >
                        <button type="button" className="mt-0.5 text-rose-400">
                          {sub.completado ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-neutral-600" />
                          )}
                        </button>
                        <span className="leading-tight">{sub.texto}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Botón marcar completada */}
            <div className="mt-4 pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleCompletado(actividadEnfoque.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  actividadEnfoque.completado
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-dark-950 shadow-md shadow-rose-950/40'
                }`}
              >
                {actividadEnfoque.completado ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>¡Completada Hoy!</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Marcar Actividad Lista</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenDetalles(actividadEnfoque)}
                className="px-3 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-300 hover:text-white border border-white/5 text-xs font-semibold"
              >
                Detalles
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-400">No hay actividades registradas para hoy.</p>
        )}
      </div>

      {/* Resumen Semanal Compacto */}
      <div className="bg-dark-900/80 rounded-3xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-400" />
            Progreso Semanal
          </h4>
          <button
            onClick={onOpenStats}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
          >
            Ver más
          </button>
        </div>

        <div className="space-y-2">
          {resumenSemana.map((d) => (
            <div key={d.id} className="flex items-center gap-2.5 text-xs">
              <span
                className={`w-10 text-[11px] font-semibold ${
                  d.isHoy ? 'text-rose-400' : 'text-neutral-400'
                }`}
              >
                {d.corto}
              </span>
              <div className="flex-1 bg-dark-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-[10px] text-neutral-400">
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-dark-900/60 rounded-3xl p-4 border border-white/5 grid grid-cols-2 gap-2">
        <button
          onClick={onOpenNewActivity}
          className="p-3 rounded-2xl bg-dark-850 hover:bg-dark-800 border border-white/5 hover:border-rose-500/30 text-left transition-all group"
        >
          <Plus className="w-4 h-4 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-semibold text-white">Nueva Tarea</p>
          <p className="text-[10px] text-neutral-500">Añadir a la rutina</p>
        </button>

        <button
          onClick={handleExportar}
          className="p-3 rounded-2xl bg-dark-850 hover:bg-dark-800 border border-white/5 hover:border-rose-500/30 text-left transition-all group"
        >
          <Download className="w-4 h-4 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-semibold text-white">Respaldo</p>
          <p className="text-[10px] text-neutral-500">Descargar JSON</p>
        </button>
      </div>
    </aside>
  );
}

import React from 'react';
import { DIAS, CATEGORIAS_CONFIG } from '../data/seedData';
import { getActividadesPorDia } from '../services/storageService';
import { Clock, Plus, Check, CheckCircle2, Sparkles } from 'lucide-react';

export default function WeekView({
  hoyId,
  horaMinutoActual,
  onOpenDetalles,
  onToggleCompletado,
  onAddNewToDay,
}) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3.5 items-start">
        {DIAS.map((dia) => {
          const isHoy = dia.id === hoyId;
          const actividadesDia = getActividadesPorDia(dia.id);
          const total = actividadesDia.length;
          const completadas = actividadesDia.filter((a) => a.completado).length;
          const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;

          return (
            <div
              key={dia.id}
              className={`rounded-2xl flex flex-col transition-all border ${
                isHoy
                  ? 'bg-dark-900/90 border-rose-500/40 shadow-rose-glow ring-1 ring-rose-500/30'
                  : 'bg-dark-900/50 border-white/5 hover:border-rose-500/20'
              }`}
            >
              {/* Cabecera del día */}
              <div
                className={`p-3.5 border-b rounded-t-2xl ${
                  isHoy
                    ? 'border-rose-500/20 bg-rose-950/20'
                    : 'border-white/5 bg-dark-850/40'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">{dia.nombre}</h3>
                    {isHoy && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-rose-500 text-dark-950">
                        Hoy
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-rose-300/80 font-semibold">
                    {completadas}/{total}
                  </span>
                </div>

                {/* Subtítulo / Excepción del día */}
                {dia.subtitulo && (
                  <p className="text-[10px] text-neutral-400 truncate mb-2">
                    {dia.subtitulo}
                  </p>
                )}

                {/* Minibarra de progreso */}
                <div className="w-full bg-dark-950 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-300 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Lista de Actividades de la columna */}
              <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto smooth-scroll flex-1">
                {actividadesDia.map((act) => {
                  const cat = CATEGORIAS_CONFIG[act.categoria] || CATEGORIAS_CONFIG['Cuidado Personal'];
                  const isEnCurso =
                    isHoy &&
                    horaMinutoActual >= act.horaInicio &&
                    horaMinutoActual < act.horaFin;

                  return (
                    <div
                      key={act.id}
                      onClick={() => onOpenDetalles(act)}
                      className={`group relative p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        act.completado
                          ? 'bg-dark-950/40 border-white/5 opacity-60'
                          : isEnCurso
                          ? 'bg-dark-850 border-rose-500/40 shadow-sm'
                          : 'bg-dark-850/70 hover:bg-dark-800 border-white/5 hover:border-rose-500/20'
                      }`}
                    >
                      {/* Borde izquierdo de categoría */}
                      <div
                        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r"
                        style={{ backgroundColor: cat.colorHex }}
                      />

                      <div className="flex items-center justify-between gap-1 text-[10px] text-rose-200/80 font-mono mb-1 pl-1">
                        <span>{act.horaInicioDisplay}</span>
                        {isEnCurso && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-1 pl-1">
                        <p
                          className={`text-xs font-medium leading-tight line-clamp-2 ${
                            act.completado ? 'line-through text-neutral-400' : 'text-neutral-100 group-hover:text-rose-200'
                          }`}
                        >
                          {act.titulo}
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompletado(act.id);
                          }}
                          className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
                            act.completado
                              ? 'bg-rose-500/25 text-rose-300'
                              : 'border border-neutral-700 hover:border-rose-400 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Botón rápido para agregar tarea al día */}
                <button
                  type="button"
                  onClick={() => onAddNewToDay(dia.id)}
                  className="w-full py-1.5 rounded-xl border border-dashed border-white/10 hover:border-rose-500/30 text-neutral-500 hover:text-rose-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

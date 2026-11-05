import React, { useRef } from 'react';
import {
  X,
  BarChart3,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { DIAS } from '../data/seedData';
import {
  exportarDatosJSON,
  importarDatosJSON,
  resetearSemilla,
  getActividadesPorDia,
} from '../services/storageService';

export default function StatsModal({ isOpen, onClose, onDataChanged }) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Calcular estadísticas para los 7 días
  const diasStats = DIAS.map((dia) => {
    const acts = getActividadesPorDia(dia.id);
    const total = acts.length;
    const comps = acts.filter((a) => a.completado).length;
    const pct = total > 0 ? Math.round((comps / total) * 100) : 0;
    return {
      ...dia,
      total,
      comps,
      pct,
    };
  });

  const totalSemana = diasStats.reduce((acc, d) => acc + d.total, 0);
  const compsSemana = diasStats.reduce((acc, d) => acc + d.comps, 0);
  const pctSemana = totalSemana > 0 ? Math.round((compsSemana / totalSemana) * 100) : 0;

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

  const handleImportar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importarDatosJSON(event.target.result);
      if (result.exito) {
        alert('¡Respaldo importado con éxito!');
        onDataChanged();
        onClose();
      } else {
        alert(`Error al importar respaldo: ${result.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetear = () => {
    const ok = window.confirm(
      '¿Estás segura/o de restablecer la rutina a los datos iniciales? Se recuperarán todos los horarios y excepciones por defecto.'
    );
    if (ok) {
      resetearSemilla();
      onDataChanged();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-dark-900 border border-rose-500/20 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-rose-950/40 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-400" />
            Productividad y Respaldo
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-dark-850 hover:bg-dark-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 smooth-scroll flex-1">
          {/* Card Resumen General */}
          <div className="bg-gradient-to-br from-rose-950/40 to-dark-850 p-4 rounded-2xl border border-rose-500/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300/80">
                Cumplimiento Semanal
              </span>
              <h3 className="text-2xl font-black text-white mt-0.5">
                {pctSemana}%
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {compsSemana} de {totalSemana} actividades completadas
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <Flame className="w-6 h-6 text-rose-400 fill-rose-500/30" />
            </div>
          </div>

          {/* Gráfico de barras de los 7 días */}
          <div>
            <h4 className="text-xs font-bold text-rose-200/80 uppercase tracking-wider mb-3">
              Progreso por Día de la Semana
            </h4>
            <div className="space-y-2.5">
              {diasStats.map((d) => (
                <div key={d.id} className="bg-dark-950/60 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-neutral-300">{d.nombre}</span>
                    <span className="text-[11px] font-mono text-rose-300">
                      {d.comps}/{d.total} ({d.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-dark-850 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Respaldo y Restauración */}
          <div>
            <h4 className="text-xs font-bold text-rose-200/80 uppercase tracking-wider mb-3">
              Datos y Respaldo
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportar}
                className="p-3 rounded-2xl bg-dark-850 hover:bg-dark-800 border border-white/5 hover:border-rose-500/30 transition-all text-left group"
              >
                <Download className="w-4 h-4 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-white">Exportar JSON</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Guardar respaldo local</p>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl bg-dark-850 hover:bg-dark-800 border border-white/5 hover:border-rose-500/30 transition-all text-left group"
              >
                <Upload className="w-4 h-4 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-white">Importar JSON</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Cargar archivo guardado</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportar}
                />
              </button>
            </div>

            {/* Restablecer valores de fábrica */}
            <button
              type="button"
              onClick={handleResetear}
              className="w-full mt-3 p-3 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Restablecer Rutina Base Inicial</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-dark-950 border-t border-rose-950/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-rose-200 text-xs font-semibold border border-white/5 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

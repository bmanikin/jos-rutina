import React from 'react';
import { DIAS } from '../data/seedData';
import { getDiaActualId } from '../services/storageService';

export default function DaySelector({ diaSeleccionadoId, onSelectDia }) {
  const hoyId = getDiaActualId();

  return (
    <div className="py-3 px-4 bg-dark-900/60 border-b border-rose-950/30">
      <div className="flex items-center gap-2 overflow-x-auto smooth-scroll py-1">
        {DIAS.map((dia) => {
          const isSelected = dia.id === diaSeleccionadoId;
          const isHoy = dia.id === hoyId;

          return (
            <button
              key={dia.id}
              onClick={() => onSelectDia(dia.id)}
              className={`flex-shrink-0 relative px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-left flex flex-col items-center min-w-[62px] border ${
                isSelected
                  ? 'bg-rose-500/20 border-rose-500/50 text-white shadow-rose-glow scale-[1.02]'
                  : 'bg-dark-850/80 hover:bg-dark-800 border-white/5 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {/* Badge Hoy */}
              {isHoy && (
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mb-1 ${
                    isSelected
                      ? 'bg-rose-400 text-dark-950'
                      : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  Hoy
                </span>
              )}

              {/* Nombre corto */}
              <span className={`text-xs font-bold ${isSelected ? 'text-rose-100' : 'text-neutral-300'}`}>
                {dia.corto}
              </span>

              {/* Indicador de seleccionado */}
              <div
                className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-all ${
                  isSelected ? 'bg-rose-400 scale-125' : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

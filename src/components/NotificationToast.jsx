import React, { useEffect, useState } from 'react';
import { Bell, X, ArrowRight, Sparkles } from 'lucide-react';
import { onAlertTriggered } from '../services/notificationService';
import { CATEGORIAS_CONFIG } from '../data/seedData';

export default function NotificationToast({ onOpenActivityById }) {
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    const unsubscribe = onAlertTriggered((alertaData) => {
      setAlerta(alertaData);
    });
    return unsubscribe;
  }, []);

  if (!alerta) return null;

  const cat = CATEGORIAS_CONFIG[alerta.categoria] || CATEGORIAS_CONFIG['Cuidado Personal'];

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none animate-bounce-in">
      <div className="pointer-events-auto max-w-md w-full bg-dark-900/95 border-2 border-rose-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white">
        <div className="flex items-start gap-3">
          {/* Icono con animación de pulso */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/30 to-rose-900/40 border border-rose-400/40 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Bell className="w-5 h-5 text-rose-300 fill-rose-400/20" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                Alerta de Rutina (10 min antes)
              </span>
              <button
                onClick={() => setAlerta(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-sm font-bold text-white mt-0.5 truncate">
              {alerta.titulo}
            </h4>

            <p className="text-xs text-rose-200/80 mt-0.5 font-mono">
              Comienza a las {alerta.horaDisplay}
            </p>

            {/* Checklist Preview si tiene */}
            {alerta.checklist && alerta.checklist.length > 0 && (
              <div className="mt-2 text-[11px] text-neutral-300 bg-dark-950/70 p-2 rounded-lg border border-white/5 space-y-0.5">
                <p className="font-semibold text-rose-300/80 text-[10px] uppercase">Pasos a realizar:</p>
                {alerta.checklist.slice(0, 3).map((item, idx) => (
                  <p key={idx} className="truncate text-neutral-300">
                    • {item.texto}
                  </p>
                ))}
                {alerta.checklist.length > 3 && (
                  <p className="text-[10px] text-neutral-500 italic">
                    +{alerta.checklist.length - 3} pasos más...
                  </p>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  onOpenActivityById(alerta.id);
                  setAlerta(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500 text-dark-950 font-bold text-xs hover:bg-rose-400 transition-colors flex items-center gap-1"
              >
                <span>Ver Detalles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

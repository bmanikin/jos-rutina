import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  Smartphone,
  Monitor,
  BarChart3,
  Volume2,
  Cat,
  Download,
  Calendar,
  Clock,
  Plus,
} from 'lucide-react';
import {
  solicitarPermisoNotificaciones,
  simularAlertaPrueba,
} from '../services/notificationService';

export default function Header({
  diaSeleccionado,
  actividades,
  isPhoneFrame,
  setIsPhoneFrame,
  vistaModo,
  setVistaModo,
  onOpenStats,
  onOpenNewActivity,
}) {
  const [horaActual, setHoraActual] = useState(new Date());
  const [notifPerm, setNotifPerm] = useState('default');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setHoraActual(new Date()), 1000);
    if ('Notification' in window) {
      setNotifPerm(Notification.permission);
    }

    const installHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', installHandler);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeinstallprompt', installHandler);
    };
  }, []);

  const totalActividades = actividades.length;
  const completadas = actividades.filter((a) => a.completado).length;
  const porcentaje = totalActividades > 0 ? Math.round((completadas / totalActividades) * 100) : 0;

  const handleActivarNotificaciones = async () => {
    const res = await solicitarPermisoNotificaciones();
    setNotifPerm(res);
    if (res === 'granted') {
      simularAlertaPrueba(actividades.find((a) => a.alerta10Min));
    }
  };

  const handleProbarAlerta = () => {
    const actConAlerta = actividades.find((a) => a.alerta10Min) || actividades[0];
    simularAlertaPrueba(actConAlerta);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // Formato bonito de hora
  const horaFormateada = horaActual.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="px-5 lg:px-8 pt-5 pb-4 border-b border-rose-950/40 bg-dark-900/90 backdrop-blur-md sticky top-0 z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        {/* Logo, título y selector de modo en Desktop */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-900/40 border border-rose-500/30 flex items-center justify-center shadow-rose-glow flex-shrink-0">
            <Cat className="w-5 h-5 text-rose-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Jos Rutina
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              </h1>
            </div>
            <p className="text-[11px] text-rose-200/60 font-medium">
              Planificador Diario y Semanal
            </p>
          </div>

          {/* Selector de modo para PC (Día vs Semana) */}
          {!isPhoneFrame && (
            <div className="hidden sm:flex items-center bg-dark-950 p-1 rounded-2xl border border-white/5 ml-3">
              <button
                onClick={() => setVistaModo('dia')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  vistaModo === 'dia'
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Vista Día & Enfoque</span>
              </button>
              <button
                onClick={() => setVistaModo('semana')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  vistaModo === 'semana'
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Semana Completa (7 días)</span>
              </button>
            </div>
          )}
        </div>

        {/* Acciones de la cabecera */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Botón Nueva Tarea en Desktop */}
          {!isPhoneFrame && (
            <button
              onClick={onOpenNewActivity}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-dark-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nueva Tarea</span>
            </button>
          )}

          {/* Botón Instalar App (si está disponible) */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              title="Instalar como app en tu computadora"
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-dark-950 font-bold text-xs flex items-center gap-1 shadow-rose-glow animate-pulse"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[11px]">Instalar</span>
            </button>
          )}

          {/* Botón probar alerta */}
          <button
            onClick={handleProbarAlerta}
            title="Probar sonido y alerta 10 min antes"
            className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-rose-300/80 hover:text-rose-200 border border-rose-500/20 transition-all flex items-center gap-1.5 text-xs"
          >
            <Bell className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline text-xs font-medium">Probar Alerta</span>
          </button>

          {/* Botón permisos notificaciones */}
          {notifPerm !== 'granted' && (
            <button
              onClick={handleActivarNotificaciones}
              title="Activar notificaciones del sistema"
              className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all text-xs flex items-center gap-1"
            >
              <Volume2 className="w-4 h-4 text-rose-400" />
            </button>
          )}

          {/* Estadísticas / Ajustes */}
          <button
            onClick={onOpenStats}
            title="Estadísticas y Respaldo"
            className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-rose-500/30 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-rose-300/80" />
          </button>

          {/* Switch de modo Marco Móvil / Monitor PC */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            title={isPhoneFrame ? 'Agrandar para Monitor PC' : 'Vista compacta de celular'}
            className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-rose-300/80 hover:text-rose-200 border border-rose-500/20 transition-all hidden md:flex items-center gap-1 text-xs"
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="w-4 h-4 text-rose-400" />
                <span className="text-[11px] font-medium">Modo Monitor</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span className="text-[11px] font-medium">Modo Celular</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reloj y Progreso del día */}
      <div className="bg-dark-850/80 rounded-2xl p-3.5 border border-rose-500/10 shadow-card-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2.5">
            <span className="text-xl lg:text-2xl font-bold font-mono tracking-tight text-rose-100">
              {horaFormateada}
            </span>
            <span className="text-xs text-rose-300/80 font-semibold capitalize">
              {diaSeleccionado.nombre}
            </span>
            {diaSeleccionado.subtitulo && (
              <span className="hidden lg:inline text-xs text-neutral-400 font-medium">
                • {diaSeleccionado.subtitulo}
              </span>
            )}
          </div>

          <div className="text-right flex items-center gap-2">
            <span className="text-xs lg:text-sm font-semibold text-rose-300">
              {completadas} de {totalActividades} completadas
            </span>
            <span className="text-xs text-neutral-400 font-mono">({porcentaje}%)</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-dark-950 rounded-full h-2.5 overflow-hidden border border-white/5 relative">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-rose-400 to-rose-300 transition-all duration-500 rounded-full"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, Smartphone, Monitor, BarChart3, Volume2, Cat } from 'lucide-react';
import { solicitarPermisoNotificaciones, simularAlertaPrueba } from '../services/notificationService';

export default function Header({
  diaSeleccionado,
  actividades,
  isPhoneFrame,
  setIsPhoneFrame,
  onOpenStats,
  onOpenNewActivity,
}) {
  const [horaActual, setHoraActual] = useState(new Date());
  const [notifPerm, setNotifPerm] = useState('default');

  useEffect(() => {
    const timer = setInterval(() => setHoraActual(new Date()), 1000);
    if ('Notification' in window) {
      setNotifPerm(Notification.permission);
    }
    return () => clearInterval(timer);
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

  // Formato bonito de hora
  const horaFormateada = horaActual.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="px-5 pt-6 pb-4 border-b border-rose-950/40 bg-dark-900/90 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Logo y título */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-900/40 border border-rose-500/30 flex items-center justify-center shadow-rose-glow">
            <Cat className="w-5 h-5 text-rose-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Jos Rutina
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
              </h1>
            </div>
            <p className="text-[11px] text-rose-200/60 font-medium">Planificador Diario Dinámico</p>
          </div>
        </div>

        {/* Acciones de la cabecera */}
        <div className="flex items-center gap-1.5">
          {/* Botón probar alerta */}
          <button
            onClick={handleProbarAlerta}
            title="Probar sonido y alerta 10 min antes"
            className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-rose-300/80 hover:text-rose-200 border border-rose-500/20 transition-all flex items-center gap-1 text-xs"
          >
            <Bell className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline text-[11px] font-medium">Probar Alerta</span>
          </button>

          {/* Botón permisos notificaciones */}
          {notifPerm !== 'granted' && (
            <button
              onClick={handleActivarNotificaciones}
              title="Activar notificaciones del sistema"
              className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all text-xs flex items-center gap-1"
            >
              <Volume2 className="w-4 h-4 text-rose-400" />
            </button>
          )}

          {/* Estadísticas / Ajustes */}
          <button
            onClick={onOpenStats}
            title="Estadísticas y Respaldo"
            className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-rose-500/30 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-rose-300/80" />
          </button>

          {/* Switch de modo Marco Móvil / Pantalla Completa */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            title={isPhoneFrame ? "Ver en pantalla completa" : "Ver en marco de celular"}
            className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-400 hover:text-rose-300 border border-neutral-800 transition-all hidden md:flex"
          >
            {isPhoneFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Reloj y Progreso del día */}
      <div className="bg-dark-850/80 rounded-2xl p-3.5 border border-rose-500/10 shadow-card-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tracking-tight text-rose-100">
              {horaFormateada}
            </span>
            <span className="text-xs text-rose-300/60 font-medium capitalize">
              {diaSeleccionado.nombre}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-rose-300">
              {completadas}/{totalActividades} completadas
            </span>
            <span className="text-[11px] text-neutral-400 ml-1.5">({porcentaje}%)</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-dark-950 rounded-full h-2.5 overflow-hidden border border-white/5 relative">
          <div
            className="h-full bg-gradient-to-r from-rose-500/80 via-rose-400 to-rose-300 transition-all duration-500 rounded-full"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    </header>
  );
}

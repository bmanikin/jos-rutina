import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import DaySelector from './components/DaySelector';
import ActivityCard from './components/ActivityCard';
import ActivityDetailModal from './components/ActivityDetailModal';
import ActivityFormModal from './components/ActivityFormModal';
import NotificationToast from './components/NotificationToast';
import StatsModal from './components/StatsModal';
import { DIAS, CATEGORIAS_CONFIG } from './data/seedData';
import {
  getDiaActualId,
  getFechaHoyStr,
  getActividadesPorDia,
  toggleActividadCompletada,
  toggleChecklistItem,
  upsertActividad,
  eliminarActividad,
  cargarActividadesBase,
} from './services/storageService';
import { verificarAlertasProximas } from './services/notificationService';
import { Plus, Filter, Sparkles, Calendar, CheckCheck, Clock } from 'lucide-react';

export default function App() {
  const hoyId = useMemo(() => getDiaActualId(), []);
  const [diaSeleccionadoId, setDiaSeleccionadoId] = useState(hoyId);
  const [actividades, setActividades] = useState([]);
  const [actividadDetalle, setActividadDetalle] = useState(null);
  const [actividadEditar, setActividadEditar] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [horaMinutoActual, setHoraMinutoActual] = useState('');

  // Cargar actividades cuando cambia el día seleccionado
  const recargarActividades = () => {
    const list = getActividadesPorDia(diaSeleccionadoId);
    setActividades(list);

    // Si hay un modal de detalle abierto, actualizarlo también
    if (actividadDetalle) {
      const actualizada = list.find((a) => a.id === actividadDetalle.id);
      if (actualizada) {
        setActividadDetalle(actualizada);
      }
    }
  };

  useEffect(() => {
    recargarActividades();
  }, [diaSeleccionadoId]);

  // Actualizar hora en minutos para chequear la actividad "En curso" y disparar alertas 10 min antes
  useEffect(() => {
    const actualizarRelojYAlertas = () => {
      const ahora = new Date();
      const h = String(ahora.getHours()).padStart(2, '0');
      const m = String(ahora.getMinutes()).padStart(2, '0');
      setHoraMinutoActual(`${h}:${m}`);

      // Verificar alertas solo sobre las actividades del día actual de hoy
      const actividadesHoy = getActividadesPorDia(hoyId);
      verificarAlertasProximas(actividadesHoy);
    };

    actualizarRelojYAlertas();
    const interval = setInterval(actualizarRelojYAlertas, 30000); // Cada 30 seg
    return () => clearInterval(interval);
  }, [hoyId]);

  // Día seleccionado objeto
  const diaSeleccionado = DIAS.find((d) => d.id === diaSeleccionadoId) || DIAS[0];

  // Identificar si una tarea está en curso en este momento
  const esActividadEnCurso = (actividad) => {
    if (diaSeleccionadoId !== hoyId || !horaMinutoActual) return false;
    return (
      horaMinutoActual >= actividad.horaInicio &&
      horaMinutoActual < actividad.horaFin
    );
  };

  // Filtrado de actividades por categoría
  const actividadesFiltradas = useMemo(() => {
    if (filtroCategoria === 'Todas') return actividades;
    return actividades.filter((a) => a.categoria === filtroCategoria);
  }, [actividades, filtroCategoria]);

  // Handlers
  const handleToggleCompletado = (actividadId) => {
    toggleActividadCompletada(actividadId);
    recargarActividades();
  };

  const handleToggleSubtask = (actividadId, subtaskId) => {
    toggleChecklistItem(actividadId, subtaskId);
    recargarActividades();
  };

  const handleAddSubtask = (actividadId, texto) => {
    const todas = cargarActividadesBase();
    const act = todas.find((a) => a.id === actividadId);
    if (!act) return;

    const nueva = {
      id: `sub-${Date.now()}`,
      texto,
      completado: false,
    };

    const updated = {
      ...act,
      detalleChecklist: [...(act.detalleChecklist || []), nueva],
    };

    upsertActividad(updated);
    recargarActividades();
  };

  const handleSaveActividad = (actData) => {
    upsertActividad(actData);
    recargarActividades();
  };

  const handleEliminarActividad = (actividadId) => {
    if (window.confirm('¿Segura/o de que deseas eliminar esta actividad?')) {
      eliminarActividad(actividadId);
      setActividadDetalle(null);
      recargarActividades();
    }
  };

  const handleOpenActivityById = (id) => {
    const found = actividades.find((a) => a.id === id);
    if (found) {
      setActividadDetalle(found);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-neutral-100 flex flex-col items-center justify-start sm:py-6 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Toast de Alerta 10 min antes */}
      <NotificationToast onOpenActivityById={handleOpenActivityById} />

      {/* Contenedor principal: Envoltorio para modo Marco Móvil o Responsive */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-[430px] min-h-[92vh] sm:rounded-[42px] border sm:border-rose-500/25 shadow-2xl shadow-rose-950/20 bg-dark-950 overflow-hidden relative sm:my-2 ring-1 ring-white/10'
            : 'max-w-2xl min-h-screen bg-dark-950 sm:border-x sm:border-rose-950/40'
        }`}
      >
        {/* Cabecera con reloj, progreso y acciones */}
        <Header
          diaSeleccionado={diaSeleccionado}
          actividades={actividades}
          isPhoneFrame={isPhoneFrame}
          setIsPhoneFrame={setIsPhoneFrame}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenNewActivity={() => {
            setActividadEditar(null);
            setIsFormOpen(true);
          }}
        />

        {/* Selector horizontal de días (Lunes a Domingo) */}
        <DaySelector
          diaSeleccionadoId={diaSeleccionadoId}
          onSelectDia={(id) => setDiaSeleccionadoId(id)}
        />

        {/* Barra de Filtros por Categoría */}
        <div className="px-4 py-2.5 bg-dark-900/40 flex items-center gap-1.5 overflow-x-auto smooth-scroll border-b border-white/5">
          <button
            onClick={() => setFiltroCategoria('Todas')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
              filtroCategoria === 'Todas'
                ? 'bg-rose-500/25 text-rose-200 border-rose-500/40 shadow-sm'
                : 'bg-dark-850 text-neutral-400 border-white/5 hover:text-white'
            }`}
          >
            Todas ({actividades.length})
          </button>

          {Object.keys(CATEGORIAS_CONFIG).map((catName) => {
            const conf = CATEGORIAS_CONFIG[catName];
            const isSelected = filtroCategoria === catName;
            const count = actividades.filter((a) => a.categoria === catName).length;
            if (count === 0) return null;

            return (
              <button
                key={catName}
                onClick={() => setFiltroCategoria(catName)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? `${conf.badgeBg} ${conf.badgeText} ${conf.badgeBorder} shadow-sm`
                    : 'bg-dark-850 text-neutral-400 border-white/5 hover:text-white'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: conf.colorHex }}
                />
                <span>{catName}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Subtítulo del día / Excepciones */}
        {diaSeleccionado.subtitulo && (
          <div className="px-5 py-2 bg-rose-950/20 border-b border-rose-500/10 flex items-center justify-between text-xs text-rose-300/80">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              {diaSeleccionado.subtitulo}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              {actividadesFiltradas.length} actividades
            </span>
          </div>
        )}

        {/* Lista Vertical de Actividades ordenada cronológicamente */}
        <main className="flex-1 p-4 space-y-3 overflow-y-auto smooth-scroll pb-24">
          {actividadesFiltradas.length > 0 ? (
            actividadesFiltradas.map((actividad) => (
              <ActivityCard
                key={actividad.id}
                actividad={actividad}
                isEnCurso={esActividadEnCurso(actividad)}
                onToggleCompletado={handleToggleCompletado}
                onClickDetalles={() => setActividadDetalle(actividad)}
              />
            ))
          ) : (
            <div className="py-16 text-center text-neutral-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-rose-400/30" />
              <p className="text-sm font-semibold text-neutral-300">No hay actividades en esta vista</p>
              <p className="text-xs text-neutral-500 mt-1">
                Puedes cambiar el filtro o añadir una actividad personalizada con el botón inferior.
              </p>
            </div>
          )}
        </main>

        {/* Botón Flotante para Añadir Actividad (FAB) */}
        <div className="sticky bottom-4 left-0 right-0 px-5 flex justify-end pointer-events-none z-10">
          <button
            onClick={() => {
              setActividadEditar(null);
              setIsFormOpen(true);
            }}
            className="pointer-events-auto p-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-dark-950 font-bold shadow-lg shadow-rose-950/60 border border-rose-400/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="text-xs tracking-wide">Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* Modal de Vista de Detalles */}
      <ActivityDetailModal
        actividad={actividadDetalle}
        diaNombre={diaSeleccionado.nombre}
        isOpen={!!actividadDetalle}
        onClose={() => setActividadDetalle(null)}
        onToggleCompletado={handleToggleCompletado}
        onToggleSubtask={handleToggleSubtask}
        onAddSubtask={handleAddSubtask}
        onEditActividad={(act) => {
          upsertActividad(act);
          recargarActividades();
        }}
        onEliminarActividad={handleEliminarActividad}
      />

      {/* Modal para Crear / Editar Actividad */}
      <ActivityFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setActividadEditar(null);
        }}
        onSave={handleSaveActividad}
        diaDefaultId={diaSeleccionadoId}
        actividadEditar={actividadEditar}
      />

      {/* Modal de Estadísticas y Respaldo */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        onDataChanged={recargarActividades}
      />
    </div>
  );
}

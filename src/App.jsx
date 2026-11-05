import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import DaySelector from './components/DaySelector';
import ActivityCard from './components/ActivityCard';
import ActivityDetailModal from './components/ActivityDetailModal';
import ActivityFormModal from './components/ActivityFormModal';
import NotificationToast from './components/NotificationToast';
import StatsModal from './components/StatsModal';
import DesktopSidePanel from './components/DesktopSidePanel';
import WeekView from './components/WeekView';
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
import { Plus, Filter, Sparkles, Calendar, CheckCheck, Clock, Layers } from 'lucide-react';

export default function App() {
  const hoyId = useMemo(() => getDiaActualId(), []);
  const [diaSeleccionadoId, setDiaSeleccionadoId] = useState(hoyId);
  const [actividades, setActividades] = useState([]);
  const [actividadDetalle, setActividadDetalle] = useState(null);
  const [actividadEditar, setActividadEditar] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  
  // En pantallas grandes (PC/Monitores), iniciar por defecto en vista completa de escritorio
  const [isPhoneFrame, setIsPhoneFrame] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Modo de vista en PC: 'dia' (Dashboard con panel lateral) o 'semana' (Calendario 7 columnas)
  const [vistaModo, setVistaModo] = useState('dia');
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

      // Verificar alertas sobre actividades del día actual
      const actividadesHoy = getActividadesPorDia(hoyId);
      verificarAlertasProximas(actividadesHoy);
    };

    actualizarRelojYAlertas();
    const interval = setInterval(actualizarRelojYAlertas, 30000); // Cada 30 seg
    return () => clearInterval(interval);
  }, [hoyId]);

  // Día seleccionado objeto
  const diaSeleccionado = DIAS.find((d) => d.id === diaSeleccionadoId) || DIAS[0];

  // Actividades del día de hoy (para panel de enfoque lateral)
  const actividadesHoy = useMemo(() => getActividadesPorDia(hoyId), [actividades, hoyId]);

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

      {/* Contenedor principal: Envoltorio para modo Marco Móvil o Pantalla Monitor PC */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-[430px] min-h-[92vh] sm:rounded-[42px] border sm:border-rose-500/25 shadow-2xl shadow-rose-950/20 bg-dark-950 overflow-hidden relative sm:my-2 ring-1 ring-white/10'
            : 'max-w-7xl min-h-screen lg:px-6'
        }`}
      >
        {/* Cabecera con reloj, progreso y acciones adaptables a PC */}
        <Header
          diaSeleccionado={diaSeleccionado}
          actividades={actividades}
          isPhoneFrame={isPhoneFrame}
          setIsPhoneFrame={setIsPhoneFrame}
          vistaModo={vistaModo}
          setVistaModo={setVistaModo}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenNewActivity={() => {
            setActividadEditar(null);
            setIsFormOpen(true);
          }}
        />

        {/* =========================================================================
            VISTA SEMANA COMPLETA (7 columnas para monitores de escritorio)
           ========================================================================= */}
        {!isPhoneFrame && vistaModo === 'semana' ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-400" />
                  Horario y Rutina Semanal Completa
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Visualiza tus 7 días simultáneamente con todos tus horarios y excepciones.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActividadEditar(null);
                    setIsFormOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-dark-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Añadir Actividad</span>
                </button>
              </div>
            </div>

            <WeekView
              hoyId={hoyId}
              horaMinutoActual={horaMinutoActual}
              onOpenDetalles={(act) => setActividadDetalle(act)}
              onToggleCompletado={handleToggleCompletado}
              onAddNewToDay={(diaId) => {
                setDiaSeleccionadoId(diaId);
                setActividadEditar(null);
                setIsFormOpen(true);
              }}
            />
          </div>
        ) : (
          /* =========================================================================
             VISTA DÍA (Móvil o Desktop con Panel Lateral de Enfoque)
             ========================================================================= */
          <div
            className={`flex-1 ${
              !isPhoneFrame
                ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 p-6'
                : 'flex flex-col'
            }`}
          >
            {/* Columna Principal: Día Seleccionado y Lista Cronológica */}
            <div className={!isPhoneFrame ? 'lg:col-span-7 xl:col-span-8 space-y-4' : 'flex-1 flex flex-col'}>
              {/* Selector horizontal de días (Lunes a Domingo) */}
              <DaySelector
                diaSeleccionadoId={diaSeleccionadoId}
                onSelectDia={(id) => setDiaSeleccionadoId(id)}
              />

              {/* Barra de Filtros por Categoría */}
              <div className="px-4 py-2.5 bg-dark-900/40 flex items-center gap-1.5 overflow-x-auto smooth-scroll border-b border-white/5 rounded-2xl">
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
                <div className="px-4 py-2.5 bg-rose-950/20 border border-rose-500/15 rounded-2xl flex items-center justify-between text-xs text-rose-300/90">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    {diaSeleccionado.subtitulo}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {actividadesFiltradas.length} actividades programadas
                  </span>
                </div>
              )}

              {/* Lista Vertical de Actividades ordenada cronológicamente */}
              <main className="space-y-3 overflow-y-auto smooth-scroll pb-16">
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
                  <div className="py-16 text-center text-neutral-500 bg-dark-900/40 rounded-3xl border border-white/5">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-rose-400/30" />
                    <p className="text-sm font-semibold text-neutral-300">
                      No hay actividades en esta vista
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Puedes cambiar el filtro o añadir una actividad personalizada con el botón de Nueva Tarea.
                    </p>
                  </div>
                )}
              </main>
            </div>

            {/* Columna Derecha para Pantallas de PC: Panel Lateral de Enfoque */}
            {!isPhoneFrame && (
              <div className="lg:col-span-5 xl:col-span-4">
                <DesktopSidePanel
                  hoyId={hoyId}
                  actividadesHoy={actividadesHoy}
                  horaMinutoActual={horaMinutoActual}
                  onToggleCompletado={handleToggleCompletado}
                  onToggleSubtask={handleToggleSubtask}
                  onOpenDetalles={(act) => setActividadDetalle(act)}
                  onOpenNewActivity={() => {
                    setActividadEditar(null);
                    setIsFormOpen(true);
                  }}
                  onOpenStats={() => setIsStatsOpen(true)}
                  onProbarAlerta={() => {
                    const actConAlerta = actividades.find((a) => a.alerta10Min) || actividades[0];
                    if (actConAlerta) {
                      setActividadDetalle(actConAlerta);
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Botón Flotante para Añadir Actividad (solo visible en modo móvil) */}
        {isPhoneFrame && (
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
        )}
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

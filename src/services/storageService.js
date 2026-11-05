import { DIAS, ACTIVIDADES_SEMILLA, CATEGORIAS_CONFIG } from '../data/seedData';

const STORAGE_KEYS = {
  ACTIVIDADES: 'jos_rutina_actividades_v1',
  COMPLETADOS_PREFIX: 'jos_rutina_completados_',
  NOTIFICACIONES_SETTINGS: 'jos_rutina_notif_config',
};

// Formato de fecha YYYY-MM-DD
export function getFechaHoyStr() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Obtener el día actual en formato id ('lunes', 'martes', etc.)
export function getDiaActualId() {
  const diaNum = new Date().getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const map = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado',
  };
  return map[diaNum] || 'lunes';
}

// Inicializar o cargar actividades base
export function cargarActividadesBase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVIDADES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVIDADES, JSON.stringify(ACTIVIDADES_SEMILLA));
      return ACTIVIDADES_SEMILLA;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : ACTIVIDADES_SEMILLA;
  } catch (e) {
    console.error('Error cargando actividades desde localStorage', e);
    return ACTIVIDADES_SEMILLA;
  }
}

// Guardar actividades base actualizadas
export function guardarActividadesBase(actividades) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVIDADES, JSON.stringify(actividades));
  } catch (e) {
    console.error('Error guardando actividades en localStorage', e);
  }
}

// Cargar estado de completados para una fecha específica (YYYY-MM-DD)
export function cargarEstadoFecha(fechaStr) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.COMPLETADOS_PREFIX}${fechaStr}`);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error cargando estado de fecha', e);
    return {};
  }
}

// Guardar estado de completados para una fecha específica
export function guardarEstadoFecha(fechaStr, estado) {
  try {
    localStorage.setItem(`${STORAGE_KEYS.COMPLETADOS_PREFIX}${fechaStr}`, JSON.stringify(estado));
  } catch (e) {
    console.error('Error guardando estado de fecha', e);
  }
}

// Obtener actividades enriquecidas con el estado de completado para un día y fecha
export function getActividadesPorDia(diaId, fechaStr = getFechaHoyStr()) {
  const actividadesBase = cargarActividadesBase();
  const estadoFecha = cargarEstadoFecha(fechaStr);

  return actividadesBase
    .filter((act) => act.diaId === diaId)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    .map((act) => {
      const actEstado = estadoFecha[act.id] || {};
      const checklistCompletados = actEstado.checklist || {};

      const subtasks = (act.detalleChecklist || []).map((sub) => ({
        ...sub,
        completado: checklistCompletados[sub.id] !== undefined
          ? checklistCompletados[sub.id]
          : false,
      }));

      // Si actEstado.completado está explícitamente definido, usarlo.
      // Si no, si todas las subtareas existen y están completas, considerarlo completo.
      let isCompleted = actEstado.completado !== undefined ? actEstado.completado : false;

      return {
        ...act,
        detalleChecklist: subtasks,
        completado: isCompleted,
      };
    });
}

// Cambiar estado completado de una actividad
export function toggleActividadCompletada(actividadId, fechaStr = getFechaHoyStr()) {
  const estadoFecha = cargarEstadoFecha(fechaStr);
  const actEstado = estadoFecha[actividadId] || { completado: false, checklist: {} };
  const nuevoCompletado = !actEstado.completado;

  // Si se marca como completa la actividad principal, también marcar todos sus subitems como completados
  const actividadesBase = cargarActividadesBase();
  const act = actividadesBase.find((a) => a.id === actividadId);
  const nuevoChecklist = { ...(actEstado.checklist || {}) };

  if (act && act.detalleChecklist) {
    act.detalleChecklist.forEach((sub) => {
      nuevoChecklist[sub.id] = nuevoCompletado;
    });
  }

  estadoFecha[actividadId] = {
    completado: nuevoCompletado,
    checklist: nuevoChecklist,
  };

  guardarEstadoFecha(fechaStr, estadoFecha);
  return estadoFecha[actividadId];
}

// Cambiar estado de una subtarea individual del checklist
export function toggleChecklistItem(actividadId, subtaskId, fechaStr = getFechaHoyStr()) {
  const estadoFecha = cargarEstadoFecha(fechaStr);
  const actEstado = estadoFecha[actividadId] || { completado: false, checklist: {} };
  const checklist = { ...(actEstado.checklist || {}) };

  checklist[subtaskId] = !checklist[subtaskId];

  // Verificar si todas las subtareas están ahora completadas
  const actividadesBase = cargarActividadesBase();
  const act = actividadesBase.find((a) => a.id === actividadId);
  let todasCompletas = false;

  if (act && act.detalleChecklist && act.detalleChecklist.length > 0) {
    todasCompletas = act.detalleChecklist.every((sub) => checklist[sub.id] === true);
  }

  estadoFecha[actividadId] = {
    completado: todasCompletas,
    checklist,
  };

  guardarEstadoFecha(fechaStr, estadoFecha);
  return estadoFecha[actividadId];
}

// Agregar o editar actividad
export function upsertActividad(actividadData) {
  const actividades = cargarActividadesBase();
  const index = actividades.findIndex((a) => a.id === actividadData.id);

  if (index >= 0) {
    actividades[index] = { ...actividades[index], ...actividadData };
  } else {
    const nuevoId = actividadData.id || `act-${Date.now()}`;
    actividades.push({ ...actividadData, id: nuevoId });
  }

  guardarActividadesBase(actividades);
  return actividades;
}

// Eliminar actividad
export function eliminarActividad(actividadId) {
  const actividades = cargarActividadesBase().filter((a) => a.id !== actividadId);
  guardarActividadesBase(actividades);
  return actividades;
}

// Restablecer a valores de fábrica / semilla
export function resetearSemilla() {
  localStorage.setItem(STORAGE_KEYS.ACTIVIDADES, JSON.stringify(ACTIVIDADES_SEMILLA));
  return ACTIVIDADES_SEMILLA;
}

// Exportar todos los datos a JSON
export function exportarDatosJSON() {
  const actividades = cargarActividadesBase();
  const keys = Object.keys(localStorage);
  const estados = {};

  keys.forEach((key) => {
    if (key.startsWith(STORAGE_KEYS.COMPLETADOS_PREFIX)) {
      try {
        estados[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {}
    }
  });

  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    actividades,
    estados,
  };

  return JSON.stringify(backup, null, 2);
}

// Importar datos desde JSON
export function importarDatosJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.actividades && Array.isArray(data.actividades)) {
      guardarActividadesBase(data.actividades);
    }
    if (data.estados && typeof data.estados === 'object') {
      Object.keys(data.estados).forEach((key) => {
        localStorage.setItem(key, JSON.stringify(data.estados[key]));
      });
    }
    return { exito: true };
  } catch (err) {
    return { exito: false, error: err.message };
  }
}

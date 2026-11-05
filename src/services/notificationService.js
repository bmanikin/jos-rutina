// Servicio de notificaciones y alertas 10 minutos antes

let audioCtx = null;

// Sonido sutil y elegante con Web Audio API (acorde rosa suave: F#5 y A5)
export function playAlertChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx = new AudioContext();
    }

    const now = audioCtx.currentTime;

    // Primer tono (armónico suave)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Segundo tono (campana rosa brillante)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.001, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.25, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.85);
  } catch (e) {
    console.warn('Audio no disponible o bloqueado por interacción previa del usuario', e);
  }
}

// Solicitar permisos de notificación web nativa
export async function solicitarPermisoNotificaciones() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (e) {
    return 'denied';
  }
}

// Disparar notificación de sistema
export function lanzarNotificacionNativa(titulo, cuerpo) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(titulo, {
        body: cuerpo,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'jos-rutina-alert',
      });
    } catch (e) {
      console.warn('Error enviando notificación nativa', e);
    }
  }
}

// Suscriptores para alertas in-app (Toast)
const listeners = new Set();

export function onAlertTriggered(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notificarListeners(alertaData) {
  listeners.forEach((cb) => {
    try {
      cb(alertaData);
    } catch (err) {
      console.error(err);
    }
  });
}

// Comprobar si falta ~10 minutos para alguna actividad con alerta
// Se ejecuta periódicamente
export function verificarAlertasProximas(actividadesDelDia) {
  const ahora = new Date();
  const horasActuales = ahora.getHours();
  const minutosActuales = ahora.getMinutes();
  const minutosHoy = horasActuales * 60 + minutosActuales;

  const fechaHoyStr = ahora.toISOString().split('T')[0];

  actividadesDelDia.forEach((act) => {
    if (!act.alerta10Min) return;

    // Convertir 'HH:mm' a minutos del día
    const [hStr, mStr] = act.horaInicio.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const minutosInicio = h * 60 + m;

    const diff = minutosInicio - minutosHoy;

    // Si la actividad comienza dentro de 9 a 10 minutos (o si está exactamente en la ventana de aviso)
    if (diff > 0 && diff <= 10) {
      const alertaKey = `alert_${fechaHoyStr}_${act.id}`;
      const yaDisparada = sessionStorage.getItem(alertaKey);

      if (!yaDisparada) {
        sessionStorage.setItem(alertaKey, 'true');

        // Lanzar sonido
        playAlertChime();

        // Lanzar notificación nativa
        lanzarNotificacionNativa(
          `🔔 En ${diff} min: ${act.titulo}`,
          `Comienza a las ${act.horaInicioDisplay}. Categoría: ${act.categoria}`
        );

        // Notificar al componente Toast de la app
        notificarListeners({
          id: act.id,
          titulo: act.titulo,
          horaDisplay: act.horaInicioDisplay,
          categoria: act.categoria,
          minutosRestantes: diff,
          checklist: act.detalleChecklist || [],
        });
      }
    }
  });
}

// Simular alerta de prueba para verificación inmediata
export function simularAlertaPrueba(actividadEjemplo) {
  playAlertChime();
  lanzarNotificacionNativa(
    `🔔 Recordatorio (Prueba): ${actividadEjemplo?.titulo || 'Skincare Noche'}`,
    `Tu actividad comienza en 10 minutos (${actividadEjemplo?.horaInicioDisplay || '09:30 p.m.'}).`
  );

  notificarListeners({
    id: actividadEjemplo?.id || 'test-1',
    titulo: actividadEjemplo?.titulo || 'Skincare Noche (+ Mascarilla de Avena)',
    horaDisplay: actividadEjemplo?.horaInicioDisplay || '09:30 p.m.',
    categoria: actividadEjemplo?.categoria || 'Cuidado Personal',
    minutosRestantes: 10,
    checklist: actividadEjemplo?.detalleChecklist || [
      { id: 't1', texto: 'Lavar con Cetaphil', completado: false },
      { id: 't2', texto: 'Aplicar Retinol CeraVe', completado: false },
    ],
  });
}

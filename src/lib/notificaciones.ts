import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CANAL_AVISOS = 'reportes';

// En Android el canal tiene que existir antes de pedir el permiso
// y antes de programar cualquier notificación.
export async function crearCanalAvisos() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_AVISOS, {
    name: 'Reportes',
    description: 'Avisos cuando se resuelve un reporte',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Programa el aviso para dentro de 10 segundos.
// Si el permiso está denegado no hace nada: el aviso igual queda en /avisos.
export async function programarAvisoResolucion(titulo: string) {
  const permiso = await Notifications.getPermissionsAsync();
  if (!permiso.granted) return;

  await crearCanalAvisos();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Reporte resuelto',
      body: `El reporte "${titulo}" ya está resuelto.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
    },
  });
}

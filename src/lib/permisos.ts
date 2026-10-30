import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

export type Recurso = 'camara' | 'ubicacion' | 'fotos' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

// Los permisos de Expo no son todos iguales, pero todos tienen estos campos.
export type Permiso = {
  status: string;
  granted: boolean;
  canAskAgain: boolean;
  accessPrivileges?: 'all' | 'limited' | 'none';
  android?: {
    accuracy?: 'fine' | 'coarse' | 'none';
    importance?: number;
    interruptionFilter?: number;
  };
  ios?: {
    accuracy?: 'full' | 'reduced';
    scope?: 'whenInUse' | 'always' | 'none';
    status?: string | number;
  };
};

export const INFO_PERMISO: Record<Recurso, { nombre: string; beneficio: string; aclaracion?: string }> = {
  camara: {
    nombre: 'Cámara',
    beneficio: 'Usamos tu cámara para leer el QR del aula y sacar la foto del desperfecto.',
  },
  ubicacion: {
    nombre: 'Ubicación',
    beneficio: 'Usamos tu ubicación para marcar en qué sector del edificio está el problema.',
  },
  fotos: {
    nombre: 'Fotos',
    beneficio: 'Usamos tus fotos para adjuntar la imagen del desperfecto al reporte.',
    aclaracion: 'Este permiso no se pide: la foto se elige con el selector del sistema.',
  },
  notificaciones: {
    nombre: 'Notificaciones',
    beneficio: 'Usamos tus notificaciones para avisarte cuando se resuelve el reporte que enviaste.',
  },
};

export function esRecurso(valor: string): valor is Recurso {
  return (
    valor === 'camara' ||
    valor === 'ubicacion' ||
    valor === 'fotos' ||
    valor === 'notificaciones'
  );
}

// Consulta el estado actual sin mostrar ningÃºn diÃ¡logo.
export async function consultarPermiso(recurso: Recurso): Promise<Permiso> {
  switch (recurso) {
    case 'camara':
      return await Camera.getCameraPermissionsAsync();
    case 'ubicacion':
      return await Location.getForegroundPermissionsAsync();
    case 'fotos':
      return await ImagePicker.getMediaLibraryPermissionsAsync();
    case 'notificaciones':
      return await Notifications.getPermissionsAsync();
  }
}

// Pide el permiso. AcÃ¡ el sistema puede mostrar el diÃ¡logo.
export async function pedirPermiso(recurso: Recurso): Promise<Permiso> {
  switch (recurso) {
    case 'camara':
      return await Camera.requestCameraPermissionsAsync();
    case 'ubicacion':
      return await Location.requestForegroundPermissionsAsync();
    case 'fotos':
      return await ImagePicker.requestMediaLibraryPermissionsAsync();
    case 'notificaciones':
      return await Notifications.requestPermissionsAsync();
  }
}

export function estadoDe(permiso: Permiso): EstadoPermiso {
  if (permiso.granted) return 'concedido';
  if (permiso.canAskAgain) return 'preguntable';
  return 'bloqueado';
}

export function estadoLegible(estado: EstadoPermiso) {
  switch (estado) {
    case 'cargando':
      return 'Consultando...';
    case 'concedido':
      return 'Concedido';
    case 'preguntable':
      return 'Preguntable';
    case 'bloqueado':
      return 'Bloqueado';
  }
}

// Devuelve el matiz del permiso cuando no es un "sí" completo.
export function matizDe(permiso: Permiso): string | null {
  if (permiso.accessPrivileges === 'limited') return 'Acceso limitado a fotos';
  if (permiso.android?.accuracy === 'coarse') return 'Ubicación aproximada';
  if (permiso.ios?.accuracy === 'reduced') return 'Ubicación aproximada';
  return null;
}

export async function abrirAjustes() {
  await Linking.openSettings();
}

export function rutaAjustes(recurso: Recurso) {
  const nombre = INFO_PERMISO[recurso].nombre;
  if (Platform.OS === 'ios') {
    return `Ajustes > Mantenimiento IPF > ${nombre}`;
  }
  return `Ajustes > Apps > Mantenimiento IPF > Permisos > ${nombre}`;
}



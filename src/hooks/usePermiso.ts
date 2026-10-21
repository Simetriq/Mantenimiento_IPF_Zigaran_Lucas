import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  abrirAjustes,
  consultarPermiso,
  estadoDe,
  matizDe,
  pedirPermiso,
  type EstadoPermiso,
  type Permiso,
  type Recurso,
} from '../lib/permisos';

// Hook que junta los cuatro estados de un permiso y las acciones que se pueden hacer.
export function usePermiso(recurso: Recurso) {
  const [respuesta, setRespuesta] = useState<Permiso | null>(null);

  const actualizar = useCallback(async () => {
    const actual = await consultarPermiso(recurso);
    setRespuesta(actual);
  }, [recurso]);

  useEffect(() => {
    void actualizar();

    // Cuando la persona vuelve de Ajustes, la app pasa a "active" y consultamos de nuevo.
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        void actualizar();
      }
    });

    return () => suscripcion.remove();
  }, [actualizar]);

  // Cuando la pantalla vuelve a estar visible (por ejemplo, al cerrar el modal
  // del permiso), consultamos de nuevo por si cambió.
  useFocusEffect(
    useCallback(() => {
      void actualizar();
    }, [actualizar])
  );

  const pedir = useCallback(async () => {
    const resultado = await pedirPermiso(recurso);
    setRespuesta(resultado);
    return resultado;
  }, [recurso]);

  const estado: EstadoPermiso = respuesta ? estadoDe(respuesta) : 'cargando';
  const parcial = respuesta ? matizDe(respuesta) : null;

  return {
    estado,
    parcial,
    respuesta,
    pedir,
    actualizar,
    abrirAjustes,
  };
}

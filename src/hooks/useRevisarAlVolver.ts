import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// Sirve para avisar cuando la app vuelve del segundo plano.
// Por ejemplo, cuando la persona va a Ajustes y vuelve.
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = anterior.current.match(/inactive|background/) !== null;
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });

    return () => suscripcion.remove();
  }, [revisar]);
}

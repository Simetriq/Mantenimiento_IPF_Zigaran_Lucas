import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Boton } from '../../components/Boton';
import { usePermiso } from '../../hooks/usePermiso';
import { estadoLegible } from '../../lib/permisos';
import { useReportes } from '../../lib/reportes';
import { SECTORES } from '../../lib/tipos';

export default function Ubicacion() {
  const router = useRouter();
  const { borrador, actualizarBorrador } = useReportes();
  const { estado, parcial, abrirAjustes } = usePermiso('ubicacion');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const continuarUbicacion = useRef(false);

  async function usarUbicacion() {
    if (estado === 'bloqueado') {
      setMensaje('El permiso de ubicación está bloqueado. Podés elegir el sector a mano.');
      return;
    }

    if (estado !== 'concedido') {
      continuarUbicacion.current = true;
      router.push({
        pathname: '/permisos/[recurso]',
        params: { recurso: 'ubicacion' },
      });
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const permiso = await Location.getForegroundPermissionsAsync();
      const aproximada =
        permiso.android?.accuracy === 'coarse' || permiso.ios?.accuracy === 'reduced';

      actualizarBorrador({
        ubicacion: {
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
          aproximada,
        },
        sector: '',
      });

      setMensaje(
        aproximada
          ? 'Guardamos la ubicación aproximada. No mostramos las coordenadas exactas.'
          : 'Listo, guardamos tus coordenadas.'
      );
    } catch {
      setMensaje('No pudimos obtener la ubicación. Probá otra vez o elegí el sector a mano.');
    } finally {
      setCargando(false);
    }
  }

  // Si veníamos de pedir el permiso y ya está concedido, leemos la ubicación.
  useEffect(() => {
    if (continuarUbicacion.current && estado === 'concedido') {
      continuarUbicacion.current = false;
      void usarUbicacion();
    }
  }, [estado]);

  function elegirSector(sector: string) {
    actualizarBorrador({ sector, ubicacion: null });
    setMensaje(`Guardamos el sector ${sector}.`);
  }

  function quitar() {
    actualizarBorrador({ sector: '', ubicacion: null });
    setMensaje('Quitamos la ubicación del reporte.');
  }

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Text style={estilos.titulo}>¿Dónde está el problema?</Text>
      <Text style={estilos.texto}>
        Podés usar tu ubicación actual o elegir el sector a mano. El reporte se puede cargar igual.
      </Text>

      <View style={estilos.tarjeta}>
        <Text style={estilos.estado}>Permiso de ubicación: {estadoLegible(estado)}</Text>
        {parcial ? <Text style={estilos.parcial}>{parcial}</Text> : null}
      </View>

      {borrador.ubicacion || borrador.sector ? (
        <View style={estilos.tarjeta}>
          <Text style={estilos.etiqueta}>Guardado en el reporte</Text>
          <Text style={estilos.valor}>
            {borrador.ubicacion
              ? borrador.ubicacion.aproximada
                ? 'Ubicación aproximada'
                : `Lat ${borrador.ubicacion.latitud.toFixed(5)}, Lng ${borrador.ubicacion.longitud.toFixed(5)}`
              : `Sector: ${borrador.sector}`}
          </Text>
          <Boton variante="secundario" titulo="Quitar" onPress={quitar} />
        </View>
      ) : null}

      <Boton
        titulo={cargando ? 'Buscando tu ubicación...' : 'Usar mi ubicación actual'}
        onPress={usarUbicacion}
        deshabilitado={cargando}
      />
      {cargando ? <ActivityIndicator color="#0f766e" /> : null}

      {estado === 'bloqueado' ? (
        <Boton variante="secundario" titulo="Abrir Ajustes" onPress={abrirAjustes} />
      ) : null}

      <View style={estilos.separador} />

      <Text style={estilos.subtitulo}>O elegí el sector a mano</Text>
      <View style={estilos.chips}>
        {SECTORES.map((sector) => {
          const elegido = borrador.sector === sector;
          return (
            <Pressable
              key={sector}
              onPress={() => elegirSector(sector)}
              style={[estilos.chip, elegido && estilos.chipElegido]}
            >
              <Text style={[estilos.chipTexto, elegido && estilos.chipTextoElegido]}>
                {sector}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mensaje ? <Text style={estilos.mensaje}>{mensaje}</Text> : null}

      <Boton variante="secundario" titulo="Volver al formulario" onPress={() => router.back()} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  contenido: {
    padding: 20,
    gap: 12,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  texto: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  estado: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f766e',
  },
  parcial: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b45309',
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  valor: {
    fontSize: 15,
    color: '#0f172a',
  },
  separador: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  chipElegido: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  chipTexto: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextoElegido: {
    color: '#ffffff',
  },
  mensaje: {
    fontSize: 13,
    color: '#b45309',
  },
});

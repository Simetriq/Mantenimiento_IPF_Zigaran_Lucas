import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Boton } from '../components/Boton';
import { usePermiso } from '../hooks/usePermiso';
import { crearCanalAvisos } from '../lib/notificaciones';
import { estadoLegible, rutaAjustes } from '../lib/permisos';
import { useReportes } from '../lib/reportes';

export default function AjustesApp() {
  const router = useRouter();
  const { avisosActivados, setAvisosActivados } = useReportes();
  const notificaciones = usePermiso('notificaciones');
  const [mensaje, setMensaje] = useState('');
  const activarAlVolver = useRef(false);

  const activado = avisosActivados && notificaciones.estado === 'concedido';

  // Si la persona volvió del modal con el permiso concedido, prendemos el interruptor.
  useEffect(() => {
    if (activarAlVolver.current && notificaciones.estado === 'concedido') {
      activarAlVolver.current = false;
      setAvisosActivados(true);
    }
  }, [notificaciones.estado, setAvisosActivados]);

  async function cambiar(valor: boolean) {
    if (!valor) {
      setAvisosActivados(false);
      setMensaje('Listo, no te programamos más avisos.');
      return;
    }

    setMensaje('');

    // En Android el canal tiene que existir antes de pedir el permiso.
    await crearCanalAvisos();

    if (notificaciones.estado === 'concedido') {
      setAvisosActivados(true);
      return;
    }

    if (notificaciones.estado === 'bloqueado') {
      setMensaje('Las notificaciones están bloqueadas. Habilitalas desde los Ajustes del sistema.');
      return;
    }

    activarAlVolver.current = true;
    router.push({
      pathname: '/permisos/[recurso]',
      params: { recurso: 'notificaciones' },
    });
  }

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.tarjeta}>
        <View style={estilos.fila}>
          <View style={estilos.textos}>
            <Text style={estilos.titulo}>Avisarme cuando se resuelva mi reporte</Text>
            <Text style={estilos.detalle}>
              Te mandamos una notificación cuando se resuelve un reporte que enviaste.
            </Text>
          </View>
          <Switch
            value={activado}
            onValueChange={cambiar}
            trackColor={{ false: '#cbd5e1', true: '#0f766e' }}
          />
        </View>

        <Text style={estilos.estado}>
          Permiso de notificaciones: {estadoLegible(notificaciones.estado)}
        </Text>

        {notificaciones.estado === 'bloqueado' ? (
          <>
            <Text style={estilos.detalle}>Para habilitarlo andá a: {rutaAjustes('notificaciones')}</Text>
            <Boton titulo="Abrir Ajustes" onPress={notificaciones.abrirAjustes} />
          </>
        ) : null}
      </View>

      {mensaje ? <Text style={estilos.mensaje}>{mensaje}</Text> : null}

      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>¿Y si no me llegan las notificaciones?</Text>
        <Text style={estilos.detalle}>
          Todos los avisos quedan guardados en la pestaña Avisos, así que nunca perdés la novedad.
          Las notificaciones son un extra, no un requisito para usar la app.
        </Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  contenido: {
    padding: 16,
    gap: 12,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  detalle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
  },
  estado: {
    fontSize: 13,
    color: '#0f766e',
    fontWeight: '600',
  },
  mensaje: {
    fontSize: 13,
    color: '#b45309',
    paddingHorizontal: 4,
  },
});

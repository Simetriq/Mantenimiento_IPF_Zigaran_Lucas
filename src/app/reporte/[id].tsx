import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BadgeEstado } from '../../components/BadgeEstado';
import { Boton } from '../../components/Boton';
import { useReportes } from '../../lib/reportes';
import { nombreCategoria, type Reporte } from '../../lib/tipos';

function textoUbicacion(reporte: Reporte) {
  if (reporte.ubicacion) {
    if (reporte.ubicacion.aproximada) return 'Ubicación aproximada';
    return `Lat ${reporte.ubicacion.latitud.toFixed(5)}, Lng ${reporte.ubicacion.longitud.toFixed(5)}`;
  }
  if (reporte.sector) return `Sector: ${reporte.sector}`;
  return 'Sin ubicación';
}

export default function DetalleReporte() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { reportes, simularResolucion } = useReportes();
  const [mensaje, setMensaje] = useState('');

  const reporte = reportes.find((item) => item.id === String(id));

  if (!reporte) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.icono}>🔍</Text>
        <Text style={estilos.titulo}>No encontramos ese reporte</Text>
        <Text style={estilos.texto}>
          Puede que se haya borrado o que el id esté mal. Volvé a la lista y probá de nuevo.
        </Text>
        <Boton titulo="Volver a mis reportes" onPress={() => router.replace('/')} />
      </View>
    );
  }

  function simular() {
    if (!reporte) return;
    if (reporte.estado !== 'pendiente') return;
    simularResolucion(reporte.id);
    setMensaje('Listo. En 10 segundos el reporte pasa a resuelto y te llega el aviso.');
  }

  const resuelto = reporte.estado === 'resuelto';
  const enCurso = reporte.estado === 'en_curso';

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.filaTitulo}>
        <Text style={estilos.titulo}>{reporte.titulo}</Text>
        <BadgeEstado estado={reporte.estado} />
      </View>

      <Text style={estilos.subtitulo}>
        {reporte.aula} · {nombreCategoria(reporte.categoria)}
      </Text>

      <View style={estilos.tarjeta}>
        <Text style={estilos.etiqueta}>Descripción</Text>
        <Text style={estilos.valor}>{reporte.descripcion}</Text>
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.etiqueta}>Ubicación</Text>
        <Text style={estilos.valor}>{textoUbicacion(reporte)}</Text>
      </View>

      {reporte.foto ? (
        <View style={estilos.tarjeta}>
          <Text style={estilos.etiqueta}>Foto</Text>
          <Image source={{ uri: reporte.foto }} style={estilos.foto} />
        </View>
      ) : null}

      <Text style={estilos.fecha}>Creado el {reporte.creado}</Text>

      <Boton
        titulo={resuelto ? 'Ya está resuelto' : enCurso ? 'Resolviendo...' : 'Simular resolución'}
        onPress={simular}
        deshabilitado={resuelto || enCurso}
      />
      {mensaje ? <Text style={estilos.mensaje}>{mensaje}</Text> : null}

      <Text style={estilos.nota}>
        Si el reporte está resuelto, el aviso queda guardado en la pestaña Avisos.
      </Text>
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
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
    backgroundColor: '#f1f5f9',
  },
  icono: {
    fontSize: 40,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titulo: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitulo: {
    fontSize: 14,
    color: '#475569',
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
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
    lineHeight: 21,
  },
  foto: {
    height: 200,
    borderRadius: 10,
  },
  fecha: {
    fontSize: 12,
    color: '#94a3b8',
  },
  mensaje: {
    fontSize: 13,
    color: '#0f766e',
    fontWeight: '600',
  },
  nota: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  texto: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

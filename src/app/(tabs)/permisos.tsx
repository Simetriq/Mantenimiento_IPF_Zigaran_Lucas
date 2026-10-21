import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { usePermiso } from '../../hooks/usePermiso';
import {
  abrirAjustes,
  estadoLegible,
  INFO_PERMISO,
  type EstadoPermiso,
  type Recurso,
} from '../../lib/permisos';

const COLORES_ESTADO: Record<EstadoPermiso, string> = {
  cargando: '#64748b',
  concedido: '#15803d',
  preguntable: '#b45309',
  bloqueado: '#b91c1c',
};

export default function Permisos() {
  const router = useRouter();

  const camara = usePermiso('camara');
  const ubicacion = usePermiso('ubicacion');
  const fotos = usePermiso('fotos');
  const notificaciones = usePermiso('notificaciones');

  const filas: { recurso: Recurso; estado: EstadoPermiso; parcial: string | null }[] = [
    { recurso: 'camara', estado: camara.estado, parcial: camara.parcial },
    { recurso: 'ubicacion', estado: ubicacion.estado, parcial: ubicacion.parcial },
    { recurso: 'fotos', estado: fotos.estado, parcial: fotos.parcial },
    { recurso: 'notificaciones', estado: notificaciones.estado, parcial: notificaciones.parcial },
  ];

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.tarjetaPlataforma}>
        <Text style={estilos.etiqueta}>Plataforma detectada</Text>
        <Text style={estilos.plataforma}>{Platform.OS}</Text>
        <Text style={estilos.texto}>
          El estado se actualiza solo cuando volvés de los Ajustes del sistema.
        </Text>
      </View>

      {filas.map((fila) => {
        const info = INFO_PERMISO[fila.recurso];
        const noSePide = fila.recurso === 'fotos';

        return (
          <View key={fila.recurso} style={estilos.tarjeta}>
            <View style={estilos.filaTitulo}>
              <Text style={estilos.nombre}>{info.nombre}</Text>
              <Text style={[estilos.estado, { color: COLORES_ESTADO[fila.estado] }]}>
                {estadoLegible(fila.estado)}
              </Text>
            </View>

            {fila.parcial ? <Text style={estilos.parcial}>{fila.parcial}</Text> : null}

            <Text style={estilos.detalle}>{info.aclaracion ?? info.beneficio}</Text>

            {noSePide ? (
              <Text style={estilos.nota}>
                No aparece ningún diálogo de permiso porque usamos el selector del sistema.
              </Text>
            ) : fila.estado === 'preguntable' ? (
              <Boton
                titulo="Pedir permiso"
                onPress={() =>
                  router.push({
                    pathname: '/permisos/[recurso]',
                    params: { recurso: fila.recurso },
                  })
                }
              />
            ) : fila.estado === 'bloqueado' ? (
              <Boton variante="secundario" titulo="Abrir Ajustes" onPress={abrirAjustes} />
            ) : null}
          </View>
        );
      })}

      <Boton
        variante="secundario"
        titulo="Ajustes de la app"
        onPress={() => router.push('/ajustes-app')}
      />
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
  tarjetaPlataforma: {
    backgroundColor: '#0f766e',
    borderRadius: 14,
    padding: 16,
  },
  etiqueta: {
    color: '#99f6e4',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  plataforma: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  texto: {
    color: '#ccfbf1',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  estado: {
    fontSize: 13,
    fontWeight: '700',
  },
  parcial: {
    fontSize: 13,
    color: '#b45309',
    fontWeight: '600',
  },
  detalle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
  },
  nota: {
    fontSize: 12,
    color: '#0f766e',
    lineHeight: 18,
  },
});

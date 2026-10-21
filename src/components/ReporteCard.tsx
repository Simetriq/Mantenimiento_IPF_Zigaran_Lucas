import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeEstado } from './BadgeEstado';
import { nombreCategoria, type Reporte } from '../lib/tipos';

export function ReporteCard({ reporte }: { reporte: Reporte }) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
      onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: reporte.id } })}
    >
      <View style={estilos.fila}>
        <Text style={estilos.titulo} numberOfLines={1}>
          {reporte.titulo}
        </Text>
        <BadgeEstado estado={reporte.estado} />
      </View>

      <Text style={estilos.detalle}>
        {reporte.aula} · {nombreCategoria(reporte.categoria)}
      </Text>

      {reporte.foto ? <Image source={{ uri: reporte.foto }} style={estilos.foto} /> : null}

      <Text style={estilos.fecha}>{reporte.creado}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  presionada: {
    opacity: 0.85,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titulo: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  detalle: {
    marginTop: 6,
    fontSize: 14,
    color: '#475569',
  },
  foto: {
    marginTop: 10,
    height: 120,
    borderRadius: 10,
  },
  fecha: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
  },
});

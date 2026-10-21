import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EstadoVacio } from '../../components/EstadoVacio';
import { useReportes } from '../../lib/reportes';

export default function Avisos() {
  const { avisos } = useReportes();
  const router = useRouter();

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={avisos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={estilos.lista}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
            onPress={() =>
              router.push({ pathname: '/reporte/[id]', params: { id: item.reporteId } })
            }
          >
            <Text style={estilos.texto}>{item.texto}</Text>
            <Text style={estilos.fecha}>{item.fecha}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <EstadoVacio
            titulo="Sin avisos por ahora"
            texto="Cuando se resuelva un reporte vas a ver el aviso acá, aunque tengas las notificaciones desactivadas."
          />
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  lista: {
    padding: 16,
  },
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
  texto: {
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 21,
  },
  fecha: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
  },
});

import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { EstadoVacio } from '../../components/EstadoVacio';
import { ReporteCard } from '../../components/ReporteCard';
import { useReportes } from '../../lib/reportes';

export default function Inicio() {
  const { reportes, limpiarBorrador } = useReportes();
  const router = useRouter();

  function nuevoReporte() {
    limpiarBorrador();
    router.push('/reporte/nuevo');
  }

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={reportes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReporteCard reporte={item} />}
        contentContainerStyle={estilos.lista}
        ListHeaderComponent={
          reportes.length > 0 ? <Text style={estilos.tituloLista}>Reportes propios</Text> : null
        }
        ListEmptyComponent={
          <EstadoVacio
            titulo="Todavía no cargaste reportes"
            texto="Tocá en Nuevo reporte para avisar de una luz quemada, una canilla que pierde o un proyector roto."
          />
        }
      />

      <View style={estilos.pie}>
        <Boton titulo="Nuevo reporte" onPress={nuevoReporte} />
      </View>
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
    paddingBottom: 32,
  },
  tituloLista: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  pie: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
});

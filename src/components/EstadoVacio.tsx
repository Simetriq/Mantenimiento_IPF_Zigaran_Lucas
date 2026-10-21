import { StyleSheet, Text, View } from 'react-native';

type Props = {
  titulo: string;
  texto: string;
};

export function EstadoVacio({ titulo, texto }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.icono}>📭</Text>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  icono: {
    fontSize: 40,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  texto: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
    textAlign: 'center',
  },
});

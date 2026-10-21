import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'principal' | 'secundario' | 'peligro';
  deshabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Boton({ titulo, onPress, variante = 'principal', deshabilitado = false, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [
        estilos.base,
        variante === 'principal' && estilos.principal,
        variante === 'secundario' && estilos.secundario,
        variante === 'peligro' && estilos.peligro,
        deshabilitado && estilos.deshabilitado,
        pressed && !deshabilitado && estilos.presionado,
        style,
      ]}
    >
      <Text
        style={[
          estilos.texto,
          variante === 'secundario' && estilos.textoSecundario,
          variante === 'peligro' && estilos.textoPeligro,
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  principal: {
    backgroundColor: '#0f766e',
  },
  secundario: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  peligro: {
    backgroundColor: '#b91c1c',
  },
  deshabilitado: {
    opacity: 0.45,
  },
  presionado: {
    opacity: 0.75,
  },
  texto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  textoSecundario: {
    color: '#0f766e',
  },
  textoPeligro: {
    color: '#ffffff',
  },
});

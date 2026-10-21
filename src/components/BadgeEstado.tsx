import { StyleSheet, Text, View } from 'react-native';
import type { EstadoReporte } from '../lib/tipos';

const ESTADOS: Record<EstadoReporte, { texto: string; fondo: string; color: string }> = {
  pendiente: { texto: 'Pendiente', fondo: '#fef3c7', color: '#92400e' },
  en_curso: { texto: 'En curso', fondo: '#dbeafe', color: '#1d4ed8' },
  resuelto: { texto: 'Resuelto', fondo: '#dcfce7', color: '#15803d' },
};

export function BadgeEstado({ estado }: { estado: EstadoReporte }) {
  const dato = ESTADOS[estado];

  return (
    <View style={[estilos.badge, { backgroundColor: dato.fondo }]}>
      <Text style={[estilos.texto, { color: dato.color }]}>{dato.texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  texto: {
    fontSize: 12,
    fontWeight: '700',
  },
});

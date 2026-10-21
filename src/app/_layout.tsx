import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { ReportesProvider } from '../lib/reportes';

// Así se ven las notificaciones cuando la app está abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <ReportesProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f766e' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#f1f5f9' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="reporte/nuevo" options={{ title: 'Nuevo reporte' }} />
        <Stack.Screen name="reporte/escanear" options={{ title: 'Escanear el aula' }} />
        <Stack.Screen name="reporte/foto" options={{ title: 'Foto del desperfecto' }} />
        <Stack.Screen name="reporte/ubicacion" options={{ title: 'Ubicación del problema' }} />
        <Stack.Screen name="reporte/[id]" options={{ title: 'Detalle del reporte' }} />
        <Stack.Screen name="ajustes-app" options={{ title: 'Ajustes de la app' }} />
        <Stack.Screen
          name="permisos/[recurso]"
          options={{ presentation: 'modal', title: 'Permiso' }}
        />
      </Stack>
    </ReportesProvider>
  );
}

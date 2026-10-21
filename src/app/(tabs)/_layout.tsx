import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0f766e' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reportes',
          headerTitle: 'Mis reportes',
          tabBarIcon: () => <Text style={estilos.icono}>📋</Text>,
          headerRight: () => (
            <Pressable onPress={() => router.push('/ajustes-app')} hitSlop={8}>
              <Text style={estilos.ajustes}>Ajustes</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="avisos"
        options={{
          title: 'Avisos',
          tabBarIcon: () => <Text style={estilos.icono}>🔔</Text>,
        }}
      />
      <Tabs.Screen
        name="permisos"
        options={{
          title: 'Permisos',
          tabBarIcon: () => <Text style={estilos.icono}>🔐</Text>,
        }}
      />
    </Tabs>
  );
}

const estilos = StyleSheet.create({
  icono: {
    fontSize: 18,
  },
  ajustes: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 16,
  },
});

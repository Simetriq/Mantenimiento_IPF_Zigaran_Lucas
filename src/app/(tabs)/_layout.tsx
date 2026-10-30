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
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0', height: 56, paddingBottom: 6 },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reportes',
          headerTitle: 'Mis reportes',
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
        }}
      />
      <Tabs.Screen
        name="permisos"
        options={{
          title: 'Permisos',
        }}
      />
    </Tabs>
  );
}

const estilos = StyleSheet.create({
  ajustes: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 16,
  },
});

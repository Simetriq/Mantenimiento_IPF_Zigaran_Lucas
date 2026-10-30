import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { usePermiso } from '../../hooks/usePermiso';
import { esRecurso, INFO_PERMISO, rutaAjustes, type Recurso } from '../../lib/permisos';

export default function PantallaPermiso() {
  const { recurso } = useLocalSearchParams<{ recurso?: string }>();
  const router = useRouter();
  const [pidiendo, setPidiendo] = useState(false);

  const nombreRecurso = String(recurso ?? '');
  const recursoValido: Recurso = esRecurso(nombreRecurso) ? nombreRecurso : 'camara';
  const { estado, parcial, pedir, abrirAjustes } = usePermiso(recursoValido);

  function volver() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/permisos');
    }
  }

  async function continuar() {
    if (pidiendo) return;
    setPidiendo(true);
    const respuesta = await pedir();
    setPidiendo(false);
    if (respuesta.granted) {
      volver();
    }
  }

  if (!esRecurso(nombreRecurso)) {
    return (
      <View style={estilos.pantalla}>
        <Text style={estilos.titulo}>No conocemos ese permiso</Text>
        <Text style={estilos.texto}>El recurso "{nombreRecurso}" no está en la app.</Text>
        <Boton titulo="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  const info = INFO_PERMISO[recursoValido];

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: info.nombre }} />

      <Text style={estilos.titulo}>{info.nombre}</Text>
      <Text style={estilos.beneficio}>{info.beneficio}</Text>

      {estado === 'cargando' ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={estilos.texto}>Consultando el permiso...</Text>
        </View>
      ) : null}

      {estado === 'concedido' ? (
        <>
          {parcial ? <Text style={estilos.parcial}>{parcial}</Text> : null}
          <Text style={estilos.texto}>
            Ya está concedido. Podés cambiarlo cuando quieras desde los Ajustes del sistema.
          </Text>
          <Boton titulo="Continuar" onPress={volver} />
        </>
      ) : null}

      {estado === 'preguntable' ? (
        <>
          <Text style={estilos.texto}>
            El sistema te va a mostrar un diálogo. Podés cambiarlo después desde los Ajustes.
          </Text>
          <Boton titulo={pidiendo ? 'Pidiendo...' : 'Continuar'} onPress={continuar} deshabilitado={pidiendo} />
          {pidiendo ? <ActivityIndicator color="#0f766e" /> : null}
        </>
      ) : null}

      {estado === 'bloqueado' ? (
        <>
          <Text style={estilos.texto}>
            Bloqueaste este permiso para la app. Para habilitarlo andá a:
          </Text>
          <View style={estilos.camino}>
            <Text style={estilos.caminoTexto}>{rutaAjustes(recursoValido)}</Text>
          </View>
          <Text style={estilos.texto}>
            Después volvé a la app y tocá otra vez la función que necesita el permiso.
          </Text>
          <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
        </>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  contenido: {
    padding: 24,
    gap: 12,
  },
  icono: {
    fontSize: 44,
    textAlign: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  beneficio: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    textAlign: 'center',
  },
  texto: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    textAlign: 'center',
  },
  parcial: {
    fontSize: 13,
    color: '#b45309',
    fontWeight: '700',
    textAlign: 'center',
  },
  camino: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
  },
  caminoTexto: {
    fontSize: 13,
    color: '#0f172a',
    textAlign: 'center',
  },
  centro: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
});

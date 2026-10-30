import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Boton } from '../../components/Boton';
import { useRevisarAlVolver } from '../../hooks/useRevisarAlVolver';
import { useReportes } from '../../lib/reportes';

export default function Escanear() {
  const router = useRouter();
  const { actualizarBorrador } = useReportes();
  const [permiso, , consultarPermiso] = useCameraPermissions();
  const [codigo, setCodigo] = useState('');
  const yaEscaneo = useRef(false);

  // Cuando la persona vuelve de Ajustes, consultamos de nuevo el permiso.
  useRevisarAlVolver(consultarPermiso);

  // Cuando se cierra el modal del permiso, la pantalla vuelve a estar visible
  // y consultamos otra vez para ver si ya lo concedió.
  useFocusEffect(
    useCallback(() => {
      void consultarPermiso();
    }, [consultarPermiso])
  );

  function usarAula(aula: string) {
    if (yaEscaneo.current) return;
    yaEscaneo.current = true;
    actualizarBorrador({ aula: aula.trim().toUpperCase() });
    router.back();
  }

  if (!permiso) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={estilos.texto}>Preparando la cámara...</Text>
      </View>
    );
  }

  if (permiso.granted) {
    return (
      <View style={estilos.pantalla}>
        <View style={estilos.cajaCamara}>
          <CameraView
            style={estilos.camara}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => {
              if (data) usarAula(data);
            }}
          />
        </View>
        <View style={estilos.pieCamara}>
          <Text style={estilos.instruccion}>Apuntá al QR de la puerta del aula</Text>
          <Text style={estilos.ayuda}>El código se carga solo en el formulario.</Text>
        </View>
      </View>
    );
  }

  const bloqueado = !permiso.canAskAgain;

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Text style={estilos.titulo}>
        {bloqueado ? 'La cámara está bloqueada' : 'Necesitamos la cámara'}
      </Text>
      <Text style={estilos.texto}>
        La usamos solo para leer el QR del aula. No grabamos video ni audio.
      </Text>

      {bloqueado ? (
        <>
          <Text style={estilos.texto}>
            Habilitá la cámara desde los Ajustes del sistema y volvé a tocar el botón.
          </Text>
          <Boton titulo="Abrir Ajustes" onPress={() => Linking.openSettings()} />
        </>
      ) : (
        <>
          <Text style={estilos.texto}>
            El sistema te va a mostrar un diálogo. Después podés cambiarlo desde los Ajustes.
          </Text>
          <Boton
            titulo="Continuar"
            onPress={() => {
              router.push({
                pathname: '/permisos/[recurso]',
                params: { recurso: 'camara' },
              });
            }}
          />
        </>
      )}

      <View style={estilos.separador} />

      <Text style={estilos.subtitulo}>¿No podés usar la cámara?</Text>
      <Text style={estilos.texto}>Escribí el código del aula a mano y seguí con el reporte.</Text>
      <TextInput
        style={estilos.input}
        value={codigo}
        onChangeText={setCodigo}
        placeholder="Ej: AULA-12"
        placeholderTextColor="#94a3b8"
        autoCapitalize="characters"
      />
      <Boton
        variante="secundario"
        titulo="Usar este código"
        onPress={() => {
          if (codigo.trim()) usarAula(codigo);
        }}
        deshabilitado={codigo.trim() === ''}
      />
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
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    gap: 10,
    padding: 24,
  },
  icono: {
    fontSize: 44,
    textAlign: 'center',
  },
  titulo: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  texto: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    textAlign: 'center',
  },
  ayuda: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  cajaCamara: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  camara: {
    flex: 1,
  },
  pieCamara: {
    padding: 16,
    gap: 4,
  },
  instruccion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  separador: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
});

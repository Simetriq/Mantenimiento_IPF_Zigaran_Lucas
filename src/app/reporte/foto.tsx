import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { usePermiso } from '../../hooks/usePermiso';
import { useReportes } from '../../lib/reportes';

export default function Foto() {
  const router = useRouter();
  const { borrador, actualizarBorrador } = useReportes();
  const { estado, abrirAjustes } = usePermiso('camara');
  const [abriendo, setAbriendo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const continuarCamara = useRef(false);

  async function elegirDeGaleria() {
    setMensaje('');
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });

    if (!resultado.canceled) {
      actualizarBorrador({ foto: resultado.assets[0].uri });
      router.back();
    }
  }

  async function sacarFoto() {
    if (estado === 'cargando') return;

    if (estado !== 'concedido') {
      continuarCamara.current = true;
      router.push({
        pathname: '/permisos/[recurso]',
        params: { recurso: 'camara' },
      });
      return;
    }

    setMensaje('');
    setAbriendo(true);
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });
    setAbriendo(false);

    if (!resultado.canceled) {
      actualizarBorrador({ foto: resultado.assets[0].uri });
      router.back();
    }
  }

  // Si veníamos de pedir el permiso y ya está concedido, abrimos la cámara directo.
  useEffect(() => {
    if (continuarCamara.current && estado === 'concedido') {
      continuarCamara.current = false;
      void sacarFoto();
    }
  }, [estado]);

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Text style={estilos.titulo}>Adjuntar foto del desperfecto</Text>
      <Text style={estilos.texto}>
        Podés sacar la foto en el momento o elegir una que ya tengas en el teléfono.
      </Text>

      {borrador.foto ? (
        <Image source={{ uri: borrador.foto }} style={estilos.foto} />
      ) : (
        <View style={estilos.marcoVacio}>
          <Text style={estilos.marcoTexto}>Todavía no elegiste ninguna foto</Text>
        </View>
      )}

      <Boton
        titulo={abriendo ? 'Abriendo la cámara...' : 'Sacar foto'}
        onPress={sacarFoto}
        deshabilitado={abriendo}
      />
      {abriendo ? <ActivityIndicator color="#0f766e" /> : null}

      <Boton variante="secundario" titulo="Elegir de la galería" onPress={elegirDeGaleria} />
      <Text style={estilos.ayuda}>
        La galería se abre con el selector del sistema. Por eso la app no pide permiso de fotos.
      </Text>

      {estado === 'bloqueado' ? (
        <View style={estilos.aviso}>
          <Text style={estilos.avisoTexto}>
            La cámara está bloqueada, pero igual podés elegir una foto de la galería.
          </Text>
          <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
        </View>
      ) : null}

      {mensaje ? <Text style={estilos.mensaje}>{mensaje}</Text> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  contenido: {
    padding: 20,
    gap: 12,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  texto: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  foto: {
    height: 200,
    borderRadius: 14,
  },
  marcoVacio: {
    height: 180,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcoTexto: {
    fontSize: 13,
    color: '#94a3b8',
  },
  ayuda: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  aviso: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  avisoTexto: {
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 19,
  },
  mensaje: {
    fontSize: 13,
    color: '#b45309',
  },
});

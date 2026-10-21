import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Boton } from '../../components/Boton';
import { useReportes } from '../../lib/reportes';
import { CATEGORIAS } from '../../lib/tipos';

export default function NuevoReporte() {
  const router = useRouter();
  const { borrador, actualizarBorrador, crearReporte } = useReportes();
  const [error, setError] = useState('');

  function guardar() {
    if (borrador.titulo.trim().length < 3) {
      setError('Escribí un título de al menos 3 letras.');
      return;
    }
    if (borrador.descripcion.trim().length < 5) {
      setError('Contanos un poco más en la descripción.');
      return;
    }
    if (borrador.aula.trim() === '') {
      setError('Falta el aula. Podés escanear el QR o escribirla a mano.');
      return;
    }

    setError('');
    crearReporte();
    router.back();
  }

  function resumenUbicacion() {
    if (borrador.ubicacion) {
      if (borrador.ubicacion.aproximada) return 'Ubicación aproximada';
      return `Lat ${borrador.ubicacion.latitud.toFixed(5)}, Lng ${borrador.ubicacion.longitud.toFixed(5)}`;
    }
    if (borrador.sector) return `Sector: ${borrador.sector}`;
    return 'Sin ubicación todavía';
  }

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={estilos.etiqueta}>Título</Text>
      <TextInput
        style={estilos.input}
        value={borrador.titulo}
        onChangeText={(texto) => actualizarBorrador({ titulo: texto })}
        placeholder="Ej: Luz quemada en el pasillo"
        placeholderTextColor="#94a3b8"
      />

      <Text style={estilos.etiqueta}>Descripción</Text>
      <TextInput
        style={[estilos.input, estilos.inputMultilinea]}
        value={borrador.descripcion}
        onChangeText={(texto) => actualizarBorrador({ descripcion: texto })}
        placeholder="Contá qué pasa y desde cuándo"
        placeholderTextColor="#94a3b8"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text style={estilos.etiqueta}>Aula</Text>
      <TextInput
        style={estilos.input}
        value={borrador.aula}
        onChangeText={(texto) => actualizarBorrador({ aula: texto })}
        placeholder="Ej: AULA-12"
        placeholderTextColor="#94a3b8"
        autoCapitalize="characters"
      />
      <Boton
        variante="secundario"
        titulo="Escanear el QR del aula"
        onPress={() => router.push('/reporte/escanear')}
      />

      <Text style={estilos.etiqueta}>Categoría</Text>
      <View style={estilos.chips}>
        {CATEGORIAS.map((categoria) => {
          const elegida = borrador.categoria === categoria.valor;
          return (
            <Pressable
              key={categoria.valor}
              onPress={() => actualizarBorrador({ categoria: categoria.valor })}
              style={[estilos.chip, elegida && estilos.chipElegido]}
            >
              <Text style={[estilos.chipTexto, elegida && estilos.chipTextoElegido]}>
                {categoria.nombre}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={estilos.etiqueta}>Foto</Text>
      {borrador.foto ? (
        <>
          <Image source={{ uri: borrador.foto }} style={estilos.foto} />
          <Boton
            variante="secundario"
            titulo="Cambiar foto"
            onPress={() => router.push('/reporte/foto')}
          />
        </>
      ) : (
        <Boton
          variante="secundario"
          titulo="Adjuntar foto del desperfecto"
          onPress={() => router.push('/reporte/foto')}
        />
      )}

      <Text style={estilos.etiqueta}>Ubicación</Text>
      <Text style={estilos.resumen}>{resumenUbicacion()}</Text>
      <Boton
        variante="secundario"
        titulo="Marcar dónde está el problema"
        onPress={() => router.push('/reporte/ubicacion')}
      />

      {error ? <Text style={estilos.error}>{error}</Text> : null}

      <Boton titulo="Guardar reporte" onPress={guardar} style={estilos.guardar} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  contenido: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },
  etiqueta: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
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
  inputMultilinea: {
    minHeight: 100,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  chipElegido: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  chipTexto: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextoElegido: {
    color: '#ffffff',
  },
  foto: {
    height: 160,
    borderRadius: 12,
  },
  resumen: {
    fontSize: 14,
    color: '#475569',
    paddingVertical: 4,
  },
  error: {
    marginTop: 4,
    fontSize: 13,
    color: '#b91c1c',
    fontWeight: '600',
  },
  guardar: {
    marginTop: 16,
  },
});

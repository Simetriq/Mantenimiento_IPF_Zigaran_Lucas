# Mantenimiento IPF

App para que alumnos y docentes del Instituto Politécnico Formosa reporten desperfectos del edificio: una luz quemada, una canilla que pierde, un proyector roto. Cada reporte tiene su estado (pendiente, en curso, resuelto) y cuando se resuelve llega un aviso.

Está hecha con Expo SDK 57, TypeScript y Expo Router. Usa cámara (para leer el QR del aula), ubicación en primer plano, el selector de fotos del sistema y notificaciones locales. No usa `expo-permissions`.

## Cómo levantarla

Requisitos: Node 20 o superior, y Expo Go en el celular o un emulador de Android/iOS.

```bash
# dependencias
npm install

# arrancar en Expo Go (escaneás el QR con el celular)
npx expo start

# development build en Android (compila lo nativo)
npx expo run:android

# development build en iOS (solo en Mac)
npx expo run:ios

# volver a generar las carpetas nativas desde app.json
npx expo prebuild --clean
```

Los paquetes se instalaron con `npx expo install` para que queden en las versiones de SDK 57: `expo-camera`, `expo-location`, `expo-image-picker` y `expo-notifications`.

En Expo Go se puede probar casi todo (cámara, ubicación en primer plano, selector de fotos, notificaciones locales y el panel de permisos). Para ver los textos de propósito propios, `blockedPermissions` y las notificaciones andando como en producción hace falta la development build, porque Expo Go tiene su propio manifiesto e Info.plist y no los del proyecto.

## Rutas de la app

La app tiene que responder a estas URLs y quedan armadas así:

| URL | Archivo | Pantalla | Permiso |
| --- | --- | --- | --- |
| `/` | `src/app/(tabs)/index.tsx` | Lista de reportes propios y botón "Nuevo reporte" | Ninguno |
| `/reporte/nuevo` | `src/app/reporte/nuevo.tsx` | Formulario de reporte | Ninguno al abrir |
| `/reporte/escanear` | `src/app/reporte/escanear.tsx` | Lector de QR del aula | Cámara |
| `/reporte/foto` | `src/app/reporte/foto.tsx` | Sacar foto o elegir de la galería | Cámara solo para sacar |
| `/reporte/ubicacion` | `src/app/reporte/ubicacion.tsx` | Ubicación actual o sector a mano | Ubicación en primer plano |
| `/reporte/[id]` | `src/app/reporte/[id].tsx` | Detalle del reporte y "Simular resolución" | Ninguno |
| `/avisos` | `src/app/(tabs)/avisos.tsx` | Bandeja de avisos | Ninguno |
| `/permisos` | `src/app/(tabs)/permisos.tsx` | Estado de cada permiso | Ninguno |
| `/permisos/[recurso]` | `src/app/permisos/[recurso].tsx` | Pantalla previa al diálogo (modal) | El que se está pidiendo |
| `/ajustes-app` | `src/app/ajustes-app.tsx` | Interruptor de avisos | Notificaciones al activarlo |

### Árbol de carpetas de `src/app`

```text
src/
├── app/
│   ├── _layout.tsx              # Stack raíz y provider de reportes
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Barra de pestañas
│   │   ├── index.tsx            # "/"
│   │   ├── avisos.tsx           # "/avisos"
│   │   └── permisos.tsx         # "/permisos"
│   ├── ajustes-app.tsx          # "/ajustes-app"
│   ├── permisos/
│   │   └── [recurso].tsx        # "/permisos/[recurso]" - modal
│   └── reporte/
│       ├── nuevo.tsx            # "/reporte/nuevo"
│       ├── escanear.tsx         # "/reporte/escanear"
│       ├── foto.tsx             # "/reporte/foto"
│       ├── ubicacion.tsx        # "/reporte/ubicacion"
│       └── [id].tsx             # "/reporte/[id]"
├── components/
│   ├── BadgeEstado.tsx
│   ├── Boton.tsx
│   ├── EstadoVacio.tsx
│   └── ReporteCard.tsx
├── hooks/
│   ├── usePermiso.ts
│   └── useRevisarAlVolver.ts
└── lib/
    ├── notificaciones.ts
    ├── permisos.ts
    ├── reportes.tsx
    └── tipos.ts
```

El grupo `(tabs)` no aparece en la URL: sirve para que las tres pestañas compartan la barra de abajo. `[id]` y `[recurso]` son segmentos dinámicos: `/reporte/1750000000000` cae en `[id].tsx` y `/permisos/camara` cae en `[recurso].tsx`. La pantalla `permisos/[recurso]` está con `presentation: "modal"` en el `_layout.tsx`, por eso se abre como ventana arriba de la pantalla anterior.

## Cómo se piden los permisos

La lógica está en `src/lib/permisos.ts` y el hook en `src/hooks/usePermiso.ts`. El hook recibe el recurso (`camara`, `ubicacion`, `fotos` o `notificaciones`) y devuelve:

- `estado`: `'cargando' | 'concedido' | 'preguntable' | 'bloqueado'`.
- `parcial`: el matiz cuando el permiso no es un "sí" completo (acceso limitado a fotos o ubicación aproximada).
- `pedir()`: dispara el diálogo del sistema.
- `abrirAjustes()`: abre los ajustes de la app con `Linking.openSettings()`.
- `actualizar()`: vuelve a consultar el estado.

Cuando la app vuelve del segundo plano, el hook consulta de nuevo con `AppState`. Así, si la persona fue a Ajustes y habilitó el permiso, la pantalla se entera sin que haya que reiniciar nada.

Reglas que se respetan:

- Cada permiso se pide recién cuando se toca la función que lo necesita, nunca al abrir la app.
- Antes de cada diálogo del sistema se abre la pantalla previa `/permisos/[recurso]`, que explica el beneficio en una frase y tiene un único botón "Continuar". Sin "Ahora no" ni "Cerrar".
- Si el permiso está bloqueado (`canAskAgain: false`), esa misma pantalla muestra cómo habilitarlo en Ajustes y el botón pasa a ser "Abrir Ajustes".
- Si la persona dice que no, no se vuelve a insistir solo: la pantalla previa aparece únicamente cuando toca otra vez la función.
- Ningún permiso denegado impide cargar un reporte: cada función tiene su plan B (aula a mano, foto desde el selector, sector a mano, bandeja de avisos).

Los cuatro estados se ven en `/reporte/escanear` (cargando, cámara, explicación con "Continuar" y bloqueado con "Abrir Ajustes") y el detalle de cada permiso en `/permisos`.

## Tabla de permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se deniega |
| --- | --- | --- | --- |
| Cámara | `expo-camera` (escáner) y `expo-image-picker` (sacar foto) | Al tocar "Escanear el QR del aula" o "Sacar foto" | Escribir el código del aula a mano; para la foto, elegir de la galería |
| Ubicación | `expo-location` | Al tocar "Usar mi ubicación actual" en `/reporte/ubicacion` | Elegir el sector a mano (patio, estacionamiento, pasillo, etc.) |
| Fotos (galería) | `expo-image-picker` | No se pide: se usa el selector del sistema | No hace falta alternativa, el selector siempre está disponible |
| Notificaciones | `expo-notifications` | Solo al activar el interruptor "Avisarme cuando se resuelva mi reporte" en `/ajustes-app` | Bandeja `/avisos` dentro de la app |

La foto de la galería se elige con `ImagePicker.launchImageLibraryAsync`. La app no declara `READ_MEDIA_IMAGES` ni `READ_MEDIA_VIDEO` y tampoco pide permiso de galería. La foto de la cámara sí necesita permiso, porque usa la cámara del teléfono.

## Bloque plugins de app.json (comentado)

`app.json` es la fuente de verdad de lo nativo. Este es el bloque tal como está en el proyecto, con un comentario en cada parte:

```jsonc
{
  "expo": {
    "name": "Mantenimiento IPF",
    "slug": "mantenimiento-ipf",
    "scheme": "mantenimientoipf",
    "plugins": [
      // Expo Router: arma las rutas a partir de src/app.
      "expo-router",
      // Pantalla de carga con el color de la app.
      [
        "expo-splash-screen",
        {
          "image": "./assets/splash-icon.png",
          "imageWidth": 160,
          "backgroundColor": "#0f766e"
        }
      ],
      // Cámara: texto de propósito propio en iOS. Sin micrófono porque la app
      // no graba audio: apagamos el texto de iOS y el RECORD_AUDIO de Android.
      [
        "expo-camera",
        {
          "cameraPermission": "Usamos tu cámara para leer el QR del aula y sacar la foto del desperfecto.",
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      // Ubicación: solo en primer plano. No se configura segundo plano.
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Usamos tu ubicación para marcar en qué sector del edificio está el problema."
        }
      ],
      // Selector de fotos: no pide permiso de galería (photosPermission: false).
      // El texto de cámara es el mismo que el de expo-camera, para que no quede
      // el texto genérico de la librería.
      [
        "expo-image-picker",
        {
          "photosPermission": false,
          "cameraPermission": "Usamos tu cámara para leer el QR del aula y sacar la foto del desperfecto.",
          "microphonePermission": false
        }
      ],
      // Notificaciones locales: no llevan texto de propósito en iOS.
      "expo-notifications"
    ],
    "android": {
      "package": "com.ipf.mantenimientoipf",
      // Todo lo que la app no usa se saca del manifiesto final.
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    "ios": {
      "bundleIdentifier": "com.ipf.mantenimientoipf",
      "supportsTablet": true
    }
  }
}
```

Los textos de propósito cumplen el molde "Usamos tu [dato] para [beneficio concreto]". El de notificaciones no va en `app.json` porque iOS no tiene una clave de propósito para notificaciones: el diálogo lo arma el sistema con el nombre de la app.

## Mínimo privilegio: qué bloqueamos y por qué

En `android.blockedPermissions` quedan cuatro permisos que la app no usa:

- `RECORD_AUDIO`: `expo-camera` lo declara para poder grabar video con sonido. Esta app solo escanea QR y saca fotos, no graba audio. Se apaga también desde el plugin con `microphonePermission: false` y `recordAudioAndroid: false`.
- `SYSTEM_ALERT_WINDOW`: permite dibujar arriba de otras apps. No se usa; Expo lo agrega para herramientas de desarrollo, no para la app final.
- `READ_EXTERNAL_STORAGE` y `WRITE_EXTERNAL_STORAGE`: los declara `expo-image-picker` para Android 12 o anterior. Acá la foto se elige con el selector del sistema, que entrega solo el archivo elegido, así que la app no necesita leer el almacenamiento.

El permiso de cámara **no** se bloquea: se usa para el escáner. En `expo-image-picker` el `cameraPermission` va con texto y no en `false`, porque si se pone en `false` la librería borra `CAMERA` del manifiesto y el escáner deja de funcionar.

## Manifiesto generado (auditoría con prebuild)

Corriendo `npx expo prebuild --clean` se genera `android/app/src/main/AndroidManifest.xml`. Estos son los permisos que quedan, quién los agrega y qué hicimos:

| Permiso | Quién lo agrega | ¿Queda en la app? |
| --- | --- | --- |
| `ACCESS_COARSE_LOCATION` | `expo-location` | Sí, lo usa `/reporte/ubicacion` |
| `ACCESS_FINE_LOCATION` | `expo-location` | Sí, para pedir ubicación precisa (la persona puede elegir aproximada) |
| `CAMERA` | `expo-camera` | Sí, lo usa el escáner |
| `INTERNET` | `expo` | Sí, es de instalación |
| `VIBRATE` | `expo-notifications` | Sí, para las notificaciones |
| `RECORD_AUDIO` | `expo-camera` por defecto | No, se bloquea (la app no graba audio) |
| `SYSTEM_ALERT_WINDOW` | Expo en desarrollo | No, se bloquea (no se dibuja arriba de otras apps) |
| `READ_EXTERNAL_STORAGE` | `expo-image-picker`, con `maxSdkVersion="32"` | No, se bloquea (se usa el selector del sistema) |
| `WRITE_EXTERNAL_STORAGE` | `expo-image-picker`, con `maxSdkVersion="32"` | No, se bloquea (se usa el selector del sistema) |

`POST_NOTIFICATIONS` y `RECEIVE_BOOT_COMPLETED` los agrega `expo-notifications` y no aparecen en el manifiesto de la app porque el build los mergea desde el manifiesto de la librería. Se necesitan: el primero para pedir el permiso en Android 13+ y el segundo para reprogramar avisos después de reiniciar el teléfono. `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` no están declarados en ningún lado.

Las carpetas `android/` e `ios/` no se suben al repo (están en `.gitignore`): se generan con prebuild desde `app.json`. Por eso lo nativo se configura en `app.json` y nunca a mano.

## Notificaciones

- El permiso se pide solo al activar el interruptor de `/ajustes-app`, no al abrir la app.
- En Android, el canal `reportes` se crea con `setNotificationChannelAsync` **antes** de pedir el permiso. Sin canal, Android 13+ no muestra el diálogo.
- "Simular resolución" en `/reporte/[id]` deja el reporte `en_curso`, y a los 10 segundos lo pasa a `resuelto`, guarda el aviso en `/avisos` y, si el permiso está concedido y el interruptor activo, programa la notificación local con `scheduleNotificationAsync` (trigger de 10 segundos).
- Si el permiso de notificaciones está denegado, la notificación no se programa, pero el aviso igual queda en `/avisos`. La app nunca depende de las notificaciones para funcionar.

## Datos en memoria

Los reportes, los avisos y el borrador del formulario viven en un contexto de React (`src/lib/reportes.tsx`). Al cerrar la app se pierden, porque el TP no pedía base de datos ni persistencia. El botón "Simular resolución" es de prueba, sirve para ver el cambio de estado y el aviso sin esperar a que mantenimiento resuelva nada.

## Pruebas

Con la app corriendo, estos son los recorridos para probar todo:

1. Crear un reporte sin dar ningún permiso: escribir el aula a mano y elegir el sector a mano. Tiene que guardarse igual.
2. `/reporte/escanear`: ver los estados cargando, concedido, preguntable y bloqueado. Probar el botón "Abrir Ajustes" con la cámara bloqueada.
3. `/reporte/ubicacion`: con ubicación aproximada tiene que mostrar "Ubicación aproximada" y no coordenadas. Si se deniega, elegir el sector a mano.
4. `/reporte/foto`: "Elegir de la galería" sin ningún diálogo de permiso, y "Sacar foto" con el permiso de cámara.
5. `/ajustes-app`: activar el interruptor, ver el diálogo de notificaciones, y después "Simular resolución" desde el detalle del reporte. A los 10 segundos tiene que llegar la notificación y aparecer el aviso en `/avisos`.
6. `/permisos`: ver los estados, ir a Ajustes, cambiar un permiso y volver. El panel se actualiza solo al volver.
7. Para volver un permiso a "sin decidir": `adb shell pm clear com.ipf.mantenimientoipf` en Android, o `xcrun simctl privacy booted reset all com.ipf.mantenimientoipf` en el simulador de iOS.

Las capturas que pide la consigna (escáner en sus cuatro estados, ubicación concedida y denegada, foto desde el selector, notificación recibida, panel antes y después de Ajustes y el diálogo del sistema con el texto de propósito) están listadas en `capturas/README.md`.

## Defensa oral

Respuestas cortas a las preguntas de la consigna, con el código a mano:

1. **"Continuar" o "Abrir Ajustes"**: lo decide `canAskAgain`. En `src/app/permisos/[recurso].tsx`, si `estado === 'bloqueado'` (que es `granted: false` con `canAskAgain: false`) se muestra "Abrir Ajustes"; si es `preguntable`, se muestra "Continuar" y se llama a `pedir()`.
2. **Revocar la cámara desde Ajustes con la app abierta**: Android mata el proceso porque se revocó un permiso. Al volver, la app arranca de cero y consulta el estado real. En iOS no la mata, pero igual el hook consulta cuando `AppState` pasa a `active`.
3. **Galería sin permiso pero cámara sí**: la galería se abre con el selector del sistema (`launchImageLibraryAsync`), que devuelve solo la foto elegida. La cámara es un recurso directo y necesita `CAMERA`.
4. **Ubicación aproximada o denegada**: si es aproximada, el reporte guarda `aproximada: true` y se muestra "Ubicación aproximada" sin coordenadas. Si se deniega, no se muestra nada raro: se elige el sector a mano y el reporte se crea igual.
5. **Textos de propósito en Expo Go**: no aparecen porque el Info.plist y el manifiesto son de Expo Go, no de la app. Se ven recién en una development build.
6. **Nota de voz con OTA**: no alcanza. `expo-audio` necesita `NSMicrophoneUsageDescription` en el Info.plist y `RECORD_AUDIO` en el manifiesto, y eso va dentro del binario: hace falta compilar una build nueva. Una OTA solo manda JS y assets.

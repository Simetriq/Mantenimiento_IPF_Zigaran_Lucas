# Trabajo Práctico N° 3: permisos móviles en React Native

**Alumno:** Lucas Zigaran
**Materia:** Taller Complementario - React Native II
**Institución:** Instituto Politécnico Formosa
**Fecha de entrega:** 21/10/2026

Las respuestas de las Partes A a F están en este archivo. El desarrollo del sistema (Parte G) está en el repositorio, con el árbol de rutas y la configuración explicados en el README.

## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

**a)** Un permiso es una autorización que da la persona usuaria para que la app use algo protegido del teléfono: la cámara, el micrófono, la ubicación, los contactos, las fotos. La app pide, el sistema operativo muestra el diálogo y controla el acceso, y la persona decide. Sin ese permiso la app no puede tocar el recurso, aunque sepa programarlo.

**b)** La caja de arena (sandbox) es el encierro donde corre cada app: tiene su espacio, sus archivos y su memoria, y no ve los de las demás apps ni los del sistema. Los permisos son las puertas que el sistema abre en esa caja, de a una y con autorización. Sin ningún permiso una app puede ejecutarse, dibujar su interfaz, guardar datos en su propio espacio y hacer cálculos, pero no puede salir de ahí: ni cámara, ni ubicación, ni contactos, ni internet (INTERNET también se declara y se concede al instalar).

**c)** Las cuatro razones, con un ejemplo cada una:

1. Proteger la privacidad: la ubicación y los contactos son datos sensibles y no querés que cualquier app los lea sin avisar.
2. Mantener el control y la transparencia: la persona sabe qué está usando la app y decide en el momento justo, por ejemplo cuando tocás "Compartir ubicación" en un delivery.
3. Dar seguridad al sistema y a las demás apps: si una app maliciosa pudiera mandar SMS o usar la cámara sin permiso, podría cobrarte o espiarte.
4. Evitar el abuso de recursos: notificaciones que no paran, batería y datos gastados en segundo plano; el permiso pone un freno, como cuando una app te pregunta si querés recibir avisos.

**d)** En la analogía, la visita es la app que quiere entrar al dato; el portero es el sistema operativo (Android o iOS), que tiene la lista y controla el acceso; el dueño del departamento es la persona usuaria, que es la que dice sí o no. Que "el portero se acuerda de la respuesta" significa que el sistema guarda la decisión: la próxima vez la app no vuelve a molestar, consulta el estado y ya sabe si puede pasar (y en iOS, si dijo no, el diálogo directamente no se repite).

### A2. Declarar y solicitar

| Momento | ¿Qué se hace? | ¿Dónde / cómo en Android? | ¿Dónde / cómo en iOS? | ¿Dónde / cómo en Expo? | ¿Qué pasa si se omite? |
| --- | --- | --- | --- | --- | --- |
| **Declarar (al compilar)** | Se anota en el manifiesto qué permisos puede llegar a usar la app. Sin esto, el permiso no existe para el sistema. | `AndroidManifest.xml` con `<uses-permission android:name="..." />`. En Expo el archivo se genera solo. | `Info.plist` con las claves `NS...UsageDescription` (y `NSUserTrackingUsageDescription` para ATT). | `app.json` / `app.config.ts`, con `expo.android.permissions`, `blockedPermissions`, `expo.ios.infoPlist` y los plugins de cada módulo. `npx expo prebuild` escribe el nativo. | En Android el permiso no está declarado: la solicitud se deniega en el acto y no aparece ningún diálogo. En iOS la app se cierra si toca el recurso, y App Store Connect rechaza la build. |
| **Solicitar (al ejecutar)** | Se le muestra a la persona el diálogo del sistema y se lee la respuesta. La app decide qué hacer según si concedió, rechazó o todavía no decidió. | `requestPermissions()` nativo, o el pedido del módulo de Expo (`useCameraPermissions`, `requestForegroundPermissionsAsync`, etc.). | El pedido del módulo de Expo; el texto de abajo del título sale de la clave del `Info.plist`. | La función o el hook de cada paquete: `request...PermissionsAsync()` y `use...Permissions()`. | El permiso queda "sin decidir" (o concedido si es de instalación) y el recurso no funciona. La app nunca se entera de que le faltó pedirlo: falla en silencio. |

### A3. Verdadero o falso

**a) F.** El diálogo lo dibuja el sistema operativo, no la app. React Native solo dispara la solicitud; el título, los botones y el estilo los pone Android o iOS.

**b) V.** `app.json` (o `app.config.ts`) es la fuente: desde ahí `prebuild` genera el `AndroidManifest.xml` y el `Info.plist`. Si editás el nativo a mano, el próximo prebuild lo pisa.

**c) F.** Las claves del `Info.plist` van dentro del binario nativo. Una OTA (EAS Update) solo manda JS y assets: para agregar un permiso hay que compilar una build nueva y pasar por revisión de Apple.

**d) F.** Si el permiso no está declarado en el manifiesto, Android no muestra ningún diálogo: la solicitud se deniega al instante. La declaración es la condición para que el diálogo exista.

**e) F.** `expo-permissions` está deprecado y en SDK 57 no se usa (en el TP está prohibido). Cada módulo trae su propio hook: `useCameraPermissions`, `useForegroundPermissions`, etc.

**f) V.** Las notificaciones no llevan texto de propósito en iOS: no hay clave para eso porque el diálogo lo arma el sistema con el nombre de la app.

**g) V.** Con acceso limitado el permiso está concedido (`status: 'granted'`, `granted: true`) y el matiz aparece en `accessPrivileges: 'limited'`. Hay que mirar ese campo para saber que la persona eligió solo algunas fotos.

**h) F.** No hace falta reinstalar: en Android `adb shell pm clear com.tu.app` y en el simulador de iOS `xcrun simctl privacy booted reset all com.tu.app` vuelven todo a "sin decidir". Además, reinstalar no siempre limpia del todo (Android conserva los canales de notificación).

### A4. Los estados de un permiso

**a)** Diagramas con flechas simples.

```text
ANDROID
Sin decidir (undetermined)
   | request()
   +--> Concedido (granted)  -->  la app usa el recurso
   +--> Denegado (denied, canAskAgain=true)
            | request() otra vez
            +--> Concedido
            +--> Denegado 2 veces (Android 11+)
                     +--> Bloqueado (denied, canAskAgain=false)
                              +--> solo se arregla en Ajustes

iOS
Sin decidir (undetermined)
   | request()
   +--> Concedido (granted)  -->  la app usa el recurso
   +--> Denegado (denied, canAskAgain=false)
            +--> Bloqueado: el diálogo no vuelve nunca, solo Ajustes
```

En Android hay un estado intermedio (denegado pero se puede volver a pedir) y una segunda oportunidad; en iOS el rechazo es de una sola vez y ya queda bloqueado. Esa es la diferencia central: en Android podés insistir una vez, en iOS no. Por eso la pantalla previa con el botón "Abrir Ajustes" es casi obligatoria en iOS.

**b)** Lo que devuelve Expo en cada estado:

| Estado | status | canAskAgain | ¿Puede aparecer el diálogo? |
| --- | --- | --- | --- |
| Sin decidir | `'undetermined'` | `true` | Sí, es la primera vez que se pide. |
| Concedido | `'granted'` | `true` | No, devuelve `granted` al toque sin mostrar nada. |
| Denegado (se puede volver a pedir) | `'denied'` | `true` | Sí, una segunda oportunidad (Android). En iOS este estado casi no aparece con `canAskAgain: true`. |
| Bloqueado | `'denied'` | `false` | No, hay que mandar a Ajustes con `Linking.openSettings()`. |

## Parte B · Android: tipos de permisos y manifiesto

### B1. Clasificá los permisos

| Permiso | Tipo | ¿Cómo se obtiene? |
| --- | --- | --- |
| INTERNET | de instalación (normal) | Se declara y listo: el sistema lo concede solo al instalar, sin diálogo. |
| CAMERA | de tiempo de ejecución | Se declara y se pide con el diálogo (`requestCameraPermissionsAsync` / `useCameraPermissions`). |
| VIBRATE | de instalación (normal) | Se declara y se concede al instalar; no hay diálogo. |
| SYSTEM_ALERT_WINDOW | especial | Desde Ajustes > Apps > Acceso especial > "Dibujar sobre otras apps". Se abre con un intent (`expo-intent-launcher`); Expo no lo pide solo. |
| POST_NOTIFICATIONS | de tiempo de ejecución | Diálogo en runtime desde Android 13 (API 33), después de crear el canal con `setNotificationChannelAsync`. |
| ACCESS_NETWORK_STATE | de instalación (normal) | Se declara y se concede al instalar. |
| READ_CONTACTS | de tiempo de ejecución | Diálogo en runtime (`expo-contacts`, `requestPermissionsAsync`). |
| SCHEDULE_EXACT_ALARM | especial | Desde Ajustes > Apps > Acceso especial > "Alarmas y recordatorios" (o con un intent). Desde Android 14 viene negada por defecto. |
| RECORD_AUDIO | de tiempo de ejecución | Diálogo en runtime (`expo-audio`, `requestRecordingPermissionsAsync`). |
| MANAGE_EXTERNAL_STORAGE | especial | Desde Ajustes > Apps > Acceso especial > "Todos los archivos"; Google Play la revisa aparte y pide justificación. |

### B2. Grupos y nombres

**a)** Un grupo de permisos es una forma de agrupar permisos del mismo recurso (ubicación, cámara, contactos, etc.) para no mostrar un diálogo por cada uno. Si se piden `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, la persona ve un solo diálogo de ubicación. Si ya tiene concedido uno del grupo, el otro se concede sin diálogo.

**b)** El prefijo es `android.permission.`. El nombre completo del permiso de cámara es `android.permission.CAMERA`.

**c)** Los permisos de firma (signature) son permisos que solo se conceden si la app está firmada con el mismo certificado que quien los define (el sistema o el fabricante). No se usan en apps comunes porque necesitarías la firma de la plataforma: no se pueden pedir en tiempo de ejecución ni publicar así en Play Store.

### B3. Leé el manifiesto

**a)** De los permisos del manifiesto, solo INTERNET se concede solo: es de instalación y no lleva diálogo. Los demás son de tiempo de ejecución y hay que pedirlos con diálogo: CAMERA, ACCESS_COARSE_LOCATION y ACCESS_FINE_LOCATION, POST_NOTIFICATIONS (Android 13+) y READ_EXTERNAL_STORAGE (hasta Android 12). RECORD_AUDIO no llega al manifiesto final porque `tools:node="remove"` lo borra. Que estén declarados no significa que la app los pida ni que los tenga.

**b)** `android:maxSdkVersion="32"` dice que ese permiso solo se declara hasta API 32 (Android 12L). En Android 13 (API 33) y superiores no se declara ni se pide. Desde Android 13 los reemplazan `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` (y `READ_MEDIA_AUDIO` para audio). Ojo: con el selector de fotos del sistema no hace falta ninguno.

**c)** `tools:node="remove"` le dice al merger de manifiestos que borre ese permiso del manifiesto final, aunque una librería lo haya agregado. El fragmento de `app.json`:

```json
{
  "expo": {
    "android": {
      "blockedPermissions": ["android.permission.RECORD_AUDIO"]
    }
  }
}
```

**d)** Va en `expo.android.permissions`, el array de permisos extra:

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.SCHEDULE_EXACT_ALARM"]
    }
  }
}
```

**e)** No conviene editarlo a mano porque `npx expo prebuild` (y si usás `--clean` directamente borra la carpeta nativa) regenera `android/` desde `app.json`: tus cambios se pierden. Todo va en `app.json` o en un config plugin. Y `blockedPermissions` en Expo Go no funciona: Expo Go tiene su propio manifiesto fijo con todos los permisos de sus módulos, y los plugins recién se aplican al generar la build nativa.

### B4. Así pregunta Android

**a)** No, Android no deja poner texto propio en el diálogo: el sistema arma "¿Permitir que [App] acceda a [recurso]?". Lo que tenés que explicar va antes, en una pantalla previa de tu app, y también en la ficha de Play Store y en la política de privacidad.

**b)** "Mientras la app está en uso" mantiene el permiso mientras usás la app en primer plano (y un rato en segundo plano); "Solo esta vez" caduca cuando cerrás la app o la dejás de usar, y hay que volver a pedir. Esta última existe para ubicación, cámara y micrófono, los recursos más sensibles.

**c)** En Android 11+ el segundo "No permitir" equivale a "no volver a preguntar": el permiso queda bloqueado y `canAskAgain` pasa a `false`. A partir de ahí `request...()` devuelve `denied` al instante, sin diálogo, y la app tiene que ofrecer "Abrir Ajustes".

**d)** Con ubicación aproximada (unos 3 km²) anda bien "farmacias de turno cerca" o "el clima de tu zona". No anda bien para navegación paso a paso, para pedir un remís a tu casa ni para registrar el recorrido de una carrera.

**e)** Android mata el proceso de la app cuando se revoca un permiso desde Ajustes con la app abierta. Al volver, la app arranca de cero y el permiso ya figura revocado; por eso hay que volver a consultar el estado al volver del segundo plano (con `AppState`), no confiar en lo que se guardó antes.

### B5. Android, versión por versión

| Cambio | Versión (API) | Qué implica para el código |
| --- | --- | --- |
| Nacen los permisos en tiempo de ejecución | Android 6.0 (API 23) | Ya no alcanza el manifiesto: hay que chequear con `checkSelfPermission` y pedir con `requestPermissions`. Hay que programar el caso denegado. |
| La ubicación en segundo plano pasa a ser un permiso aparte | Android 10 (API 29) | `ACCESS_BACKGROUND_LOCATION` es otro permiso. Se pide primero el de primer plano y después el de fondo; desde Android 11 la de fondo se concede desde Ajustes ("Permitir todo el tiempo"). |
| Dos rechazos equivalen a "no volver a preguntar" | Android 11 (API 30) | El diálogo ya no tiene la casilla "No volver a preguntar": al segundo rechazo queda bloqueado, `canAskAgain: false` y hay que mandar a Ajustes. |
| Ubicación precisa o aproximada | Android 12 (API 31) | La persona elige la precisión. Puede volver con `accuracy: 'coarse'`: no pidas FINE si no lo necesitás y manejá la aproximada. |
| Las notificaciones pasan a ser un permiso (`POST_NOTIFICATIONS`) | Android 13 (API 33) | Se pide en runtime, y el diálogo no aparece hasta crear el canal con `setNotificationChannelAsync`. Si rechaza, no se puede insistir: queda la bandeja de avisos. |
| Acceso parcial a fotos y videos ("Seleccionar fotos") | Android 14 (API 34) | Se suma `READ_MEDIA_VISUAL_USER_SELECTED`: la persona elige algunas fotos y el permiso llega `granted` con acceso limitado. Con el selector del sistema no hace falta pedir nada. |
| Permiso de red local (`ACCESS_LOCAL_NETWORK`) | Android 17 (API 37). En Android 16 (API 36) era opcional | Si la app se conecta a la red local (impresoras, TV, dispositivos de la escuela), tiene que declarar y pedir este permiso; desde Android 17 es obligatorio para las apps que apuntan a API 37. Si la app solo habla con internet, no cambia nada. |

El `targetSdkVersion` es la versión de Android contra la que declarás que probaste la app: no es la mínima, es la "conducta" del sistema que se te aplica, y Google Play exige un mínimo para publicar. Expo SDK 57 compila y apunta a `targetSdkVersion` 36 (Android 16), con mínimo Android 7. Desde el 31 de agosto de 2026 Google Play exige API 36 para apps nuevas y actualizaciones, así que con SDK 57 ya estás en regla y no hay que tocar nada.

## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves del Info.plist

| Recurso | Clave en Info.plist |
| --- | --- |
| Cámara | `NSCameraUsageDescription` |
| Micrófono | `NSMicrophoneUsageDescription` |
| Ubicación en uso | `NSLocationWhenInUseUsageDescription` |
| Ubicación siempre | `NSLocationAlwaysAndWhenInUseUsageDescription` (la vieja `NSLocationAlwaysUsageDescription` quedó deprecada) |
| Fotos (leer) | `NSPhotoLibraryUsageDescription` |
| Fotos (solo guardar) | `NSPhotoLibraryAddUsageDescription` |
| Contactos | `NSContactsUsageDescription` |
| Face ID | `NSFaceIDUsageDescription` |
| Rastreo entre apps (ATT) | `NSUserTrackingUsageDescription` |
| Notificaciones | No lleva clave de propósito: el sistema usa el nombre de la app. |

### C2. Sin texto, no hay permiso

**a)** Si falta el texto y la app intenta usar la cámara, iOS cierra la app en el acto: se crashea con "This app has crashed because it attempted to access privacy-sensitive data without a usage description". Al subir la build a App Store Connect te la rechazan con el error `ITMS-90683` (falta la clave de propósito en el Info.plist).

**b)** iOS muestra el diálogo una sola vez por permiso. Si la persona dice que no, a la app le queda el estado denegado con `canAskAgain: false`: no hay segundo diálogo y solo puede mostrar una explicación y un botón para abrir Ajustes con `Linking.openSettings()`.

**c)** El sistema arma el título ("¿Permitir que 'App' acceda a la cámara?"), los botones y el estilo; vos escribís el texto de propósito, la frase que va abajo del título y que sale de la clave del `Info.plist`. En Expo se configura en `app.json`, en el plugin de cada módulo (`cameraPermission`, `locationWhenInUsePermission`, `photosPermission`) o en `expo.ios.infoPlist`.

**d)** Pasa porque Apple revisa el binario y el Info.plist completos, no solo lo que llama tu JavaScript: si una librería nativa referencia una API protegida, la app necesita el texto y puede aparecer como si la usara. Se resuelve actualizando o sacando esa librería; si es imprescindible, declarando la clave con un texto real que explique el uso, y nunca poniendo un texto de relleno.

### C3. Probador de textos de propósito

Pauta 5.1.1 de Apple: el texto tiene que decir qué dato se usa y para qué, concreto y sin vueltas.

| Texto propuesto | ¿Aprobado? | Versión mejorada |
| --- | --- | --- |
| "Necesitamos tu ubicación." | No. No dice para qué la usa. | "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas." |
| "Para mejorar tu experiencia." | No. Es vago y no menciona el dato ni un beneficio concreto. | "Usamos tu ubicación para ordenar los puntos de reciclaje por cercanía a tu casa." |
| "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas." | Sí. Cumple el molde: dato + beneficio concreto. | Ya está bien; se puede dejar igual, nomás se le puede agregar el nombre de la app. |
| "La app no funciona sin ubicación." | No. No explica para qué y además la app debería poder usarse sin ubicación. | "Usamos tu ubicación para marcar en el mapa dónde está el desperfecto que reportás." |
| "Ubicación requerida por el sistema." | No. No existe tal requisito del sistema y no explica el propósito. | "Usamos tu ubicación para completar el sector del reporte y que mantenimiento llegue más rápido." |

### C4. Acceso parcial y gradual

| Caso | iOS | En Expo |
| --- | --- | --- |
| Fotos limitadas ("Seleccionar fotos") | iOS 14 | `expo-image-picker`: `getMediaLibraryPermissionsAsync()` devuelve `accessPrivileges: 'limited'`. Se pide con `requestMediaLibraryPermissionsAsync()`, o directamente se usa `launchImageLibraryAsync()` (selector del sistema, sin permiso). |
| Ubicación aproximada (interruptor "Precisa") | iOS 14 | `Location.getForegroundPermissionsAsync()`: `ios.accuracy` vale `'reduced'` (aproximada) o `'full'` (precisa). |
| "Permitir una vez" (ubicación) | iOS 13 | No hay campo que lo distinga: el permiso llega igual como `ios.scope: 'whenInUse'`. Se pide con `requestForegroundPermissionsAsync()` y la autorización se va al cerrar la app. |
| Ubicación escalonada: de "al usar la app" a "Siempre" | iOS 13 | Primero `requestForegroundPermissionsAsync()` y después `requestBackgroundPermissionsAsync()`; se detecta con `ios.scope` pasando de `'whenInUse'` a `'always'`. |
| Notificaciones provisionales | iOS 12 | `Notifications.requestPermissionsAsync({ ios: { allowProvisional: true } })`; se detecta con `response.ios.status === 'PROVISIONAL'`. |
| Rastreo entre apps (App Tracking Transparency) | iOS 14.5 | `expo-tracking-transparency`: `requestTrackingPermissionsAsync()` y `getTrackingPermissionsAsync()`, con la clave `NSUserTrackingUsageDescription`. |

Expo SDK 57 requiere iOS 16.4 o superior. La consecuencia práctica es que todas las filas de la tabla (iOS 12, 13, 14 y 14.5) ya existen en cualquier equipo que pueda correr la app: no hace falta preguntar la versión de iOS ni meter condicionales. En Android, en cambio, sí conviene mirar `Platform.Version` para lo que apareció en API 33 o 34.

### C5. Android vs iOS, lado a lado

| | Android | iOS |
| --- | --- | --- |
| ¿Dónde se declara? | `AndroidManifest.xml`, generado desde `app.json` (`expo.android.permissions`, `blockedPermissions` y los plugins). | `Info.plist`, generado desde `app.json` (`expo.ios.infoPlist` y el texto de cada plugin). |
| Texto en el diálogo | No se puede personalizar: lo escribe el sistema. | Lo escribís vos como texto de propósito en la clave del `Info.plist`. |
| Oportunidades para preguntar | Varias: el diálogo puede volver mientras `canAskAgain` sea `true`; recién al segundo rechazo queda bloqueado. | Una sola vez por permiso. Si dice no, no hay segunda: solo Ajustes. |
| "Solo esta vez" / "Permitir una vez" | "Solo esta vez" para ubicación, cámara y micrófono; caduca al cerrar la app. | "Permitir una vez" para ubicación; caduca al cerrar la app. |
| Notificaciones | Permiso de runtime desde Android 13 (API 33), y hay que crear el canal antes de pedir. | No lleva texto de propósito; se pide con `requestPermissionsAsync()` y existe la variante provisional. |
| Ubicación en segundo plano | `ACCESS_BACKGROUND_LOCATION` (API 29) es un permiso aparte y Google Play pide justificación. | `NSLocationAlwaysAndWhenInUseUsageDescription`; se pide escalonado, primero "en uso" y después "siempre". |
| Si falta la declaración | La solicitud falla en silencio: no aparece el diálogo y queda denegado. | La app se cierra al tocar el recurso y App Store Connect rechaza la build (`ITMS-90683`). |

## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad | Módulo | Hook / función de permiso |
| --- | --- | --- |
| Escanear un QR con la cámara | `expo-camera` | `useCameraPermissions()` (o `Camera.getCameraPermissionsAsync()` / `Camera.requestCameraPermissionsAsync()`) |
| Grabar video con sonido | `expo-camera` (usa cámara y micrófono) | `useCameraPermissions()` para la cámara y `useMicrophonePermissions()` para el micrófono |
| Mostrar farmacias cercanas | `expo-location` | `Location.useForegroundPermissions()` (o `getForegroundPermissionsAsync()` / `requestForegroundPermissionsAsync()`) |
| Seguir un envío con la app en segundo plano | `expo-location` (con `expo-task-manager` para las actualizaciones) | `requestBackgroundPermissionsAsync()` y, antes, `requestForegroundPermissionsAsync()` (o `useBackgroundPermissions()`) |
| Mostrar un recordatorio | `expo-notifications` | `getPermissionsAsync()` / `requestPermissionsAsync()` (no tiene hook propio) |
| Grabar una nota de voz | `expo-audio` | `Audio.requestRecordingPermissionsAsync()` / `Audio.getRecordingPermissionsAsync()` |
| Galería propia dentro de la app | `expo-media-library` | `MediaLibrary.usePermissions()` (o `requestPermissionsAsync()`) |
| Publicidad personalizada entre apps (iOS) | `expo-tracking-transparency` | `requestTrackingPermissionsAsync()` / `getTrackingPermissionsAsync()` |

Un tutorial que arranca con `import * as Permissions from 'expo-permissions'` es viejo. Ese paquete quedó deprecado en SDK 41 (2021) y ya no existe en SDK 57. Desde esa época cada módulo trae su propio pedido de permiso: cámara en `expo-camera`, ubicación en `expo-location`, notificaciones en `expo-notifications`. Si copiás ese import en el proyecto no compila, y las funciones tipo `Permissions.askAsync(Permissions.CAMERA)` tampoco existen. Fijate la fecha del tutorial y usá la doc del SDK que tenés.

### D2. Consultar, pedir y el hook

**a)** La función que empieza con `get` (por ejemplo `getForegroundPermissionsAsync()`) solo consulta: devuelve lo que el sistema ya tiene guardado y no muestra nada. La que empieza con `request` (por ejemplo `requestForegroundPermissionsAsync()`) pide: si el permiso está en "sin decidir" o si todavía se puede volver a preguntar, abre el diálogo del sistema. Las dos devuelven el mismo tipo de respuesta (`status`, `granted`, `canAskAgain`, `expires`). La única que puede mostrar un diálogo es `request`. `get` es la que usás al montar la pantalla o al volver de Ajustes, porque no molesta a nadie.

**b)** `Location.useForegroundPermissions()` devuelve `[permiso, pedirPermiso, consultarPermiso]`. `permiso` es la `LocationPermissionResponse` o `null`; `pedirPermiso` llama a `requestForegroundPermissionsAsync()`; `consultarPermiso` llama a `getForegroundPermissionsAsync()`. En el primer render `permiso` vale `null`, porque leer el estado nativo es asincrónico. Mientras tanto la pantalla tiene que mostrar un indicador de carga (un `ActivityIndicator` o un texto "Revisando permiso"). Lo que no puede hacer es asumir que está denegado ni montar la cámara con un permiso que todavía no leyó.

**c)** Si `canAskAgain` es `false`, la función `request` no abre nada: devuelve al toque la respuesta que ya tenía, en general `denied`. La persona no ve diálogo y parece que el botón no anda. Para habilitarlo hay que ir a Ajustes con `Linking.openSettings()`. Si llamás a `requestForegroundPermissionsAsync()` en un bucle (por ejemplo en el cuerpo del componente o en un `useEffect` sin condiciones), el pedido se dispara en cada render, el estado cambia, vuelve a renderizar y se dispara de nuevo: la pantalla queda trabada en "Pidiendo permiso..." y, si el permiso está bloqueado, encima sin diálogo. Se llama una vez, desde un botón o desde un efecto con guarda.

### D3. Leé la respuesta

| Respuesta | Qué hace la app |
| --- | --- |
| `null` | Todavía está leyendo el permiso. Mostrar el indicador de carga y no montar cámara, mapa ni galería. |
| `{ status: 'granted', granted: true }` | Usar la función directamente, sin pantalla previa ni nada. |
| `{ status: 'undetermined', canAskAgain: true }` | Nunca se preguntó. Mostrar la pantalla previa con el beneficio y un botón "Continuar" que dispare el pedido. |
| `{ status: 'denied', canAskAgain: true }` | Ya dijo que no, pero el diálogo puede volver a aparecer. Explicar para qué se usa, ofrecer el botón para volver a pedir y la alternativa sin permiso. |
| `{ status: 'denied', canAskAgain: false }` | Bloqueado. No se puede pedir más: mostrar el camino a Ajustes con `Linking.openSettings()` y la alternativa sin permiso. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Acceso parcial a fotos. La app funciona con las fotos que la persona eligió; ofrecer "Elegir más fotos" para ampliar la selección y no pedir el acceso completo de arranque. |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Ubicación aproximada (unos 3 km²). Mostrar "Ubicación aproximada" o el barrio, no coordenadas exactas. Si hace falta precisión, pedirla en contexto. |

Los dos campos que deciden casi todo son `status` y `canAskAgain`. `status` responde "¿tengo el permiso ahora?" y `canAskAgain` responde "¿puedo volver a mostrar el diálogo del sistema?". Con esos dos alcanza para elegir entre las cuatro pantallas: cargando, concedido, preguntable y bloqueado. `granted` es solo un atajo de `status === 'granted'`.

### D4. Simulación del ciclo completo

Android 14, app recién instalada, `expo-location`.

| # | Acción | status | canAskAgain | ¿Diálogo? |
| --- | --- | --- | --- | --- |
| 1 | `getForegroundPermissionsAsync()` | `undetermined` | `true` | No. Solo consulta. |
| 2 | `requestForegroundPermissionsAsync()` y la persona toca "No permitir" | `denied` | `true` | Sí, el primer diálogo. |
| 3 | Otra vez `requestForegroundPermissionsAsync()` y otra vez "No permitir" | `denied` | `false` | Sí, el segundo diálogo. Android 11+ lo toma como "no volver a preguntar". |
| 4 | Otra vez `requestForegroundPermissionsAsync()` | `denied` | `false` | No. Devuelve la respuesta guardada al toque. |
| 5 | `Linking.openSettings()`, habilita "Mientras la app está en uso", vuelve y la app consulta | `granted` | `true` | No. Ya está concedido. |
| 6 | Igual que el 5, pero la app no vuelve a consultar | En el sistema es `granted`, pero la app sigue mostrando `denied` | La app sigue con el `false` viejo | No. |

En el paso 5, para que la app se entere hay que consultar de nuevo al volver: `Linking.openSettings()` no devuelve nada cuando la persona vuelve, así que se usa `AppState` o el hook `useRevisarAlVolver`. El paso 6 es justamente el bug: el sistema ya concedió, la pantalla sigue diciendo "bloqueado" y el botón sigue siendo "Abrir Ajustes". Ojo con el detalle de Android: si en vez de conceder revocás un permiso que ya estaba dado, el sistema mata el proceso de la app y el estado se refresca solo al arrancar. Al conceder no la mata, y por eso hace falta consultar a mano.

Los pasos 1 a 4 en iOS:

| # | Acción | status | canAskAgain | ¿Diálogo? |
| --- | --- | --- | --- | --- |
| 1 | `getForegroundPermissionsAsync()` | `undetermined` | `true` | No |
| 2 | `requestForegroundPermissionsAsync()` y la persona toca "No permitir" | `denied` | `false` | Sí, el único diálogo |
| 3 | Otra vez `requestForegroundPermissionsAsync()` | `denied` | `false` | No |
| 4 | Otra vez `requestForegroundPermissionsAsync()` | `denied` | `false` | No |

El resultado cambia en el paso 3. En Android el segundo pedido todavía muestra el diálogo y recién el segundo "No permitir" apaga `canAskAgain`. En iOS el diálogo se muestra una sola vez: después del primer rechazo `canAskAgain` ya es `false`, así que el paso 3 devuelve `denied` sin mostrar nada. Para volver a habilitar en iOS no queda otra que Ajustes.

"Permitir una vez" en iOS vale solo para la sesión actual. Si la persona elige esa opción y después cierra y reabre la app, el permiso se revoca, `getForegroundPermissionsAsync()` vuelve a devolver `undetermined` y el diálogo aparece otra vez cuando la app pide. Sirve para una consulta puntual y es la opción más chica que ofrece iOS. Un detalle que rompe el seguimiento: si en la misma sesión pedís el permiso de segundo plano ("Siempre") después de un "Permitir una vez", el pedido falla en silencio y vuelve `denied`, porque el "una vez" no alcanza para el "Siempre". En ese caso hay que mandar a la persona a Ajustes.

### D5. Configurar app.json

```jsonc
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          // Solo cámara y QR: la app no graba video con sonido.
          "cameraPermission": "Usamos tu cámara para leer el QR de la puerta del aula.",
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-location",
        {
          // Solo primer plano: puntos de reciclaje cercanos.
          "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje cercanos.",
          "isIosBackgroundLocationEnabled": false,
          "isAndroidBackgroundLocationEnabled": false
        }
      ]
    ],
    "android": {
      // Nada de audio ni de dibujar encima de otras apps.
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

`microphonePermission: false` evita el `NSMicrophoneUsageDescription` en iOS y `recordAudioAndroid: false` le dice al plugin de `expo-camera` que no agregue `RECORD_AUDIO` en Android. Igual lo dejo en `blockedPermissions` por si otro módulo lo mete. `blockedPermissions` solo tiene efecto cuando se genera el proyecto nativo, así que no funciona en Expo Go: hay que hacer `prebuild` y compilar.

¿Por qué `expo-camera` agrega `RECORD_AUDIO` si la app no graba sonido? Porque el módulo sirve para escanear, sacar fotos y también grabar video con audio: `CameraView` puede grabar un video con pista de sonido y la librería declara `RECORD_AUDIO` en su `AndroidManifest.xml` para que eso funcione sin configuración extra. En iOS hace lo mismo con el texto del micrófono. Si tu app solo lee QR, no lo necesitás, y declarar permisos que no usás es justo lo que las tiendas castigan. Por eso se apaga con el plugin y se bloquea en el manifiesto.

### D6. Expo Go no es tu app

**a)** Los textos de propósito viven en el `Info.plist` de iOS y en el manifiesto de Android de la app compilada. En Expo Go esos archivos son de Expo Go, que ya tiene los suyos (y no los tuyos). Tu `app.json` no toca el binario de Expo Go, así que en Expo Go vas a ver el texto genérico de Expo Go o directamente ninguno. Para ver tus textos hace falta compilar tu propia app, aunque sea una development build.

**b)** En Expo Go se puede probar casi todo lo que es JavaScript y los módulos que ya vienen adentro: cámara, ubicación en primer plano, selector de fotos, notificaciones locales, sensores, portapapeles. Necesitás una development build para: notificaciones push en Android (desde SDK 53 no andan en Expo Go), ubicación en segundo plano (la doc de `expo-location` lo dice explícito), tareas en segundo plano y foreground services, cualquier módulo nativo que no esté en Expo Go, los textos de propósito propios, el ícono y el canal configurados por los plugins de `app.json`, y `blockedPermissions`.

**c)**

```bash
# Genera las carpetas android/ e ios/ con los archivos nativos
npx expo prebuild --clean

# Quedan acá: android/app/src/main/AndroidManifest.xml
# y ios/<NombreDelProyecto>/Info.plist

# Compila e instala la development build en el emulador o en el celu conectado
npx expo run:android
```

**d)**

```bash
# Android: saca el permiso (queda denegado) y después lo deja como recién instalado
adb shell pm revoke com.ipf.mantenimientoipf android.permission.CAMERA
adb shell pm clear com.ipf.mantenimientoipf

# iOS: resetea todas las decisiones de privacidad de esa app en el simulador
xcrun simctl privacy booted reset all com.ipf.mantenimientoipf

# Solo la cámara, si querés tocar nada más
xcrun simctl privacy booted reset camera com.ipf.mantenimientoipf
```

`pm clear` borra los datos de la app y vuelve los permisos al estado de instalación nueva, sin desinstalar. `pm revoke` saca el permiso pero puede dejar el "no preguntar" si ya lo rechazaste dos veces. `simctl privacy reset all` hace lo mismo en el simulador de iOS. Si nada de eso alcanza, desinstalar y volver a instalar es lo más seguro, y en iOS es la única alternativa a `simctl` porque `adb` es solo de Android.

## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

El código tiene más de tres problemas. Algunos se ven al toque y otros aparecen recién cuando el permiso cambia:

1. **Falta el estado de carga.** El hook devuelve `null` mientras lee el permiso, así que si el primer render llega antes de que termine la lectura, `permiso.status` rompe con un `TypeError: Cannot read property 'status' of null`. A veces responde tan rápido que parece andar, pero el caso hay que cubrirlo igual: un indicador de carga antes de tocar la respuesta.
2. **`<Explicacion>` no existe en el archivo.** Solo se importan `CameraView`, `useCameraPermissions` y `Button`. Ese componente no está importado ni definido, así que ni compila.
3. **No distingue bloqueado de preguntable.** Si `canAskAgain` es `false`, el botón "Permitir" llama a `pedirPermiso`, que no muestra ningún diálogo y devuelve `denied`. La persona toca y no pasa nada nunca.
4. **No lee ningún QR.** `CameraView` está sin `barcodeScannerSettings` ni `onBarcodeScanned`, así que se ve la cámara pero no escanea nada.
5. **No hay plan B.** Si deniega la cámara, no hay forma de cargar el aula. El TP pide poder escribir el código a mano.
6. **No se entera de los cambios en Ajustes.** No vuelve a consultar el permiso al volver a la app; si la persona lo habilita desde Ajustes, la pantalla sigue mostrando el cartel.
7. **El botón dice "Permitir".** Debería decir "Continuar": la app no puede conceder nada, solo abrir el diálogo del sistema.

Versión corregida con los cuatro estados (cargando, concedido, preguntable, bloqueado) y la alternativa de escribir el código:

```tsx
// src/app/escanear.tsx
import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRevisarAlVolver } from '../hooks/useRevisarAlVolver';

export default function Escanear() {
  const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
  const [codigoManual, setCodigoManual] = useState('');
  const [aula, setAula] = useState<string | null>(null);

  // Cuando la persona vuelve de Ajustes, consultamos sin abrir diálogos.
  useRevisarAlVolver(consultarPermiso);

  // 1. Cargando: el hook todavía no leyó el permiso.
  if (permiso === null) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={estilos.texto}>Revisando el permiso de cámara...</Text>
      </View>
    );
  }

  // 2. Concedido: mostramos la cámara.
  if (permiso.granted) {
    return (
      <View style={estilos.pantalla}>
        <CameraView
          style={estilos.camara}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => setAula(data)}
        />
        {aula && <Text style={estilos.resultado}>Aula leída: {aula}</Text>}
        <TextInput
          style={estilos.input}
          placeholder="Código del aula (ej. A-12)"
          value={codigoManual}
          onChangeText={setCodigoManual}
        />
        <Button title="Usar este código" onPress={() => setAula(codigoManual)} />
      </View>
    );
  }

  // 3. Preguntable: pantalla previa con un único botón "Continuar".
  if (permiso.canAskAgain) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>Usamos tu cámara para leer el QR del aula</Text>
        <Text style={estilos.texto}>
          El código está pegado en la puerta. Si preferís no dar la cámara,
          escribí el código a mano.
        </Text>
        <Button title="Continuar" onPress={pedirPermiso} />
        <TextInput
          style={estilos.input}
          placeholder="Código del aula (ej. A-12)"
          value={codigoManual}
          onChangeText={setCodigoManual}
        />
        <Button title="Usar este código" onPress={() => setAula(codigoManual)} />
      </View>
    );
  }

  // 4. Bloqueado: ya no se puede pedir, solo habilitar en Ajustes.
  return (
    <View style={estilos.centro}>
      <Text style={estilos.titulo}>La cámara está bloqueada</Text>
      <Text style={estilos.texto}>
        Ya no podemos volver a preguntar. Habilitala en Ajustes, o escribí el
        código del aula acá abajo.
      </Text>
      <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
      <TextInput
        style={estilos.input}
        placeholder="Código del aula (ej. A-12)"
        value={codigoManual}
        onChangeText={setCodigoManual}
      />
      <Button title="Usar este código" onPress={() => setAula(codigoManual)} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  camara: { flex: 1 },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  titulo: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  texto: { fontSize: 15, textAlign: 'center' },
  resultado: { fontSize: 16, fontWeight: '600', padding: 12 },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
  },
});
```

### E2. El orden importa (ubicación)

**a)** La función pide el permiso de segundo plano antes que el de primer plano, y encima no importa `expo-location`: el archivo no tiene el `import`, así que `Location` no existe y todo explota antes de pedir nada.

Con el import puesto, el problema es el orden. En iOS el "Siempre" solo tiene sentido después de tener el "Al usar la app". Si pedís el de fondo primero, el sistema te muestra el diálogo de "Al usar la app"; si la persona elige esa opción y no "Siempre", el pedido de fondo vuelve `denied`. La función corta en el primer `if` y devuelve `false` aunque el permiso de primer plano se hubiera podido conceder. Para el "Siempre" real iOS pide un paso más en Ajustes.

En Android 11+ es peor: `requestBackgroundPermissionsAsync()` no abre un diálogo común. Abre la pantalla de permisos de la app y la persona tiene que elegir "Permitir todo el tiempo" a mano. Además Android exige tener ya el permiso de primer plano: si lo pedís antes, te devuelve `denied`. Resultado: la app se queda sin seguimiento y sin poder explicar por qué.

**b)**

```ts
// src/lib/ubicacion.ts
import * as Location from 'expo-location';

export async function activarSeguimiento(): Promise<boolean> {
  // 1. Primero "mientras la app está en uso". En iOS es obligatorio que vaya primero.
  const enUso = await Location.requestForegroundPermissionsAsync();

  if (!enUso.granted) {
    return false;
  }

  // 2. Recién ahora el "Siempre". En Android 11+ esto abre la pantalla de permisos.
  const siempre = await Location.requestBackgroundPermissionsAsync();

  if (!siempre.granted) {
    console.warn('Sin permiso de segundo plano', siempre.status, siempre.canAskAgain);
    return false;
  }

  return true;
}
```

**c)**

```ts
// src/lib/ubicacion.ts
import * as Location from 'expo-location';

export type Coordenadas = {
  latitud: number;
  longitud: number;
  aproximada: boolean;
};

export async function obtenerUbicacion(): Promise<Coordenadas | null> {
  // Primero consultamos: si ya está concedido, get no abre ningún diálogo.
  let permiso = await Location.getForegroundPermissionsAsync();

  if (!permiso.granted) {
    permiso = await Location.requestForegroundPermissionsAsync();
  }

  if (!permiso.granted) {
    return null;
  }

  // Android devuelve 'coarse' o 'fine'; iOS devuelve 'reduced' o 'full'.
  const aproximada =
    permiso.android?.accuracy === 'coarse' || permiso.ios?.accuracy === 'reduced';

  try {
    const posicion = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      aproximada,
    };
  } catch (error) {
    console.warn('No pudimos leer la ubicación', error);
    return null;
  }
}
```

El `try/catch` es a propósito: si el GPS no engancha o el permiso se revoca justo en el medio, la función devuelve `null` y la app sigue con el sector elegido a mano. Nunca rompe.

**d)** Para "farmacias cercanas" no hace falta segundo plano. Alcanza con el primer plano: la persona abre la pantalla, la app lee la ubicación una vez, arma la lista y listo. El segundo plano es para cuando la app está cerrada o en background, como seguir un envío o registrar una carrera con el celular en el bolsillo. Si igual lo pedís, Google Play lo trata como permiso sensible: hay que declararlo en la consola con el formulario de ubicación en segundo plano, explicar para qué sirve, subir un video mostrando la función y pasar una revisión aparte. Si la justificación no cierra, te rechazan la actualización. Y el pedido tiene que ser en dos pasos: primero "mientras la app está en uso" y después "todo el tiempo".

### E3. Notificaciones mudas

**a)** La causa más probable es que faltó crear el canal antes. En Android 13 o superior `POST_NOTIFICATIONS` es un permiso de tiempo de ejecución, y el diálogo del sistema no aparece hasta que existe al menos un canal de notificaciones. Si llamás a `requestPermissionsAsync()` sin haber creado el canal, el sistema no muestra nada y devuelve `denied`. Se arregla creando el canal "reportes" primero y pidiendo después:

```ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function pedirPermisoDeAvisos() {
  // El canal va ANTES del pedido: sin canal, Android 13+ no muestra el diálogo.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reportes', {
      name: 'Reportes',
      description: 'Avisos cuando se resuelve un reporte',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  const actual = await Notifications.getPermissionsAsync();

  if (actual.granted) {
    return actual;
  }

  return Notifications.requestPermissionsAsync();
}
```

**b)** En Android 12 o anterior no existe `POST_NOTIFICATIONS`: las notificaciones se conceden al instalar y el sistema no muestra ningún diálogo. `requestPermissionsAsync()` devuelve `granted` sin preguntar nada (salvo que la persona las haya apagado a mano en Ajustes; en ese caso devuelve `denied` y no hay diálogo que mostrar). Por eso el mismo código "anda" en Android 12 y no anda en 14: en 12 nunca hubo nada que pedir.

**c)** iOS tiene las notificaciones provisionales: se pide con `allowProvisional: true` y la app puede mandar avisos que llegan callados a la Notificación, sin diálogo. El estado se detecta por `ios.status`, no por el `status` de arriba, porque el de arriba puede decir `granted` en los dos casos:

```ts
const respuesta = await Notifications.requestPermissionsAsync({
  ios: {
    allowAlert: true,
    allowBadge: true,
    allowSound: true,
    allowProvisional: true,
  },
});

const esProvisional =
  respuesta.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
```

**d)** Se pide en el momento en que la persona demuestra que quiere avisos, no al abrir la app. Buen momento: toca el interruptor "Avisarme cuando se resuelva mi reporte" en `/ajustes-app`, o justo después de crear un reporte y elige que le avisen. Mal momento: al abrir la app, antes de que entienda para qué son, o cuando aprieta cualquier botón sin relación. Si dice que no, no se insiste: la bandeja `/avisos` dentro de la app es la alternativa y no depende del permiso.

### E4. Fotos sin pedir permiso

| Necesidad | Herramienta | Permiso |
| --- | --- | --- |
| Elegir una foto de perfil | `expo-image-picker`: `ImagePicker.launchImageLibraryAsync()` | Ninguno. Abre el selector del sistema y la app recibe solo el archivo elegido. |
| Sacar una foto en el momento | `expo-camera` (`CameraView` y `takePictureAsync()`) o `ImagePicker.launchCameraAsync()` | Permiso de cámara: `useCameraPermissions()`. |
| Editor que muestra toda la galería | `expo-media-library`: `MediaLibrary.usePermissions()` | `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` en Android 13+, y el texto de fotos en iOS (`NSPhotoLibraryUsageDescription`). |
| Adjuntar la foto de un comprobante | `expo-image-picker`: `ImagePicker.launchImageLibraryAsync()` | Ninguno. Es una sola foto, no hace falta el acceso a la galería. |

Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` para que las apps no lean toda la galería sin necesidad. Los permisos existen desde Android 13 (API 33), cuando reemplazaron a `READ_EXTERNAL_STORAGE`. La política de Play que los limita se anunció en octubre de 2023 y desde el 28 de mayo de 2025 es obligatoria: solo las apps cuya función principal es de fotos (galería, editor, backup, fondos de pantalla) pueden pedirlos, y el resto tiene que usar el selector del sistema. Una app de mantenimiento que sube la foto de un desperfecto no califica.

El mejor permiso es el que no tenés que pedir. Si el selector del sistema te deja elegir la foto que necesitás, no pidas nada: la persona elige, el sistema le entrega a tu app solo ese archivo y no hay diálogo ni permiso nuevo. Después viene el acceso parcial (fotos limitadas, que en Android 14 tiene su propio selector) y último el permiso completo, que solo se justifica si la app muestra toda la galería.

### E5. Volver de Ajustes

```ts
// src/hooks/useRevisarAlVolver.ts
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = anterior.current.match(/inactive|background/) !== null;
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}
```

**a)** Porque el permiso es del sistema, no de la app, y el sistema no le avisa a JavaScript cuando cambia desde Ajustes. Los hooks de Expo guardan la última respuesta que leyeron y no hay evento de "cambió el permiso". La única forma de enterarse es volver a consultar con `getForegroundPermissionsAsync()` (o la función `get` que corresponda al recurso). Por eso la app consulta cuando vuelve a estar activa (con `AppState`) o justo antes de usar el recurso. Hay un caso que se arregla solo: en Android, revocar un permiso mientras la app está abierta mata el proceso, así que al abrirla de nuevo arranca con el estado real. Pero conceder no mata nada, y ahí es donde el hook se queda con el valor viejo.

**b)** La tercera: `consultarPermiso` (el `getPermission` del hook, que llama a `getCameraPermissionsAsync()`). No le pasarías `pedirPermiso`, porque al volver de Ajustes no querés abrir otro diálogo, solo leer.

**c)** Porque el permiso puede cambiar por fuera de la app y en cualquier momento. La persona lo revoca desde Ajustes, iOS lo vence si eligió "Permitir una vez", Android lo puede resetear solo si la app no se usa por meses, y una reinstalación borra todo. Si guardás "concedido" en un store global para siempre, la app muestra la cámara, la cámara falla y la persona no entiende nada. Un store sirve como caché corto, pero la verdad la tiene el sistema: se refresca al volver a la app y antes de usar el recurso.

## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si lo deniegan |
| --- | --- | --- |
| Delivery · ubicación | Cuando toca "Usar mi ubicación" en la pantalla de dirección, después de armar el pedido o de elegir el local. | Escribir la dirección a mano, elegir una dirección guardada o marcar el punto en el mapa. |
| Billetera virtual · cámara | Cuando toca "Escanear QR" para pagar o "Sacar foto de la tarjeta". | Pagar con alias o CBU escribiendo a mano, o usar una tarjeta ya guardada. |
| Red social · contactos | Cuando toca "Buscar amigos" o "Invitar amigos", nunca al abrir la app. | Buscar por nombre de usuario, compartir el link de invitación o usar el selector de contactos. |
| Mensajería · micrófono | Cuando mantiene apretado el botón de grabar, adentro del chat. | Escribir el mensaje de texto. |
| Turnos médicos · notificaciones | Después de reservar el turno, cuando la app ofrece "Avisarme antes del turno". | Aviso por mail o SMS, o consultar el turno dentro de la app. |
| Editor de fotos · galería completa | Cuando entra a la pestaña de galería y se pone a editar, no al abrir la app. | Elegir las fotos de a una con el selector del sistema. |

Pedir cuatro permisos apenas abre la app entrena el "No permitir automático". La persona todavía no sabe para qué son, ve cuatro carteles seguidos y aprende a tocar "No permitir" por reflejo. En Android 11+ el sistema también aprende: dos rechazos y ese permiso queda como "no volver a preguntar", sin diálogo, para siempre. Después, aunque la persona quiera dar la cámara, la app solo puede mandarla a Ajustes. Si además el permiso no tiene nada que ver con lo que está haciendo (pide contactos en un editor de fotos), el rechazo es inmediato.

### F2. La pantalla previa

**a)** Tiene tres elementos:

1. El beneficio concreto en una frase, con el molde "Usamos tu cámara para leer el QR del aula". Tiene que decir para qué, no "para mejorar tu experiencia".
2. Un único botón "Continuar", que es el que abre el diálogo del sistema.
3. La aclaración de que se puede cambiar después en Ajustes, y dónde.

**b)** Porque la app no concede el permiso: el permiso lo da el sistema. "Continuar" dice la verdad, sigue el flujo y la decisión viene después, en el diálogo del sistema. "Permitir" promete algo que la app no puede cumplir, presiona para que aceptes y parece que ya aceptaste. Con "Continuar" la persona llega al diálogo y elige ahí, con la información de la pantalla previa.

**c)** La pauta 5.1.1(iv) pide respetar la decisión de la persona y no intentar manipularla, engañarla ni forzarla a dar acceso a datos que no necesita. Una pantalla previa con "Ahora no" o "Cerrar" imita el diálogo del sistema y presiona: duplica la decisión, apura el "no" o lo disfraza de opción neutral. Apple rechaza esas pantallas por esa pauta. El único botón es "Continuar"; la negativa real la da el sistema y, si dice que no, la app tiene que ofrecer una alternativa (entrar la dirección a mano, escribir el código del aula).

**d)** Cambia el texto y el botón. Ya no hay "Continuar" porque no se puede volver a pedir: se explica cómo habilitarlo (Android: Ajustes > Apps > Mantenimiento IPF > Permisos > Cámara; iOS: Ajustes > Mantenimiento IPF > Cámara) y el botón pasa a ser "Abrir Ajustes", con `Linking.openSettings()`. Al volver, la pantalla consulta de nuevo con `useRevisarAlVolver` y, si ya está concedido, sigue el flujo normal. La alternativa sin permiso se mantiene visible.

### F3. Mínimo privilegio

**a)** Aproximada (`ACCESS_COARSE_LOCATION`). Para ordenar los puntos de reciclaje de un barrio por cercanía, un error de 3 km² no cambia nada: igual sabés cuál es el más cercano. La precisa (`ACCESS_FINE_LOCATION`) es para navegación paso a paso o para marcar una puerta exacta, y acá no hace falta. Si la app no la necesita, conviene bloquearla con `blockedPermissions` y pedir solo el acceso aproximado.

**b)** "Siempre" (segundo plano). Registrar una carrera con el celular en el bolsillo significa pantalla apagada y app en segundo plano, y con el "en uso" el sistema corta la ubicación cuando la app deja de estar visible. Así que va el permiso de fondo, con foreground service en Android (`FOREGROUND_SERVICE_LOCATION`) y el modo `location` en iOS. Es un permiso sensible: hay que justificarlo en Google Play con el formulario y el video.

**c)** El selector del sistema. Para subir la foto del DNI necesitás una sola foto, y `ImagePicker.launchImageLibraryAsync()` abre la galería del sistema y le entrega a la app solo el archivo elegido. No pide permiso, no pide `READ_MEDIA_IMAGES` y no le da acceso al resto de las fotos. Es el caso típico de "el mejor permiso es el que no pedís".

**d)** Sin micrófono. Para leer un QR no hay audio: `microphonePermission: false` y `recordAudioAndroid: false` en el plugin de `expo-camera`, más `RECORD_AUDIO` en `blockedPermissions` para asegurarte de que no quede en el manifiesto. La cámara sola alcanza y la app no pide nada de más.

### F4. Tiendas

**a)** De Google Play, dos:

- Declarar en la consola los permisos sensibles que usa la app (ubicación en segundo plano, fotos y videos, contactos, SMS) con su justificación, y que el uso real coincida con lo declarado. Si no coincide, rechazan la actualización.
- Completar bien el formulario de Seguridad de los datos y tener la política de privacidad publicada y accesible. Además hay que mantener actualizado el `targetSdkVersion`, que Play exige subir todos los años.

De App Store, dos:

- Los textos de propósito son obligatorios: si falta el de la cámara, el sistema cierra la app. Y tienen que explicar el uso real, no una frase genérica (pauta 5.1.1(ii)).
- Usar los datos solo para lo declarado y no manipular ni forzar el permiso (pauta 5.1.1). Sumado a eso, el formulario de privacidad de App Store Connect y el `PrivacyInfo.xcprivacy` tienen que coincidir con lo que la app hace.

**b)** `PrivacyInfo.xcprivacy` es un archivo que va dentro del proyecto iOS y declara dos cosas: qué "required reason APIs" usa el código del binario (UserDefaults, timestamps de archivos, tiempo de arranque, espacio en disco, teclado, entre otras) y con qué motivo, y qué datos recolecta la app. Apple lo exige desde 2024 y, si falta, la build avisa o la rechazan. En Expo con prebuild no se toca Xcode: se configura `expo.ios.privacyManifests` en `app.json`:

```jsonc
{
  "expo": {
    "ios": {
      "privacyManifests": {
        "NSPrivacyAccessedAPITypes": [
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
            "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
          }
        ]
      }
    }
  }
}
```

Los paquetes de Expo ya traen su propio `PrivacyInfo.xcprivacy` y prebuild los junta. Si usás una librería de terceros que accede a esas APIs, fijate si trae el archivo en `node_modules/<paquete>/ios` y copiá los motivos a tu configuración.

**c)** Android 17 suma el selector de contactos del sistema: la app pide elegir uno o varios contactos y el sistema le entrega solo eso, sin `READ_CONTACTS`. Para las apps que apuntan a Android 17 también cambia el permiso de red local, que pasa a ser obligatorio (en Android 16 era opcional). Y desde el 27/01/2027 Google Play aplica la política de permisos restringidos: las apps que hoy piden `READ_CONTACTS` tienen que usar el selector de contactos como alternativa de mínimo alcance, o justificar y declarar el acceso amplio en la consola y pasar la revisión. Si la app solo necesita "elegir un contacto para invitar", con el selector alcanza y hay que sacar el permiso del manifiesto; si no, la actualización se rechaza.

### F5. Errores comunes

**a)** Falta el texto de propósito de esa API en el `Info.plist`. Cuando el código nativo toca la cámara, el micrófono o la ubicación, iOS busca la clave (`NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSLocationWhenInUseUsageDescription` y compañía) y, si no está, cierra la app en el acto con ese mensaje. La consola te dice qué clave falta. Se arregla agregando el texto en `app.json` (por el plugin del módulo o en `ios.infoPlist`), corriendo `npx expo prebuild --clean` y compilando de nuevo. No alcanza con una actualización OTA: el `Info.plist` va dentro del binario.

**b)** Casi siempre es que el permiso quedó denegado de un intento anterior: en la development build probaste, dijiste que no, y ya no se puede volver a preguntar (`canAskAgain: false`). En Expo Go andaba porque el permiso que se probaba era el de Expo Go, que es otra app y tiene otro estado. En iOS también pasa si quedó un rechazo viejo. Solución: mostrar la pantalla de bloqueado con "Abrir Ajustes" y, para probar de cero, resetear con `adb shell pm clear`, `xcrun simctl privacy booted reset all` o desinstalando. Fijate también que el texto de propósito esté en la build: si falta, el síntoma es un crash, no una negación silenciosa.

**c)** La app tiene el estado viejo. Habilitar el permiso en Ajustes no le avisa a JavaScript; si la pantalla leyó el hook una sola vez al montarse, se queda con `denied` para siempre. Se arregla consultando de nuevo al volver a la app, con `useRevisarAlVolver(consultarPermiso)` y `AppState`, que llama a `getForegroundPermissionsAsync()` cuando el estado pasa a `active`. Acordate de que en Android revocar un permiso mata el proceso, pero conceder no, y ahí es donde se nota el bug.

**d)** Porque `requestForegroundPermissionsAsync()` está en el cuerpo del componente o en un `useEffect` sin lista de dependencias. Cada render dispara el pedido, el pedido cambia el estado, el estado provoca otro render y así sin fin: la pantalla queda en "Pidiendo permiso..." y el diálogo aparece y desaparece. Se arregla llamándolo desde un botón, o desde un efecto con `[]` y una guarda con `useRef`, y mostrando el estado que devuelve el hook.

**e)** Porque está tratando un permiso opcional como si fuera obligatorio. Las notificaciones no son necesarias para usar la app: si la persona dice que no, la app tiene que seguir andando con la bandeja `/avisos` como alternativa. La pantalla de turnos se muestra igual, solo se oculta o se aclara la parte de avisos. Bloquear todas las pantallas por un permiso denegado es justo lo que la pauta 5.1.1(iv) no quiere, porque fuerza el consentimiento.

## Referencias

- [Expo, guía de permisos](https://docs.expo.dev/guides/permissions/)
- [Expo Notifications, SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)
- [Expo Location, SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/location/)
- [Apple, App Store Review Guidelines 5.1.1](https://developer.apple.com/app-store/review/guidelines/#5.1.1)
- [Google Play, permisos restringidos](https://support.google.com/googleplay/android-developer/answer/16935362)
- [Android 17, selector de contactos](https://developer.android.com/about/versions/17/features#contact-picker)
- [Expo, manifiestos de privacidad](https://docs.expo.dev/guides/apple-privacy/)

# Guía de Estudio y Documentación Técnica para la Defensa Oral
## Proyecto: Mantenimiento IPF — Gestión de Permisos Móviles en React Native
**Autor:** Lucas Zigaran  
**Materia:** Taller Complementario - React Native II  
**Institución:** Instituto Politécnico Formosa  
**Tecnologías:** React Native 0.86, Expo SDK 57, Expo Router, TypeScript

---

## 1. Resumen Ejecutivo del Proyecto

**Mantenimiento IPF** es una aplicación móvil diseñada para que estudiantes y docentes reporten desperfectos en el edificio institucional (iluminación, plomería, equipamiento, etc.).  

El eje temático central de la aplicación es la **gestión integral del ciclo de vida de los permisos móviles**, cumpliendo con los estándares modernos de desarrollo (Android 13+ e iOS 17+), sin recurrir a bibliotecas obsoletas como `expo-permissions`, y aplicando principios de **privacidad por diseño**, **explicación previa (rationale)** y **degradación elegante**.

---

## 2. Conceptos Fundamentales de Permisos Móviles

### ¿Qué es un permiso móvil y por qué existe la "Sandbox" (Caja de Arena)?
* **Sandbox (Caja de arena):** Es el mecanismo de seguridad del sistema operativo donde cada aplicación se ejecuta de forma aislada. Una aplicación tiene acceso exclusivo a su propio espacio de almacenamiento y memoria, y no puede acceder a los datos de otras aplicaciones ni a los recursos del hardware del dispositivo sin una autorización explícita.
* **Permiso móvil:** Es una llave o autorización que el usuario concede a la aplicación para salir de su sandbox y acceder a recursos sensibles: hardware (cámara, GPS, micrófono) o datos privados (contactos, fotos, almacenamiento).
* **Objetivo:** Proteger la privacidad del usuario, evitar cobros indebidos, impedir espionaje y evitar el consumo desmedido de batería y recursos en segundo plano.

### ¿Cuál es la diferencia entre "Declarar" y "Solicitar" un permiso?
1. **Declarar (en tiempo de compilación):** Se especifica formalmente qué permisos requerirá la aplicación.
   * **En Android:** Se registran en `AndroidManifest.xml` con `<uses-permission android:name="..." />`.
   * **En iOS:** Se definen en `Info.plist` acompañados obligatoriamente de un mensaje de propósito (`NSCameraUsageDescription`, etc.).
   * **En Expo:** Se declaran en `app.json` mediante la configuración de plugins y las secciones `ios.infoPlist` y `android.permissions`. Durante `npx expo prebuild`, Expo genera automáticamente los archivos nativos.
   * *Si no se declara:* En Android la solicitud es rechazada inmediatamente sin mostrar diálogo; en iOS la app se cierra por excepción crítica (*crash*).
2. **Solicitar (en tiempo de ejecución / Runtime):** Es la invocación desde el código JavaScript/TypeScript para que el sistema operativo muestre el cuadro de diálogo al usuario y este acepte o deniegue el acceso.
   * *Regla moderna:* Nunca pedir permisos al iniciar la aplicación. Se deben solicitar en el momento exacto en que el usuario intenta realizar la acción (*just-in-time*).

### ¿Cuáles son los estados del ciclo de vida de un permiso?
* **Sin decidir (`undetermined` / `preguntable`):** El usuario aún no fue consultado. Se puede mostrar el diálogo nativo mediante `requestPermissionsAsync()`.
* **Concedido (`granted`):** El usuario otorgó el permiso. La app puede utilizar el recurso directamente.
* **Denegado preguntable (`denied`, `canAskAgain: true`):** El usuario rechazó el permiso una vez, pero el sistema aún permite solicitarlo de nuevo.
* **Bloqueado (`denied`, `canAskAgain: false`):** En Android ocurre cuando el usuario marca "No volver a preguntar" o deniega por segunda vez. En iOS ocurre tras la primera negativa. La aplicación **ya no puede abrir el diálogo nativo**; la única forma de recuperarlo es redirigir al usuario a los Ajustes del sistema (`Linking.openSettings()`).

### ¿Por qué está prohibido `expo-permissions`?
`expo-permissions` era una biblioteca unificada que centralizaba todos los permisos en versiones viejas de Expo. Fue **deprecada** porque violaba el principio de modularidad y provocaba que aplicaciones incluyeran permisos no deseados en el manifiesto nativo. En Expo SDK 57 cada módulo oficial gestiona sus propios permisos:
* `expo-camera` gestiona la cámara.
* `expo-location` gestiona el GPS/ubicación.
* `expo-image-picker` gestiona la selección multimedia.
* `expo-notifications` gestiona las notificaciones locales y remotas.

### ¿Por qué la galería de fotos no pide permiso en este proyecto?
En Android 13+ y en iOS moderno se utiliza el **Photo Picker del sistema** (`ImagePicker.launchImageLibraryAsync()`). Este componente corre en un proceso independiente fuera de la aplicación: el usuario elige puntualmente qué foto compartir y el sistema entrega a la app únicamente el URI de esa imagen. No se requiere solicitar permiso de lectura general de almacenamiento (`READ_MEDIA_IMAGES` o `READ_EXTERNAL_STORAGE`), respetando la privacidad del usuario.

---

## 3. Preguntas de React, JavaScript y Hooks (Mesa Evaluadora)

### ¿Qué es una función Callback?
Una **función callback** es una función que se pasa como argumento a otra función, con la intención de que sea ejecutada ("llamada de vuelta") en un momento posterior, usualmente al completarse una tarea asíncrona o ante la ocurrencia de un evento.

**Ejemplos en el proyecto:**
1. **En eventos de componentes:** En `src/app/reporte/escanear.tsx`, la propiedad `onBarcodeScanned` recibe un callback que se ejecuta cuando el sensor de la cámara reconoce un código QR:
   ```tsx
   onBarcodeScanned={(resultado) => {
     actualizarBorrador({ aula: resultado.data });
     router.back();
   }}
   ```
2. **En actualización de estado de React:** En `src/lib/reportes.tsx`, cuando se actualiza el estado basándose en el estado previo:
   ```tsx
   setReportes((anteriores) => [nuevo, ...anteriores]);
   ```
   Aquí `(anteriores) => [nuevo, ...anteriores]` es un callback que garantiza trabajar con el valor más reciente del estado.
3. **En suscripciones al sistema:** En `usePermiso.ts`:
   ```tsx
   AppState.addEventListener('change', (estadoApp) => {
     if (estadoApp === 'active') void actualizar();
   });
   ```

---

### ¿Qué es un Hook en React y cuáles son sus reglas?
Un **Hook** es una función especial que permite a los componentes funcionales "engancharse" a las características de estado y ciclo de vida de React.
* **Regla 1:** Solo deben llamarse en el nivel superior del componente (no dentro de bucles, condicionales ni funciones anidadas).
* **Regla 2:** Solo deben llamarse desde componentes funcionales de React o desde otros Hooks personalizados.

---

### ¿Qué hace el hook `useState`?
Declara una variable de estado que React preserva entre renderizados. Cuando la función actualizadora se ejecuta, React agenda un nuevo render del componente con los datos actualizados.
```tsx
const [mensaje, setMensaje] = useState('');
```

---

### ¿Qué hace el hook `useEffect` y qué es la función de limpieza (cleanup)?
Permite ejecutar efectos secundarios en componentes (peticiones de red, suscripciones de eventos, temporizadores).
* Se ejecuta luego de que el componente se monta o cuando cambian las variables de su arreglo de dependencias `[dependencia]`.
* **Función de limpieza (cleanup function):** Es la función retornada por `useEffect`. Se ejecuta antes de desmontar el componente o antes de volver a ejecutar el efecto. Sirve para cancelar suscripciones, temporizadores y evitar pérdidas de memoria (*memory leaks*):
  ```tsx
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', callback);
    return () => suscripcion.remove(); // LIMPIEZA
  }, []);
  ```

---

### ¿Qué hace el hook `useRef` y en qué se diferencia de `useState`?
`useRef` devuelve un objeto mutable con la propiedad `.current` que persiste durante toda la vida del componente.
* **Diferencia clave con `useState`:** Modificar `.current` **NO** dispara un re-renderizado del componente.
* **Uso en el proyecto (`src/hooks/useRevisarAlVolver.ts`):** Guarda el estado anterior de la app (`AppState.currentState`) para comparar si la app regresó de segundo plano a primer plano sin forzar renders innecesarios:
  ```tsx
  const anterior = useRef(AppState.currentState);
  // Al cambiar el estado:
  const estabaAfuera = anterior.current.match(/inactive|background/) !== null;
  anterior.current = nuevo;
  ```
* También se utiliza en `src/app/reporte/foto.tsx` como bandera (`continuarCamara = useRef(false)`) para recordar si el usuario venía de pedir el permiso de cámara.

---

### ¿Qué hace el hook `useCallback` y por qué es importante?
`useCallback` memoriza una definición de función entre renderizados. Devuelve la misma referencia de la función a menos que cambien sus dependencias.
* **Por qué se usa en `usePermiso.ts`:** Las funciones `actualizar` y `pedir` se pasan a las dependencias de `useEffect` y `useFocusEffect`. Si no tuvieran `useCallback`, en cada render se crearía una nueva instancia de la función, provocando un **bucle infinito de re-renderizados**.

---

### ¿Qué hace el hook `useContext`?
Permite consumir datos de un Contexto global sin tener que pasar propiedades manualmente por todos los niveles del árbol de componentes (*prop drilling*).
* En el proyecto, `useReportes()` consume `ReportesProvider`, permitiendo acceder a los reportes, avisos y funciones de creación desde cualquier pantalla (`nuevo.tsx`, `index.tsx`, `[id].tsx`).

---

### ¿Qué hace el hook `useFocusEffect` (Expo Router / React Navigation)?
Se ejecuta cada vez que la pantalla entra en foco (se hace visible) y limpia cuando la pantalla pierde el foco.
* **Por qué es necesario en permisos:** Si el usuario abre la pantalla de un permiso modal (`/permisos/[recurso]`), concede el permiso y regresa, la pantalla previa se reenfoca. `useFocusEffect` detecta ese foco y re-evalúa el estado del permiso en pantalla automáticamente.

---

### ¿Qué hacen `useRouter` y `useLocalSearchParams`?
Son hooks provistos por **Expo Router** (enrutamiento basado en archivos):
* `useRouter`: Permite la navegación programática (`router.push('/ruta')`, `router.back()`, `router.replace('/')`).
* `useLocalSearchParams`: Extrae los parámetros pasados por la URL dinámica, por ejemplo el `[id]` en `/reporte/[id]` o el `[recurso]` en `/permisos/[recurso]`.

---

## 4. Funciones Críticas del Proyecto y Explicación de Código

### 1. `consultarPermiso` vs `pedirPermiso` (`src/lib/permisos.ts`)
* **`consultarPermiso(recurso)`:** Invoca los métodos `get...PermissionsAsync()` (como `Camera.getCameraPermissionsAsync()`). Solo inspecciona el estado actual guardado por el sistema. **Nunca abre un diálogo visible al usuario**.
* **`pedirPermiso(recurso)`:** Invoca los métodos `request...PermissionsAsync()`. Si el estado es preguntable, el sistema operativo despliega el cuadro de diálogo con los botones de conceder o rechazar.

### 2. Hook Personalizado `usePermiso(recurso)` (`src/hooks/usePermiso.ts`)
Es el corazón de la arquitectura de permisos del proyecto. Centraliza:
* El estado actual (`'cargando' | 'concedido' | 'preguntable' | 'bloqueado'`).
* La función `pedir()` para disparar la solicitud.
* Detección reactiva mediante `AppState`: cuando el usuario va a Ajustes del teléfono, concede el permiso y vuelve a la app, `AppState` pasa a `'active'` y el hook consulta automáticamente el estado actualizado.
* Revalidación mediante `useFocusEffect` al regresar de pantallas modales.

### 3. Degradación Elegante en Ubicación (`src/app/reporte/ubicacion.tsx`)
Si el usuario rechaza o bloquea el permiso de GPS:
* La aplicación no se rompe ni le impide continuar.
* Informa con claridad que la ubicación por sensor no está disponible y habilita una botonera manual para seleccionar el sector del establecimiento (`Laboratorio de informática`, `Biblioteca`, `Taller`, `Patio central`, etc.).
* Distingue además entre ubicación exacta (`fine` / `full`) y aproximada (`coarse` / `reduced`).

### 4. Notificaciones Locales y Canales de Android (`src/lib/notificaciones.ts`)
* **Canales en Android (`NotificationChannel`):** Desde Android 8.0 (API 26), toda notificación debe pertenecer obligatoriamente a un canal configurado. La función `crearCanalAvisos()` registra el canal `'reportes'` antes de agendar avisos.
* **Trigger temporal:** `programarAvisoResolucion()` utiliza un disparador de tipo `TIME_INTERVAL` de 10 segundos para simular la alerta de resolución del reclamo en segundo plano.

---

## 5. Simulacro de Preguntas Frecuentes para la Defensa Oral

**P1: ¿Por qué no pidieron el permiso de cámara apenas se abre la app?**  
*R:* Porque es una mala práctica de experiencia de usuario y privacidad. El usuario no sabe aún para qué se usará y suele rechazarlo. Los permisos deben solicitarse *justo a tiempo* (*just-in-time*), cuando el usuario pulsa voluntariamente "Escanear QR" o "Sacar foto", precedido por una pantalla previa que explica el beneficio del permiso.

**P2: Si el usuario presiona "Rechazar" y luego "No volver a preguntar", ¿qué sucede y cómo lo soluciona la app?**  
*R:* El permiso pasa a estado *bloqueado* (`canAskAgain: false`). Si llamamos a `requestPermissionsAsync()`, el sistema no muestra nada y deniega inmediatamente. La app detecta este estado, oculta el botón de pedir permiso y ofrece un botón "Abrir Ajustes", invocando `Linking.openSettings()` para guiar al usuario a la configuración del sistema. Al regresar, el listener de `AppState` refresca el estado en tiempo real.

**P3: ¿Qué diferencia hay entre `AppState` y la navegación de pantallas?**  
*R:* La navegación de pantallas ocurre internamente dentro de la app (cambiar entre tabs o rutas). `AppState` monitorea el ciclo de vida de la aplicación respecto al sistema operativo (`active`, `background`, `inactive`). Es crucial para saber cuándo el usuario salió a la pantalla de Ajustes del teléfono y regresó a la app.

**P4: ¿Por qué se utilizó TypeScript en lugar de JavaScript simple?**  
*R:* Para garantizar seguridad de tipos, autocompletado y evitar errores en tiempo de ejecución. Permite tipar estrictamente los recursos (`'camara' | 'ubicacion' | 'fotos' | 'notificaciones'`), los estados de los permisos y los modelos de datos (`Reporte`, `Borrador`, `Aviso`).

---
*Documento preparado como soporte de estudio y defensa técnica del proyecto.*

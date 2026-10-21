# Capturas para la entrega

Acá van las capturas que pide la consigna del TP3. La app se prueba en un celular Android con la development build (`npx expo run:android`) y, si hay Mac, en el simulador de iOS (`npx expo run:ios`). Conviene tomarlas con la pantalla completa y el nombre de archivo que figura abajo.

## Lista de capturas

| Archivo | Qué tiene que mostrar |
| --- | --- |
| `01-escanear-cargando.png` | `/reporte/escanear` con el indicador de carga, antes de leer el permiso |
| `02-escanear-preguntable.png` | `/reporte/escanear` con la explicación y el botón "Continuar" |
| `03-escanear-concedido.png` | `/reporte/escanear` con la cámara abierta y el mensaje "Apuntá al QR de la puerta del aula" |
| `04-escanear-bloqueado.png` | `/reporte/escanear` con el aviso de bloqueado, el botón "Abrir Ajustes" y el campo para escribir el aula a mano |
| `05-permiso-modal.png` | La pantalla previa `/permisos/camara` con el beneficio, el botón "Continuar" y la aclaración de Ajustes |
| `06-ubicacion-concedida.png` | `/reporte/ubicacion` con la ubicación guardada (aproximada o con coordenadas) |
| `07-ubicacion-denegada.png` | `/reporte/ubicacion` con el permiso denegado y los sectores para elegir a mano |
| `08-foto-selector.png` | `/reporte/foto` con la foto elegida desde la galería del sistema, sin diálogo de permiso |
| `09-notificacion.png` | La notificación "Reporte resuelto" recibida en el celular después de "Simular resolución" |
| `10-avisos.png` | `/avisos` con el aviso del reporte resuelto |
| `11-permisos-antes.png` | `/permisos` con un permiso en estado preguntable o bloqueado |
| `12-permisos-despues.png` | `/permisos` actualizado después de volver de Ajustes, con el permiso concedido |
| `13-dialogo-sistema.png` | El diálogo del sistema con el texto de propósito propio, en una development build (por ejemplo el de la cámara) |
| `14-aula-manual.png` | El formulario con el aula cargada a mano después de denegar la cámara |

## Cómo sacarlas

1. Compilar la development build en el celular: `npx expo run:android`.
2. Para forzar los estados de permiso y poder repetir las tomas:
   - Android: `adb shell pm clear com.ipf.mantenimientoipf` deja todo como recién instalado.
   - iOS: `xcrun simctl privacy booted reset all com.ipf.mantenimientoipf`.
3. Para la captura del diálogo del sistema (`13-dialogo-sistema.png`) hay que pedir el permiso desde la pantalla previa y sacar la foto justo cuando aparece el diálogo. En Expo Go no sirve: el texto que se ve es el de Expo Go, no el de la app.
4. Para la captura de la notificación, dejar la app en segundo plano y esperar los 10 segundos que tarda "Simular resolución".

Las imágenes van en esta misma carpeta, con los nombres de la tabla. Se pueden comprimir para que el repo no crezca de más.

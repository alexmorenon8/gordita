# Un mes juntos ♡

Página romántica para celebrar vuestro primer mes, servida con Docker Compose. No necesita dependencias de Node ni un backend.

## Cómo abrirla con Docker Compose

Desde esta carpeta ejecuta:

```bash
docker compose up --build -d
```

Después abre [http://localhost:8090](http://localhost:8090) en el navegador.

Para detenerla:

```bash
docker compose down
```

El puerto es `8090` para no interferir con otros proyectos locales que ya usan los puertos `8080` y `8081`.

## Personalizarla

- **Título, mensajes y despedida:** edita los textos señalados con `PERSONALIZA` dentro de `index.html`.
- **Frases de los corazones:** abre `app.js` y modifica el array `loveNotes`. Para añadir otra frase, incorpora una nueva línea entre las frases existentes, por ejemplo: `"Nuestra frase especial.",`.
- **Recuerdos:** modifica el array `memories` de `app.js`. Cada recuerdo tiene un `title` y un `text`; puedes duplicar uno para añadir más.
- **Fotos:** pulsa una foto para verla grande. Para ver, añadir o borrar fotos compartidas, pulsa **“Entrar con Google”** y usa una de las dos cuentas autorizadas. Las fotos se guardan en Supabase y se ven desde cualquier dispositivo autorizado.

## Acceso privado con Google

La página usa Google para entrar y Supabase para proteger el álbum. Antes de publicarla, copia y ejecuta el contenido de `supabase-access.sql` en **Supabase → SQL Editor**. Incluye las dos direcciones autorizadas, protege la tabla `gallery_photos` y deja privado el bucket `gordita-photos`.

La página de GitHub Pages es estática: el código y los textos de la página se pueden descargar si alguien conoce el enlace. Lo que queda realmente privado con esta configuración son las fotos y las acciones de añadir o borrar.

Los colores y las animaciones están en `styles.css`, por si quieres ajustar la estética.

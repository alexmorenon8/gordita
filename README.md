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
- **Fotos:** pulsa **“Añadir nuestras fotos”** y selecciona una o varias imágenes. Se verán en la página de forma privada y temporal: no se suben a internet ni se guardan en una carpeta. Al recargar la página tendrás que seleccionarlas de nuevo.

Los colores y las animaciones están en `styles.css`, por si quieres ajustar la estética.

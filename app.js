import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { photoBucket, supabasePublishableKey, supabaseUrl } from "./supabase-config.js";

const supabase = createClient(supabaseUrl, supabasePublishableKey);

// PERSONALIZA AQUÍ: cambia las frases o añade una nueva línea entre las llaves.
const loveNotes = [
  "Solo con verte haces que me salga una sonrisa.",
  "No sabía que una sonrisa podría enamorarme tanto.",
  "Un mes ha bastado para saber que quiero muchos más a tu lado.",
];

// PERSONALIZA AQUÍ: sustituye estos recuerdos por los vuestros o añade más objetos.
const memories = [
  { title: "La primera vez que nos reímos sin parar", text: "Ese momento en el que todo se sintió fácil y entendí que contigo podía ser yo." },
  { title: "Nuestros momentos de cocinar, nuestros berrinches, nuestras risas locas", text: "Pequeñas cosas que para el mundo son nada, pero para mí ya tienen tu nombre." },
  { title: "Este primer mes día 12 de octubre", text: "Un montón de instantes bonitos que son apenas el comienzo de nuestra historia." },
];

const loveNotesContainer = document.querySelector("#love-notes");
loveNotes.forEach((note) => {
  const article = document.createElement("article");
  article.className = "love-note";
  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute("aria-label", "Ver frase de amor");
  article.innerHTML = `<div class="love-note-inner"><div class="love-note-face love-note-front" aria-hidden="true">♥</div><div class="love-note-face love-note-back"><span>${note}</span></div></div>`;
  article.addEventListener("click", () => article.classList.toggle("is-flipped"));
  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      article.classList.toggle("is-flipped");
    }
  });
  loveNotesContainer.append(article);
});

const memoriesContainer = document.querySelector("#memories");
memories.forEach((memory, index) => {
  const item = document.createElement("li");
  item.className = "memory";
  item.innerHTML = `<span class="memory-number">0${index + 1}</span><div><h3>${memory.title}</h3><p>${memory.text}</p></div>`;
  memoriesContainer.append(item);
});

const input = document.querySelector("#photo-upload");
const gallery = document.querySelector("#photo-gallery");
const status = document.querySelector("#upload-status");
let sharedPhotos = [];
let activeSession = null;

function renderPlaceholders() {
  ["Un recuerdo<br />bonito", "Una foto<br />juntos", "Otro instante<br />nuestro"].forEach((text, index) => {
    const placeholder = document.createElement("div");
    placeholder.className = `photo-placeholder placeholder-${["one", "two", "three"][index]}`;
    placeholder.innerHTML = `<span>${text}</span>`;
    gallery.append(placeholder);
  });
}

function openPhoto(photoUrl) {
  const lightbox = document.createElement("div");
  lightbox.className = "photo-lightbox";
  lightbox.innerHTML = `<button type="button" class="close-lightbox" aria-label="Cerrar foto">×</button><img src="${photoUrl}" alt="Una foto de nuestros recuerdos" />`;
  const close = () => lightbox.remove();
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  lightbox.querySelector(".close-lightbox").addEventListener("click", close);
  document.body.append(lightbox);
}

function renderGallery() {
  gallery.replaceChildren();
  if (!sharedPhotos.length) {
    renderPlaceholders();
    return;
  }

  sharedPhotos.forEach((photo) => {
    const card = document.createElement("figure");
    card.className = "photo-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Ver esta foto en grande");
    card.innerHTML = `<img src="${photo.url}" alt="Una foto de nuestros recuerdos" />${activeSession ? '<button class="remove-photo" type="button" aria-label="Quitar esta foto">×</button>' : ""}`;
    card.addEventListener("click", () => openPhoto(photo.url));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPhoto(photo.url);
      }
    });
    card.querySelector(".remove-photo")?.addEventListener("click", async (event) => {
      event.stopPropagation();
      const { error: storageError } = await supabase.storage.from(photoBucket).remove([photo.path]);
      const { error: databaseError } = await supabase.from("gallery_photos").delete().eq("path", photo.path);
      if (storageError || databaseError) {
        status.textContent = "No se pudo eliminar esta foto.";
        return;
      }
      status.textContent = "Foto eliminada para todos los dispositivos.";
      loadSharedPhotos();
    });
    gallery.append(card);
  });
}

function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      const maxSize = 1280;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(source);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("No se pudo leer una de las fotos."));
    };
    image.src = source;
  });
}

async function loadSharedPhotos() {
  const { data, error } = await supabase.from("gallery_photos").select("path").order("created_at", { ascending: true });
  if (error) {
    status.textContent = "No se pudieron cargar las fotos compartidas todavía.";
    return;
  }
  sharedPhotos = data.map((photo) => ({
    path: photo.path,
    url: supabase.storage.from(photoBucket).getPublicUrl(photo.path).data.publicUrl,
  }));
  renderGallery();
  if (sharedPhotos.length) status.textContent = `${sharedPhotos.length} ${sharedPhotos.length === 1 ? "foto compartida" : "fotos compartidas"} en vuestro álbum.`;
}

async function updateSession() {
  const { data } = await supabase.auth.getSession();
  activeSession = data.session;
  if (!activeSession) {
    const { data: anonymousData, error } = await supabase.auth.signInAnonymously();
    if (error) {
      status.textContent = "Activa los inicios de sesión anónimos en Supabase para poder añadir fotos sin email.";
      return;
    }
    activeSession = anonymousData.session;
  }
  renderGallery();
}

input.addEventListener("change", async (event) => {
  const files = [...event.target.files].filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;
  if (!activeSession) {
    status.textContent = "Preparando el álbum compartido. Prueba de nuevo en un momento.";
    input.value = "";
    return;
  }

  status.textContent = "Subiendo fotos para que podáis verlas desde cualquier sitio…";
  try {
    const photos = await Promise.all(files.map(compressPhoto));
    for (const photo of photos) {
      const filePath = `${crypto.randomUUID()}.jpg`;
      const imageBlob = await (await fetch(photo)).blob();
      const { error: storageError } = await supabase.storage.from(photoBucket).upload(filePath, imageBlob, { contentType: "image/jpeg" });
      if (storageError) throw storageError;
      const { error: databaseError } = await supabase.from("gallery_photos").insert({ path: filePath });
      if (databaseError) {
        await supabase.storage.from(photoBucket).remove([filePath]);
        throw databaseError;
      }
    }
    await loadSharedPhotos();
    status.textContent = `${photos.length} ${photos.length === 1 ? "foto subida" : "fotos subidas"}. Ya se ven en todos los dispositivos.`;
  } catch (error) {
    status.textContent = error.message || "No se pudieron subir las fotos.";
  }
  input.value = "";
});

renderGallery();
updateSession();
loadSharedPhotos();

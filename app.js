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

input.addEventListener("change", (event) => {
  const files = [...event.target.files].filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;

  gallery.replaceChildren();
  files.forEach((file) => {
    const imageUrl = URL.createObjectURL(file);
    const card = document.createElement("figure");
    card.className = "photo-card";
    card.innerHTML = `<img src="${imageUrl}" alt="Una foto de nuestros recuerdos" /><button class="remove-photo" type="button" aria-label="Quitar esta foto">×</button>`;
    card.querySelector(".remove-photo").addEventListener("click", () => {
      URL.revokeObjectURL(imageUrl);
      card.remove();
      if (!gallery.children.length) status.textContent = "No quedan fotos. Puedes elegir otras cuando quieras.";
    });
    gallery.append(card);
  });
  status.textContent = `${files.length} ${files.length === 1 ? "foto añadida" : "fotos añadidas"}. No se han subido a ningún sitio.`;
  input.value = "";
});

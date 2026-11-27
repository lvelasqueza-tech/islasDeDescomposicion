const lenis = new Lenis({
  anchors: true,
  orientation: 'horizontal',
  gestureOrientation: 'both', // la rueda vertical mueve el scroll horizontal
});

const backgroundTrack = document.querySelector('.scroll-background');
const backgroundSources = [
  'recursos/jpgs/back-2.jpg',
  'recursos/jpgs/back-3.jpg',
];
let backgroundImages = [];

function actualizarFondo(scrollActual = lenis.scroll) {
  if (!backgroundTrack || backgroundImages.length === 0) return;

  backgroundTrack.replaceChildren();
  const anchoNecesario = document.documentElement.scrollWidth + window.innerWidth;
  let anchoCubierto = 0;
  let indice = 0;

  while (anchoCubierto < anchoNecesario) {
    const fondo = backgroundImages[indice % backgroundImages.length];
    const imagen = document.createElement('img');
    const ancho = (fondo.naturalWidth / fondo.naturalHeight) * window.innerHeight;

    imagen.src = fondo.src;
    imagen.alt = '';
    imagen.draggable = false;
    imagen.style.width = `${ancho}px`;
    backgroundTrack.append(imagen);

    anchoCubierto += ancho;
    indice += 1;
  }

  backgroundTrack.style.transform = `translate3d(${-scrollActual}px, 0, 0)`;
}

if (backgroundTrack) {
  Promise.all(backgroundSources.map((src) => {
    const imagen = new Image();
    imagen.src = src;
    return imagen.decode().then(() => imagen);
  }))
    .then((imagenes) => {
      backgroundImages = imagenes;
      actualizarFondo();
    })
    .catch((error) => {
      console.error('No se pudieron cargar las imágenes del fondo horizontal.', error);
    });
}

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- ANIMACIÓN DEL LOGO CON SCROLL ---
const heroLogo = document.querySelector('.hero__logo');
const headerLogoAncla = document.querySelector('.site-header .logo');
const sectionProgress = document.querySelector('.section-progress');
const distanciaMaxLogo = 500;
let sectionCenters = [];
let sectionDots = [];
let sectionWalker;
let walkerStopTimer;
let lastScrollPosition = lenis.scroll;
let scrollDirection = 1;

function actualizarLogo(scrollActual) {
  if (!heroLogo || !headerLogoAncla) return;

  // Distancia en px de scroll que dura la transición
  const progreso = Math.min(Math.max(scrollActual / distanciaMaxLogo, 0), 1);

  // Coordenadas iniciales (centro horizontal, 32% desde arriba)
  const inicioX = window.innerWidth * 0.5;
  const inicioY = window.innerHeight * 0.32;

  // Coordenadas finales (centro del espacio .logo en el header)
  const rectDestino = headerLogoAncla.getBoundingClientRect();
  const finX = rectDestino.left + rectDestino.width / 2;
  const finY = rectDestino.top + rectDestino.height / 2;

  // Escala final calculada según el ancho del ancla en el header
  const escalaFinal = rectDestino.width / heroLogo.offsetWidth;
  const escalaActual = 1 - (1 - escalaFinal) * progreso;

  const posX = inicioX + (finX - inicioX) * progreso;
  const posY = inicioY + (finY - inicioY) * progreso;

  heroLogo.style.left = `${posX}px`;
  heroLogo.style.top = `${posY}px`;
  heroLogo.style.transform = `translate(-50%, -50%) scale(${escalaActual})`;
}

function prepararIndicadorSecciones() {
  if (!sectionProgress) return;

  const secciones = [...document.querySelectorAll('.horizontal main > section')];
  sectionCenters = secciones.map((seccion) => (
    seccion.offsetLeft + seccion.offsetWidth / 2
  ));
  sectionProgress.replaceChildren();
  sectionProgress.style.width = `${document.documentElement.scrollWidth}px`;

  if (sectionCenters.length > 1) {
    const linea = document.createElement('span');
    linea.className = 'section-progress__line';
    linea.style.left = `${sectionCenters[0]}px`;
    linea.style.width = `${sectionCenters[sectionCenters.length - 1] - sectionCenters[0]}px`;
    sectionProgress.append(linea);
  }

  sectionDots = sectionCenters.map((centro) => {
    const punto = document.createElement('span');
    punto.className = 'section-progress__dot';
    punto.style.left = `${centro}px`;
    sectionProgress.append(punto);
    return punto;
  });

  sectionWalker = document.createElement('span');
  sectionWalker.className = 'section-progress__walker';
  sectionProgress.append(sectionWalker);
}

function actualizarIndicadorSecciones(scrollActual = lenis.scroll) {
  if (!sectionProgress || sectionCenters.length === 0) return;

  if (scrollActual !== lastScrollPosition) {
    scrollDirection = scrollActual > lastScrollPosition ? 1 : -1;
    lastScrollPosition = scrollActual;
  }

  sectionProgress.style.transform = `translate3d(${-scrollActual}px, 0, 0)`;
  sectionProgress.classList.toggle('is-visible', scrollActual >= distanciaMaxLogo);

  const centroViewport = scrollActual + window.innerWidth / 2;
  sectionWalker.style.left = `${centroViewport}px`;
  sectionWalker.classList.toggle('is-reversed', scrollDirection < 0);
  let indiceActual = 0;

  for (let indice = 1; indice < sectionCenters.length; indice += 1) {
    if (Math.abs(sectionCenters[indice] - centroViewport) <
        Math.abs(sectionCenters[indiceActual] - centroViewport)) {
      indiceActual = indice;
    }
  }

  sectionDots.forEach((punto, indice) => {
    punto.classList.toggle('is-current', indice === indiceActual);
  });
}

function animarCaminanteDuranteScroll() {
  if (!sectionProgress) return;

  sectionProgress.classList.add('is-scrolling');
  window.clearTimeout(walkerStopTimer);
  walkerStopTimer = window.setTimeout(() => {
    sectionProgress.classList.remove('is-scrolling');
  }, 180);
}

prepararIndicadorSecciones();
actualizarIndicadorSecciones(0);

lenis.on('scroll', ({ scroll }) => {
  actualizarLogo(scroll);
  actualizarFondo(scroll);
  actualizarIndicadorSecciones(scroll);
  animarCaminanteDuranteScroll();
});

window.addEventListener('resize', () => {
  prepararIndicadorSecciones();
  actualizarLogo(lenis.scroll);
  actualizarFondo();
  actualizarIndicadorSecciones();
});
window.addEventListener('load', () => actualizarLogo(lenis.scroll));
actualizarLogo(0);

// --- SWIPERS ---
['.swiper-1', '.swiper-2', '.swiper-3'].forEach((selector) => {
  new Swiper(selector, {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: { el: `${selector} .swiper-pagination`, clickable: true },
    navigation: {
      nextEl: `${selector} .swiper-button-next`,
      prevEl: `${selector} .swiper-button-prev`,
    },
  });
});
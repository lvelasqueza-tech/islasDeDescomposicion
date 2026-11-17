const lenis = new Lenis({ anchors: true });

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

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

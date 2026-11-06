(() => {

  const blocks = document.querySelectorAll('.js-motion');

  if (!blocks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-paused', !entry.isIntersecting);
    });
  });

  blocks.forEach((block) => observer.observe(block));

})();

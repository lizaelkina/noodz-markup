(() => {

  const accordion = document.querySelector('.js-accordion');

  if (!accordion) return;

  accordion.addEventListener('click', ({target}) => {
    const button = target.closest('.js-accordion-button');

    if (!button) return;

    const item = button.closest('.js-accordion-item');
    const isOpen = item.classList.toggle('is-open');

    button.setAttribute('aria-expanded', String(isOpen));
  });

})();

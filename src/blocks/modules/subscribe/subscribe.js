(() => {
  const subscribeForm = document.querySelector('.js-subscribe-form');

  if (!subscribeForm) return;

  const liveStatus = subscribeForm.querySelector('.js-subscribe-status');
  const submitButton = subscribeForm.querySelector('.js-subscribe-submit');
  const successText = subscribeForm.querySelector('.js-subscribe-message');

  if (!liveStatus || !submitButton || !successText) return;

  const successMessage = successText.textContent.trim();

  const SUCCESS_MESSAGE_DURATION_MS = 2000;

  let isSubmitting = false;

  function delay(duration) {
    return new Promise(resolve => window.setTimeout(resolve, duration));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    isSubmitting = true;
    submitButton.setAttribute('aria-disabled', 'true');

    try {
      subscribeForm.reset();
      liveStatus.textContent = successMessage;
      successText.classList.add('is-success');
      await delay(SUCCESS_MESSAGE_DURATION_MS);
      successText.classList.remove('is-success');
      liveStatus.textContent = '';
    } finally {
      submitButton.removeAttribute('aria-disabled');
      isSubmitting = false;
    }
  }

  subscribeForm.addEventListener('submit', handleSubmit);

})();

(() => {

  const smile = document.querySelector('.js-smile');

  if (!smile) return;

  const tongue = smile.querySelector('.js-smile-tongue');

  if (!tongue) return;

  // counted from the tap, the tease itself takes 0.9s
  const TOUCH_HOLD_MS = 2000;

  let state = 'idle';
  let isActive = false;
  let pointerType = '';
  let touchTimer = 0;

  function tease() {
    state = 'teasing';
    smile.classList.remove('is-calming');
    smile.classList.add('is-teasing');
  }

  function calm() {
    state = 'calming';
    smile.classList.remove('is-teasing');
    smile.classList.add('is-calming');
  }

  function activate() {
    isActive = true;

    if (state === 'idle') tease();
  }

  function release() {
    isActive = false;

    if (state === 'teased') calm();
  }

  function handlePointerEnter(event) {
    if (event.pointerType !== 'mouse') return;

    activate();
  }

  function handlePointerLeave(event) {
    if (event.pointerType !== 'mouse') return;

    release();
  }

  function handlePointerDown(event) {
    pointerType = event.pointerType;
  }

  // click comes only after a tap, not after a swipe, so scrolling does not tease
  function handleClick() {
    if (pointerType === 'mouse') return;

    window.clearTimeout(touchTimer);
    touchTimer = window.setTimeout(release, TOUCH_HOLD_MS);
    activate();
  }

  function handleAnimationEnd(event) {
    if (event.target !== tongue) return;

    if (state === 'teasing') {
      state = 'teased';

      if (!isActive) calm();

      return;
    }

    if (state === 'calming') {
      state = 'idle';
      smile.classList.remove('is-calming');

      if (isActive) tease();
    }
  }

  smile.addEventListener('pointerenter', handlePointerEnter);
  smile.addEventListener('pointerleave', handlePointerLeave);
  smile.addEventListener('pointerdown', handlePointerDown);
  smile.addEventListener('click', handleClick);
  smile.addEventListener('animationend', handleAnimationEnd);

})();

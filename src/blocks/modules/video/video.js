import {down} from '../../../js/breakpoints/breakpoints';

(() => {

  const PLAYER_ORIGIN = 'https://rutube.ru';

  const videoSection = document.querySelector('.js-video-section');

  if (!videoSection) return;

  const status = videoSection.querySelector('.js-video-status');
  const videoContainer = videoSection.querySelector('.js-video-container');
  const playButton = videoSection.querySelector('.js-video-play');
  let iframe = videoSection.querySelector('.js-video-iframe');
  const closeButton = videoSection.querySelector('.js-video-close');
  const expandButton = videoSection.querySelector('.js-video-expand');


  if (!videoContainer || !playButton || !iframe || !closeButton || !expandButton || !status) return;

  const isMobileMediaQuery = window.matchMedia(down('tablet'));
  let observer = null;
  let isIntersecting = true;
  let isAutoFullscreen = false;

  const isPlaying = () => videoContainer.classList.contains('is-playing');
  const isSticky = () => videoContainer.classList.contains('is-sticky');

  const announceStatus = (text) => {
    status.textContent = text;
  };

  const sendPlayerCommand = (type) => {
    iframe.contentWindow.postMessage(JSON.stringify({type, data: {}}), PLAYER_ORIGIN);
  };

  const handlePlayerMessage = (event) => {
    if (event.origin !== PLAYER_ORIGIN || event.source !== iframe.contentWindow) return;

    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }

    if (message.type === 'player:ready') sendPlayerCommand('player:play');
  };

  const destroyPlayer = () => {
    const freshIframe = iframe.cloneNode(false);
    freshIframe.removeAttribute('src');
    iframe.replaceWith(freshIframe);
    iframe = freshIframe;
  };

  const resetVideo = () => {
    const wasSticky = isSticky();
    const focused = document.activeElement;
    const isKeyboardFocusInPlayer = videoContainer.contains(focused) && focused.matches(':focus-visible');

    window.removeEventListener('message', handlePlayerMessage);
    document.removeEventListener('keydown', handleEscClose);

    destroyPlayer();
    isAutoFullscreen = false;

    videoContainer.classList.remove('is-playing', 'is-sticky');
    document.documentElement.style.scrollPaddingBottom = '';

    announceStatus('Video playback has stopped');

    if (!wasSticky) {
      playButton.focus({preventScroll: true});
      return;
    }

    if (isKeyboardFocusInPlayer) playButton.focus();
  };

  const handleEscClose = (event) => {
    if (event.key === 'Escape' && isPlaying()) resetVideo();
  };

  const switchToSticky = (becomeSticky) => {
    if (isSticky() === becomeSticky) return;

    videoContainer.classList.toggle('is-sticky', becomeSticky);

    document.documentElement.style.scrollPaddingBottom = becomeSticky ? `${videoContainer.offsetHeight + 40}px` : '';

    if (becomeSticky) {
      announceStatus('The video is minimized into a mini-player in the corner of the screen');
    } else {
      announceStatus('The video has returned to full-size mode');
    }
  };

  const ignoreKeyRepeat = (event) => {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
  };

  playButton.addEventListener('keydown', ignoreKeyRepeat);
  closeButton.addEventListener('keydown', ignoreKeyRepeat);

  playButton.addEventListener('click', () => {
    if (isPlaying()) return;

    const url = new URL(iframe.dataset.src);
    url.searchParams.set('autoplay', 'true');

    window.addEventListener('message', handlePlayerMessage);
    document.addEventListener('keydown', handleEscClose);
    iframe.setAttribute('src', url.toString());

    videoContainer.classList.add('is-playing');
    announceStatus('The video has started');

    closeButton.focus({preventScroll: true});

    if (!isIntersecting) switchToSticky(true);

    if (isMobileMediaQuery.matches && iframe.requestFullscreen) {
      isAutoFullscreen = true;
      iframe.requestFullscreen().catch(error => {
        isAutoFullscreen = false;
        console.info('Fullscreen blocked:', error);
      });
    }
  });

  closeButton.addEventListener('click', resetVideo);

  expandButton.addEventListener('click', () => {
    closeButton.focus({preventScroll: true});
    videoSection.scrollIntoView({block: 'center'});
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isAutoFullscreen && isPlaying()) resetVideo();
  });

  const syncObserver = (mediaQuery) => {
    if (mediaQuery.matches) {
      observer?.disconnect();
      observer = null;
      isIntersecting = true;
      switchToSticky(false);
      return;
    }

    if (observer) return;

    observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;

      if (isPlaying()) switchToSticky(!isIntersecting);
    }, {threshold: 0.15});

    observer.observe(videoSection);
  };

  isMobileMediaQuery.addEventListener('change', syncObserver);
  syncObserver(isMobileMediaQuery);

})();

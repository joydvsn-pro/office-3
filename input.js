// input.js — unifies keyboard + on-screen touch controls into one state object.

const Input = (() => {
  const state = { left: false, right: false, jump: false, jumpPressed: false };
  let jumpWasDown = false;

  function keyDown(e) {
    if (['ArrowLeft', 'KeyA'].includes(e.code)) state.left = true;
    if (['ArrowRight', 'KeyD'].includes(e.code)) state.right = true;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      state.jump = true;
    }
  }
  function keyUp(e) {
    if (['ArrowLeft', 'KeyA'].includes(e.code)) state.left = false;
    if (['ArrowRight', 'KeyD'].includes(e.code)) state.right = false;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') state.jump = false;
  }

  function bindButton(el, key) {
    if (!el) return;
    const on = (ev) => { ev.preventDefault(); state[key] = true; };
    const off = (ev) => { ev.preventDefault(); state[key] = false; };
    el.addEventListener('touchstart', on, { passive: false });
    el.addEventListener('touchend', off, { passive: false });
    el.addEventListener('touchcancel', off, { passive: false });
    el.addEventListener('mousedown', on);
    el.addEventListener('mouseup', off);
    el.addEventListener('mouseleave', off);
  }

  function init() {
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    bindButton(document.getElementById('btn-left'), 'left');
    bindButton(document.getElementById('btn-right'), 'right');
    bindButton(document.getElementById('btn-jump'), 'jump');

    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouch) document.getElementById('mobile-controls').classList.remove('hidden');
  }

  function update() {
    state.jumpPressed = state.jump && !jumpWasDown;
    jumpWasDown = state.jump;
  }

  return { init, update, state };
})();

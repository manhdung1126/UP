"use strict";

// Chỉ tạo một viewer khi người dùng mở model; buổi tập vẫn do workouts.js quản lý.
(() => {
  const dialog = document.querySelector('#exercise-3d-dialog');
  const stage = document.querySelector('#model-stage');
  const status = document.querySelector('#model-status');
  const play = document.querySelector('#model-play');
  const reset = document.querySelector('#model-reset');
  const retry = document.querySelector('#model-retry');
  let viewer = null;
  let selected = null;
  let opener = null;
  let generation = 0;
  let retryVersion = 0;
  let timer;

  function syncPlay() {
    play.textContent = viewer?.paused ? 'Phát động tác' : 'Tạm dừng';
  }

  function release() {
    generation++;
    clearTimeout(timer);
    viewer?.pause();
    viewer?.remove();
    viewer = null;
    stage.setAttribute('aria-busy', 'false');
    play.disabled = reset.disabled = true;
  }

  async function loadModel() {
    release();
    const version = generation;
    const model = selected.model3d;
    retry.hidden = true;
    status.textContent = 'Đang tải mô hình 3D…';
    stage.setAttribute('aria-busy', 'true');
    play.textContent = 'Phát động tác';
    function fail() {
      if (version !== generation) return;
      retryVersion++;
      release();
      stage.setAttribute('aria-busy', 'false');
      status.textContent = location.protocol === 'file:'
        ? 'Model 3D cần mở qua trang xem trước của UP. Mở bản xem trước rồi thử lại.'
        : 'Không tải được mô hình 3D. Hãy thử lại hoặc dùng trình duyệt hỗ trợ WebGL.';
      retry.hidden = false;
    }
    timer = setTimeout(fail, 30000);
    try {
      // Component chuẩn xử lý camera, cảm ứng và WebGL; không tự viết engine 3D.
      const { ModelViewerElement } = await import('./vendor/model-viewer.min.js');
      ModelViewerElement.modelCacheSize = 1;
      if (version !== generation || !dialog.open) return;
      if (!/^assets\/models\/[a-z0-9-]+\.glb$/.test(model.src)) throw new Error('Invalid model path');
      viewer = document.createElement('model-viewer');
      viewer.setAttribute('alt', `${selected.name}: mô hình 3D chuyển động. Kéo để xoay, chụm hai ngón để thu phóng.`);
      viewer.setAttribute('camera-controls', '');
      viewer.setAttribute('disable-pan', '');
      viewer.setAttribute('touch-action', 'none');
      viewer.setAttribute('interaction-prompt', 'none');
      viewer.setAttribute('camera-orbit', model.cameraOrbit);
      viewer.setAttribute('camera-target', model.cameraTarget);
      viewer.setAttribute('field-of-view', '35deg');
      viewer.setAttribute('min-camera-orbit', 'auto 10deg 1m');
      viewer.setAttribute('max-camera-orbit', 'auto 170deg 8m');
      if (!Array.isArray(model.animations) || !model.animations.length) throw new Error('Missing animations');
      viewer.setAttribute('animation-name', model.animations[0]);
      viewer.setAttribute('animation-crossfade-duration', '0');
      viewer.setAttribute('shadow-intensity', '1');
      viewer.setAttribute('exposure', '1');
      viewer.addEventListener('error', fail);
      viewer.addEventListener('load', () => {
        if (version !== generation || !dialog.open) return;
        if (!model.animations.every(name => viewer.availableAnimations.includes(name))) { fail(); return; }
        clearTimeout(timer);
        // Phát cùng các clip gốc: khung xương và biến dạng cơ thể nếu có.
        viewer.play();
        model.animations.slice(1).forEach(name => viewer.appendAnimation(name));
        if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) viewer.pause();
        play.disabled = reset.disabled = false;
        stage.setAttribute('aria-busy', 'false');
        status.textContent = 'Kéo để xoay · Chụm hai ngón hoặc cuộn để thu phóng.';
        syncPlay();
      }, { once: true });
      // Đổi URL sau lỗi vì component ghi nhớ cả lần tải thất bại.
      viewer.setAttribute('src', model.src + (retryVersion ? `?retry=${retryVersion}` : ''));
      stage.append(viewer);
    } catch { fail(); }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-model-exercise]');
    if (!button) return;
    const exercise = EXERCISES.find(item => item.id === button.dataset.modelExercise);
    if (!exercise?.model3d) return;
    selected = exercise;
    opener = button;
    document.querySelector('#model-title').textContent = exercise.name;
    document.querySelector('#model-license').textContent = exercise.model3d.license;
    dialog.showModal();
    document.body.classList.add('viewer-open');
    loadModel();
  });
  document.querySelector('#model-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    release();
    document.body.classList.remove('viewer-open');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  play.addEventListener('click', () => {
    if (!viewer || play.disabled) return;
    viewer.paused ? viewer.play() : viewer.pause();
    syncPlay();
  });
  reset.addEventListener('click', () => {
    if (viewer) viewer.cameraOrbit = selected.model3d.cameraOrbit;
  });
  retry.addEventListener('click', loadModel);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && viewer) { viewer.pause(); syncPlay(); }
  });
  window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); });
})();

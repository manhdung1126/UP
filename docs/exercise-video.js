"use strict";

// Một video dùng chung, chỉ tải khi mở; không thay đổi dữ liệu buổi tập.
(() => {
  const dialog = document.querySelector('#exercise-video-dialog');
  const player = document.querySelector('#exercise-video');
  const status = document.querySelector('#video-status');
  const retry = document.querySelector('#video-retry');
  const byId = new Map(EXERCISES.map(exercise => [exercise.id, exercise]));
  let opener;
  let timer;

  function failed() {
    clearTimeout(timer);
    status.textContent = 'Không tải được video. Bạn có thể thử lại hoặc đóng để tiếp tục ghi buổi tập.';
    retry.hidden = false;
  }
  function load() {
    clearTimeout(timer);
    status.textContent = 'Đang tải video…';
    retry.hidden = true;
    player.load();
    timer = setTimeout(failed, 20000);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-video-exercise]');
    if (!button) return;
    const exercise = byId.get(button.dataset.videoExercise);
    const video = exercise?.video;
    if (!video || !/^assets\/videos\/wger-\d+\.mp4$/.test(video.src)
      || !/^assets\/videos\/wger-\d+\.jpg$/.test(video.poster)) return;
    opener = button;
    document.querySelector('#video-title').textContent = exercise.name;
    document.querySelector('#video-credit').textContent = `${video.title} — ${video.author}`;
    document.querySelector('#video-source').href = video.sourceUrl;
    document.querySelector('#video-source').textContent = `Nguồn ${video.sourceName || 'wger'}`;
    document.querySelector('#video-changes').textContent = 'Đã chuyển sang MP4, giảm kích thước và bỏ âm thanh; ảnh xem trước trích từ video. Bản chuyển đổi và ảnh giữ giấy phép của video nguồn.';
    const license = document.querySelector('#video-license');
    license.href = video.licenseUrl;
    license.textContent = video.license;
    player.src = video.src;
    player.poster = video.poster;
    player.setAttribute('aria-label', `Video minh họa ${exercise.name}`);
    dialog.showModal();
    document.body.classList.add('viewer-open');
    load();
  });
  player.addEventListener('loadedmetadata', () => {
    clearTimeout(timer);
    retry.hidden = true;
    status.textContent = 'Nhấn Phát trong video để xem động tác. Video không có âm thanh.';
  });
  player.addEventListener('error', () => { if (dialog.open) failed(); });
  retry.addEventListener('click', load);
  document.querySelector('#video-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    clearTimeout(timer);
    player.pause();
    player.removeAttribute('src');
    player.removeAttribute('poster');
    player.load();
    document.body.classList.remove('viewer-open');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) player.pause(); });
})();

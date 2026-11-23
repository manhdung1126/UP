"use strict";

// Dữ liệu thư viện độc lập với số liệu người dùng nhập trong buổi tập.
(() => {
  const root = document.querySelector('[data-page="workouts"]');
  const list = document.querySelector('#exercise-library');
  const sessionList = document.querySelector('#session-exercises');
  const search = document.querySelector('#exercise-search');
  const muscleFilter = document.querySelector('#muscle-filter');
  const mediaFilter = document.querySelector('#media-filter');
  const equipmentFilter = document.querySelector('#equipment-filter');
  const more = document.querySelector('#library-more');
  let visibleLimit = 30;
  const muscles = {
    chest: 'Ngực', lats: 'Lưng xô', 'middle back': 'Lưng giữa', 'lower back': 'Lưng dưới',
    shoulders: 'Vai', biceps: 'Tay trước', triceps: 'Tay sau', quadriceps: 'Đùi trước',
    hamstrings: 'Đùi sau', calves: 'Bắp chân', abdominals: 'Bụng', glutes: 'Mông',
    traps: 'Cầu vai', forearms: 'Cẳng tay', serratus: 'Cơ răng trước',
    brachialis: 'Cơ cánh tay', obliques: 'Bụng chéo',
    'upper legs': 'Đùi', 'lower legs': 'Cẳng chân', 'upper arms': 'Cánh tay', back: 'Lưng',
    'lateral delts': 'Vai giữa', 'rear delts': 'Vai sau', rhomboids: 'Cơ trám',
    supraspinatus: 'Cơ trên gai', 'upper traps': 'Cơ thang trên', 'middle traps': 'Cơ thang giữa',
  };
  const equipment = { barbell: 'Thanh đòn', dumbbell: 'Tạ đơn', cable: 'Cáp', machine: 'Máy', 'body only': 'Trọng lượng cơ thể', other: 'Dụng cụ khác', bench: 'Ghế phẳng', 'incline bench': 'Ghế dốc', mat: 'Thảm', kettlebell: 'Tạ ấm', 'pull-up bar': 'Xà đơn', band: 'Dây kháng lực', 'ez bar': 'Thanh EZ', ball: 'Bóng tập', unspecified: 'Chưa ghi dụng cụ', 'weight plate': 'Đĩa tạ', 'battle rope': 'Dây thừng tập' };
  const level = { beginner: 'Cơ bản', intermediate: 'Trung cấp', expert: 'Nâng cao', advanced: 'Nâng cao' };
  const catalogue = typeof EXERCISES === 'undefined' ? [] : EXERCISES;
  if (!Array.isArray(catalogue) || !catalogue.length) {
    document.querySelector('#workout-error').hidden = false;
    return;
  }
  const byId = new Map(catalogue.map(exercise => [exercise.id, exercise]));
  // Các số dưới đây chỉ là ví dụ để học giao diện; không phải lịch sử thật.
  const session = [
    { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: [10, 10, 8].map(reps => ({ kg: '42.5', reps: String(reps), done: false })) },
    { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: [12, 12, 10].map(reps => ({ kg: '45', reps: String(reps), done: false })) },
  ];
  const muscleText = exercise => exercise.primaryMuscles.map(muscle => muscles[muscle] || muscle).join(', ') || 'Chưa ghi nhóm cơ';
  const equipmentKeys = exercise => exercise.equipmentList?.length ? exercise.equipmentList : [exercise.equipment];
  const equipmentText = exercise => equipmentKeys(exercise).map(key => equipment[key] || key).join(', ');
  const blankSet = () => ({ kg: '', reps: '', done: false });
  const hasExercise = id => session.some(item => item.exerciseId === id);

  function modelButton(exercise) {
    if (exercise.video) {
      const label = 'Xem video';
      return `<button class="button secondary" data-video-exercise="${escapeHtml(exercise.id)}" aria-label="${label} ${escapeHtml(exercise.name)}">${label}</button>`;
    }
    return exercise.model3d
      ? `<button class="button secondary" data-model-exercise="${exercise.id}" aria-label="Xem 3D ${escapeHtml(exercise.name)}">Xem 3D</button>`
      : '<span class="model-unavailable">Chưa có video</span>';
  }

  function sourceCredit(exercise) {
    const source = exercise.source;
    if (!source) return '';
    const authors = [...new Set([source.author, ...(source.authors || [])].filter(Boolean))].join(', ');
    const changes = source.changes || 'Đã chuyển hướng dẫn sang văn bản thuần và chuẩn hóa nhóm cơ, dụng cụ.';
    return `<p class="library-source">Dữ liệu “${escapeHtml(source.title)}”: ${escapeHtml(authors || 'Xem tác giả tại nguồn')} · <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name || 'wger')}</a> · <a href="${escapeHtml(source.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.license)}</a>. ${escapeHtml(changes)}</p>`;
  }

  function renderLibrary() {
    const query = search.value.trim().toLowerCase();
    const matches = catalogue.filter(exercise => exercise.name.toLowerCase().includes(query)
      && (!muscleFilter.value || exercise.primaryMuscles.includes(muscleFilter.value))
      && (!equipmentFilter.value || equipmentKeys(exercise).includes(equipmentFilter.value))
      && (mediaFilter.value === 'all'
        || (mediaFilter.value === 'video' && exercise.video)
        || (mediaFilter.value === 'model' && exercise.model3d)));
    document.querySelector('#library-count').textContent = `${matches.length} / ${catalogue.length} bài tập`;
    more.hidden = matches.length <= visibleLimit;
    more.textContent = `Xem thêm ${Math.min(30, Math.max(0, matches.length - visibleLimit))} bài`;
    document.querySelector('#library-shown').textContent = `Đang hiện ${Math.min(matches.length, visibleLimit)} / ${matches.length} bài phù hợp`;
    list.innerHTML = matches.length ? matches.slice(0, visibleLimit).map(exercise => `
      <article class="library-exercise">
        <div class="library-row">
          <div class="exercise-description"><h3 lang="en" tabindex="-1">${escapeHtml(exercise.name)}</h3><p>${escapeHtml(muscleText(exercise))} · ${escapeHtml(equipmentText(exercise))}</p></div>
          <button class="button secondary add-exercise" data-add-exercise="${exercise.id}" aria-label="Thêm ${escapeHtml(exercise.name)}" ${hasExercise(exercise.id) ? 'disabled' : ''}>${hasExercise(exercise.id) ? 'Đã thêm' : '+ Thêm'}</button>
        </div>
        <div class="exercise-model-action">${modelButton(exercise)}</div>
        <details class="exercise-details"><summary>Hướng dẫn <span class="sr-only" lang="en">${escapeHtml(exercise.name)}</span></summary>
          <p class="exercise-metadata">${escapeHtml(level[exercise.level] || exercise.level || 'Chưa ghi cấp độ')} · Cơ phụ: ${escapeHtml(exercise.secondaryMuscles.map(muscle => muscles[muscle] || muscle).join(', ') || 'Không ghi')}</p>
          ${exercise.instructions.length ? `<ol lang="en">${exercise.instructions.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>` : `<p class="exercise-metadata">${escapeHtml(exercise.instructionNotice || 'Nguồn chưa có hướng dẫn cho bài này.')}</p>`}
          ${sourceCredit(exercise)}
        </details>
      </article>`).join('') : '<p class="empty-tasks">Không tìm thấy bài phù hợp. Thử tên khác hoặc chọn tất cả nhóm cơ.</p>';
  }

  function renderSession() {
    sessionList.innerHTML = session.map(item => {
      const exercise = byId.get(item.exerciseId);
      return `<section class="exercise" data-session-exercise="${exercise.id}">
        <div class="section-heading"><div><h3 lang="en">${escapeHtml(exercise.name)}</h3><p>${escapeHtml(muscleText(exercise))} · ${escapeHtml(equipmentText(exercise))}</p></div>${exercise.video || exercise.model3d ? modelButton(exercise) : ''}</div>
        <div class="set-head" aria-hidden="true"><span>Hiệp</span><span>kg</span><span>Số lần</span><span>Xong</span></div>
        ${item.sets.map((set, index) => `<div class="set-row ${set.done ? 'is-done' : ''}" data-set-index="${index}">
          <span class="set-number">${index + 1}</span>
          <input type="number" data-field="kg" min="0" step="any" inputmode="decimal" required placeholder="—" value="${escapeHtml(set.kg)}" aria-label="${escapeHtml(exercise.name)} hiệp ${index + 1}: kg">
          <input type="number" data-field="reps" min="1" step="1" inputmode="numeric" required placeholder="—" value="${escapeHtml(set.reps)}" aria-label="${escapeHtml(exercise.name)} hiệp ${index + 1}: số lần">
          <label class="set-check"><input type="checkbox" data-set="${exercise.id}-${index}" aria-label="Hoàn thành ${escapeHtml(exercise.name)} hiệp ${index + 1}" ${set.done ? 'checked' : ''}><span>${icon('check')}</span></label>
        </div>`).join('')}
        <button class="button quiet add-set" data-add-set="${exercise.id}" aria-label="Thêm hiệp ${escapeHtml(exercise.name)}">${icon('plus')} Thêm hiệp</button>
      </section>`;
    }).join('');
    syncSummary();
  }

  function syncSummary() {
    const sets = session.flatMap(item => item.sets);
    const completed = sets.filter(set => set.done).length;
    document.querySelector('#set-progress').textContent = `${completed} / ${sets.length} hiệp`;
    document.querySelector('#session-count').textContent = `${session.length} bài tập · Số liệu minh họa`;
    document.querySelector('#session-view-button').textContent = `Buổi tập (${session.length})`;
    document.querySelector('#calendar-workout-count').textContent = `18:00 – 19:00 · ${session.length} bài tập mẫu`;
    sampleEvents.find(event => event.icon === 'workout').category = `${session.length} bài tập mẫu`;
    renderCalendar();
  }

  function showWorkoutView(view) {
    root.querySelectorAll('[data-workout-panel]').forEach(panel => { panel.hidden = panel.dataset.workoutPanel !== view; });
    root.querySelectorAll('[data-workout-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workoutView === view)));
  }
  root.addEventListener('click', event => {
    const view = event.target.closest('[data-workout-view]');
    if (view) showWorkoutView(view.dataset.workoutView);
    const add = event.target.closest('[data-add-exercise]');
    if (add && byId.has(add.dataset.addExercise) && !hasExercise(add.dataset.addExercise)) {
      session.push({ exerciseId: add.dataset.addExercise, sets: [blankSet()] });
      renderSession();
      add.textContent = 'Đã thêm';
      add.disabled = true;
      document.querySelector('#library-feedback').textContent = `Đã thêm ${byId.get(add.dataset.addExercise).name}. Mở Buổi tập để nhập số liệu.`;
      document.querySelector('#session-view-button').focus({ preventScroll: true });
    }
    const addSet = event.target.closest('[data-add-set]');
    if (addSet) {
      const item = session.find(item => item.exerciseId === addSet.dataset.addSet);
      item.sets.push(blankSet());
      renderSession();
      sessionList.querySelector(`[data-session-exercise="${item.exerciseId}"] .set-row:last-of-type [data-field="kg"]`).focus();
      announce('Đã thêm một hiệp trống');
    }
  });

  // Lưu khi gõ để render lại không làm mất nội dung đang nhập.
  sessionList.addEventListener('input', event => {
    const input = event.target;
    if (!input.matches('[data-field]')) return;
    const row = input.closest('.set-row');
    const item = session.find(item => item.exerciseId === input.closest('[data-session-exercise]').dataset.sessionExercise);
    const set = item.sets[Number(row.dataset.setIndex)];
    set[input.dataset.field] = input.value;
    set.done = false;
    row.classList.remove('is-done');
    row.querySelector('[data-set]').checked = false;
    syncSummary();
  });
  sessionList.addEventListener('change', event => {
    const input = event.target;
    if (!input.matches('[data-set]')) return;
    const row = input.closest('.set-row');
    const invalid = [...row.querySelectorAll('[data-field]')].find(field => !field.validity.valid);
    if (input.checked && invalid) {
      input.checked = false;
      invalid.reportValidity();
      announce('Nhập kg từ 0 trở lên và số lần là số nguyên từ 1 trước khi đánh dấu xong.');
      return;
    }
    const item = session.find(item => item.exerciseId === input.closest('[data-session-exercise]').dataset.sessionExercise);
    item.sets[Number(row.dataset.setIndex)].done = input.checked;
    row.classList.toggle('is-done', input.checked);
    syncSummary();
    announce(input.checked ? 'Đã hoàn thành hiệp tập' : 'Đã bỏ đánh dấu hiệp tập');
  });
  const availableMuscles = [...new Set(catalogue.flatMap(exercise => exercise.primaryMuscles))];
  for (const muscle of availableMuscles) {
    const option = document.createElement('option');
    option.value = muscle;
    option.textContent = muscles[muscle] || muscle;
    muscleFilter.append(option);
  }
  for (const key of [...new Set(catalogue.flatMap(equipmentKeys))].sort()) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = equipment[key] || key;
    equipmentFilter.append(option);
  }
  const resetLibrary = () => { visibleLimit = 30; renderLibrary(); };
  search.addEventListener('input', resetLibrary);
  muscleFilter.addEventListener('change', resetLibrary);
  equipmentFilter.addEventListener('change', resetLibrary);
  mediaFilter.addEventListener('change', resetLibrary);
  more.addEventListener('click', () => {
    const previousLimit = visibleLimit;
    visibleLimit += 30;
    renderLibrary();
    list.querySelectorAll('h3')[previousLimit]?.focus({ preventScroll: true });
  });
  const videoCount = catalogue.filter(exercise => exercise.video).length;
  const modelCount = catalogue.filter(exercise => exercise.model3d).length;
  document.querySelector('#model-coverage').textContent = `${videoCount} bài có video · ${modelCount} model 3D · ${catalogue.length} mục.`;
  document.querySelector('#library-view-button').textContent = `Thư viện (${catalogue.length})`;
  renderLibrary();
  renderSession();
})();

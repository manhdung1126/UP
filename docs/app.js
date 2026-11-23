"use strict";

// 1. Dữ liệu mẫu chỉ nằm trong bộ nhớ. Tải lại trang sẽ trở về trạng thái ban đầu.
const tasks = [
  { id: "task-1", title: "Đọc sách 20 phút", done: false, group: "Cá nhân" },
  { id: "task-2", title: "Hoàn thành trang HTML đầu tiên", done: false, group: "Học tập" },
  { id: "task-3", title: "Chuẩn bị đồ cho buổi tập", done: false, group: "Sức khỏe" },
];

// Ngày hôm nay lấy theo Việt Nam; giờ của lịch mẫu không thay đổi theo máy chủ.
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());
let selectedDate = today;
let nextTaskId = 4;
const pageNames = ["calendar", "tasks", "workouts", "notes", "finance", "ai"];
const sampleEvents = [
  { start: "09:00", end: "10:00", title: "Lên kế hoạch trong tuần", category: "Công việc", icon: "tasks" },
  { start: "10:30", end: "11:30", title: "Học một điều mới", category: "Học tập", icon: "notes" },
  { start: "14:00", end: "15:00", title: "Làm việc tập trung", category: "Công việc", icon: "tasks" },
  { start: "18:00", end: "19:00", title: "Buổi tập mẫu", category: "2 bài tập mẫu", icon: "workout" },
];

// 2. Các hàm nhỏ: SVG, hiển thị văn bản an toàn và tính ngày.
function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function dateLabel(dateString, options) {
  return new Intl.DateTimeFormat("vi-VN", { timeZone: "UTC", ...options })
    .format(new Date(`${dateString}T12:00:00Z`));
}

function announce(message) {
  document.querySelector("#status-message").textContent = message;
}

// 3. Điều hướng bằng hash: nút Back của trình duyệt vẫn hoạt động.
function showPage(moveFocus = false) {
  const requested = location.hash.slice(1);
  const page = pageNames.includes(requested) ? requested : "calendar";
  document.querySelectorAll("[data-page]").forEach((section) => {
    section.hidden = section.dataset.page !== page;
  });
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const heading = document.querySelector(`[data-page="${page}"] h1`);
  document.title = `UP — ${heading.textContent}`;
  if (moveFocus) {
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

// 4. Vẽ lại phần lịch khi chọn ngày. Chỉ ngày hôm nay có lịch minh họa.
function renderCalendar() {
  document.querySelector("#calendar-heading").textContent = selectedDate === today ? "Hôm nay" : "Lịch của bạn";
  document.querySelector("#selected-date-label").textContent = dateLabel(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.querySelector("#calendar-month").textContent = dateLabel(selectedDate, { month: "long", year: "numeric" });

  const weekday = new Date(`${selectedDate}T12:00:00Z`).getUTCDay();
  const monday = addDays(selectedDate, -(weekday === 0 ? 6 : weekday - 1));
  const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  document.querySelector("#week-strip").innerHTML = weekdays.map((day, index) => {
    const date = addDays(monday, index);
    return `<button class="day-button ${date === today ? "is-today" : ""}" data-date="${date}" aria-label="${dateLabel(date, { weekday: "long", day: "numeric", month: "long" })}" aria-pressed="${date === selectedDate}"><span>${day}</span><strong>${Number(date.slice(-2))}</strong></button>`;
  }).join("");

  const events = selectedDate === today ? sampleEvents : [];
  document.querySelector("#event-count").textContent = `${events.length} lịch hẹn`;
  document.querySelector("#agenda").innerHTML = events.length ? events.map((event, index) => {
    const workout = event.icon === "workout";
    const row = `<article class="agenda-row"><div class="agenda-time"><time datetime="${selectedDate}T${event.start}:00+07:00">${event.start}</time><small>${event.end}</small></div><div class="event ${workout ? "workout-event" : ""}"><div><h3>${event.title}</h3><p>${icon(event.icon)}${event.category}</p></div>${workout ? `<a class="event-link" href="#workouts" aria-label="Xem buổi tập mẫu">${icon("arrow")}</a>` : `<span class="event-symbol" aria-hidden="true">${icon(event.icon)}</span>`}</div></article>`;
    const next = events[index + 1];
    const gap = next ? `<p class="agenda-gap">${event.end} – ${next.start} <span>Thời gian trống</span></p>` : "";
    return row + gap;
  }).join("") : `<div class="empty-agenda">${icon("calendar")}<h3>Một ngày còn nhiều khoảng trống</h3><p>Chưa có lịch mẫu cho ngày này. Chọn Hôm nay để xem minh họa.</p></div>`;
}

// 5. Hai danh sách cùng đọc từ mảng tasks, nên trạng thái luôn khớp nhau.
function taskRow(task, locationName) {
  return `<div class="task-item ${task.done ? "is-done" : ""}"><label for="${locationName}-${task.id}"><input id="${locationName}-${task.id}" type="checkbox" data-task="${task.id}" ${task.done ? "checked" : ""}><span class="task-title">${escapeHtml(task.title)}</span></label><span class="task-meta">${task.group}</span></div>`;
}

function renderTasks() {
  document.querySelector("#task-list").innerHTML = tasks.length
    ? tasks.map((task) => taskRow(task, "list")).join("")
    : '<p class="empty-tasks">Danh sách đang trống. Thêm việc đầu tiên ở phía trên.</p>';
  const pending = tasks.filter((task) => !task.done);
  document.querySelector("#today-tasks").innerHTML = pending.length
    ? pending.slice(0, 3).map((task) => taskRow(task, "today")).join("")
    : '<p class="empty-tasks">Bạn đã hoàn thành mọi việc trong bản mẫu.</p>';
  document.querySelector("#nav-task-count").textContent = pending.length;
  document.querySelector("#task-progress").textContent = `${tasks.length - pending.length} / ${tasks.length} đã xong`;
}

// 6. Gắn sự kiện công việc và lịch; buổi tập được quản lý trong workouts.js.
window.addEventListener("hashchange", () => showPage(true));
document.querySelector("#previous-day").addEventListener("click", () => {
  selectedDate = addDays(selectedDate, -1);
  renderCalendar();
  announce(`Đang xem ${dateLabel(selectedDate, { day: "numeric", month: "long" })}`);
});
document.querySelector("#next-day").addEventListener("click", () => {
  selectedDate = addDays(selectedDate, 1);
  renderCalendar();
  announce(`Đang xem ${dateLabel(selectedDate, { day: "numeric", month: "long" })}`);
});
document.querySelector("#go-today").addEventListener("click", () => {
  selectedDate = today;
  renderCalendar();
  announce("Đã trở về hôm nay");
});
document.querySelector("#week-strip").addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button) return;
  selectedDate = button.dataset.date;
  renderCalendar();
  document.querySelector(`[data-date="${selectedDate}"]`).focus();
});

document.querySelector("#task-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#task-title");
  const title = input.value.trim();
  if (!title) {
    input.setCustomValidity("Hãy nhập tên công việc, không chỉ khoảng trắng.");
    input.reportValidity();
    return;
  }
  tasks.push({ id: `task-${nextTaskId++}`, title, done: false, group: "Cá nhân" });
  input.value = "";
  renderTasks();
  input.focus();
  announce("Đã thêm công việc vào danh sách mẫu");
});
document.querySelector("#task-title").addEventListener("input", (event) => event.target.setCustomValidity(""));

document.addEventListener("change", (event) => {
  const input = event.target;
  if (input.matches("[data-task]")) {
    const task = tasks.find((item) => item.id === input.dataset.task);
    task.done = input.checked;
    const focusId = input.id;
    renderTasks();
    // Khi hoàn thành ở trang Lịch, hàng vừa xong được chuyển ra khỏi danh sách chờ.
    const nextFocus = document.getElementById(focusId) || document.querySelector("#today-tasks input") || document.querySelector('[data-page="calendar"] .text-link');
    nextFocus.focus();
    announce(task.done ? "Đã hoàn thành công việc" : "Đã chuyển công việc về chưa hoàn thành");
  }

});

// 7. Khởi động ứng dụng.
renderCalendar();
renderTasks();
showPage();

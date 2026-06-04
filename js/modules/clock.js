// Lego-часы
let clockInterval = null;

export function initClock() {
  updateClock();
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const hour1 = document.getElementById("hour1");
  const hour2 = document.getElementById("hour2");
  const minute1 = document.getElementById("minute1");
  const minute2 = document.getElementById("minute2");
  const second1 = document.getElementById("second1");
  const second2 = document.getElementById("second2");

  if (hour1) hour1.textContent = hours[0];
  if (hour2) hour2.textContent = hours[1];
  if (minute1) minute1.textContent = minutes[0];
  if (minute2) minute2.textContent = minutes[1];
  if (second1) second1.textContent = seconds[0];
  if (second2) second2.textContent = seconds[1];
}

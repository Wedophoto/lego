// Анимации робота и телепортация
let robotTeleportTimer = null;

export function initRobot() {
  const robot = document.getElementById("robot");
  if (!robot) return;

  const startPosition = getRandomPosition();
  robot.style.left = startPosition.x - robot.offsetWidth / 2 + "px";
  robot.style.top = startPosition.y - robot.offsetHeight / 2 + "px";

  setTimeout(() => {
    robot.classList.add("visible");
  }, 100);

  robot.addEventListener("mouseenter", function () {
    robot.style.cursor = "pointer";
  });

  robot.addEventListener("click", function (event) {
    createQuestionParticles(event);
    teleportRobot();
  });
}

function getRandomPosition() {
  const margin = 100;
  const x = margin + Math.random() * (window.innerWidth - margin * 2);
  const y = margin + Math.random() * (window.innerHeight - margin * 2);
  return { x, y };
}

function createQuestionParticles(event) {
  const robot = document.getElementById("robot");
  const rect = robot.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.className = "question-particle";
    particle.textContent = "?";
    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#ffd166",
      "#966fd6",
      "#ee7752",
    ];
    particle.style.color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";

    const angle = (Math.PI * 2 * i) / 30;
    const velocity = 100 + Math.random() * 200;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    const tx2 = Math.cos(angle) * (velocity * 2);
    const ty2 = Math.sin(angle) * (velocity * 2);

    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);
    particle.style.setProperty("--tx2", `${tx2}px`);
    particle.style.setProperty("--ty2", `${ty2}px`);

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 2000);
  }
}

function teleportRobot() {
  const robot = document.getElementById("robot");
  const teleportEffect = document.getElementById("teleportEffect");
  if (!robot || !teleportEffect) return;

  const currentX = robot.offsetLeft + robot.offsetWidth / 2;
  const currentY = robot.offsetTop + robot.offsetHeight / 2;

  teleportEffect.style.left = currentX + "px";
  teleportEffect.style.top = currentY + "px";
  teleportEffect.classList.add("active");
  robot.classList.add("teleport-out");
  robot.classList.remove("visible");

  const randomDelay = 2000 + Math.random() * 4000;

  setTimeout(() => {
    const newPosition = getRandomPosition();
    robot.style.left = newPosition.x - robot.offsetWidth / 2 + "px";
    robot.style.top = newPosition.y - robot.offsetHeight / 2 + "px";

    teleportEffect.style.left = newPosition.x + "px";
    teleportEffect.style.top = newPosition.y + "px";
    teleportEffect.classList.add("active");
    robot.classList.remove("teleport-out");
    robot.classList.add("teleport-in");
    robot.classList.add("visible");

    setTimeout(() => {
      robot.classList.remove("teleport-in");
      teleportEffect.classList.remove("active");
    }, 500);
  }, randomDelay);

  setTimeout(() => {
    teleportEffect.classList.remove("active");
  }, 600);
}

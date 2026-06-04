// Салюты ко Дню защитника Отечества

export function initDefenderFireworks() {
  createDefenderSalutes();
}

function createDefenderSalutes() {
  const defenderDaySalutes = document.getElementById("defenderDaySalutes");
  if (!defenderDaySalutes) return;

  const saluteColors = ["#dc3545", "#0d6efd", "#ffc107"];
  setInterval(() => {
    const salute = document.createElement("div");
    salute.className = "defender-salute";
    salute.style.backgroundColor =
      saluteColors[Math.floor(Math.random() * saluteColors.length)];
    defenderDaySalutes.appendChild(salute);

    setTimeout(() => {
      const rect = salute.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.className = "defender-salute-particle";
        particle.style.left = x + "px";
        particle.style.top = y + "px";
        particle.style.backgroundColor =
          saluteColors[Math.floor(Math.random() * saluteColors.length)];
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 30 + Math.random() * 30;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        defenderDaySalutes.appendChild(particle);
      }
      salute.remove();
    }, 2000);

    setTimeout(() => {
      const particles = defenderDaySalutes.querySelectorAll(
        ".defender-salute-particle",
      );
      particles.forEach((particle) => particle.remove());
    }, 3000);
  }, 4000);
}

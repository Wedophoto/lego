// Снежинки, гирлянды и новогодние украшения

export function initSnowEffects() {
  createSnowflakes();
  createChristmasLights();
  createNewYearGarland();
  createFireworks();
  createConfetti();
}

function createSnowflakes() {
  const snowfall = document.getElementById("snowfall");
  if (!snowfall) return;

  const snowflakeSymbols = ["❄", "❅", "❆"];
  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement("div");
    snowflake.className = "snowflake";
    snowflake.textContent =
      snowflakeSymbols[Math.floor(Math.random() * snowflakeSymbols.length)];
    snowflake.style.left = Math.random() * 100 + "%";
    snowflake.style.animationDuration = Math.random() * 3 + 7 + "s";
    snowflake.style.opacity = Math.random() * 0.6 + 0.4;
    snowflake.style.fontSize = Math.random() * 10 + 10 + "px";
    snowflake.style.animationDelay = Math.random() * 5 + "s";
    snowfall.appendChild(snowflake);
  }
}

function createChristmasLights() {
  const christmasLights = document.getElementById("christmas-lights");
  if (!christmasLights) return;

  const lightColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
  for (let i = 0; i < 30; i++) {
    const light = document.createElement("div");
    light.className = "christmas-light";
    light.style.backgroundColor =
      lightColors[Math.floor(Math.random() * lightColors.length)];
    light.style.animationDelay = Math.random() * 2 + "s";
    christmasLights.appendChild(light);
  }
}

function createNewYearGarland() {
  const newYearGarland = document.getElementById("new-year-garland");
  if (!newYearGarland) return;

  const bulbColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
  for (let i = 0; i < 20; i++) {
    const bulb = document.createElement("div");
    bulb.className = "garland-bulb";
    bulb.style.backgroundColor =
      bulbColors[Math.floor(Math.random() * bulbColors.length)];
    bulb.style.animationDelay = Math.random() * 2 + "s";
    newYearGarland.appendChild(bulb);
  }
}

function createFireworks() {
  const fireworks = document.getElementById("new-year-fireworks");
  if (!fireworks) return;

  const fireworkColors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];
  setInterval(() => {
    const firework = document.createElement("div");
    firework.className = "firework";
    firework.style.left = Math.random() * 100 + "%";
    firework.style.bottom = "0";
    firework.style.backgroundColor =
      fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
    fireworks.appendChild(firework);

    setTimeout(() => {
      const rect = firework.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");
        particle.className = "firework-particle";
        particle.style.left = x + "px";
        particle.style.top = y + "px";
        particle.style.backgroundColor =
          fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
        const angle = (Math.PI * 2 * i) / 30;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        fireworks.appendChild(particle);
      }
      firework.remove();
    }, 1000);

    setTimeout(() => {
      const particles = fireworks.querySelectorAll(".firework-particle");
      particles.forEach((particle) => particle.remove());
    }, 2000);
  }, 3000);
}

function createConfetti() {
  const confettiColors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];
  setInterval(() => {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.backgroundColor =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confetti.style.animationDuration = Math.random() * 3 + 5 + "s";
    confetti.style.animationDelay = Math.random() * 2 + "s";
    const decorations = document.querySelector(".new-year-decorations");
    if (decorations) decorations.appendChild(confetti);
    setTimeout(() => confetti.remove(), 8000);
  }, 500);
}

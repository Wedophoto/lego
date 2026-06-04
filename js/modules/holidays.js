// Праздничные украшения и поздравления

export function initHolidays() {
  initBirthdayModal();
  initChristmasToggle();
  initDefenderToggle();
  initMarch8Toggle();
}

function isBirthdayPeriod() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  return month === 12 && day >= 6 && day <= 6;
}

function createBirthdayConfetti() {
  const birthdayConfetti = document.getElementById("birthdayConfetti");
  if (!birthdayConfetti) return;

  const confettiColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFD166",
    "#966FD6",
    "#EE7752",
  ];
  for (let i = 0; i < 50; i++) {
    const confettiPiece = document.createElement("div");
    confettiPiece.className = "confetti-piece";
    confettiPiece.style.backgroundColor =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confettiPiece.style.left = Math.random() * 100 + "%";
    confettiPiece.style.top = Math.random() * 100 + "%";
    confettiPiece.style.animationDelay = Math.random() * 5 + "s";
    confettiPiece.style.animationDuration = Math.random() * 3 + 5 + "s";
    birthdayConfetti.appendChild(confettiPiece);
  }
}

function initBirthdayModal() {
  const birthdayModal = document.getElementById("birthdayModal");
  const birthdayClose = document.getElementById("birthdayClose");
  const wedo20Toggle = document.getElementById("wedo20-toggle");

  if (!birthdayModal) return;

  createBirthdayConfetti();

  if (isBirthdayPeriod()) {
    setTimeout(() => {
      birthdayModal.classList.add("show");
    }, 1000);
  }

  if (birthdayClose) {
    birthdayClose.addEventListener("click", function () {
      birthdayModal.classList.remove("show");
    });
  }

  if (wedo20Toggle) {
    wedo20Toggle.addEventListener("click", function () {
      birthdayModal.classList.toggle("show");
    });
  }

  birthdayModal.addEventListener("click", function (event) {
    if (event.target === birthdayModal) {
      birthdayModal.classList.remove("show");
    }
  });
}

function initChristmasToggle() {
  const christmasToggle = document.getElementById("christmasToggle");
  const newYearDecorations = document.getElementById("newYearDecorations");
  if (!christmasToggle || !newYearDecorations) return;

  christmasToggle.addEventListener("click", function () {
    if (newYearDecorations.classList.contains("hidden")) {
      newYearDecorations.classList.remove("hidden");
      christmasToggle.classList.remove("off");
    } else {
      newYearDecorations.classList.add("hidden");
      christmasToggle.classList.add("off");
    }
  });
}

function initDefenderToggle() {
  const defenderToggle = document.getElementById("defenderToggle");
  const defenderDayDecorations = document.getElementById(
    "defenderDayDecorations",
  );
  if (!defenderToggle || !defenderDayDecorations) return;

  defenderToggle.addEventListener("click", function () {
    if (defenderDayDecorations.classList.contains("hidden")) {
      defenderDayDecorations.classList.remove("hidden");
      defenderToggle.classList.remove("off");
    } else {
      defenderDayDecorations.classList.add("hidden");
      defenderToggle.classList.add("off");
    }
  });
}

function initMarch8Toggle() {
  const march8Toggle = document.getElementById("march8Toggle");
  const march8Decorations = document.getElementById("march8Decorations");
  if (!march8Toggle || !march8Decorations) return;

  march8Toggle.addEventListener("click", function () {
    if (march8Decorations.classList.contains("hidden")) {
      march8Decorations.classList.remove("hidden");
      march8Toggle.classList.remove("off");
    } else {
      march8Decorations.classList.add("hidden");
      march8Toggle.classList.add("off");
    }
  });
}

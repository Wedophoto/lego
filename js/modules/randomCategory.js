// Случайная категория (карточка "На удачу")

export function initRandomCategory() {
  const luckyCard = document.getElementById("luckyCard");
  if (!luckyCard) return;

  luckyCard.addEventListener("click", goToRandomCategory);
  luckyCard.addEventListener("mouseenter", function () {
    this.style.cursor = "pointer";
  });
}

function goToRandomCategory() {
  const categoryLinks = document.querySelectorAll(
    ".categories-grid a.category-card",
  );
  if (categoryLinks.length === 0) return;

  const randomIndex = Math.floor(Math.random() * categoryLinks.length);
  const randomCategory = categoryLinks[randomIndex];

  const luckyCard = document.getElementById("luckyCard");
  if (luckyCard) {
    luckyCard.style.transform = "scale(0.95)";
    luckyCard.style.background =
      "linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(139, 195, 74, 0.2) 100%)";
    setTimeout(() => {
      luckyCard.style.transform = "";
      luckyCard.style.background = "";
    }, 300);
  }

  setTimeout(() => {
    window.location.href = randomCategory.href;
  }, 500);
}

// Слова "робототехника" на фоне

export function initFloatingWords() {
  const roboticsWords = document.querySelectorAll(".robotics-word");
  if (roboticsWords.length === 0) return;

  const header = document.querySelector(".header");
  const sections = document.querySelectorAll(".section");
  const footer = document.querySelector(".footer");

  function isInsideBlock(x, y, element) {
    const rect = element.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  function isInsideAnyBlock(x, y) {
    if (header && isInsideBlock(x, y, header)) return true;
    if (footer && isInsideBlock(x, y, footer)) return true;
    for (const section of sections) {
      if (isInsideBlock(x, y, section)) return true;
    }
    return false;
  }

  function getRandomPositionOutsideBlocks() {
    let x, y;
    let attempts = 0;
    const maxAttempts = 100;
    do {
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
      attempts++;
    } while (isInsideAnyBlock(x, y) && attempts < maxAttempts);
    return { x, y };
  }

  roboticsWords.forEach((word, index) => {
    const position = getRandomPositionOutsideBlocks();
    word.style.left = position.x + "px";
    word.style.top = position.y + "px";
    setTimeout(() => {
      word.classList.add("visible");
    }, index * 500);
  });

  window.addEventListener("resize", () => {
    roboticsWords.forEach((word) => {
      const position = getRandomPositionOutsideBlocks();
      word.style.left = position.x + "px";
      word.style.top = position.y + "px";
    });
  });
}

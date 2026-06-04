import { saveSections, loadSections } from "../utils/storage.js";

export function initSectionsCache() {
  console.log("🔄 Обновление кэша разделов...");
  const cached = loadSections();
  if (cached.length > 0) {
    console.log(`✅ Загружено из кэша: ${cached.length} категорий`);
  }
  updateSectionsCache();
}

function updateSectionsCache() {
  const categoryCards = document.querySelectorAll(".category-card");
  if (categoryCards.length === 0) {
    console.warn("Категории на странице не найдены.");
    return;
  }
  const sections = [];
  categoryCards.forEach((card) => {
    const linkEl = card;
    const nameEl = card.querySelector(".category-name");
    if (linkEl && nameEl) {
      let href = linkEl.getAttribute("href");
      let id = href;
      if (id.includes("/")) id = id.substring(id.lastIndexOf("/") + 1);
      if (id.endsWith(".htm")) id = id.replace(".htm", "");
      sections.push({ id: id, name: nameEl.innerText.trim() });
    }
  });
  if (sections.length > 0) {
    saveSections(sections);
    console.log(`✅ Кэш обновлен. Категорий записано: ${sections.length}`);
  } else {
    console.warn("Не удалось извлечь категории.");
  }
}

// js/upload.js
import { loadDynamicBlocks } from "./modules/dynamicBlocks.js";
import { initModalImageZoomObserver } from "./modules/modalImageZoom.js";
import { initCardsGrid } from "./modules/cardsGrid.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("📢 upload.js: загрузка динамических блоков");
  await loadDynamicBlocks();

  console.log("📢 upload.js: инициализация сетки карточек");
  await initCardsGrid(); // ДОЖИДАЕМСЯ загрузки

  console.log("📢 upload.js: инициализация модального окна изображений");
  initModalImageZoomObserver();

  console.log("✅ upload.js: все модули инициализированы");
});

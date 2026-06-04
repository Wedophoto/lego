// Точка входа для использования type="module"
// Содержимое такое же как в app.js
// Можно импортировать app.js или дублировать

import { initPdfHandler } from "./modules/pdfHandler.js";
import { initSectionsCache } from "./modules/sectionsCache.js";
import { initNotifications } from "./modules/notifications.js";
import { initClock } from "./modules/clock.js";
import { initAnimations } from "./modules/animations.js";
import { initSearchEngine, updateModelsData } from "./modules/searchEngine.js";
import { loadCards } from "./utils/storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  initPdfHandler();
  initSectionsCache();
  initClock();
  initAnimations();
  initSearchEngine();
  await initNotifications();
  const freshCards = loadCards();
  updateModelsData(freshCards);
});

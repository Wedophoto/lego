// js/app.js
import { initSeasons } from "./modules/seasons.js";
import { initRobot } from "./modules/robot.js";
import { initClock } from "./modules/clock.js";
import { initHolidays } from "./modules/holidays.js";
import { initFloatingWords } from "./modules/floatingWords.js";
import { initCardAnimations } from "./modules/cardAnimations.js";
import { initRestrictedBooks } from "./modules/restrictedBooks.js";
import { initPdfHandler } from "./modules/pdfHandler.js";
import { initSectionsCache } from "./modules/sectionsCache.js";
import { initNotifications } from "./modules/notifications.js";
import { initSearchEngine, updateModelsData } from "./modules/searchEngine.js";
import { initSnowEffects } from "./modules/snow.js";
import { initDefenderFireworks } from "./modules/fireworks.js";
import { initRandomCategory } from "./modules/randomCategory.js";
import { initFooter } from "./modules/footer.js";
import { AdsDisplay } from "./modules/adsDisplay.js";
import { loadCards, saveCards } from "./utils/storage.js";
import { fetchAllCards } from "./api/gasClient.js"; // ДОБАВИТЬ

console.log("ИНИЦИАЛИЗАЦИЯ МОДУЛЕЙ");

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Сначала загружаем данные с GAS
  console.log("⏳ Загрузка данных с сервера...");
  let serverCards = [];
  try {
    serverCards = await fetchAllCards();
    if (serverCards.length > 0) {
      saveCards(serverCards);
      console.log(`✅ Загружено ${serverCards.length} карточек с сервера`);
    }
  } catch (e) {
    console.error("Ошибка загрузки с сервера:", e);
    // Если сервер недоступен, используем кэш
    serverCards = loadCards();
    console.log(`📦 Используем кэш: ${serverCards.length} карточек`);
  }

  // 2. Теперь загружаем рекламу (параллельно, но не блокируем)
  const hideAllBtn = document.getElementById("hideAllAdsBtn");
  if (hideAllBtn) {
    hideAllBtn.addEventListener("click", () => {
      AdsDisplay.hideAdsSection();
    });
  }
  AdsDisplay.loadAds(); // Не await, пусть грузится в фоне

  // 3. Инициализируем все модули, которые НЕ зависят от данных
  initSeasons();
  initRobot();
  initClock();
  initHolidays();
  initFloatingWords();
  initSnowEffects();
  initDefenderFireworks();
  initCardAnimations();
  initRestrictedBooks();
  initPdfHandler();
  initSectionsCache();
  initRandomCategory();
  initFooter();

  // 4. Инициализируем поиск с уже загруженными данными
  initSearchEngine();
  updateModelsData(serverCards);

  // 5. Проверяем новые карточки (после загрузки)
  await initNotifications(); // Этот вызов уже внутри проверит новые карточки

  console.log("✅ Все модули инициализированы");
});

// --- КОНФИГУРАЦИЯ ---
const GAS_APP_URL =
  "https://script.google.com/macros/s/AKfycbyQBWZZRrIGT6HIy78uvYqNqqo2CDISHIqOPMPTEG1mCvH4gxEn9QJXqlYaHVAV0zBu/exec";

// Главная функция, объединяющая все операции
(async function initPage() {
  console.log("🚀 Инициализация страницы...");

  // 1. Получаем ID секции из URL
  const pathName = window.location.pathname;
  const sectionId =
    pathName.substring(pathName.lastIndexOf("/") + 1).replace(".htm", "") ||
    "general";
  console.log(`Текущая секция (ID): ${sectionId}`);

  // 2. Загружаем старые данные для сравнения (если есть)
  const oldDataRaw = localStorage.getItem("site_cards");
  const oldCards = oldDataRaw ? JSON.parse(oldDataRaw) : [];
  const oldIds = new Set(oldCards.map((c) => c.id));

  let allCards = [];

  // 3. Сначала пробуем из LocalStorage (быстро)
  if (oldDataRaw) {
    try {
      allCards = JSON.parse(oldDataRaw);
      console.log("📦 Данные загружены из LocalStorage");
      renderGrid(allCards); // Рисуем то, что есть
    } catch (e) {
      console.warn("LocalStorage поврежден");
    }
  }

  // 4. Один запрос к серверу для всего
  try {
    console.log("⏳ Загружаем данные с сервера...");
    const res = await fetch(GAS_APP_URL + "?action=getCards&t=" + Date.now());
    const newCardsAll = await res.json();

    if (Array.isArray(newCardsAll)) {
      allCards = newCardsAll;

      // Сохраняем в кэш
      localStorage.setItem("site_cards", JSON.stringify(allCards));
      console.log("✅ Данные обновлены с сервера");

      // Перерисовываем с актуальными данными
      renderGrid(allCards);

      // 5. Проверяем новые карточки
      const newItems = newCardsAll.filter((c) => !oldIds.has(c.id));

      if (newItems.length > 0) {
        console.log(`🎉 Найдено новых карточек: ${newItems.length}`);

        // Сохраняем ID новых карточек
        const newIds = newItems.map((c) => c.id);
        localStorage.setItem("notification_card_ids", JSON.stringify(newIds));

        // Показываем уведомление
        showNotification(newItems.length);
      } else {
        console.log("✅ Нет новых инструкций.");
      }
    }
  } catch (e) {
    console.error("Ошибка загрузки с сервера, работаем с кэшем:", e);
  }

  // 6. Функция отрисовки
  function renderGrid(cards) {
    const container = document.querySelector(".models-grid");
    if (!container) {
      console.warn("Контейнер .models-grid не найден на странице.");
      return;
    }

    const sectionCards = cards.filter((c) => c.section === sectionId);
    if (sectionCards.length === 0) return;

    const html = sectionCards
      .map((card) => {
        const pdfLink =
          card.pdf && card.pdf.id
            ? `https://drive.google.com/file/d/${card.pdf.id}/preview`
            : "#";
        const videoLink = card.videoUrl || "#";
        const imgUrl = card.imageUrl || "";

        return `
        <div class="model-card">
          <img src="${imgUrl}" alt="${card.title}" class="model-image">
          <h3 class="model-title">${card.title}</h3>
          <div class="model-details">
            ${videoLink !== "#" ? `<a href="${videoLink}" target="_blank" class="video-btn"><i class="fas fa-play"></i> Видео</a>` : ""}
          </div>
          <a href="${pdfLink}" target="_blank" class="instruction-btn">
            <i class="fas fa-file-pdf"></i> Открыть инструкцию
          </a>
        </div>
      `;
      })
      .join("");

    container.innerHTML = html;
    console.log(`🎨 Отрисовано карточек: ${sectionCards.length}`);
  }

  // 7. Функция показа уведомления
  function showNotification(count) {
    const toast = document.createElement("div");
    toast.className = "new-notify-toast";

    const currentUrl = window.location.href;
    const link = `novye-instruktsii-new.htm?q=${count}`;
    const finalLink = currentUrl.includes("teams/") ? link : `teams/${link}`;

    toast.innerHTML = `
      <div class="new-notify-content">
        <div class="new-notify-title">Новые инструкции!</div>
        <div class="new-notify-text">Доступно новых позиций: ${count}.</div>
        <a href="${finalLink}" style="color: #4f46e5; text-decoration: none; font-weight: 500; font-size: 0.9rem;">Смотреть &rarr;</a>
      </div>
      <button class="new-notify-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    toast.addEventListener("click", (e) => {
      if (!e.target.classList.contains("new-notify-close")) {
        window.location.href = finalLink;
      }
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 15000);
  }
})();

// Функция для добавления контента в footer (оставляем без изменений)
function addFooterContent() {
  // ... (код функции остается без изменений)
}

// Функция для добавления стилей (оставляем без изменений)
function addFooterStyles() {
  // ... (код функции остается без изменений)
}

// Запускаем функцию после полной загрузки DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addFooterContent);
} else {
  addFooterContent();
}

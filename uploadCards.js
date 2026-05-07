// --- КОНФИГУРАЦИЯ ---
const GAS_APP_URL =
  "https://script.google.com/macros/s/AKfycbyQBWZZRrIGT6HIy78uvYqNqqo2CDISHIqOPMPTEG1mCvH4gxEn9QJXqlYaHVAV0zBu/exec";

// Функция получения уровня сложности (1, 2, 3)
function getDifficultyLevel(difficulty) {
  const map = {
    easy: 1,
    hard: 2,
    pro: 3,
  };
  return map[difficulty] || 0;
}

// Функция получения текста уровня
function getDifficultyText(difficulty) {
  const map = {
    easy: "Начальный",
    hard: "Средний",
    pro: "Сложный",
  };
  return map[difficulty] || "";
}

// Главная функция, объединяющая все операции
(async function initPage() {
  console.log("🚀 Инициализация страницы...");
  console.log("📊 ========== НАЧАЛО ЛОГИРОВАНИЯ ==========");

  // 1. Получаем ID секции из URL (только для отрисовки)
  const pathName = window.location.pathname;
  const sectionId =
    pathName.substring(pathName.lastIndexOf("/") + 1).replace(".htm", "") ||
    "general";
  console.log(`📍 Текущая секция для отрисовки: ${sectionId}`);

  // 2. Загружаем ВСЕ старые данные из LocalStorage
  const oldDataRaw = localStorage.getItem("site_cards");
  let oldCards = [];
  let oldIds = new Set();

  if (oldDataRaw) {
    try {
      oldCards = JSON.parse(oldDataRaw);
      oldIds = new Set(oldCards.map((c) => c.id));
      console.log(
        `📦 LocalStorage: загружено ВСЕГО ${oldCards.length} карточек (из всех секций)`,
      );
      console.log(
        `📦 ID всех карточек в LocalStorage:`,
        oldCards.map((c) => c.id).join(", "),
      );

      // Группировка по секциям для информации
      const sectionsCount = {};
      oldCards.forEach((card) => {
        sectionsCount[card.section] = (sectionsCount[card.section] || 0) + 1;
      });
      console.log(`📊 Распределение по секциям в LocalStorage:`, sectionsCount);
    } catch (e) {
      console.warn("⚠️ LocalStorage поврежден");
      oldCards = [];
    }
  } else {
    console.log("📭 LocalStorage пуст (нет сохраненных карточек)");
  }

  let allCards = [];

  // 3. Сначала пробуем из LocalStorage (быстро)
  if (oldDataRaw && oldCards.length > 0) {
    try {
      allCards = oldCards;
      console.log(
        "✅ Данные загружены из LocalStorage для быстрого отображения",
      );
      renderGrid(allCards); // Рисуем то, что есть (с фильтром по секции внутри функции)
    } catch (e) {
      console.warn("⚠️ Ошибка при использовании LocalStorage:", e);
    }
  }

  // 4. Один запрос к серверу для всего
  try {
    console.log("⏳ Запрашиваем данные с сервера...");
    console.time("⏱️ Время запроса к серверу");

    const res = await fetch(GAS_APP_URL + "?action=getCards&t=" + Date.now());
    const newCardsAll = await res.json();

    console.timeEnd("⏱️ Время запроса к серверу");

    if (Array.isArray(newCardsAll)) {
      console.log(
        `🌐 Сервер вернул ВСЕГО ${newCardsAll.length} карточек (из всех секций)`,
      );
      console.log(
        `🌐 ID всех карточек с сервера:`,
        newCardsAll.map((c) => c.id).join(", "),
      );

      // Группировка по секциям с сервера
      const serverSectionsCount = {};
      newCardsAll.forEach((card) => {
        serverSectionsCount[card.section] =
          (serverSectionsCount[card.section] || 0) + 1;
      });
      console.log(
        `📊 Распределение по секциям на сервере:`,
        serverSectionsCount,
      );

      allCards = newCardsAll;

      // Сравниваем ВСЕ карточки (без фильтрации по секции)
      if (oldCards.length > 0) {
        console.log(`\n📊 СРАВНЕНИЕ ВСЕХ КАРТОЧЕК (по всем секциям):`);
        console.log(`   - В LocalStorage: ${oldCards.length} карточек`);
        console.log(`   - На сервере: ${newCardsAll.length} карточек`);

        if (newCardsAll.length > oldCards.length) {
          console.log(
            `📈 На сервере на ${newCardsAll.length - oldCards.length} карточек БОЛЬШЕ`,
          );
        } else if (newCardsAll.length < oldCards.length) {
          console.log(
            `📉 На сервере на ${oldCards.length - newCardsAll.length} карточек МЕНЬШЕ`,
          );
        } else {
          console.log(
            `📊 Количество карточек совпадает (${newCardsAll.length})`,
          );
        }
      } else {
        console.log(
          `📊 В LocalStorage не было данных, загружено ${newCardsAll.length} карточек с сервера`,
        );
      }

      // Сохраняем в кэш ВСЕ карточки
      localStorage.setItem("site_cards", JSON.stringify(allCards));
      console.log("💾 Все данные сохранены в LocalStorage");

      // Перерисовываем с актуальными данными
      console.log("🎨 Перерисовываем сетку с актуальными данными...");
      renderGrid(allCards);

      // 5. Проверяем новые карточки (по ВСЕМ карточкам, без фильтрации по секции!)
      console.log("\n🔍 Проверяем наличие новых карточек ПО ВСЕМ СЕКЦИЯМ...");

      // Сравниваем по ID все карточки из обоих источников
      const newItems = newCardsAll.filter((c) => !oldIds.has(c.id));

      if (newItems.length > 0) {
        console.log(`🎉 НАЙДЕНО НОВЫХ КАРТОЧЕК: ${newItems.length}`);
        console.log(
          `🆕 ID новых карточек:`,
          newItems.map((c) => c.id).join(", "),
        );
        console.log(
          `🆕 Названия новых карточек:`,
          newItems.map((c) => `"${c.title}"`).join(", "),
        );

        // Группировка новых карточек по секциям
        const newBySection = {};
        newItems.forEach((card) => {
          newBySection[card.section] = (newBySection[card.section] || 0) + 1;
        });
        console.log(
          `📊 Распределение новых карточек по секциям:`,
          newBySection,
        );

        // Сохраняем ID всех новых карточек
        const newIds = newItems.map((c) => c.id);
        localStorage.setItem("notification_card_ids", JSON.stringify(newIds));
        console.log("💾 ID новых карточек сохранены в notification_card_ids");

        // Показываем уведомление
        showNotification(newItems.length);
      } else {
        console.log("✅ Новых карточек не обнаружено (во всех секциях)");

        // Проверяем, не было ли удалений (по всем секциям)
        const serverIds = new Set(newCardsAll.map((n) => n.id));
        const deletedItems = oldCards.filter((c) => !serverIds.has(c.id));

        if (deletedItems.length > 0) {
          console.log(
            `🗑️ Обнаружено удаленных карточек: ${deletedItems.length}`,
          );
          console.log(
            `🗑️ ID удаленных карточек:`,
            deletedItems.map((c) => c.id).join(", "),
          );

          // Группировка удаленных по секциям
          const deletedBySection = {};
          deletedItems.forEach((card) => {
            deletedBySection[card.section] =
              (deletedBySection[card.section] || 0) + 1;
          });
          console.log(
            `📊 Распределение удаленных карточек по секциям:`,
            deletedBySection,
          );
        }
      }
    } else {
      console.error("❌ Сервер вернул не массив данных:", newCardsAll);
    }
  } catch (e) {
    console.error("❌ Ошибка загрузки с сервера, работаем с кэшем:", e);
  }

  console.log("📊 ========== КОНЕЦ ЛОГИРОВАНИЯ ==========\n");

  // 6. Функция отрисовки (фильтрует по секции ТОЛЬКО для отображения)
  function renderGrid(cards) {
    console.log(
      `🎨 Вызвана renderGrid с ${cards.length} карточками (все секции)`,
    );

    const container = document.querySelector(".models-grid");
    if (!container) {
      console.warn("⚠️ Контейнер .models-grid не найден на странице.");
      return;
    }

    // Фильтруем ТОЛЬКО для отображения на текущей странице
    const sectionCards = cards.filter((c) => c.section === sectionId);
    console.log(
      `🎯 Для отображения в секции "${sectionId}" отобрано ${sectionCards.length} карточек`,
    );

    sectionCards.sort((a, b) => a.title.localeCompare(b.title, "ru"));

    if (sectionCards.length === 0) {
      console.log(`📭 В секции "${sectionId}" нет карточек для отображения`);
      container.innerHTML =
        '<p class="no-models">В этом разделе пока нет моделей.</p>';
      return;
    }

    const html = sectionCards
      .map((card, index) => {
        const pdfLink =
          card.pdf && card.pdf.id
            ? `https://drive.google.com/file/d/${card.pdf.id}/preview`
            : "#";
        const videoLink = card.videoUrl || "#";
        const imgUrl = card.imageUrl || "";

        const difficultyLevel = getDifficultyLevel(card.difficulty);
        const difficultyText = getDifficultyText(card.difficulty);

        const difficultyHTML = `
    <div class="difficulty-segment" style="margin: 12px 0 8px; width: 100%">
        <div class="segments" style="display: flex; gap: 6px;">
            <div class="segment" style="flex:1; height:15px; background:${difficultyLevel >= 1 ? "#22c55e" : "#e9ecef"}; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:600; color:${difficultyLevel >= 1 ? "white" : "transparent"};">${difficultyLevel === 1 ? difficultyText : ""}</div>
            <div class="segment" style="flex:1; height:15px; background:${difficultyLevel >= 2 ? "#f59e0b" : "#e9ecef"}; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:600; color:${difficultyLevel >= 2 ? "white" : "transparent"};">${difficultyLevel === 2 ? difficultyText : ""}</div>
            <div class="segment" style="flex:1; height:15px; background:${difficultyLevel >= 3 ? "#ef4444" : "#e9ecef"}; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:600; color:${difficultyLevel >= 3 ? "white" : "transparent"};">${difficultyLevel === 3 ? difficultyText : ""}</div>
        </div>
    </div>
`;

        return `
            <div class="model-card" data-card-index="${index}" 
                 data-title="${escapeHtml(card.title)}"
                 data-desc="${escapeHtml(card.description || "")}"
                 data-img="${escapeHtml(imgUrl)}"
                 data-pdf="${escapeHtml(pdfLink)}"
                 data-video="${escapeHtml(videoLink)}">
                <img src="${imgUrl}" alt="${card.title}" class="model-image" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 150\'><rect fill=\'%23f0f0f0\' width=\'200\' height=\'150\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23999\' font-size=\'14\'>Нет фото</text></svg>'">
                <h3 class="model-title">${escapeHtml(card.title)}</h3>
                <p class="model-description">${escapeHtml(card.description ? card.description.substring(0, 100) : "")}${card.description && card.description.length > 100 ? "..." : ""}</p>
                ${difficultyHTML}
                <div class="model-details">
                    ${videoLink !== "#" ? `<a href="${videoLink}" target="_blank" class="video-btn" data-video-link><i class="fas fa-play"></i> Видео</a>` : ""}
                </div>
                <a href="${pdfLink}" target="_blank" class="instruction-btn" data-pdf-link>
                    <i class="fas fa-file-pdf"></i> Открыть инструкцию
                </a>
            </div>
        `;
      })
      .join("");

    container.innerHTML = html;
    console.log(`✅ Отрисовано карточек в сетке: ${sectionCards.length}`);

    // Добавляем обработчики кликов на карточки
    attachCardClickHandlers(sectionCards);
  }

  // Функция для экранирования HTML
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Функция для обработки кликов по карточкам
  function attachCardClickHandlers(cards) {
    const modal = document.getElementById("cardModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalActions = document.getElementById("modalActions");
    const modalClose = document.querySelector(".modal-close");

    if (!modal) {
      console.warn("⚠️ Модальное окно не найдено");
      return;
    }

    // Закрытие модального окна
    const closeModal = () => {
      modal.classList.remove("active");
    };

    if (modalClose) modalClose.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    // Обработчики на карточки
    const cardElements = document.querySelectorAll(".model-card");

    cardElements.forEach((cardEl, idx) => {
      // Убираем старый обработчик, если был
      const newCard = cardEl.cloneNode(true);
      cardEl.parentNode.replaceChild(newCard, cardEl);

      newCard.addEventListener("click", (e) => {
        // Не открываем модалку, если кликнули на кнопку
        if (
          e.target.closest(".video-btn") ||
          e.target.closest(".instruction-btn")
        ) {
          return;
        }

        e.preventDefault();

        const title = newCard.getAttribute("data-title") || "";
        const desc = newCard.getAttribute("data-desc") || "";
        const img = newCard.getAttribute("data-img") || "";
        const pdfLink = newCard.getAttribute("data-pdf") || "#";
        const videoLink = newCard.getAttribute("data-video") || "#";

        // Заполняем модальное окно
        modalTitle.textContent = title;
        modalDesc.textContent = desc || "";
        modalImg.src = img;
        modalImg.alt = title;

        // Формируем кнопки
        let actionsHtml = "";

        if (pdfLink !== "#") {
          actionsHtml += `
            <a href="${pdfLink}" target="_blank" class="modal-btn modal-btn-pdf">
              <i class="fas fa-file-pdf"></i> Открыть инструкцию
            </a>
          `;
        }

        if (videoLink !== "#") {
          actionsHtml += `
            <a href="${videoLink}" target="_blank" class="modal-btn modal-btn-video">
              <i class="fas fa-play"></i> Смотреть видео
            </a>
          `;
        }

        modalActions.innerHTML = actionsHtml;

        // Показываем модальное окно
        modal.classList.add("active");
      });
    });

    console.log(`✅ Добавлено обработчиков на ${cardElements.length} карточек`);
  }

  // 7. Функция показа уведомления
  function showNotification(count) {
    console.log(
      `🔔 Показываем уведомление о ${count} новых карточках (во всех секциях)`,
    );

    const toast = document.createElement("div");
    toast.className = "new-notify-toast";

    const currentUrl = window.location.href;
    const link = `novye-instruktsii-new.htm?q=${count}`;
    const finalLink = currentUrl.includes("teams/") ? link : `teams/${link}`;

    console.log(`🔗 Ссылка в уведомлении: ${finalLink}`);

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
        console.log(`👆 Клик по уведомлению, переходим на: ${finalLink}`);
        window.location.href = finalLink;
      }
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
        console.log("🔔 Уведомление скрыто");
      }, 400);
    }, 15000);

    console.log("🔔 Уведомление отображено");
  }
})();

// Функция для добавления контента в footer (без изменений)
function addFooterContent() {
  console.log("🦶 Добавляем контент в footer...");

  const footerDiv = document.querySelector("div.footer");
  if (footerDiv) {
    footerDiv.innerHTML = "";

    const link = document.createElement("a");
    link.href = "https://t.me/kornilovsergey";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "creation-link";

    link.appendChild(
      document.createTextNode("Создание сайтов и телеграм ботов под ключ"),
    );

    const arrowSpan = document.createElement("span");
    arrowSpan.className = "arrow";
    arrowSpan.textContent = "↗";
    link.appendChild(arrowSpan);

    footerDiv.appendChild(link);
    addFooterStyles();

    console.log("✅ Контент успешно добавлен в footer");
  } else {
    console.log("❌ Div с классом footer не найден");
  }
}

// Функция для добавления стилей (без изменений)
function addFooterStyles() {
  if (!document.getElementById("footer-styles")) {
    console.log("🎨 Добавляем стили для footer...");

    const styleElement = document.createElement("style");
    styleElement.id = "footer-styles";
    styleElement.textContent = `
      .footer {
        background-color: #f5f5f5;
        padding: 20px;
        text-align: center;
        font-family: Arial, sans-serif;
        border-top: 1px solid #ddd;
      }
    
      .footer p {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 14px;
      }
    
      .creation-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #666;
        text-decoration: none;
        padding: 4px 12px;
        border: 1px solid #ccc;
        border-radius: 20px;
        transition: all 0.3s ease;
        background-color: white;
        letter-spacing: 0.3px;
      }
    
      .creation-link:hover {
        color: #0088cc;
        border-color: #0088cc;
        background-color: #f0f9ff;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    
      .arrow {
        font-size: 14px;
        line-height: 1;
        transition: transform 0.2s ease;
      }
    
      .creation-link:hover .arrow {
        transform: translate(2px, -2px);
      }
    `;
    document.head.appendChild(styleElement);
    console.log("✅ Стили для footer добавлены");
  }
}

// Запускаем функцию после полной загрузки DOM
if (document.readyState === "loading") {
  console.log("⏳ DOM загружается, добавляем обработчик...");
  document.addEventListener("DOMContentLoaded", addFooterContent);
} else {
  console.log("✅ DOM уже загружен, запускаем addFooterContent...");
  addFooterContent();
}

// Проверяем, находимся ли мы на GitHub Pages
if (
  window.location.hostname.includes("github.io") ||
  window.location.hostname.includes("github.com")
) {
  // Переадресация на новый хостинг
  window.location.replace("http://ведо.рф");
}

document.addEventListener("DOMContentLoaded", function () {
  // Ждём появления модального окна
  setTimeout(function () {
    const modal = document.getElementById("cardModal");
    const closeBtn = document.querySelector("#cardModal .modal-close-btn");

    if (closeBtn) {
      // Закрытие по крестику
      closeBtn.onclick = function () {
        modal.classList.remove("active");
      };
    }

    // Закрытие по клику на фон
    if (modal) {
      modal.onclick = function (e) {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      };
    }

    // Закрытие по клавише ESC
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && modal.classList.contains("active")) {
        modal.classList.remove("active");
      }
    });

    console.log("✅ Закрытие модального окна настроено");
  }, 1000);
});

async function loadDynamicBlocks() {
  const url =
    "https://script.google.com/macros/s/AKfycbzB6aP3KPBdMvkSrL9j_u2J-vViEcwvoxMHWiLHKaCSH4sZ8_vk-mCJdGOKnXHh8qi7/exec";

  const block1Container = document.getElementById("block1");
  const block2Container = document.getElementById("block2");
  const block3Container = document.getElementById("block3");

  // Заглушки во время загрузки
  if (block1Container)
    block1Container.innerHTML = '<div class="dynamic-block"></div>';
  if (block2Container)
    block2Container.innerHTML = '<div class="dynamic-block"></div>';
  if (block3Container)
    block3Container.innerHTML = '<div class="dynamic-block"></div>';

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (block1Container && data.block1) block1Container.innerHTML = data.block1;
    if (block2Container && data.block2) block2Container.innerHTML = data.block2;
    if (block3Container && data.block3) block3Container.innerHTML = data.block3;

    console.log("✅ Три блока успешно загружены");
  } catch (error) {
    console.error("❌ Ошибка загрузки:", error);
    if (block1Container)
      block1Container.innerHTML = '<div class="dynamic-block">⚠️ Ошибка</div>';
    if (block2Container)
      block2Container.innerHTML = '<div class="dynamic-block">⚠️ Ошибка</div>';
    if (block3Container)
      block3Container.innerHTML = '<div class="dynamic-block">⚠️ Ошибка</div>';
  }
}

// document.addEventListener("DOMContentLoaded", loadDynamicBlocks);

// --- РЕКЛАМНЫЕ БЛОКИ (НА ГЛАВНОЙ) ---
const AdsDisplay = {
  allAds: [],
  currentAds: [],
  shownHistory: [],
  rotationInterval: null,
  isRotating: false,
  cacheKey: "wedo_ads_cache",
  cacheTimestampKey: "wedo_ads_timestamp",
  cacheTTL: 3600000,

  // Скрытие всей секции рекламы
  hideAdsSection: () => {
    const adsSection = document.getElementById("floatingBlocks");
    const adsHeader = document.querySelector(".ads-header");

    if (adsSection) {
      // Анимация скрытия
      adsSection.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      adsSection.style.opacity = "0";
      adsSection.style.transform = "scale(0.95)";

      if (adsHeader) {
        adsHeader.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        adsHeader.style.opacity = "0";
        adsHeader.style.transform = "scale(0.95)";
      }

      setTimeout(() => {
        adsSection.style.display = "none";
        if (adsHeader) adsHeader.style.display = "none";
      }, 300);
    }
  },

  isCacheValid: () => {
    const timestamp = localStorage.getItem(AdsDisplay.cacheTimestampKey);
    if (!timestamp) return false;
    const now = Date.now();
    return now - parseInt(timestamp) < AdsDisplay.cacheTTL;
  },

  saveToCache: (ads) => {
    try {
      localStorage.setItem(AdsDisplay.cacheKey, JSON.stringify(ads));
      localStorage.setItem(AdsDisplay.cacheTimestampKey, Date.now().toString());
      console.log(`Реклама сохранена в кэш: ${ads.length} блоков`);
    } catch (e) {
      console.warn("Не удалось сохранить рекламу в localStorage:", e);
    }
  },

  loadFromCache: () => {
    try {
      const cached = localStorage.getItem(AdsDisplay.cacheKey);
      if (cached) {
        const ads = JSON.parse(cached);
        if (Array.isArray(ads) && ads.length > 0) {
          console.log(`Загружено из кэша: ${ads.length} блоков`);
          return ads;
        }
      }
    } catch (e) {
      console.warn("Ошибка чтения кэша рекламы:", e);
    }
    return null;
  },

  loadAds: async () => {
    // 1. Показываем кэш (если есть) и запускаем ротацию
    const cachedAds = AdsDisplay.loadFromCache();
    let hasCache = false;

    if (cachedAds && cachedAds.length > 0) {
      AdsDisplay.allAds = cachedAds;
      hasCache = true;
      console.log(
        `Используем кэшированную рекламу (${cachedAds.length} блоков)`,
      );
      AdsDisplay.start(); // Сразу показываем то, что есть в кэше
    } else {
      console.log("Кэш рекламы пуст, показываем fallback");
      AdsDisplay.showFallback();
    }

    // 2. Проверяем сервер и обновляем, если данные изменились
    try {
      const res = await fetch(GAS_APP_URL + "?action=getAds&t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        const freshAds = Array.isArray(data) ? data : [];

        if (freshAds.length > 0) {
          // Сравниваем ID текущих объявлений с новыми
          const currentIds = AdsDisplay.allAds.map((ad) => ad.id).join(",");
          const freshIds = freshAds.map((ad) => ad.id).join(",");

          if (currentIds !== freshIds) {
            console.log(
              `Обновление рекламы: ${freshAds.length} блоков (было ${AdsDisplay.allAds.length})`,
            );

            // Обновляем данные и кэш
            AdsDisplay.allAds = freshAds;
            AdsDisplay.saveToCache(freshAds);

            // Перезапускаем ротацию с новыми данными
            AdsDisplay.stopRotation();
            AdsDisplay.start();
          } else if (hasCache) {
            // Данные не изменились, просто обновляем timestamp кэша
            console.log(
              "Реклама не изменилась, обновляем только timestamp кэша",
            );
            localStorage.setItem(
              AdsDisplay.cacheTimestampKey,
              Date.now().toString(),
            );
          }
        }
      } else {
        console.warn(
          "Не удалось загрузить свежую рекламу, используем существующую",
        );
      }
    } catch (e) {
      console.error("Ошибка фоновой загрузки рекламы:", e);
      // Если нет кэша и сервер недоступен, показываем fallback
      if (!hasCache) {
        AdsDisplay.showFallback();
      }
    }
  },

  start: () => {
    const count = AdsDisplay.allAds.length;

    if (count === 0) {
      AdsDisplay.showFallback();
      return;
    }

    if (count < 4) {
      AdsDisplay.currentAds = [...AdsDisplay.allAds];
      AdsDisplay.render();
      console.log("Реклама: блоков < 4, ротация отключена");
    } else {
      AdsDisplay.rotateAds(true);
      AdsDisplay.startRotation();
    }
  },

  getRandomUniqueAds: (count, excludeIds = []) => {
    let available = AdsDisplay.allAds.filter(
      (ad) => !excludeIds.includes(ad.id),
    );

    if (available.length < count) {
      available = AdsDisplay.allAds;
      AdsDisplay.shownHistory = [];
    }

    const shuffled = [...available];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, count);

    selected.forEach((ad) => {
      AdsDisplay.shownHistory.push(ad.id);
    });
    if (AdsDisplay.shownHistory.length > 12) {
      AdsDisplay.shownHistory = AdsDisplay.shownHistory.slice(-12);
    }

    return selected;
  },

  rotateAds: (isFirstRun = false) => {
    const newAds = AdsDisplay.getRandomUniqueAds(4, AdsDisplay.shownHistory);

    if (newAds.length < 4) {
      if (AdsDisplay.isRotating) {
        AdsDisplay.stopRotation();
        AdsDisplay.isRotating = false;
      }
      AdsDisplay.currentAds = [...newAds];
      while (AdsDisplay.currentAds.length < 4) {
        AdsDisplay.currentAds.push(null);
      }
      AdsDisplay.render();
      return;
    }

    if (!isFirstRun) {
      const containers = ["block1", "block2", "block3", "block4"];
      containers.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add("fade-out");
      });

      setTimeout(() => {
        AdsDisplay.stopAllVideos();
        AdsDisplay.currentAds = newAds;
        AdsDisplay.render();
        containers.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.classList.remove("fade-out");
        });
      }, 300);
    } else {
      AdsDisplay.currentAds = newAds;
      AdsDisplay.render();
    }
  },

  startRotation: () => {
    if (AdsDisplay.rotationInterval) clearInterval(AdsDisplay.rotationInterval);
    AdsDisplay.isRotating = true;
    AdsDisplay.rotationInterval = setInterval(() => {
      AdsDisplay.rotateAds(false);
    }, 10000);
  },

  stopRotation: () => {
    if (AdsDisplay.rotationInterval) {
      clearInterval(AdsDisplay.rotationInterval);
      AdsDisplay.rotationInterval = null;
    }
    AdsDisplay.isRotating = false;
  },

  stopAllVideos: () => {
    const videos = document.querySelectorAll(".floating-blocks video");
    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  },

  playVideoIfNeeded: (videoElement) => {
    if (videoElement && videoElement.tagName === "VIDEO") {
      videoElement.muted = true;
      videoElement
        .play()
        .catch((e) => console.log("Автовоспроизведение заблокировано:", e));
    }
  },

  render: () => {
    const blocks = ["block1", "block2", "block3", "block4"];

    blocks.forEach((blockId, index) => {
      const container = document.getElementById(blockId);
      if (!container) return;

      const ad = AdsDisplay.currentAds[index];

      if (!ad || (!ad.imageUrl && !ad.videoUrl)) {
        container.innerHTML = "";
        container.style.minHeight = "auto";
        container.style.background = "transparent";
        return;
      }

      const isVideo = ad.mediaType === "video" && ad.videoUrl;
      const mediaUrl = isVideo ? ad.videoUrl : ad.imageUrl;

      let mediaHtml = "";
      if (isVideo) {
        mediaHtml = `
          <video muted autoplay loop playsinline 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            <source src="${mediaUrl}" type="video/mp4">
            Ваш браузер не поддерживает видео.
          </video>
        `;
      } else {
        mediaHtml = `
          <img src="${mediaUrl}" alt="Реклама" 
               style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block;">
        `;
      }

      if (ad.linkUrl) {
        container.innerHTML = `
          <a href="${ad.linkUrl}" target="_blank" rel="noopener noreferrer" 
             style="display: block; width: 100%; height: 100%; text-decoration: none;">
            ${mediaHtml}
          </a>
        `;
      } else {
        container.innerHTML = mediaHtml;
      }

      if (isVideo) {
        setTimeout(() => {
          const video = container.querySelector("video");
          if (video) AdsDisplay.playVideoIfNeeded(video);
        }, 50);
      }
    });
  },

  showFallback: () => {
    const blocks = ["block1", "block2", "block3", "block4"];
    blocks.forEach((blockId) => {
      const container = document.getElementById(blockId);
      if (container) {
        container.innerHTML = "";
        container.style.minHeight = "auto";
        container.style.background = "transparent";
      }
    });
  },
};

window.addEventListener("load", function () {
  // Инициализация кнопки скрытия всей рекламы
  const hideAllBtn = document.getElementById("hideAllAdsBtn");
  if (hideAllBtn) {
    hideAllBtn.addEventListener("click", () => {
      AdsDisplay.hideAdsSection();
    });
  }

  AdsDisplay.loadAds();
});

// Запускаем рекламу после загрузки страницы
// Добавить в window.addEventListener('load', ...) или в конец DOMContentLoaded

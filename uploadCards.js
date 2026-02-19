// --- КОНФИГУРАЦИЯ ---
// Вставьте сюда ссылку на ваш Web App
const GAS_APP_URL =
  "https://script.google.com/macros/s/AKfycbyQBWZZRrIGT6HIy78uvYqNqqo2CDISHIqOPMPTEG1mCvH4gxEn9QJXqlYaHVAV0zBu/exec";

(async function initModelsGrid() {
  console.log("🚀 Инициализация сетки моделей...");

  // 1. Получаем ID секции из URL
  const pathName = window.location.pathname;
  // Пример: /wedо/teams/avtomobili-mototsikly-2.htm -> avtomobili-mototsikly-2
  const sectionId =
    pathName.substring(pathName.lastIndexOf("/") + 1).replace(".htm", "") ||
    "general";

  console.log(`Текущая секция (ID): ${sectionId}`);

  // 2. Загрузка данных
  let allCards = [];

  // Сначала пробуем из LocalStorage (быстро)
  const localData = localStorage.getItem("site_cards");
  if (localData) {
    try {
      allCards = JSON.parse(localData);
      console.log("📦 Данные загружены из LocalStorage");
      renderGrid(allCards); // Рисуем то, что есть
    } catch (e) {
      console.warn("LocalStorage поврежден, загружаем с сервера...");
    }
  }

  // Затем обновляем с сервера
  try {
    console.log("⏳ Обновление данных с сервера...");
    const res = await fetch(GAS_APP_URL + "?action=getCards&t=" + Date.now());
    const data = await res.json();

    if (Array.isArray(data)) {
      allCards = data;
      localStorage.setItem("site_cards", JSON.stringify(allCards)); // Кэшируем
      console.log("✅ Данные обновлены с сервера");
      renderGrid(allCards); // Перерисовываем с актуальными данными
    }
  } catch (e) {
    console.error("Ошибка загрузки с сервера, работаем с кэшем:", e);
  }

  // 3. Функция отрисовки
  function renderGrid(cards) {
    // Ищем контейнер .models-grid
    const container = document.querySelector(".models-grid");
    if (!container) {
      console.warn("Контейнер .models-grid не найден на странице.");
      return;
    }

    // Фильтруем карточки по ID секции
    const sectionCards = cards.filter((c) => c.section === sectionId);

    if (sectionCards.length === 0) {
      // Если карточек нет, можно оставить пустым или вывести сообщение
      // container.innerHTML = '<p>В этом разделе пока нет моделей.</p>';
      return;
    }

    // Генерируем HTML
    const html = sectionCards
      .map((card) => {
        // Ссылка на PDF для ПРОСМОТРА (не скачивания)
        // Используем ID, чтобы открыть предпросмотр Google Drive
        const pdfLink =
          card.pdf && card.pdf.id
            ? `https://drive.google.com/file/d/${card.pdf.id}/preview`
            : "#";

        const videoLink = card.videoUrl || "#";

        // Обработка картинки: если путь относительный, оставляем как есть
        // Если путь абсолютный (Google), оставляем как есть
        const imgUrl = card.imageUrl || ""; // Можно добавить заглушку, если пусто

        return `
                <div class="model-card">
                    <img src="${imgUrl}" alt="${card.title}" class="model-image">
                    <h3 class="model-title">${card.title}</h3>
                    <div class="model-details">
                        ${
                          videoLink !== "#"
                            ? `<a href="${videoLink}" target="_blank" class="video-btn">
                                <i class="fas fa-play"></i> Видео
                            </a>`
                            : ""
                        }
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
})();

// Функция для добавления контента в footer
function addFooterContent() {
  // Находим div с классом footer
  const footerDiv = document.querySelector("div.footer");

  // Проверяем, найден ли элемент
  if (footerDiv) {
    // Очищаем содержимое footer (если нужно заменить существующий контент)
    footerDiv.innerHTML = "";

    // Создаем и добавляем параграф
    // const paragraph = document.createElement("p");
    // paragraph.textContent = "Все модели автомобилей и мотоциклов";
    // footerDiv.appendChild(paragraph);

    // Создаем ссылку
    const link = document.createElement("a");
    link.href = "https://t.me/kornilovsergey";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "creation-link";

    // Добавляем текст ссылки
    link.appendChild(
      document.createTextNode("Создание сайтов и телеграм ботов под ключ"),
    );

    // Создаем и добавляем стрелку
    const arrowSpan = document.createElement("span");
    arrowSpan.className = "arrow";
    arrowSpan.textContent = "↗";
    link.appendChild(arrowSpan);

    // Добавляем ссылку в footer
    footerDiv.appendChild(link);

    // Добавляем стили
    addFooterStyles();

    console.log("Контент успешно добавлен в footer");
  } else {
    console.log("Div с классом footer не найден");
  }
}

// Функция для добавления стилей
function addFooterStyles() {
  // Проверяем, не добавлены ли уже стили
  if (!document.getElementById("footer-styles")) {
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
  }
}

// Запускаем функцию после полной загрузки DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addFooterContent);
} else {
  // Если DOM уже загружен, запускаем сразу
  addFooterContent();
}

// --- КОНФИГУРАЦИЯ ---
// const GAS_APP_URL = 'https://script.google.com/macros/s/AKfycbxzqCJUNlmfTGmF2Nb__XTz0ruVL40pvzp63Vy-TbiBJzRrsA1x-fN5-DlChAa8j3Om/exec';

(async function checkNewCards() {
  console.log("🔔 Проверка новых инструкций...");

  try {
    // 1. Загружаем старые данные из LocalStorage
    const oldDataRaw = localStorage.getItem("site_cards");
    const oldCards = oldDataRaw ? JSON.parse(oldDataRaw) : [];
    const oldIds = new Set(oldCards.map((c) => c.id));

    // 2. Загружаем свежие данные с сервера
    const res = await fetch(GAS_APP_URL + "?action=getCards&t=" + Date.now());
    const newCardsAll = await res.json();

    if (!Array.isArray(newCardsAll)) return;

    // 3. Ищем новые карточки
    const newItems = newCardsAll.filter((c) => !oldIds.has(c.id));

    if (newItems.length > 0) {
      console.log(`🎉 Найдено новых карточек: ${newItems.length}`);

      // 4. Сохраняем полный список карточек (для отображения на странице)
      localStorage.setItem("site_cards", JSON.stringify(newCardsAll));

      // 5. Сохраняем ТОЛЬКО ID новых карточек (перезаписывая старые)
      const newIds = newItems.map((c) => c.id);
      localStorage.setItem("notification_card_ids", JSON.stringify(newIds));

      console.log("💾 Сохранены ID новых карточек:", newIds);

      showNotification(newItems.length);
    } else {
      console.log("✅ Нет новых инструкций.");
    }
  } catch (e) {
    console.error("Ошибка проверки обновлений:", e);
  }

  function showNotification(count) {
    const toast = document.createElement("div");
    toast.className = "new-notify-toast";

    // Получаем текущий URL браузера
    const currentUrl = window.location.href;

    // Формируем твою ссылку
    const link = `novye-instruktsii-new.htm?q=${count}`;

    // Проверяем, содержит ли текущий URL "teams/" и добавляем к ссылке если нужно
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

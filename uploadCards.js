// --- КОНФИГУРАЦИЯ ---
const GAS_APP_URL =
  "https://script.google.com/macros/s/AKfycbyQBWZZRrIGT6HIy78uvYqNqqo2CDISHIqOPMPTEG1mCvH4gxEn9QJXqlYaHVAV0zBu/exec";

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

    if (sectionCards.length === 0) {
      console.log(`📭 В секции "${sectionId}" нет карточек для отображения`);
      container.innerHTML =
        '<p class="no-models">В этом разделе пока нет моделей.</p>';
      return;
    }

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
    console.log(`✅ Отрисовано карточек в сетке: ${sectionCards.length}`);
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

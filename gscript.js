const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyQBWZZRrIGT6HIy78uvYqNqqo2CDISHIqOPMPTEG1mCvH4gxEn9QJXqlYaHVAV0zBu/exec"; // ← замените
let fileMap = JSON.parse(localStorage.getItem("drivePdfMap") || "{}");

// === ФУНКЦИЯ: ЗАГРУЗИТЬ СПИСОК ФАЙЛОВ И СОХРАНИТЬ В localStorage ===
async function fetchAndSaveFileMap() {
  try {
    const res = await fetch(SCRIPT_URL);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    localStorage.setItem("drivePdfMap", JSON.stringify(data));
    fileMap = data; // обновляем глобальную переменную
    console.log("Список PDF-файлов успешно загружен и сохранён в localStorage");
  } catch (err) {
    console.error("Не удалось загрузить список файлов:", err);
  }
}

// === ФУНКЦИЯ: ОБРАБОТКА КЛИКА ПО PDF-ССЫЛКЕ ===
function handlePdfClick(e) {
  const link = e.target.closest('a[href$=".pdf"]');
  if (!link) return;

  e.preventDefault();
  const filename = link.href.split("/").pop();

  if (fileMap[filename]) {
    // Открываем в просмотрщике Google Drive
    window.open(
      `https://drive.google.com/file/d/${fileMap[filename]}/view`,
      "_blank",
    );
  } else {
    // Файл не найден → принудительно обновляем список один раз
    fetchAndSaveFileMap().then(() => {
      if (fileMap[filename]) {
        window.open(
          `https://drive.google.com/file/d/${fileMap[filename]}/view`,
          "_blank",
        );
      } else {
        alert(`Файл "${filename}" не найден ни в кэше, ни на Google Диске.`);
      }
    });
  }
}

// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
document.addEventListener("DOMContentLoaded", () => {
  // Назначаем обработчик кликов
  document.addEventListener("click", handlePdfClick);

  // Если localStorage пуст — сразу загружаем список файлов
  if (Object.keys(fileMap).length === 0) {
    console.log(
      "localStorage пуст. Запускаем фоновую загрузку списка файлов...",
    );
    fetchAndSaveFileMap();
  }
});

(function updateSectionsCache() {
  console.log("🔄 Обновление кэша разделов...");

  // Ищем все карточки категорий на странице
  const categoryCards = document.querySelectorAll(".category-card");

  if (categoryCards.length === 0) {
    console.warn("Категории на странице не найдены.");
    return;
  }

  const sections = [];

  categoryCards.forEach((card) => {
    const linkEl = card; // Сам элемент 'a' является ссылкой
    const nameEl = card.querySelector(".category-name");

    if (linkEl && nameEl) {
      const href = linkEl.getAttribute("href");
      // Извлекаем ID: берем часть после последнего слеша и убираем .htm
      let id = href;
      if (id.includes("/")) {
        id = id.substring(id.lastIndexOf("/") + 1);
      }
      if (id.endsWith(".htm")) {
        id = id.replace(".htm", "");
      }

      sections.push({
        id: id,
        name: nameEl.innerText.trim(),
      });
    }
  });

  if (sections.length > 0) {
    // Перезаписываем LocalStorage при каждом открытии
    localStorage.setItem("site_sections", JSON.stringify(sections));
    console.log(`✅ Кэш обновлен. Категорий записано: ${sections.length}`);
  } else {
    console.warn("Не удалось извлечь категории.");
  }
})();

// const GAS_APP_URL =
//   "https://script.google.com/macros/s/AKfycbxzqCJUNlmfTGmF2Nb__XTz0ruVL40pvzp63Vy-TbiBJzRrsA1x-fN5-DlChAa8j3Om/exec";
// (async function checkNewCards() {
//   console.log("🔔 Проверка новых инструкций...");

//   try {
//     // 1. Загружаем старые данные из LocalStorage
//     const oldDataRaw = localStorage.getItem("site_cards");
//     const oldCards = oldDataRaw ? JSON.parse(oldDataRaw) : [];
//     const oldIds = new Set(oldCards.map((c) => c.id));

//     // 2. Загружаем свежие данные с сервера
//     const res = await fetch(GAS_APP_URL + "?action=getCards&t=" + Date.now());
//     const newCardsAll = await res.json();

//     if (!Array.isArray(newCardsAll)) return;

//     // 3. Ищем новые карточки
//     const newItems = newCardsAll.filter((c) => !oldIds.has(c.id));

//     if (newItems.length > 0) {
//       console.log(`🎉 Найдено новых карточек: ${newItems.length}`);

//       // 4. Сохраняем полный список карточек (для отображения на странице)
//       localStorage.setItem("site_cards", JSON.stringify(newCardsAll));

//       // 5. Сохраняем ТОЛЬКО ID новых карточек (перезаписывая старые)
//       const newIds = newItems.map((c) => c.id);
//       localStorage.setItem("notification_card_ids", JSON.stringify(newIds));

//       console.log("💾 Сохранены ID новых карточек:", newIds);

//       showNotification(newItems.length);
//     } else {
//       console.log("✅ Нет новых инструкций.");
//     }
//   } catch (e) {
//     console.error("Ошибка проверки обновлений:", e);
//   }

//   function showNotification(count) {
//     const toast = document.createElement("div");
//     toast.className = "new-notify-toast";

//     // В ссылке может быть любое число, но главное - наличие параметра q
//     const link = `teams/novye-instruktsii-new.htm?q=${count}`;

//     toast.innerHTML = `
//       <div class="new-notify-content">
//         <div class="new-notify-title">Новые инструкции!</div>
//         <div class="new-notify-text">Доступно новых позиций: ${count}.</div>
//         <a href="${link}" style="color: #4f46e5; text-decoration: none; font-weight: 500; font-size: 0.9rem;">Смотреть &rarr;</a>
//       </div>
//       <button class="new-notify-close" onclick="this.parentElement.remove()">&times;</button>
//     `;

//     toast.addEventListener("click", (e) => {
//       if (!e.target.classList.contains("new-notify-close")) {
//         window.location.href = link;
//       }
//     });

//     document.body.appendChild(toast);
//     requestAnimationFrame(() => toast.classList.add("show"));

//     setTimeout(() => {
//       toast.classList.remove("show");
//       setTimeout(() => toast.remove(), 400);
//     }, 15000);
//   }
// })();

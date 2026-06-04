// Модуль для загрузки и отрисовки карточек на страницах категорий
// Подключается на страницах teams/*.htm

const GAS_APP_URL =
  "https://script.google.com/macros/s/AKfycbyQBWZZRrIGT6HIy78uvYqNqqo2CDISHIqOPMPTEG1mCvH4gxEn9QJXqlYaHVAV0zBu/exec";

// Уровни сложности
function getDifficultyLevel(difficulty) {
  const map = { easy: 1, hard: 2, pro: 3 };
  return map[difficulty] || 0;
}

function getDifficultyText(difficulty) {
  const map = { easy: "Начальный", hard: "Средний", pro: "Сложный" };
  return map[difficulty] || "";
}

// Экранирование HTML
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Отрисовка сетки карточек
function renderGrid(cards, sectionId) {
  console.log(
    `🎨 renderGrid: ${cards.length} карточек для секции ${sectionId}`,
  );

  const container = document.querySelector(".models-grid");
  if (!container) {
    console.warn("⚠️ Контейнер .models-grid не найден");
    return;
  }

  const sectionCards = cards.filter((c) => c.section === sectionId);
  console.log(`🎯 Отобрано ${sectionCards.length} карточек`);

  sectionCards.sort((a, b) => a.title.localeCompare(b.title, "ru"));

  if (sectionCards.length === 0) {
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
           data-video="${escapeHtml(videoLink)}"
           data-difficulty="${escapeHtml(card.difficulty || "")}">
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
  console.log(`✅ Отрисовано ${sectionCards.length} карточек`);

  // Добавляем обработчики кликов
  attachCardClickHandlers();
}

// Обработчики кликов по карточкам (модальное окно)
function attachCardClickHandlers() {
  const modal = document.getElementById("cardModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalActions = document.getElementById("modalActions");
  const modalClose = document.querySelector(".modal-close-btn");

  if (!modal) {
    console.warn("⚠️ Модальное окно не найдено");
    return;
  }

  const closeModal = () => modal.classList.remove("active");

  if (modalClose) modalClose.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
  });

  const cardElements = document.querySelectorAll(".model-card");

  cardElements.forEach((cardEl) => {
    const newCard = cardEl.cloneNode(true);
    cardEl.parentNode.replaceChild(newCard, cardEl);

    newCard.addEventListener("click", (e) => {
      if (
        e.target.closest(".video-btn") ||
        e.target.closest(".instruction-btn")
      )
        return;
      e.preventDefault();

      // Убираем старый маркер со всех карточек
      document
        .querySelectorAll(".model-card")
        .forEach((c) => c.removeAttribute("data-clicked"));
      // Ставим маркер на текущую карточку
      newCard.setAttribute("data-clicked", "true");

      const title = newCard.getAttribute("data-title") || "";
      const desc = newCard.getAttribute("data-desc") || "";
      const img = newCard.getAttribute("data-img") || "";
      const pdfLink = newCard.getAttribute("data-pdf") || "#";
      const videoLink = newCard.getAttribute("data-video") || "#";

      modalTitle.textContent = title;
      modalDesc.textContent = desc || "";
      modalImg.src = img;
      modalImg.alt = title;

      let actionsHtml = "";
      if (pdfLink !== "#") {
        actionsHtml += `<a href="${pdfLink}" target="_blank" class="modal-btn modal-btn-pdf"><i class="fas fa-file-pdf"></i> Открыть инструкцию</a>`;
      }
      if (videoLink !== "#") {
        actionsHtml += `<a href="${videoLink}" target="_blank" class="modal-btn modal-btn-video"><i class="fas fa-play"></i> Смотреть видео</a>`;
      }
      modalActions.innerHTML = actionsHtml;

      modal.classList.add("active");
    });
  });

  console.log(`✅ Добавлено обработчиков на ${cardElements.length} карточек`);
}

// Уведомление о новых карточках
function showNotification(count) {
  console.log(`🔔 Показываем уведомление о ${count} новых карточках`);

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

// Основная функция инициализации
// js/modules/cardsGrid.js (фрагмент)

export async function initCardsGrid() {
  console.log("🚀 Инициализация страницы категории...");

  const pathName = window.location.pathname;
  const sectionId =
    pathName.substring(pathName.lastIndexOf("/") + 1).replace(".htm", "") ||
    "general";
  console.log(`📍 Текущая секция: ${sectionId}`);

  let allCards = [];
  let oldIds = new Set();

  // ✅ ЖДЁМ загрузку с сервера перед рендером
  try {
    console.log("⏳ Запрашиваем данные с сервера...");
    const res = await fetch(GAS_APP_URL + "?action=getCards&t=" + Date.now());
    const newCardsAll = await res.json();

    if (Array.isArray(newCardsAll)) {
      console.log(`🌐 Сервер вернул ${newCardsAll.length} карточек`);
      allCards = newCardsAll;
      localStorage.setItem("site_cards", JSON.stringify(allCards));
      console.log("💾 Данные сохранены в localStorage");

      // ✅ Только после загрузки рендерим
      renderGrid(allCards, sectionId);

      // Проверяем новые карточки
      const oldDataRaw = localStorage.getItem("site_cards_old");
      if (oldDataRaw) {
        const oldCards = JSON.parse(oldDataRaw);
        oldIds = new Set(oldCards.map((c) => c.id));
        const newItems = newCardsAll.filter((c) => !oldIds.has(c.id));
        if (newItems.length > 0) {
          console.log(`🎉 Найдено новых карточек: ${newItems.length}`);
          showNotification(newItems.length);
        }
      }

      // Сохраняем старые для следующего сравнения
      localStorage.setItem("site_cards_old", JSON.stringify(allCards));
    }
  } catch (e) {
    console.error("❌ Ошибка загрузки с сервера:", e);
    // Fallback: используем кэш
    const cached = localStorage.getItem("site_cards");
    if (cached) {
      allCards = JSON.parse(cached);
      console.log(`📦 Используем кэш: ${allCards.length} карточек`);
      renderGrid(allCards, sectionId);
    }
  }
}

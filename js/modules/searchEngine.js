// Поиск и пагинация моделей
import { CONFIG, BASE_PATH } from "../config.js";
import { normalizeText, debounce } from "../utils/helpers.js";
import { loadCards, loadSections } from "../utils/storage.js";

const { ITEMS_PER_PAGE } = CONFIG;

let allModels = [];
let filteredModels = [];
let currentPage = 1;
let categoryMap = {};

// Элементы DOM
let searchInput,
  searchClearBtn,
  searchStats,
  categoriesGrid,
  modelsGrid,
  paginationContainer;

export function initSearchEngine() {
  // Получаем элементы
  searchInput = document.getElementById("modelSearchInput");
  searchClearBtn = document.getElementById("searchClearBtn");
  searchStats = document.getElementById("searchStats");
  categoriesGrid = document.getElementById("categoriesGrid");
  modelsGrid = document.getElementById("modelsGrid");
  paginationContainer = document.getElementById("pagination");

  if (!searchInput) return;

  // Загружаем данные
  loadData();

  // Назначаем обработчики
  const debouncedSearch = debounce(performSearch, 300);
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value;
    debouncedSearch(value);
    if (searchClearBtn) {
      searchClearBtn.classList.toggle("active", value.length > 0);
    }
  });

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchClearBtn.classList.remove("active");
      performSearch("");
      searchInput.focus();
    });
  }
}

function loadData() {
  allModels = loadCards();
  const sections = loadSections();

  // Создаём карту категорий
  const CATEGORY_COLORS = [
    "#E0F7FA",
    "#E1F5FE",
    "#E3F2FD",
    "#E8EAF6",
    "#EDE7F6",
    "#F3E5F5",
    "#FCE4EC",
    "#FFEBEE",
    "#FBE9E7",
    "#FFF3E0",
  ];

  sections.forEach((section, index) => {
    categoryMap[section.id] = {
      name: section.name,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    };
  });

  console.log(
    `Загружено моделей: ${allModels.length}, категорий: ${sections.length}`,
  );
}

function performSearch(query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery || normalizedQuery.length < 2) {
    showCategories();
    if (searchStats) {
      searchStats.textContent = query
        ? "Введите минимум 2 символа"
        : "Введите запрос для поиска";
    }
    return;
  }

  // Фильтрация по названию модели
  filteredModels = allModels.filter((model) => {
    const title = normalizeText(model.title || "");
    return title.includes(normalizedQuery);
  });

  currentPage = 1;
  renderModels();
  updateStats();
  showSearchResults();
}

function showSearchResults() {
  if (categoriesGrid) categoriesGrid.style.display = "none";
  if (modelsGrid) modelsGrid.style.display = "grid";
  if (paginationContainer) paginationContainer.style.display = "flex";
}

function showCategories() {
  if (categoriesGrid) categoriesGrid.style.display = "grid";
  if (modelsGrid) modelsGrid.style.display = "none";
  if (paginationContainer) paginationContainer.style.display = "none";
  if (modelsGrid) modelsGrid.innerHTML = "";
  if (paginationContainer) paginationContainer.innerHTML = "";
}

function updateStats() {
  if (searchStats) {
    searchStats.textContent = `Найдено: ${filteredModels.length} моделей`;
  }
}

function renderModels() {
  if (!modelsGrid) return;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = filteredModels.slice(start, end);

  modelsGrid.innerHTML = "";

  if (pageData.length === 0) {
    modelsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #7f8c8d;">
        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
        <p style="font-size: 1.2rem;">Ничего не найдено</p>
        <p>Попробуйте изменить запрос</p>
      </div>
    `;
    if (paginationContainer) paginationContainer.innerHTML = "";
    return;
  }

  pageData.forEach((model) => {
    const card = createModelCard(model);
    modelsGrid.appendChild(card);
  });

  renderPagination();
}

function createModelCard(model) {
  const card = document.createElement("div");
  card.className = "model-card";

  // Обработка изображения
  let imageUrl = "";
  if (model.imageUrl) {
    if (model.imageUrl.startsWith("http")) {
      imageUrl = model.imageUrl;
    } else {
      imageUrl = BASE_PATH + model.imageUrl.replace(/^\.\.\//, "");
    }
  }

  // Обработка PDF
  let pdfPath = "#";
  if (model.pdf && model.pdf.name) {
    const rawPdfPath = `../instructions/${model.pdf.name}`;
    if (rawPdfPath.startsWith("http")) {
      pdfPath = rawPdfPath;
    } else {
      pdfPath = BASE_PATH + rawPdfPath.replace(/^\.\.\//, "");
    }
  }

  // Видео кнопка
  const videoUrl = model.videoUrl ? model.videoUrl.trim() : "";
  const hasValidVideo = videoUrl && videoUrl !== "#" && videoUrl.length > 1;
  const videoBtn = hasValidVideo
    ? `
    <a href="${videoUrl}" target="_blank" class="action-btn btn-video">
      <i class="fas fa-play"></i> Видео
    </a>`
    : "";

  // Категория
  const categoryInfo = categoryMap[model.section] || {
    name: "Категория",
    color: "#E0F7FA",
  };
  let categoryHref = "#";
  if (model.section) {
    categoryHref = BASE_PATH + `/teams/${model.section}.htm`;
  }

  card.innerHTML = `
    <img src="${imageUrl || ""}" alt="${model.title || "Модель"}" class="model-image" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 200 150\\'><rect fill=\\'%23f0f0f0\\' width=\\'200\\' height=\\'150\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23999\\' font-size=\\'14\\'>Нет фото</text></svg>'">
    <a href="${categoryHref}" class="model-category" style="background-color: ${categoryInfo.color};">
      <i class="fas fa-folder-open"></i> ${categoryInfo.name}
    </a>
    <h3 class="model-title">${model.title || "Без названия"}</h3>
    <div class="model-actions">
      ${videoBtn}
      <a href="${pdfPath}" target="_blank" class="action-btn btn-pdf">
        <i class="fas fa-file-pdf"></i> Инструкция
      </a>
    </div>
  `;

  return card;
}

function renderPagination() {
  if (!paginationContainer) return;

  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  // Кнопка "Назад"
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    renderModels();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  paginationContainer.appendChild(prevBtn);

  // Страницы
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    const firstBtn = document.createElement("button");
    firstBtn.textContent = "1";
    firstBtn.onclick = () => {
      currentPage = 1;
      renderModels();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    paginationContainer.appendChild(firstBtn);
    if (startPage > 2) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.style.padding = "10px";
      paginationContainer.appendChild(dots);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.onclick = () => {
      currentPage = i;
      renderModels();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    paginationContainer.appendChild(btn);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.style.padding = "10px";
      paginationContainer.appendChild(dots);
    }
    const lastBtn = document.createElement("button");
    lastBtn.textContent = totalPages;
    lastBtn.onclick = () => {
      currentPage = totalPages;
      renderModels();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    paginationContainer.appendChild(lastBtn);
  }

  // Кнопка "Вперед"
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    renderModels();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  paginationContainer.appendChild(nextBtn);
}

// Обновление данных извне (после загрузки с сервера)
export function updateModelsData(newModels) {
  allModels = newModels;
  if (searchInput && searchInput.value && searchInput.value.trim()) {
    performSearch(searchInput.value);
  }
}

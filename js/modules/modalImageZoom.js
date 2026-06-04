// Увеличение изображения в модальном окне с навигацией по карточкам

let currentCardIndex = -1;
let allCardsData = [];

function getDifficultyLevel(difficulty) {
  const map = { easy: 1, hard: 2, pro: 3 };
  return map[difficulty] || 0;
}

function getDifficultyText(difficulty) {
  const map = { easy: "Начальный", hard: "Средний", pro: "Сложный" };
  return map[difficulty] || "";
}

function collectCards() {
  const cards = document.querySelectorAll(".model-card");
  allCardsData = [];
  cards.forEach((card, index) => {
    allCardsData.push({
      index: index,
      element: card,
      title: card.getAttribute("data-title") || "",
      desc: card.getAttribute("data-desc") || "",
      img: card.getAttribute("data-img") || "",
      pdfLink: card.getAttribute("data-pdf") || "#",
      videoLink: card.getAttribute("data-video") || "#",
      difficulty: card.getAttribute("data-difficulty") || "",
    });
  });
  return allCardsData.length;
}

function findCardIndex(element) {
  const cards = document.querySelectorAll(".model-card");
  for (let i = 0; i < cards.length; i++) {
    if (cards[i] === element) return i;
  }
  return -1;
}

function resetModalState() {
  currentCardIndex = -1;
  allCardsData = [];
  document.querySelectorAll(".model-card").forEach((el) => {
    el.style.boxShadow = "";
  });
  console.log("🔄 Состояние модального окна сброшено");
}

function closeModal() {
  const modal = document.getElementById("cardModal");
  if (modal) {
    modal.classList.remove("active");
    resetModalState();
  }
}

function updateModalByIndex(index) {
  if (index < 0 || index >= allCardsData.length) return;

  const card = allCardsData[index];
  currentCardIndex = index;

  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalImg = document.getElementById("modalImg");
  const modalActions = document.getElementById("modalActions");
  const modalDifficulty = document.getElementById("modalDifficulty");

  if (modalTitle) modalTitle.textContent = card.title;
  if (modalDesc) modalDesc.textContent = card.desc || "";
  if (modalImg) {
    modalImg.src = card.img;
    modalImg.alt = card.title;
  }

  // Уровень сложности (показываем только если указан)
  if (modalDifficulty) {
    if (card.difficulty && card.difficulty !== "") {
      const level = getDifficultyLevel(card.difficulty);
      const text = getDifficultyText(card.difficulty);
      const colors = { 1: "#22c55e", 2: "#f59e0b", 3: "#ef4444" };
      modalDifficulty.innerHTML = `
      <div class="difficulty-segment" style="margin: 12px 0 8px; width: 100%">
        <div class="segments" style="display: flex; gap: 6px;">
          <div class="segment" style="flex:1; height:20px; background:${level >= 1 ? colors[1] : "#e9ecef"}; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:600; color:${level >= 1 ? "white" : "transparent"};">${level === 1 ? text : ""}</div>
          <div class="segment" style="flex:1; height:20px; background:${level >= 2 ? colors[2] : "#e9ecef"}; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:600; color:${level >= 2 ? "white" : "transparent"};">${level === 2 ? text : ""}</div>
          <div class="segment" style="flex:1; height:20px; background:${level >= 3 ? colors[3] : "#e9ecef"}; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:600; color:${level >= 3 ? "white" : "transparent"};">${level === 3 ? text : ""}</div>
        </div>
      </div>
    `;
      modalDifficulty.style.display = "block";
    } else {
      // Скрываем блок, если уровень сложности не указан
      modalDifficulty.innerHTML = "";
      modalDifficulty.style.display = "none";
    }
  }

  if (modalActions) {
    let actionsHtml = "";
    if (card.pdfLink !== "#") {
      actionsHtml += `<a href="${card.pdfLink}" target="_blank" class="modal-btn modal-btn-pdf"><i class="fas fa-file-pdf"></i> Открыть инструкцию</a>`;
    }
    if (card.videoLink !== "#") {
      actionsHtml += `<a href="${card.videoLink}" target="_blank" class="modal-btn modal-btn-video"><i class="fas fa-play"></i> Смотреть видео</a>`;
    }
    modalActions.innerHTML = actionsHtml;
  }

  document.querySelectorAll(".model-card").forEach((el, i) => {
    // if (i === index) {
    //   el.style.boxShadow = "0 0 0 3px #4f46e5";
    //   el.style.transition = "box-shadow 0.2s";
    // } else {
    //   el.style.boxShadow = "";
    // }
  });
}

function nextCard() {
  if (allCardsData.length === 0) return;
  let newIndex = currentCardIndex + 1;
  if (newIndex >= allCardsData.length) newIndex = 0;
  updateModalByIndex(newIndex);
}

function prevCard() {
  if (allCardsData.length === 0) return;
  let newIndex = currentCardIndex - 1;
  if (newIndex < 0) newIndex = allCardsData.length - 1;
  updateModalByIndex(newIndex);
}

function addNavigationButtons() {
  const modalContent = document.querySelector(".modal-card-content");
  if (!modalContent) return;

  if (document.querySelector(".modal-nav-prev")) return;

  const prevBtn = document.createElement("button");
  prevBtn.className = "modal-nav-prev";
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.setAttribute("aria-label", "Предыдущая карточка");
  prevBtn.onclick = (e) => {
    e.stopPropagation();
    prevCard();
  };

  const nextBtn = document.createElement("button");
  nextBtn.className = "modal-nav-next";
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.setAttribute("aria-label", "Следующая карточка");
  nextBtn.onclick = (e) => {
    e.stopPropagation();
    nextCard();
  };

  modalContent.appendChild(prevBtn);
  modalContent.appendChild(nextBtn);

  if (!document.getElementById("modal-nav-styles")) {
    const styles = document.createElement("style");
    styles.id = "modal-nav-styles";
    styles.textContent = `
      .modal-nav-prev, .modal-nav-next {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 10001;
      }
      .modal-nav-prev { left: 20px; }
      .modal-nav-next { right: 20px; }
      .modal-nav-prev:hover, .modal-nav-next:hover {
        background: rgba(79, 70, 229, 0.8);
        transform: translateY(-50%) scale(1.1);
      }
      @media (max-width: 768px) {
        .modal-nav-prev, .modal-nav-next {
          width: 36px;
          height: 36px;
          font-size: 1.2rem;
        }
        .modal-nav-prev { left: 10px; }
        .modal-nav-next { right: 10px; }
      }
    `;
    document.head.appendChild(styles);
  }
}

function initSwipeGestures() {
  const modal = document.getElementById("cardModal");
  if (!modal) return;

  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;

  modal.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  modal.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;

    if (Math.abs(diff) < minSwipeDistance) return;

    if (diff > 0) {
      prevCard();
    } else {
      nextCard();
    }
  });
}

export function setupModalImageZoom() {
  const cardModal = document.getElementById("cardModal");
  const modalImg = document.getElementById("modalImg");

  if (!cardModal || !modalImg) {
    console.log("Модальное окно карточки не найдено");
    return;
  }

  const modalBody = document.querySelector(".modal-card-body");
  if (modalBody && !document.getElementById("modalDifficulty")) {
    const difficultyDiv = document.createElement("div");
    difficultyDiv.id = "modalDifficulty";
    difficultyDiv.className = "modal-difficulty";
    const descEl = document.getElementById("modalDesc");
    if (descEl) {
      modalBody.insertBefore(difficultyDiv, descEl.nextSibling);
    } else {
      modalBody.appendChild(difficultyDiv);
    }
  }

  modalImg.style.cursor = "pointer";
  modalImg.style.transition = "transform 0.2s ease";

  modalImg.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const imgSrc = this.src;
    const imgAlt = this.alt || "Изображение";
    if (imgSrc && !imgSrc.includes("data:image/svg") && imgSrc !== "") {
      openFullscreenImage(imgSrc, imgAlt);
    }
  });

  modalImg.addEventListener("mouseenter", function () {
    this.style.transform = "scale(1.02)";
  });

  modalImg.addEventListener("mouseleave", function () {
    this.style.transform = "scale(1)";
  });

  addNavigationButtons();
  initSwipeGestures();
}

function openFullscreenImage(imageSrc, imageTitle) {
  let imageModal = document.getElementById("fullscreenImageModal");

  if (!imageModal) {
    const modalHTML = `
      <div id="fullscreenImageModal" class="fullscreen-image-modal" style="display: none; position: fixed; z-index: 20000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.95); cursor: pointer;">
        <span class="fullscreen-close" style="position: absolute; top: 20px; right: 35px; color: white; font-size: 40px; font-weight: bold; cursor: pointer; z-index: 20001;">&times;</span>
        <img class="fullscreen-image" id="fullscreenImage" style="display: block; max-width: 90%; max-height: 90%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 8px;">
        <div class="fullscreen-caption" id="fullscreenCaption" style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: white; font-size: 16px; padding: 10px; background: rgba(0, 0, 0, 0.7); margin: 0 auto; width: fit-content; border-radius: 8px;"></div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    if (!document.getElementById("fullscreen-image-styles")) {
      const styles = document.createElement("style");
      styles.id = "fullscreen-image-styles";
      styles.textContent = `
        @keyframes zoomIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .fullscreen-image-modal .fullscreen-image { animation: zoomIn 0.3s ease; }
        .fullscreen-close:hover { color: #bbb; transform: scale(1.1); }
        #fullscreenImageModal::before {
          content: "ВЕДО.РФ";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          color: rgba(255, 255, 255, 0.15);
          font-size: clamp(30px, 8vw, 100px);
          font-family: Arial, sans-serif;
          font-weight: bold;
          white-space: nowrap;
          z-index: 20002;
          pointer-events: none;
          letter-spacing: clamp(5px, 2vw, 15px);
          text-transform: uppercase;
        }
      `;
      document.head.appendChild(styles);
    }

    imageModal = document.getElementById("fullscreenImageModal");

    const closeBtn = imageModal.querySelector(".fullscreen-close");
    if (closeBtn) {
      closeBtn.onclick = () => {
        imageModal.style.display = "none";
        document.body.style.overflow = "";
      };
    }

    imageModal.onclick = (e) => {
      if (e.target === imageModal) {
        imageModal.style.display = "none";
        document.body.style.overflow = "";
      }
    };

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && imageModal.style.display === "block") {
        imageModal.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }

  const fullscreenImg = document.getElementById("fullscreenImage");
  const fullscreenCaption = document.getElementById("fullscreenCaption");
  if (fullscreenImg) fullscreenImg.src = imageSrc;
  if (fullscreenCaption)
    fullscreenCaption.textContent = imageTitle || "ВЕДО.РФ";

  imageModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

export function initModalImageZoomObserver() {
  setupModalImageZoom();

  const cardModal = document.getElementById("cardModal");
  if (cardModal) {
    // Закрытие по крестику
    const closeBtn = document.querySelector("#cardModal .modal-close-btn");
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeModal();
      };
    }

    // Закрытие по клику на фон
    cardModal.onclick = (e) => {
      if (e.target === cardModal) {
        closeModal();
      }
    };

    // Закрытие по ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && cardModal.classList.contains("active")) {
        closeModal();
      }
    });

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === "class") {
          if (cardModal.classList.contains("active")) {
            setTimeout(() => {
              // СНАЧАЛА сбрасываем состояние
              resetModalState();
              // ПОТОМ собираем карточки
              collectCards();
              // Находим КАКУЮ КАРТОЧКУ открыли
              const clickedCard = document.querySelector(
                ".model-card[data-clicked='true']",
              );
              let idx = -1;
              if (clickedCard) {
                idx = findCardIndex(clickedCard);
                clickedCard.removeAttribute("data-clicked");
              }
              // Если не нашли по маркеру, ищем по box-shadow
              if (idx === -1) {
                const activeCard = document.querySelector(
                  ".model-card[style*='box-shadow']",
                );
                if (activeCard) idx = findCardIndex(activeCard);
              }
              if (idx !== -1) {
                updateModalByIndex(idx);
              }
              setupModalImageZoom();
            }, 100);
          }
        }
      });
    });
    observer.observe(cardModal, { attributes: true });
  }
}

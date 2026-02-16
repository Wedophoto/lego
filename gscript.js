const SCRIPT_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgfUKbCxVhrXXxsT_IL1e44ur-yhlqrMslVRKq7Plm_2kTZCuNzbCAK6swVjo6wST-Rp8H1q_6iIr_iMTdBYDmoMM0QIV97ExRbrYJJA3ALyj3ySeDeKoZkgdpzLtSEdJjuIuWhta_lxzMelmLdumkIF4G4SS-MuG-k-v6sdRZChdwlq0okg9jdnJ47Ubw9kSCGqgR-Gzit1OzQR95ZX2prxPTCrZ6md0dM0bwueUvf2j5hc9Ct5hvA7HVOMUxv0yQBCDg-E5QRYTk9fY2OWEywT34jDw&lib=MbdC-l4jD6k0pdxUCM6Bsp1NLROFN8Rze"; // ← замените
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

// Функция для добавления контента в footer
function addFooterContent() {
  // Находим div с классом footer
  const footerDiv = document.querySelector("div.footer");

  // Проверяем, найден ли элемент
  if (footerDiv) {
    // Очищаем содержимое footer (если нужно заменить существующий контент)
    footerDiv.innerHTML = "";

    // Создаем и добавляем параграф
    const paragraph = document.createElement("p");
    paragraph.textContent = "Все модели автомобилей и мотоциклов";
    footerDiv.appendChild(paragraph);

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

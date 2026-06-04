// Добавление контента в footer

export function initFooter() {
  addFooterContent();
}

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

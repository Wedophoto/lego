// --- НАСТРОЙКИ ---
const API_KEY = "shds-wjHVLdPJCQcQ3c8y1qSOhglAQyr";
//   "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"; // ВСТАВЬТЕ СЮДА ВАШ КЛЮЧ
// const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_URL = "https://gptunnel.ru/v1/chat/completions";
const MODEL_NAME = "qwen3-8b";
const SYSTEM_PROMPT = `Ты — полезный ассистент и эксперт по Lego Wedo 2.0. Отвечай кратко, по делу и на русском языке.
Используй Markdown для форматирования (жирный текст, списки, код). Если я попрошу тебя о чем-то кроме Lego Wedo вежливо напомни о том, о чем мы должны общаться. Ни в коем случае не отвечай на вопросы не по теме.
Тебя зовут Анна и ты ассистент тренера Евгения. В самом начал представься.
`;
const MAX_CONTEXT_MESSAGES = 50;
const USER_ID = "or_user_v1";

// --- ПЕРЕМЕННЫЕ ---
let chatHistory = [];
let isDragging = false;
let isResizing = false;
let dragOffsetX, dragOffsetY;
let resizeStartX,
  resizeStartY,
  resizeStartWidth,
  resizeStartHeight,
  resizeStartLeft,
  resizeStartTop;
let isModal = false;
let isChatOpen = false;
let streamBuffer = "";
let isStreaming = false;

// Элементы
const els = {
  body: document.body,
  container: document.getElementById("assistantContainer"),
  icon: document.getElementById("chatIcon"),
  overlay: document.getElementById("modalOverlay"),
  header: document.getElementById("assistantHeader"),
  resize: document.getElementById("resizeHandle"),
  messages: document.getElementById("chatMessages"),
  input: document.getElementById("questionInput"),
  sendBtn: document.getElementById("sendButton"),
  modalBtn: document.getElementById("modalBtn"),
  closeBtn: document.getElementById("closeBtn"),
  clearBtn: document.getElementById("clearHistoryBtn"),
};

// --- ФУНКЦИИ ---
function saveHistory() {
  const toSave = chatHistory.filter((m) => m.role !== "system");
  try {
    localStorage.setItem(`chat_history_${USER_ID}`, JSON.stringify(toSave));
  } catch (e) {
    if (toSave.length > 10) {
      const trimmed = toSave.slice(-20);
      localStorage.setItem(`chat_history_${USER_ID}`, JSON.stringify(trimmed));
    }
  }
}

function loadHistory() {
  try {
    const cached = localStorage.getItem(`chat_history_${USER_ID}`);
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    return [];
  }
}

marked.setOptions({ breaks: true, gfm: true });

function createMessageElement(role, content) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  // avatar.innerHTML = `<i class="fas fa-${role === "user" ? "user" : "robot"}"></i>`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";

  if (role === "assistant") {
    contentDiv.innerHTML = marked.parse(content);
  } else {
    contentDiv.textContent = content;
  }

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(contentDiv);
  return msgDiv;
}

function scrollToBottom() {
  els.messages.scrollTop = els.messages.scrollHeight;
}

// === FIX: Правильный SSE-парсер для стриминга ===
function processSSELine(line, contentEl, onContent, onDone) {
  const trimmed = line.trim();

  // Пропускаем пустые строки и SSE-комментарии (начинаются с :)
  if (!trimmed || trimmed.startsWith(":")) {
    return;
  }

  // Обрабатываем только строки с данными
  if (trimmed.startsWith("data:")) {
    const dataStr = trimmed.slice(5).trim();

    // Конец стрима
    if (dataStr === "[DONE]") {
      onDone?.();
      return;
    }

    try {
      const json = JSON.parse(dataStr);
      const delta = json.choices?.[0]?.delta?.content;
      if (delta) {
        onContent(delta);
      }
    } catch (e) {
      console.warn("SSE parse error:", e, dataStr);
    }
  }
}

async function askGPT(question) {
  if (!question || isStreaming) return;

  isStreaming = true;
  els.sendBtn.disabled = true;
  els.input.disabled = true;
  streamBuffer = "";

  // 1. Добавляем сообщение пользователя в чат
  els.messages.appendChild(createMessageElement("user", question));

  // 2. FIX: Сохраняем сообщение пользователя в историю СРАЗУ
  chatHistory.push({ role: "user", content: question });
  saveHistory();

  // 3. FIX: Очищаем input сразу, не ждём ответа
  els.input.value = "";
  scrollToBottom();

  // 4. FIX: Создаём сообщение ассистента с аватаром и индикатором ВНУТРИ
  const assistantMsg = document.createElement("div");
  assistantMsg.className = "message assistant";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  // avatar.innerHTML = '<div class="featured-book-icon"></div>';

  const typing = document.createElement("div");
  typing.className = "typing-indicator active";
  typing.style.marginLeft = "0"; // Убираем отступ, аватар уже рядом
  typing.innerHTML =
    '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  assistantMsg.appendChild(avatar);
  assistantMsg.appendChild(typing);
  els.messages.appendChild(assistantMsg);
  scrollToBottom();

  let contentDiv = null; // Будет создан при первом токене
  let rawText = "";
  let firstToken = true;

  try {
    const contextMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.slice(-MAX_CONTEXT_MESSAGES),
      { role: "user", content: question },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY, // gptunnel: без "Bearer"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        useWalletBalance: true, // Обязательно для gptunnel
        max_tokens: 1000,
        stream: true,
        messages: contextMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API ${response.status}: ${errText.slice(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      streamBuffer += chunk;
      const lines = streamBuffer.split("\n");
      streamBuffer = lines.pop() || "";

      for (const line of lines) {
        processSSELine(
          line,
          null,
          (delta) => {
            rawText += delta;

            // FIX: При первом токене заменяем индикатор на контент
            if (firstToken) {
              typing.remove(); // Убираем "..."
              contentDiv = document.createElement("div");
              contentDiv.className = "message-content";
              assistantMsg.appendChild(contentDiv); // Добавляем контент после аватара
              firstToken = false;
            }

            // Рендерим Markdown
            if (contentDiv) {
              contentDiv.innerHTML = marked.parse(rawText);
            }
            scrollToBottom();
          },
          () => {},
        );
      }
    }

    // Обработка остатка в буфере
    if (streamBuffer.trim()) {
      processSSELine(streamBuffer, null, (delta) => {
        rawText += delta;
        if (firstToken) {
          typing.remove();
          contentDiv = document.createElement("div");
          contentDiv.className = "message-content";
          assistantMsg.appendChild(contentDiv);
          firstToken = false;
        }
        if (contentDiv) {
          contentDiv.innerHTML = marked.parse(rawText);
        }
      });
    }

    // Если токенов не было — убираем индикатор и показываем заглушку
    if (firstToken) {
      typing.remove();
      if (!contentDiv) {
        contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.textContent = "(Пустой ответ)";
        assistantMsg.appendChild(contentDiv);
      }
    }

    if (!rawText) throw new Error("Пустой ответ от API");

    // FIX: Сохраняем ответ бота в историю
    chatHistory.push({ role: "assistant", content: rawText });
    saveHistory();
  } catch (error) {
    console.error("Ошибка:", error);
    typing.remove();
    const errDiv = document.createElement("div");
    errDiv.className = "message assistant";
    errDiv.innerHTML = `<div class="avatar"><i class="fas fa-exclamation-triangle"></i></div><div class="message-content" style="color:red">Ошибка: ${error.message}</div>`;
    els.messages.appendChild(errDiv);
    scrollToBottom();
  } finally {
    isStreaming = false;
    els.sendBtn.disabled = false;
    els.input.disabled = false;
    // els.input.value = ""; // Уже очищено выше
    els.input.focus();
    scrollToBottom();
  }
}

function clearHistory() {
  if (!confirm("Вы уверены? Вся история переписки будет удалена.")) return;
  chatHistory = [];
  localStorage.removeItem(`chat_history_${USER_ID}`);
  els.messages.innerHTML = "";
  const welcome = createMessageElement(
    "assistant",
    "История очищена. Чем я могу помочь?",
  );
  els.messages.appendChild(welcome);
  scrollToBottom();
}

// --- УПРАВЛЕНИЕ ОКНОМ ---
function toggleChat() {
  isChatOpen = !isChatOpen;
  if (isChatOpen) {
    els.container.classList.remove("hidden");
    els.icon.style.display = "none";
    setTimeout(() => els.input.focus(), 100);
  } else {
    els.container.classList.add("hidden");
    els.icon.style.display = "flex";
    if (isModal) toggleModal();
  }
}

function toggleModal() {
  isModal = !isModal;
  els.body.classList.toggle("modal-active", isModal);
  els.overlay.classList.toggle("active", isModal);
  els.container.classList.toggle("modal-mode", isModal);

  if (isModal) {
    els.modalBtn.innerHTML = '<i class="fas fa-compress"></i>';
    const s = window.getComputedStyle(els.container);
    els.container.dataset.prevStyles = JSON.stringify({
      w: els.container.style.width || s.width,
      h: els.container.style.height || s.height,
      l: els.container.style.left,
      t: els.container.style.top,
      r: els.container.style.right,
      b: els.container.style.bottom,
    });
  } else {
    els.modalBtn.innerHTML = '<i class="fas fa-expand"></i>';
    try {
      const p = JSON.parse(els.container.dataset.prevStyles);
      Object.assign(els.container.style, {
        width: p.w,
        height: p.h,
        left: p.l,
        top: p.t,
        right: p.r,
        bottom: p.b,
      });
    } catch (e) {}
  }
}

// --- DRAG & RESIZE ---
els.header.addEventListener("mousedown", (e) => {
  if (isModal || window.innerWidth <= 768 || e.target.closest("button")) return;
  isDragging = true;
  els.container.classList.add("dragging");
  const rect = els.container.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
  els.container.style.right = "auto";
  els.container.style.bottom = "auto";
  els.container.style.left = rect.left + "px";
  els.container.style.top = rect.top + "px";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    let x = e.clientX - dragOffsetX;
    let y = e.clientY - dragOffsetY;
    x = Math.max(0, Math.min(x, window.innerWidth - els.container.offsetWidth));
    y = Math.max(
      0,
      Math.min(y, window.innerHeight - els.container.offsetHeight),
    );
    els.container.style.left = x + "px";
    els.container.style.top = y + "px";
  }
  if (isResizing) {
    const dx = resizeStartX - e.clientX;
    const dy = resizeStartY - e.clientY;
    els.container.style.width = resizeStartWidth + dx + "px";
    els.container.style.height = resizeStartHeight + dy + "px";
    els.container.style.left = resizeStartLeft - dx + "px";
    els.container.style.top = resizeStartTop - dy + "px";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  isResizing = false;
  els.container.classList.remove("dragging");
});

els.resize.addEventListener("mousedown", (e) => {
  if (isModal || window.innerWidth <= 768) return;
  e.preventDefault();
  isResizing = true;
  const rect = els.container.getBoundingClientRect();
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartWidth = rect.width;
  resizeStartHeight = rect.height;
  resizeStartLeft = rect.left;
  resizeStartTop = rect.top;
});

// --- СОБЫТИЯ ---
els.icon.addEventListener("click", toggleChat);
els.sendBtn.addEventListener("click", () => askGPT(els.input.value.trim()));
els.input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") askGPT(els.input.value.trim());
});
els.closeBtn.addEventListener("click", toggleChat);
els.modalBtn.addEventListener("click", toggleModal);
els.clearBtn.addEventListener("click", clearHistory);

// Инициализация
window.addEventListener("load", () => {
  chatHistory = loadHistory();
  if (chatHistory.length === 0) {
    els.messages.appendChild(
      createMessageElement("assistant", "Какие у вас вопросы?"),
    );
  } else {
    chatHistory.forEach((msg) => {
      els.messages.appendChild(createMessageElement(msg.role, msg.content));
    });
    scrollToBottom();
  }
});

/* Внешний JS: https://cdn.jsdelivr.net/npm/marked/marked.min.js */

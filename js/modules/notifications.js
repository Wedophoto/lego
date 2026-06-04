import { loadCards, saveCards } from "../utils/storage.js";
import { fetchAllCards } from "../api/gasClient.js";

let oldIds = new Set();

export async function initNotifications() {
  console.log("🔔 Проверка новых инструкций...");
  const oldCards = loadCards();
  oldIds = new Set(oldCards.map((c) => c.id));
  try {
    const newCardsAll = await fetchAllCards();
    if (!Array.isArray(newCardsAll)) return;
    const newItems = newCardsAll.filter((c) => !oldIds.has(c.id));
    if (newItems.length > 0) {
      console.log(`🎉 Найдено новых карточек: ${newItems.length}`);
      saveCards(newCardsAll);
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
}

function showNotification(count) {
  const toast = document.createElement("div");
  toast.className = "new-notify-toast";
  const link = `teams/novye-instruktsii-new.htm?q=${count}`;
  toast.innerHTML = `
    <div class="new-notify-content">
      <div class="new-notify-title">Новые инструкции!</div>
      <div class="new-notify-text">Доступно новых позиций: ${count}.</div>
      <a href="${link}" style="color: #4f46e5; text-decoration: none; font-weight: 500; font-size: 0.9rem;">Смотреть &rarr;</a>
    </div>
    <button class="new-notify-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  toast.addEventListener("click", (e) => {
    if (!e.target.classList.contains("new-notify-close")) {
      window.location.href = link;
    }
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 15000);
}

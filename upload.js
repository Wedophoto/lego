const GAS_APP_URL =
  "https://script.google.com/macros/s/AKfycbyQBWZZRrIGT6HIy78uvYqNqqo2CDISHIqOPMPTEG1mCvH4gxEn9QJXqlYaHVAV0zBu/exec";
function getDifficultyLevel(e) {
  return { easy: 1, hard: 2, pro: 3 }[e] || 0;
}
function getDifficultyText(e) {
  return { easy: "Начальный", hard: "Средний", pro: "Сложный" }[e] || "";
}
function addFooterContent() {
  console.log("\uD83E\uDDB6 Добавляем контент в footer...");
  let e = document.querySelector("div.footer");
  if (e) {
    e.innerHTML = "";
    let t = document.createElement("a");
    ((t.href = "https://t.me/kornilovsergey"),
      (t.target = "_blank"),
      (t.rel = "noopener noreferrer"),
      (t.className = "creation-link"),
      t.appendChild(
        document.createTextNode("Создание сайтов и телеграм ботов под ключ"),
      ));
    let l = document.createElement("span");
    ((l.className = "arrow"),
      (l.textContent = "↗"),
      t.appendChild(l),
      e.appendChild(t),
      addFooterStyles(),
      console.log("✅ Контент успешно добавлен в footer"));
  } else console.log("❌ Div с классом footer не найден");
}
function addFooterStyles() {
  if (!document.getElementById("footer-styles")) {
    console.log("\uD83C\uDFA8 Добавляем стили для footer...");
    let e = document.createElement("style");
    ((e.id = "footer-styles"),
      (e.textContent = `
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
    `),
      document.head.appendChild(e),
      console.log("✅ Стили для footer добавлены"));
  }
}
async function loadDynamicBlocks() {
  let e = document.getElementById("block1"),
    t = document.getElementById("block2"),
    l = document.getElementById("block3");
  (e && (e.innerHTML = '<div class="dynamic-block"></div>'),
    t && (t.innerHTML = '<div class="dynamic-block"></div>'),
    l && (l.innerHTML = '<div class="dynamic-block"></div>'));
  try {
    let a = await fetch(
        "https://script.google.com/macros/s/AKfycbzB6aP3KPBdMvkSrL9j_u2J-vViEcwvoxMHWiLHKaCSH4sZ8_vk-mCJdGOKnXHh8qi7/exec",
      ),
      o = await a.json();
    (e && o.block1 && (e.innerHTML = o.block1),
      t && o.block2 && (t.innerHTML = o.block2),
      l && o.block3 && (l.innerHTML = o.block3),
      console.log("✅ Три блока успешно загружены"));
  } catch (i) {
    (console.error("❌ Ошибка загрузки:", i),
      e && (e.innerHTML = '<div class="dynamic-block">⚠️ Ошибка</div>'),
      t && (t.innerHTML = '<div class="dynamic-block">⚠️ Ошибка</div>'),
      l && (l.innerHTML = '<div class="dynamic-block">⚠️ Ошибка</div>'));
  }
}
(!(async function e() {
  (console.log("\uD83D\uDE80 Инициализация страницы..."),
    console.log("\uD83D\uDCCA ========== НАЧАЛО ЛОГИРОВАНИЯ =========="));
  let t = window.location.pathname,
    l = t.substring(t.lastIndexOf("/") + 1).replace(".htm", "") || "general";
  console.log(`📍 Текущая секция для отрисовки: ${l}`);
  let a = localStorage.getItem("site_cards"),
    o = [],
    i = new Set();
  if (a)
    try {
      ((o = JSON.parse(a)),
        (i = new Set(o.map((e) => e.id))),
        console.log(
          `📦 LocalStorage: загружено ВСЕГО ${o.length} карточек (из всех секций)`,
        ),
        console.log(
          `📦 ID всех карточек в LocalStorage:`,
          o.map((e) => e.id).join(", "),
        ));
      let s = {};
      (o.forEach((e) => {
        s[e.section] = (s[e.section] || 0) + 1;
      }),
        console.log(`📊 Распределение по секциям в LocalStorage:`, s));
    } catch (n) {
      (console.warn("⚠️ LocalStorage поврежден"), (o = []));
    }
  else console.log("\uD83D\uDCED LocalStorage пуст (нет сохраненных карточек)");
  let r = [];
  if (a && o.length > 0)
    try {
      ((r = o),
        console.log(
          "✅ Данные загружены из LocalStorage для быстрого отображения",
        ),
        v(r));
    } catch (d) {
      console.warn("⚠️ Ошибка при использовании LocalStorage:", d);
    }
  try {
    (console.log("⏳ Запрашиваем данные с сервера..."),
      console.time("⏱️ Время запроса к серверу"));
    let c = await fetch(GAS_APP_URL + "?action=getCards&t=" + Date.now()),
      g = await c.json();
    if ((console.timeEnd("⏱️ Время запроса к серверу"), Array.isArray(g))) {
      (console.log(
        `🌐 Сервер вернул ВСЕГО ${g.length} карточек (из всех секций)`,
      ),
        console.log(
          `🌐 ID всех карточек с сервера:`,
          g.map((e) => e.id).join(", "),
        ));
      let p = {};
      (g.forEach((e) => {
        p[e.section] = (p[e.section] || 0) + 1;
      }),
        console.log(`📊 Распределение по секциям на сервере:`, p),
        (r = g),
        o.length > 0
          ? (console.log(`
📊 СРАВНЕНИЕ ВСЕХ КАРТОЧЕК (по всем секциям):`),
            console.log(`   - В LocalStorage: ${o.length} карточек`),
            console.log(`   - На сервере: ${g.length} карточек`),
            g.length > o.length
              ? console.log(
                  `📈 На сервере на ${g.length - o.length} карточек БОЛЬШЕ`,
                )
              : g.length < o.length
                ? console.log(
                    `📉 На сервере на ${o.length - g.length} карточек МЕНЬШЕ`,
                  )
                : console.log(`📊 Количество карточек совпадает (${g.length})`))
          : console.log(
              `📊 В LocalStorage не было данных, загружено ${g.length} карточек с сервера`,
            ),
        localStorage.setItem("site_cards", JSON.stringify(r)),
        console.log("\uD83D\uDCBE Все данные сохранены в LocalStorage"),
        console.log(
          "\uD83C\uDFA8 Перерисовываем сетку с актуальными данными...",
        ),
        v(r),
        console.log(
          "\n\uD83D\uDD0D Проверяем наличие новых карточек ПО ВСЕМ СЕКЦИЯМ...",
        ));
      let y = g.filter((e) => !i.has(e.id));
      if (y.length > 0) {
        (console.log(`🎉 НАЙДЕНО НОВЫХ КАРТОЧЕК: ${y.length}`),
          console.log(`🆕 ID новых карточек:`, y.map((e) => e.id).join(", ")),
          console.log(
            `🆕 Названия новых карточек:`,
            y.map((e) => `"${e.title}"`).join(", "),
          ));
        let f = {};
        (y.forEach((e) => {
          f[e.section] = (f[e.section] || 0) + 1;
        }),
          console.log(`📊 Распределение новых карточек по секциям:`, f));
        let h = y.map((e) => e.id);
        (localStorage.setItem("notification_card_ids", JSON.stringify(h)),
          console.log(
            "\uD83D\uDCBE ID новых карточек сохранены в notification_card_ids",
          ),
          (function e(t) {
            console.log(
              `🔔 Показываем уведомление о ${t} новых карточках (во всех секциях)`,
            );
            let l = document.createElement("div");
            l.className = "new-notify-toast";
            let a = window.location.href,
              o = `novye-instruktsii-new.htm?q=${t}`,
              i = a.includes("teams/") ? o : `teams/${o}`;
            (console.log(`🔗 Ссылка в уведомлении: ${i}`),
              (l.innerHTML = `
      <div class="new-notify-content">
        <div class="new-notify-title">Новые инструкции!</div>
        <div class="new-notify-text">Доступно новых позиций: ${t}.</div>
        <a href="${i}" style="color: #4f46e5; text-decoration: none; font-weight: 500; font-size: 0.9rem;">Смотреть &rarr;</a>
      </div>
      <button class="new-notify-close" onclick="this.parentElement.remove()">&times;</button>
    `),
              l.addEventListener("click", (e) => {
                e.target.classList.contains("new-notify-close") ||
                  (console.log(`👆 Клик по уведомлению, переходим на: ${i}`),
                  (window.location.href = i));
              }),
              document.body.appendChild(l),
              requestAnimationFrame(() => l.classList.add("show")),
              setTimeout(() => {
                (l.classList.remove("show"),
                  setTimeout(() => {
                    (l.remove(),
                      console.log("\uD83D\uDD14 Уведомление скрыто"));
                  }, 400));
              }, 15e3),
              console.log("\uD83D\uDD14 Уведомление отображено"));
          })(y.length));
      } else {
        console.log("✅ Новых карточек не обнаружено (во всех секциях)");
        let m = new Set(g.map((e) => e.id)),
          $ = o.filter((e) => !m.has(e.id));
        if ($.length > 0) {
          (console.log(`🗑️ Обнаружено удаленных карточек: ${$.length}`),
            console.log(
              `🗑️ ID удаленных карточек:`,
              $.map((e) => e.id).join(", "),
            ));
          let u = {};
          ($.forEach((e) => {
            u[e.section] = (u[e.section] || 0) + 1;
          }),
            console.log(`📊 Распределение удаленных карточек по секциям:`, u));
        }
      }
    } else console.error("❌ Сервер вернул не массив данных:", g);
  } catch (A) {
    console.error("❌ Ошибка загрузки с сервера, работаем с кэшем:", A);
  }
  function v(e) {
    console.log(`🎨 Вызвана renderGrid с ${e.length} карточками (все секции)`);
    let t = document.querySelector(".models-grid");
    if (!t) {
      console.warn("⚠️ Контейнер .models-grid не найден на странице.");
      return;
    }
    let a = e.filter((e) => e.section === l);
    if (
      (console.log(
        `🎯 Для отображения в секции "${l}" отобрано ${a.length} карточек`,
      ),
      a.sort((e, t) => e.title.localeCompare(t.title, "ru")),
      0 === a.length)
    ) {
      (console.log(`📭 В секции "${l}" нет карточек для отображения`),
        (t.innerHTML =
          '<p class="no-models">В этом разделе пока нет моделей.</p>'));
      return;
    }
    let o = a
      .map((e, t) => {
        let l =
            e.pdf && e.pdf.id
              ? `https://drive.google.com/file/d/${e.pdf.id}/preview`
              : "#",
          a = e.videoUrl || "#",
          o = e.imageUrl || "",
          i = getDifficultyLevel(e.difficulty),
          s = getDifficultyText(e.difficulty),
          n = `
    <div class="difficulty-segment" style="margin: 12px 0 8px; width: 100%">
        <div class="segments" style="display: flex; gap: 6px;">
            <div class="segment" style="flex:1; height:15px; background:${i >= 1 ? "#22c55e" : "#e9ecef"}; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:600; color:${i >= 1 ? "white" : "transparent"};">${1 === i ? s : ""}</div>
            <div class="segment" style="flex:1; height:15px; background:${i >= 2 ? "#f59e0b" : "#e9ecef"}; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:600; color:${i >= 2 ? "white" : "transparent"};">${2 === i ? s : ""}</div>
            <div class="segment" style="flex:1; height:15px; background:${i >= 3 ? "#ef4444" : "#e9ecef"}; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:600; color:${i >= 3 ? "white" : "transparent"};">${3 === i ? s : ""}</div>
        </div>
    </div>
`;
        return `
            <div class="model-card" data-card-index="${t}" 
                 data-title="${b(e.title)}"
                 data-desc="${b(e.description || "")}"
                 data-img="${b(o)}"
                 data-pdf="${b(l)}"
                 data-video="${b(a)}">
                <img src="${o}" alt="${e.title}" class="model-image" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'><rect fill='%23f0f0f0' width='200' height='150'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='14'>Нет фото</text></svg>'">
                <h3 class="model-title">${b(e.title)}</h3>
                <p class="model-description">${b(e.description ? e.description.substring(0, 100) : "")}${e.description && e.description.length > 100 ? "..." : ""}</p>
                ${n}
                <div class="model-details">
                    ${"#" !== a ? `<a href="${a}" target="_blank" class="video-btn" data-video-link><i class="fas fa-play"></i> Видео</a>` : ""}
                </div>
                <a href="${l}" target="_blank" class="instruction-btn" data-pdf-link>
                    <i class="fas fa-file-pdf"></i> Открыть инструкцию
                </a>
            </div>
        `;
      })
      .join("");
    ((t.innerHTML = o),
      console.log(`✅ Отрисовано карточек в сетке: ${a.length}`),
      (function e(t) {
        let l = document.getElementById("cardModal"),
          a = document.getElementById("modalImg"),
          o = document.getElementById("modalTitle"),
          i = document.getElementById("modalDesc"),
          s = document.getElementById("modalActions"),
          n = document.querySelector(".modal-close");
        if (!l) {
          console.warn("⚠️ Модальное окно не найдено");
          return;
        }
        let r = () => {
          l.classList.remove("active");
        };
        (n && (n.onclick = r),
          (l.onclick = (e) => {
            e.target === l && r();
          }));
        let d = document.querySelectorAll(".model-card");
        (d.forEach((e, t) => {
          let n = e.cloneNode(!0);
          (e.parentNode.replaceChild(n, e),
            n.addEventListener("click", (e) => {
              if (
                e.target.closest(".video-btn") ||
                e.target.closest(".instruction-btn")
              )
                return;
              e.preventDefault();
              let t = n.getAttribute("data-title") || "",
                r = n.getAttribute("data-desc") || "",
                d = n.getAttribute("data-img") || "",
                c = n.getAttribute("data-pdf") || "#",
                g = n.getAttribute("data-video") || "#";
              ((o.textContent = t),
                (i.textContent = r || ""),
                (a.src = d),
                (a.alt = t));
              let p = "";
              ("#" !== c &&
                (p += `
            <a href="${c}" target="_blank" class="modal-btn modal-btn-pdf">
              <i class="fas fa-file-pdf"></i> Открыть инструкцию
            </a>
          `),
                "#" !== g &&
                  (p += `
            <a href="${g}" target="_blank" class="modal-btn modal-btn-video">
              <i class="fas fa-play"></i> Смотреть видео
            </a>
          `),
                (s.innerHTML = p),
                l.classList.add("active"));
            }));
        }),
          console.log(`✅ Добавлено обработчиков на ${d.length} карточек`));
      })(a));
  }
  function b(e) {
    return e
      ? e
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
      : "";
  }
  console.log("\uD83D\uDCCA ========== КОНЕЦ ЛОГИРОВАНИЯ ==========\n");
})(),
  "loading" === document.readyState
    ? (console.log("⏳ DOM загружается, добавляем обработчик..."),
      document.addEventListener("DOMContentLoaded", addFooterContent))
    : (console.log("✅ DOM уже загружен, запускаем addFooterContent..."),
      addFooterContent()),
  (window.location.hostname.includes("github.io") ||
    window.location.hostname.includes("github.com")) &&
    window.location.replace("http://ведо.рф"),
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      let e = document.getElementById("cardModal"),
        t = document.querySelector("#cardModal .modal-close-btn");
      (t &&
        (t.onclick = function () {
          e.classList.remove("active");
        }),
        e &&
          (e.onclick = function (t) {
            t.target === e && e.classList.remove("active");
          }),
        document.addEventListener("keydown", function (t) {
          "Escape" === t.key &&
            e &&
            e.classList.contains("active") &&
            e.classList.remove("active");
        }),
        console.log("✅ Закрытие модального окна настроено"));
    }, 1e3);
  }));
const AdsDisplay = {
  allAds: [],
  currentAds: [],
  shownHistory: [],
  rotationInterval: null,
  isRotating: !1,
  cacheKey: "wedo_ads_cache",
  cacheTimestampKey: "wedo_ads_timestamp",
  cacheTTL: 36e5,
  hideAdsSection() {
    let e = document.getElementById("floatingBlocks"),
      t = document.querySelector(".ads-header");
    e &&
      ((e.style.transition = "opacity 0.3s ease, transform 0.3s ease"),
      (e.style.opacity = "0"),
      (e.style.transform = "scale(0.95)"),
      t &&
        ((t.style.transition = "opacity 0.3s ease, transform 0.3s ease"),
        (t.style.opacity = "0"),
        (t.style.transform = "scale(0.95)")),
      setTimeout(() => {
        ((e.style.display = "none"), t && (t.style.display = "none"));
      }, 300));
  },
  isCacheValid() {
    let e = localStorage.getItem(AdsDisplay.cacheTimestampKey);
    if (!e) return !1;
    let t = Date.now();
    return t - parseInt(e) < AdsDisplay.cacheTTL;
  },
  saveToCache(e) {
    try {
      (localStorage.setItem(AdsDisplay.cacheKey, JSON.stringify(e)),
        localStorage.setItem(
          AdsDisplay.cacheTimestampKey,
          Date.now().toString(),
        ),
        console.log(`Реклама сохранена в кэш: ${e.length} блоков`));
    } catch (t) {
      console.warn("Не удалось сохранить рекламу в localStorage:", t);
    }
  },
  loadFromCache() {
    try {
      let e = localStorage.getItem(AdsDisplay.cacheKey);
      if (e) {
        let t = JSON.parse(e);
        if (Array.isArray(t) && t.length > 0)
          return (console.log(`Загружено из кэша: ${t.length} блоков`), t);
      }
    } catch (l) {
      console.warn("Ошибка чтения кэша рекламы:", l);
    }
    return null;
  },
  async loadAds() {
    let e = AdsDisplay.loadFromCache(),
      t = !1;
    e && e.length > 0
      ? ((AdsDisplay.allAds = e),
        (t = !0),
        console.log(`Используем кэшированную рекламу (${e.length} блоков)`),
        AdsDisplay.start())
      : (console.log("Кэш рекламы пуст, показываем fallback"),
        AdsDisplay.showFallback());
    try {
      let l = await fetch(GAS_APP_URL + "?action=getAds&t=" + Date.now());
      if (l.ok) {
        let a = await l.json(),
          o = Array.isArray(a) ? a : [];
        if (o.length > 0) {
          let i = AdsDisplay.allAds.map((e) => e.id).join(","),
            s = o.map((e) => e.id).join(",");
          i !== s
            ? (console.log(
                `Обновление рекламы: ${o.length} блоков (было ${AdsDisplay.allAds.length})`,
              ),
              (AdsDisplay.allAds = o),
              AdsDisplay.saveToCache(o),
              AdsDisplay.stopRotation(),
              AdsDisplay.start())
            : t &&
              (console.log(
                "Реклама не изменилась, обновляем только timestamp кэша",
              ),
              localStorage.setItem(
                AdsDisplay.cacheTimestampKey,
                Date.now().toString(),
              ));
        }
      } else
        console.warn(
          "Не удалось загрузить свежую рекламу, используем существующую",
        );
    } catch (n) {
      (console.error("Ошибка фоновой загрузки рекламы:", n),
        t || AdsDisplay.showFallback());
    }
  },
  start() {
    let e = AdsDisplay.allAds.length;
    if (0 === e) {
      AdsDisplay.showFallback();
      return;
    }
    e < 4
      ? ((AdsDisplay.currentAds = [...AdsDisplay.allAds]),
        AdsDisplay.render(),
        console.log("Реклама: блоков < 4, ротация отключена"))
      : (AdsDisplay.rotateAds(!0), AdsDisplay.startRotation());
  },
  getRandomUniqueAds(e, t = []) {
    let l = AdsDisplay.allAds.filter((e) => !t.includes(e.id));
    l.length < e && ((l = AdsDisplay.allAds), (AdsDisplay.shownHistory = []));
    let a = [...l];
    for (let o = a.length - 1; o > 0; o--) {
      let i = Math.floor(Math.random() * (o + 1));
      [a[o], a[i]] = [a[i], a[o]];
    }
    let s = a.slice(0, e);
    return (
      s.forEach((e) => {
        AdsDisplay.shownHistory.push(e.id);
      }),
      AdsDisplay.shownHistory.length > 12 &&
        (AdsDisplay.shownHistory = AdsDisplay.shownHistory.slice(-12)),
      s
    );
  },
  rotateAds(e = !1) {
    let t = AdsDisplay.getRandomUniqueAds(4, AdsDisplay.shownHistory);
    if (t.length < 4) {
      for (
        AdsDisplay.isRotating &&
          (AdsDisplay.stopRotation(), (AdsDisplay.isRotating = !1)),
          AdsDisplay.currentAds = [...t];
        AdsDisplay.currentAds.length < 4;
      )
        AdsDisplay.currentAds.push(null);
      AdsDisplay.render();
      return;
    }
    if (e) ((AdsDisplay.currentAds = t), AdsDisplay.render());
    else {
      let l = ["block1", "block2", "block3", "block4"];
      (l.forEach((e) => {
        let t = document.getElementById(e);
        t && t.classList.add("fade-out");
      }),
        setTimeout(() => {
          (AdsDisplay.stopAllVideos(),
            (AdsDisplay.currentAds = t),
            AdsDisplay.render(),
            l.forEach((e) => {
              let t = document.getElementById(e);
              t && t.classList.remove("fade-out");
            }));
        }, 300));
    }
  },
  startRotation() {
    (AdsDisplay.rotationInterval && clearInterval(AdsDisplay.rotationInterval),
      (AdsDisplay.isRotating = !0),
      (AdsDisplay.rotationInterval = setInterval(() => {
        AdsDisplay.rotateAds(!1);
      }, 1e4)));
  },
  stopRotation() {
    (AdsDisplay.rotationInterval &&
      (clearInterval(AdsDisplay.rotationInterval),
      (AdsDisplay.rotationInterval = null)),
      (AdsDisplay.isRotating = !1));
  },
  stopAllVideos() {
    let e = document.querySelectorAll(".floating-blocks video");
    e.forEach((e) => {
      (e.pause(), (e.currentTime = 0));
    });
  },
  playVideoIfNeeded(e) {
    e &&
      "VIDEO" === e.tagName &&
      ((e.muted = !0),
      e
        .play()
        .catch((e) => console.log("Автовоспроизведение заблокировано:", e)));
  },
  render() {
    ["block1", "block2", "block3", "block4"].forEach((e, t) => {
      let l = document.getElementById(e);
      if (!l) return;
      let a = AdsDisplay.currentAds[t];
      if (!a || (!a.imageUrl && !a.videoUrl)) {
        ((l.innerHTML = ""),
          (l.style.minHeight = "auto"),
          (l.style.background = "transparent"));
        return;
      }
      let o = "video" === a.mediaType && a.videoUrl,
        i = o ? a.videoUrl : a.imageUrl,
        s = "";
      ((s = o
        ? `
          <video muted autoplay loop playsinline 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            <source src="${i}" type="video/mp4">
            Ваш браузер не поддерживает видео.
          </video>
        `
        : `
          <img src="${i}" alt="Реклама" 
               style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block;">
        `),
        a.linkUrl
          ? (l.innerHTML = `
          <a href="${a.linkUrl}" target="_blank" rel="noopener noreferrer" 
             style="display: block; width: 100%; height: 100%; text-decoration: none;">
            ${s}
          </a>
        `)
          : (l.innerHTML = s),
        o &&
          setTimeout(() => {
            let e = l.querySelector("video");
            e && AdsDisplay.playVideoIfNeeded(e);
          }, 50));
    });
  },
  showFallback() {
    ["block1", "block2", "block3", "block4"].forEach((e) => {
      let t = document.getElementById(e);
      t &&
        ((t.innerHTML = ""),
        (t.style.minHeight = "auto"),
        (t.style.background = "transparent"));
    });
  },
};
window.addEventListener("load", function () {
  let e = document.getElementById("hideAllAdsBtn");
  (e &&
    e.addEventListener("click", () => {
      AdsDisplay.hideAdsSection();
    }),
    AdsDisplay.loadAds());
});

// Функция для добавления просмотра изображения в модальном окне карточки
function setupModalImageZoom() {
  // Находим модальное окно карточки
  const cardModal = document.getElementById("cardModal");
  const modalImg = document.getElementById("modalImg");

  if (!cardModal || !modalImg) {
    console.log("Модальное окно карточки не найдено");
    return;
  }

  // Добавляем стиль для увеличения картинки при клике
  modalImg.style.cursor = "pointer";
  modalImg.style.transition = "transform 0.2s ease";

  // Обработчик клика по картинке в модальном окне
  modalImg.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const imgSrc = this.src;
    const imgAlt = this.alt || "Изображение";

    if (imgSrc && !imgSrc.includes("data:image/svg") && imgSrc !== "") {
      openFullscreenImage(imgSrc, imgAlt);
    }
  });

  // Добавляем эффект при наведении
  modalImg.addEventListener("mouseenter", function () {
    this.style.transform = "scale(1.02)";
  });

  modalImg.addEventListener("mouseleave", function () {
    this.style.transform = "scale(1)";
  });
}

// Функция открытия полноэкранного изображения
// Функция открытия полноэкранного изображения
function openFullscreenImage(imageSrc, imageTitle) {
  // Проверяем, существует ли уже модальное окно для изображений
  let imageModal = document.getElementById("fullscreenImageModal");

  // Если нет - создаем
  if (!imageModal) {
    const modalHTML = `
            <div id="fullscreenImageModal" class="fullscreen-image-modal" style="display: none; position: fixed; z-index: 20000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.95); cursor: pointer;">
                <span class="fullscreen-close" style="position: absolute; top: 20px; right: 35px; color: white; font-size: 40px; font-weight: bold; cursor: pointer; z-index: 20001;">&times;</span>
                <img class="fullscreen-image" id="fullscreenImage" style="display: block; max-width: 90%; max-height: 90%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 8px; box-shadow: 0 4px 30px rgba(0,0,0,0.3);">
                <div class="fullscreen-caption" id="fullscreenCaption" style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: white; font-size: 16px; padding: 10px; background: rgba(0, 0, 0, 0.7); margin: 0 auto; width: fit-content; border-radius: 8px;"></div>
            </div>
        `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Добавляем стили, если их нет
    if (!document.getElementById("fullscreen-image-styles")) {
      const styles = document.createElement("style");
      styles.id = "fullscreen-image-styles";
      styles.textContent = `
                @keyframes zoomIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                .fullscreen-image-modal .fullscreen-image {
                    animation: zoomIn 0.3s ease;
                }
                .fullscreen-close:hover {
                    color: #bbb;
                    transform: scale(1.1);
                }
                /* Водяной знак ВЕДО.РФ */
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

    // Настройка закрытия
    const closeBtn = imageModal.querySelector(".fullscreen-close");
    if (closeBtn) {
      closeBtn.onclick = function () {
        imageModal.style.display = "none";
        document.body.style.overflow = "";
      };
    }

    imageModal.onclick = function (e) {
      if (e.target === imageModal) {
        imageModal.style.display = "none";
        document.body.style.overflow = "";
      }
    };

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && imageModal.style.display === "block") {
        imageModal.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }

  // Получаем элементы (С ПРОВЕРКОЙ НА СУЩЕСТВОВАНИЕ)
  const fullscreenImg = document.getElementById("fullscreenImage");
  const fullscreenCaption = document.getElementById("fullscreenCaption");

  // Проверяем, существуют ли элементы
  if (fullscreenImg) {
    fullscreenImg.src = imageSrc;
  } else {
    console.error("Элемент fullscreenImage не найден");
  }

  if (fullscreenCaption) {
    fullscreenCaption.textContent = imageTitle || "ВЕДО.РФ";
  } else {
    console.error("Элемент fullscreenCaption не найден");
  }

  if (imageModal) {
    imageModal.style.display = "block";
    document.body.style.overflow = "hidden";
  } else {
    console.error("Модальное окно fullscreenImageModal не найдено");
  }
}

// Запускаем настройку после загрузки страницы и после каждого открытия модального окна
document.addEventListener("DOMContentLoaded", function () {
  setupModalImageZoom();

  // Наблюдаем за изменениями в модальном окне (когда оно открывается)
  const cardModal = document.getElementById("cardModal");
  if (cardModal) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === "class") {
          if (cardModal.classList.contains("active")) {
            // Модальное окно открылось - обновляем обработчик
            setTimeout(setupModalImageZoom, 100);
          }
        }
      });
    });
    observer.observe(cardModal, { attributes: true });
  }
});

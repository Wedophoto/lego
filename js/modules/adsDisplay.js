// Рекламные блоки с ротацией

const GAS_APP_URL =
  "https://script.google.com/macros/s/AKfycbyQBWZZRrIGT6HIy78uvYqNqqo2CDISHIqOPMPTEG1mCvH4gxEn9QJXqlYaHVAV0zBu/exec";

export const AdsDisplay = {
  allAds: [],
  currentAds: [],
  shownHistory: [],
  rotationInterval: null,
  isRotating: false,
  cacheKey: "wedo_ads_cache",
  cacheTimestampKey: "wedo_ads_timestamp",
  cacheTTL: 3600000,

  hideAdsSection() {
    const adsSection = document.getElementById("floatingBlocks");
    const adsHeader = document.querySelector(".ads-header");

    if (adsSection) {
      adsSection.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      adsSection.style.opacity = "0";
      adsSection.style.transform = "scale(0.95)";

      if (adsHeader) {
        adsHeader.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        adsHeader.style.opacity = "0";
        adsHeader.style.transform = "scale(0.95)";
      }

      setTimeout(() => {
        adsSection.style.display = "none";
        if (adsHeader) adsHeader.style.display = "none";
      }, 300);
    }
  },

  isCacheValid() {
    const timestamp = localStorage.getItem(this.cacheTimestampKey);
    if (!timestamp) return false;
    const now = Date.now();
    return now - parseInt(timestamp) < this.cacheTTL;
  },

  saveToCache(ads) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(ads));
      localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
      console.log(`Реклама сохранена в кэш: ${ads.length} блоков`);
    } catch (e) {
      console.warn("Не удалось сохранить рекламу в localStorage:", e);
    }
  },

  loadFromCache() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const ads = JSON.parse(cached);
        if (Array.isArray(ads) && ads.length > 0) {
          console.log(`Загружено из кэша: ${ads.length} блоков`);
          return ads;
        }
      }
    } catch (e) {
      console.warn("Ошибка чтения кэша рекламы:", e);
    }
    return null;
  },

  async loadAds() {
    const cachedAds = this.loadFromCache();
    let hasCache = false;

    if (cachedAds && cachedAds.length > 0) {
      this.allAds = cachedAds;
      hasCache = true;
      console.log(
        `Используем кэшированную рекламу (${cachedAds.length} блоков)`,
      );
      this.start();
    } else {
      console.log("Кэш рекламы пуст, показываем fallback");
      this.showFallback();
    }

    try {
      const res = await fetch(GAS_APP_URL + "?action=getAds&t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        const freshAds = Array.isArray(data) ? data : [];

        if (freshAds.length > 0) {
          const currentIds = this.allAds.map((ad) => ad.id).join(",");
          const freshIds = freshAds.map((ad) => ad.id).join(",");

          if (currentIds !== freshIds) {
            console.log(
              `Обновление рекламы: ${freshAds.length} блоков (было ${this.allAds.length})`,
            );
            this.allAds = freshAds;
            this.saveToCache(freshAds);
            this.stopRotation();
            this.start();
          } else if (hasCache) {
            console.log(
              "Реклама не изменилась, обновляем только timestamp кэша",
            );
            localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
          }
        }
      } else {
        console.warn(
          "Не удалось загрузить свежую рекламу, используем существующую",
        );
      }
    } catch (e) {
      console.error("Ошибка фоновой загрузки рекламы:", e);
      if (!hasCache) {
        this.showFallback();
      }
    }
  },

  start() {
    const count = this.allAds.length;

    if (count === 0) {
      this.showFallback();
      return;
    }

    if (count < 4) {
      this.currentAds = [...this.allAds];
      this.render();
      console.log("Реклама: блоков < 4, ротация отключена");
    } else {
      this.rotateAds(true);
      this.startRotation();
    }
  },

  getRandomUniqueAds(count, excludeIds = []) {
    let available = this.allAds.filter((ad) => !excludeIds.includes(ad.id));

    if (available.length < count) {
      available = this.allAds;
      this.shownHistory = [];
    }

    const shuffled = [...available];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, count);

    selected.forEach((ad) => {
      this.shownHistory.push(ad.id);
    });
    if (this.shownHistory.length > 12) {
      this.shownHistory = this.shownHistory.slice(-12);
    }

    return selected;
  },

  rotateAds(isFirstRun = false) {
    const newAds = this.getRandomUniqueAds(4, this.shownHistory);

    if (newAds.length < 4) {
      if (this.isRotating) {
        this.stopRotation();
        this.isRotating = false;
      }
      this.currentAds = [...newAds];
      while (this.currentAds.length < 4) {
        this.currentAds.push(null);
      }
      this.render();
      return;
    }

    if (!isFirstRun) {
      const containers = ["block1", "block2", "block3", "block4"];
      containers.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add("fade-out");
      });

      setTimeout(() => {
        this.stopAllVideos();
        this.currentAds = newAds;
        this.render();
        containers.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.classList.remove("fade-out");
        });
      }, 300);
    } else {
      this.currentAds = newAds;
      this.render();
    }
  },

  startRotation() {
    if (this.rotationInterval) clearInterval(this.rotationInterval);
    this.isRotating = true;
    this.rotationInterval = setInterval(() => {
      this.rotateAds(false);
    }, 10000);
  },

  stopRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
    this.isRotating = false;
  },

  stopAllVideos() {
    const videos = document.querySelectorAll(".floating-blocks video");
    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  },

  playVideoIfNeeded(videoElement) {
    if (videoElement && videoElement.tagName === "VIDEO") {
      videoElement.muted = true;
      videoElement
        .play()
        .catch((e) => console.log("Автовоспроизведение заблокировано:", e));
    }
  },

  render() {
    const blocks = ["block1", "block2", "block3", "block4"];

    blocks.forEach((blockId, index) => {
      const container = document.getElementById(blockId);
      if (!container) return;

      const ad = this.currentAds[index];

      if (!ad || (!ad.imageUrl && !ad.videoUrl)) {
        container.innerHTML = "";
        container.style.minHeight = "auto";
        container.style.background = "transparent";
        return;
      }

      const isVideo = ad.mediaType === "video" && ad.videoUrl;
      const mediaUrl = isVideo ? ad.videoUrl : ad.imageUrl;

      let mediaHtml = "";
      if (isVideo) {
        mediaHtml = `
          <video muted autoplay loop playsinline 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            <source src="${mediaUrl}" type="video/mp4">
            Ваш браузер не поддерживает видео.
          </video>
        `;
      } else {
        mediaHtml = `
          <img src="${mediaUrl}" alt="Реклама" 
               style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block;">
        `;
      }

      if (ad.linkUrl) {
        container.innerHTML = `
          <a href="${ad.linkUrl}" target="_blank" rel="noopener noreferrer" 
             style="display: block; width: 100%; height: 100%; text-decoration: none;">
            ${mediaHtml}
          </a>
        `;
      } else {
        container.innerHTML = mediaHtml;
      }

      if (isVideo) {
        setTimeout(() => {
          const video = container.querySelector("video");
          if (video) this.playVideoIfNeeded(video);
        }, 50);
      }
    });
  },

  showFallback() {
    const blocks = ["block1", "block2", "block3", "block4"];
    blocks.forEach((blockId) => {
      const container = document.getElementById(blockId);
      if (container) {
        container.innerHTML = "";
        container.style.minHeight = "auto";
        container.style.background = "transparent";
      }
    });
  },
};

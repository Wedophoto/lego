// Конфигурация приложения
export const CONFIG = {
  GAS_URL:
    "https://script.google.com/macros/s/AKfycbyQBWZZRrIGT6HIy78uvYqNqqo2CDISHIqOPMPTEG1mCvH4gxEn9QJXqlYaHVAV0zBu/exec",
  ITEMS_PER_PAGE: 24,
  STORAGE_KEYS: {
    PDF_MAP: "drivePdfMap",
    CARDS: "site_cards",
    SECTIONS: "site_sections",
    NOTIFICATION_IDS: "notification_card_ids",
  },
};

export const BASE_PATH = window.location.hostname.includes("github.io")
  ? "/lego/"
  : "";

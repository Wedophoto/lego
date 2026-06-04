import { CONFIG } from "../config.js";

const { STORAGE_KEYS } = CONFIG;

export function loadFromStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return defaultValue;
}

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadPdfMap() {
  return loadFromStorage(STORAGE_KEYS.PDF_MAP, {});
}

export function savePdfMap(data) {
  return saveToStorage(STORAGE_KEYS.PDF_MAP, data);
}

export function loadCards() {
  return loadFromStorage(STORAGE_KEYS.CARDS, []);
}

export function saveCards(data) {
  return saveToStorage(STORAGE_KEYS.CARDS, data);
}

export function loadSections() {
  return loadFromStorage(STORAGE_KEYS.SECTIONS, []);
}

export function saveSections(data) {
  return saveToStorage(STORAGE_KEYS.SECTIONS, data);
}

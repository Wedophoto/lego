import { CONFIG } from "../config.js";

const { GAS_URL } = CONFIG;

async function request(params) {
  const url = new URL(GAS_URL);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key]),
  );
  url.searchParams.append("t", Date.now());
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPdfMap() {
  try {
    return await request({ action: "getFilesList" });
  } catch (err) {
    console.error("Не удалось загрузить список PDF:", err);
    return {};
  }
}

export async function fetchAllCards() {
  try {
    const data = await request({ action: "getCards" });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Не удалось загрузить карточки:", err);
    return [];
  }
}

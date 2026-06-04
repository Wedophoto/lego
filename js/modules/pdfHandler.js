import { loadPdfMap, savePdfMap } from "../utils/storage.js";
import { fetchPdfMap } from "../api/gasClient.js";

let fileMap = {};

export function initPdfHandler() {
  fileMap = loadPdfMap();
  document.addEventListener("click", handlePdfClick);
  if (Object.keys(fileMap).length === 0) {
    console.log(
      "localStorage пуст. Запускаем фоновую загрузку списка файлов...",
    );
    fetchAndSaveFileMap();
  }
}

async function fetchAndSaveFileMap() {
  try {
    const data = await fetchPdfMap();
    savePdfMap(data);
    fileMap = data;
    console.log("Список PDF-файлов успешно загружен и сохранён в localStorage");
  } catch (err) {
    console.error("Не удалось загрузить список файлов:", err);
  }
}

function handlePdfClick(e) {
  const link = e.target.closest('a[href$=".pdf"]');
  if (!link) return;
  e.preventDefault();
  const filename = link.href.split("/").pop();
  if (fileMap[filename]) {
    window.open(
      `https://drive.google.com/file/d/${fileMap[filename]}/view`,
      "_blank",
    );
  } else {
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

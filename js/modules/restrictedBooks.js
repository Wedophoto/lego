// Блокировка книг — доступ по запросу

export function initRestrictedBooks() {
  const restrictedBooks = document.querySelectorAll(".restricted-book");
  restrictedBooks.forEach((book) => {
    book.style.cursor = "pointer";
    book.addEventListener("click", function (e) {
      e.preventDefault();
      const title = this.getAttribute("data-title") || "книге";
      alert(`📩 Доступ к "${title}" по запросу.`);
    });
  });
}

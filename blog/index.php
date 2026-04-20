<?php
// Путь к БД
$dbFile = __DIR__ . '/../data/database.json';

// Чтение (Единый формат)
$posts = [];
if (file_exists($dbFile)) {
  $jsonContent = file_get_contents($dbFile);
  $data = json_decode($jsonContent, true);
  $posts = $data['posts'] ?? [];
}

// Функция безопасности
function e($str)
{
  return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

// Функция для обрезки HTML-контента без разрыва тегов
function truncateHtml($html, $limit = 200, $ellipsis = '...')
{
  $text = strip_tags($html);
  if (mb_strlen($text) <= $limit) {
    return $html;
  }
  return mb_substr($text, 0, $limit) . $ellipsis;
}
?>
<!DOCTYPE html>
<html lang="ru">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Блог</title>
  <style>
    :root {
      --primary: #4f46e5;
      --bg: #f3f4f6;
      --card-bg: #ffffff;
      --text: #1f2937;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .breadcrumbs {
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 20px;
    }

    .breadcrumbs a {
      color: #4f46e5;
      text-decoration: none;
    }

    .separator {
      margin: 0 8px;
      color: #d1d5db;
    }

    .current {
      color: #374151;
      font-weight: 500;
    }

    h1 {
      margin-bottom: 40px;
      color: #111827;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
      align-items: start;
      /* Выравнивание карточек по верхнему краю */
    }

    .post-card {
      background: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, border-color 0.2s;
      display: flex;
      flex-direction: column;
      border: 1px solid #e5e7eb;
      text-decoration: none;
      color: inherit;
      height: 100%;
      /* Растягиваем карточку на всю высоту ячейки grid */
      min-height: 450px;
      /* Минимальная высота для единообразия */
    }

    .post-card:hover {
      transform: translateY(-5px);
      border-color: var(--primary);
    }

    .post-image {
      width: 100%;
      height: 200px;
      background-color: #e5e7eb;
      object-fit: cover;
      flex-shrink: 0;
      /* Запрещаем сжатие изображения */
    }

    .post-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      /* Важно для правильной работы flex-контейнера */
    }

    .post-meta {
      font-size: 0.8rem;
      color: #9ca3af;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .post-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 10px 0;
      color: #111827;
      line-height: 1.4;
      flex-shrink: 0;
    }

    /* Стили для превью текста */
    .post-excerpt {
      font-size: 0.9rem;
      color: #6b7280;
      line-height: 1.5;
      margin-bottom: 15px;
      flex: 1;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      /* Ограничиваем текст 4 строками */
      -webkit-box-orient: vertical;
      word-break: break-word;
    }

    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: auto;
      flex-shrink: 0;
    }

    .tag {
      background-color: #e0e7ff;
      color: #4338ca;
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 99px;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      color: #6b7280;
      grid-column: 1 / -1;
      padding: 60px 0;
    }
  </style>

  <!-- Yandex.Metrika counter -->
  <script type="text/javascript">
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
      k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=108280737', 'ym');

    ym(108280737, 'init', { ssr: true, webvisor: true, clickmap: true, ecommerce: "dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true });
  </script>
  <noscript>
    <div><img src="https://mc.yandex.ru/watch/108280737" style="position:absolute; left:-9999px;" alt="" /></div>
  </noscript>
  <!-- /Yandex.Metrika counter -->
</head>

<body>

  <div class="container">

    <div class="breadcrumbs">
      <a href="/">Главная</a>
      <span class="separator">/</span>
      <span class="current">Блог</span>
    </div>

    <h1>Блог</h1>

    <div class="grid">
      <?php if (count($posts) > 0): ?>
        <?php foreach ($posts as $post): ?>
          <a href="<?php echo e($post['slug']); ?>.html" class="post-card">

            <?php if (!empty($post['image_url'])): ?>
              <img src="<?php echo e($post['image_url']); ?>" alt="<?php echo e($post['title']); ?>" class="post-image">
            <?php else: ?>
              <div class="post-image"></div>
            <?php endif; ?>

            <div class="post-content">
              <div class="post-meta">
                <span>
                  <?php echo date('d.m.Y', strtotime($post['created_at'])); ?>
                </span>
              </div>
              <h2 class="post-title">
                <?php echo e($post['title']); ?>
              </h2>

              <!-- Вывод обрезанного текста без HTML-тегов -->
              <div class="post-excerpt">
                <?php
                // Используем новую функцию для безопасного обрезания контента
                echo truncateHtml($post['content'], 150);
                ?>
              </div>

              <!-- Теги -->
              <?php if (!empty($post['tags']) && is_array($post['tags']) && count($post['tags']) > 0): ?>
                <div class="post-tags">
                  <?php foreach ($post['tags'] as $tag): ?>
                    <span class="tag">#
                      <?php echo e($tag); ?>
                    </span>
                  <?php endforeach; ?>
                </div>
              <?php endif; ?>

            </div>
          </a>
        <?php endforeach; ?>
      <?php else: ?>
        <div class="empty-state">
          <h2>Статей пока нет</h2>
          <p>Создайте первую статью через админ-панель.</p>
        </div>
      <?php endif; ?>
    </div>
  </div>

</body>

</html>
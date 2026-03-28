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
    }

    .post-card {
      background: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      display: flex;
      flex-direction: column;
      border: 1px solid #e5e7eb;
      text-decoration: none;
      color: inherit;
      height: 100%;
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
    }

    .post-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .post-meta {
      font-size: 0.8rem;
      color: #9ca3af;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
    }

    .post-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 10px 0;
      color: #111827;
      line-height: 1.4;
    }

    /* Стили для HTML контента внутри карточки */
    .post-excerpt {
      font-size: 0.9rem;
      color: #6b7280;
      line-height: 1.5;
      margin-bottom: 15px;
      flex: 1;
    }

    /* Ограничиваем высоту заголовков внутри превью */
    .post-excerpt h1,
    .post-excerpt h2,
    .post-excerpt h3 {
      font-size: 1em;
      margin: 0.5em 0;
      font-weight: 600;
    }

    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: auto;
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

              <!-- Вывод готового HTML (обрезаем для превью) -->
              <div class="post-excerpt">
                <?php
                // Отрезаем первые 200 символов УЖЕ ГОТОВОГО HTML
                echo mb_substr($post['content'], 0, 200) . '...';
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
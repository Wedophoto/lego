<?php
// /api/api.php

// Настройки
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Лог
$debugLog = __DIR__ . '/debug_log.txt';
file_put_contents($debugLog, "--- " . date('H:i:s') . " ---\n", FILE_APPEND);

header('Content-Type: application/json');

// Пути
$rootDir = dirname(__DIR__);
$dataFile = $rootDir . '/data/database.json';
$blogDir = $rootDir . '/blog/';
$templateFile = $rootDir . '/templates/post_template.html';
$uploadDir = $rootDir . '/uploads/';

// Создаем папки
$dirs = [$blogDir, $uploadDir, dirname($dataFile)];
foreach ($dirs as $dir) {
  if (!file_exists($dir)) {
    mkdir($dir, 0777, true);
  }
}

// --- ФУНКЦИИ БАЗЫ ДАННЫХ ---

function loadDB($file)
{
  if (!file_exists($file))
    return [];
  $content = file_get_contents($file);
  $data = json_decode($content, true);
  // Строгий формат: ожидаем объект с ключом 'posts'
  return isset($data['posts']) ? $data['posts'] : [];
}

function saveDB($file, $data)
{
  $fp = fopen($file, 'c+');
  if (flock($fp, LOCK_EX)) {
    ftruncate($fp, 0);
    // Формируем единую структуру
    $output = ['posts' => $data];
    fwrite($fp, json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    flock($fp, LOCK_UN);
  }
  fclose($fp);
}

function slugify($text)
{
  // Сначала заменяем кириллицу на латиницу
  $converter = array(
    'а' => 'a',
    'б' => 'b',
    'в' => 'v',
    'г' => 'g',
    'д' => 'd',
    'е' => 'e',
    'ё' => 'e',
    'ж' => 'zh',
    'з' => 'z',
    'и' => 'i',
    'й' => 'y',
    'к' => 'k',
    'л' => 'l',
    'м' => 'm',
    'н' => 'n',
    'о' => 'o',
    'п' => 'p',
    'р' => 'r',
    'с' => 's',
    'т' => 't',
    'у' => 'u',
    'ф' => 'f',
    'х' => 'h',
    'ц' => 'c',
    'ч' => 'ch',
    'ш' => 'sh',
    'щ' => 'shch',
    'ь' => '',
    'ы' => 'y',
    'ъ' => '',
    'э' => 'e',
    'ю' => 'yu',
    'я' => 'ya',

    // Заглавные буквы
    'А' => 'a',
    'Б' => 'b',
    'В' => 'v',
    'Г' => 'g',
    'Д' => 'd',
    'Е' => 'e',
    'Ё' => 'e',
    'Ж' => 'zh',
    'З' => 'z',
    'И' => 'i',
    'Й' => 'y',
    'К' => 'k',
    'Л' => 'l',
    'М' => 'm',
    'Н' => 'n',
    'О' => 'o',
    'П' => 'p',
    'Р' => 'r',
    'С' => 's',
    'Т' => 't',
    'У' => 'u',
    'Ф' => 'f',
    'Х' => 'h',
    'Ц' => 'c',
    'Ч' => 'ch',
    'Ш' => 'sh',
    'Щ' => 'shch',
    'Ь' => '',
    'Ы' => 'y',
    'Ъ' => '',
    'Э' => 'e',
    'Ю' => 'yu',
    'Я' => 'ya'
  );

  // Транслитерация
  $text = strtr($text, $converter);

  // Заменяем пробелы и другие нежелательные символы на дефисы
  $text = preg_replace('~[^\pL\d]+~u', '-', $text);

  // Удаляем дефисы в начале и конце
  $text = trim($text, '-');

  // Приводим к нижнему регистру
  $text = strtolower($text);

  // Удаляем все, что не является буквой, цифрой или дефисом
  $text = preg_replace('~[^a-z0-9-]+~', '', $text);

  return $text;
}

function generatePost($postData, $blogDir, $templateFile)
{
  // Мы получаем уже готовый HTML от marked.js
  $contentHtml = $postData['content'];

  $title = htmlspecialchars($postData['title']);
  // Для описания берем текст, вырезая теги, чтобы не было крякозябр в meta description
  $description = mb_substr(strip_tags($contentHtml), 0, 150) . '...';

  $date = date('d.m.Y', strtotime($postData['created_at'] ?? 'now'));
  $tags = implode(', ', $postData['tags']);
  $imageUrl = $postData['image_url'] ?? '';
  $imageHtml = $imageUrl ? "<img src=\"{$imageUrl}\" alt=\"{$title}\" class=\"cover-image\">" : '';

  if (!file_exists($templateFile)) {
    throw new Exception("Шаблон не найден");
  }
  $template = file_get_contents($templateFile);

  $finalHtml = str_replace(
    ['{TITLE}', '{DESCRIPTION}', '{CONTENT}', '{DATE}', '{TAGS}', '{IMAGE_URL}', '{IMAGE_HTML}'],
    [$title, $description, $contentHtml, $date, $tags, $imageUrl, $imageHtml],
    $template
  );

  $slug = $postData['slug'];
  $filePath = $blogDir . $slug . '.html';

  if (file_put_contents($filePath, $finalHtml) === false) {
    throw new Exception("Ошибка записи HTML");
  }
  return $filePath;
}

// --- ОБРАБОТКА ЗАПРОСА ---

try {
  // 1. Сбор входящих данных
  $input = [];

  // Проверяем GET
  if (isset($_GET['action'])) {
    $input = $_GET;
  }
  // Проверяем POST
  elseif (isset($_POST['action'])) {
    $input = $_POST;
  }
  // Проверяем JSON внутри POST (FormData из админки)
  elseif (isset($_POST['json_data'])) {
    $jsonInside = json_decode($_POST['json_data'], true);
    if ($jsonInside) {
      $input = array_merge($_POST, $jsonInside);
    }
  }
  // Проверяем сырой JSON (для удаления)
  else {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
      $decoded = json_decode($raw, true);
      if ($decoded)
        $input = $decoded;
    }
  }

  $action = $input['action'] ?? '';

  file_put_contents($debugLog, "Action: " . $action . "\n", FILE_APPEND);

  if (empty($action)) {
    throw new Exception("Action is empty");
  }

  $db = loadDB($dataFile);

  // --- GET TAGS ---
  if ($action === 'getTags') {
    $allTags = [];
    foreach ($db as $post) {
      if (isset($post['tags']) && is_array($post['tags'])) {
        $allTags = array_merge($allTags, $post['tags']);
      }
    }
    // Убираем дубликаты
    $allTags = array_unique($allTags);
    echo json_encode(['tags' => array_values($allTags)]);
    exit;
  }

  // --- SAVE / UPDATE (ИСПРАВЛЕННЫЙ) ---
  if ($action === 'savePost' || $action === 'updatePost') {
    $id = $input['id'] ?? null;
    $title = $input['title'] ?? 'Без названия';

    // HTML для генерации страницы (пришел из админки)
    $htmlForPage = $input['content'] ?? '';

    // Markdown для хранения в БД
    $markdown = $input['markdown'] ?? '';

    $tagsStr = $input['tags'] ?? '';
    // Обрабатываем теги (пришел массив или строка)
    if (is_array($tagsStr)) {
      $tags = array_filter($tagsStr);
    } else {
      $tags = array_map('trim', explode(',', $tagsStr));
      $tags = array_filter($tags);
    }

    $currentImage = $input['image_url'] ?? '';

    // Обработка файла
    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
      $ext = pathinfo($_FILES['image_file']['name'], PATHINFO_EXTENSION);
      $filename = uniqid() . '.' . $ext;
      if (move_uploaded_file($_FILES['image_file']['tmp_name'], $uploadDir . $filename)) {
        $currentImage = '../uploads/' . $filename;
      }
    }

    // Генерация Slug
    $slug = slugify($title);
    if (empty($slug)) {
      $slug = 'post-' . uniqid();
    }

    if (!$id) {
      // Проверка уникальности slug для НОВОЙ статьи
      $i = 1;
      $originalSlug = $slug;
      while (file_exists($blogDir . $slug . '.html')) {
        $slug = $originalSlug . '-' . $i++;
      }
    } else {
      // Для редактирования ищем старый slug, чтобы не менять ссылку
      $found = false;
      foreach ($db as $p) {
        if ($p['id'] === $id) {
          $slug = $p['slug'];
          $found = true;
          break;
        }
      }
      // Если не нашли (странно), но ID есть, генерируем новый
      if (!$found) {
        $i = 1;
        $originalSlug = $slug;
        while (file_exists($blogDir . $slug . '.html')) {
          $slug = $originalSlug . '-' . $i++;
        }
      }
    }

    $postData = [
      'id' => $id ?: uniqid(),
      'title' => $title,
      'slug' => $slug,
      'content' => $markdown, // В БД сохраняем ТОЛЬКО Markdown
      'tags' => array_values($tags),
      'image_url' => $currentImage,
      'created_at' => date('c'),
      'updated_at' => date('c')
    ];

    // Обновление или Создание
    if ($id) {
      $updated = false;
      foreach ($db as &$p) {
        if ($p['id'] === $id) {
          // Сохраняем старую дату создания
          $postData['created_at'] = $p['created_at'];
          $p = $postData;
          $updated = true;
          break;
        }
      }
      if (!$updated)
        $db[] = $postData;
    } else {
      $db[] = $postData;
    }

    saveDB($dataFile, $db);

    // Для генерации страницы используем HTML из запроса
    $tempPostData = $postData;
    $tempPostData['content'] = $htmlForPage; // Временно подменяем для генерации
    generatePost($tempPostData, $blogDir, $templateFile);

    echo json_encode(['success' => true, 'slug' => $slug]);
  }

  // --- DELETE ---
  elseif ($action === 'deletePost') {
    $id = $input['id'] ?? '';
    $found = false;

    foreach ($db as $key => $post) {
      if ($post['id'] === $id) {
        $htmlFile = $blogDir . $post['slug'] . '.html';
        if (file_exists($htmlFile))
          unlink($htmlFile);
        unset($db[$key]);
        $found = true;
        break;
      }
    }

    if ($found) {
      saveDB($dataFile, array_values($db));
      echo json_encode(['success' => true]);
    } else {
      throw new Exception("Пост не найден");
    }
  }

  // --- GET POSTS ---
  elseif ($action === 'getPosts') {
    echo json_encode(['posts' => array_values($db)]);
  } else {
    throw new Exception("Неизвестное действие: " . $action);
  }

} catch (Exception $e) {
  http_response_code(500);
  $msg = $e->getMessage();
  file_put_contents($debugLog, "Error: " . $msg . "\n", FILE_APPEND);
  echo json_encode(['success' => false, 'message' => $msg]);
}
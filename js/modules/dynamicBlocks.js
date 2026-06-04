// Загрузка динамических блоков с Google Apps Script

const DYNAMIC_BLOCKS_URL =
  "https://script.google.com/macros/s/AKfycbzB6aP3KPBdMvkSrL9j_u2J-vViEcwvoxMHWiLHKaCSH4sZ8_vk-mCJdGOKnXHh8qi7/exec";

export async function loadDynamicBlocks() {
  const block1Container = document.getElementById("block1");
  const block2Container = document.getElementById("block2");
  const block3Container = document.getElementById("block3");

  // Заглушки во время загрузки
  if (block1Container)
    block1Container.innerHTML = '<div class="dynamic-block"></div>';
  if (block2Container)
    block2Container.innerHTML = '<div class="dynamic-block"></div>';
  if (block3Container)
    block3Container.innerHTML = '<div class="dynamic-block"></div>';

  try {
    const response = await fetch(DYNAMIC_BLOCKS_URL);
    const data = await response.json();

    if (block1Container && data.block1) block1Container.innerHTML = data.block1;
    if (block2Container && data.block2) block2Container.innerHTML = data.block2;
    if (block3Container && data.block3) block3Container.innerHTML = data.block3;

    console.log("✅ Три блока успешно загружены");
  } catch (error) {
    console.error("❌ Ошибка загрузки:", error);
    if (block1Container)
      block1Container.innerHTML = '<div class="dynamic-block">⚠️ Ошибка</div>';
    if (block2Container)
      block2Container.innerHTML = '<div class="dynamic-block">⚠️ Ошибка</div>';
    if (block3Container)
      block3Container.innerHTML = '<div class="dynamic-block">⚠️ Ошибка</div>';
  }
}

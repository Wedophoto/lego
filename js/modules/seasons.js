// Смена фона по времени года

let seasonInterval = null;

export function initSeasons() {
  updateSeasonBackground();
  if (seasonInterval) clearInterval(seasonInterval);
  seasonInterval = setInterval(updateSeasonBackground, 5 * 60 * 1000);
}

async function updateSeasonBackground() {
  const season = await getSeasonByIP();
  const seasonsBg = document.getElementById("seasonsBg");

  document.querySelectorAll(".season-icon").forEach((icon) => {
    icon.style.display = "none";
  });

  const currentSeasonIcon = document.getElementById(season + "Icon");
  if (currentSeasonIcon) {
    currentSeasonIcon.style.display = "block";
  }

  switch (season) {
    case "spring":
      document.body.style.background =
        "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)";
      break;
    case "summer":
      document.body.style.background =
        "linear-gradient(135deg, #fff9c4 0%, #ffeb3b 100%)";
      break;
    case "autumn":
      document.body.style.background =
        "linear-gradient(135deg, #ffccbc 0%, #ffab91 100%)";
      break;
    case "winter":
      document.body.style.background =
        "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)";
      break;
  }
}

function getSeasonByMonth(month) {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

async function getSeasonByIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (data && data.timezone) {
      const now = new Date();
      const localTime = new Date(
        now.toLocaleString("en-US", { timeZone: data.timezone }),
      );
      const month = localTime.getMonth() + 1;
      return getSeasonByMonth(month);
    }
  } catch (error) {
    console.error("Ошибка при определении геолокации:", error);
  }
  const month = new Date().getMonth() + 1;
  return getSeasonByMonth(month);
}

// Анимации карточек при наведении

export function initCardAnimations() {
  initCarsCard();
  initNewYearCard();
  initMilitaryCard();
  initDinoCard();
  initTransportCard();
  initNoSmartHubCard();
  initAnimalsCard();
  initStarWarsCard();
  initShipsCard();
  initSpaceCard();
  initPeopleCard();
  initMechanismsCard();
  initMiniModelsCard();
  initCompetitionCard();
  initInsectsCard();
  initLegoInstructionsCard();
  initBirdsCard();
  initPlantsCard();
  initRobotsCard();
  initAirplanesCard();
  initSpecialEquipmentCard();
  initSportCard();
  initWalkingCard();
}

function initCarsCard() {
  const carsCard = document.getElementById("cars-card");
  if (!carsCard) return;
  const carWheel = carsCard.querySelector(".car-wheel");
  carsCard.addEventListener("mouseenter", function () {
    if (carWheel) {
      carWheel.style.animation = "none";
      void carWheel.offsetWidth;
      carWheel.style.animation = "wheelFallAndRoll 1.5s ease-in-out";
    }
  });
}

function initNewYearCard() {
  const newYearCard = document.getElementById("newyear-card");
  if (!newYearCard) return;
  newYearCard.addEventListener("mouseenter", function () {
    this.classList.add("animate-newyear");
  });
  newYearCard.addEventListener("mouseleave", function () {
    this.classList.remove("animate-newyear");
  });
}

function initMilitaryCard() {
  const militaryCard = document.getElementById("military-card");
  if (!militaryCard) return;
  militaryCard.addEventListener("mouseenter", function () {
    this.classList.add("animate-tank");
  });
  militaryCard.addEventListener("mouseleave", function () {
    this.classList.remove("animate-tank");
  });
}

function initDinoCard() {
  const dinoCard = document.getElementById("dino-card");
  if (!dinoCard) return;
  dinoCard.addEventListener("mouseenter", function () {
    this.classList.add("animate-dino");
  });
  dinoCard.addEventListener("mouseleave", function () {
    this.classList.remove("animate-dino");
  });
}

function initAnimalsCard() {
  const animalsCard = document.getElementById("animals-card");
  if (!animalsCard) return;
}

function initStarWarsCard() {
  const starwarsCard = document.getElementById("starwars-card");
  if (!starwarsCard) return;
}

function initShipsCard() {
  const shipsCard = document.getElementById("ships-card");
  if (!shipsCard) return;
}

function initSpaceCard() {
  const spaceCard = document.getElementById("space-card");
  if (!spaceCard) return;
}

function initPeopleCard() {
  const peopleCard = document.getElementById("people-card");
  if (!peopleCard) return;
}

function initMechanismsCard() {
  const mechanismsCard = document.getElementById("mechanisms-card");
  if (!mechanismsCard) return;
}

function initMiniModelsCard() {
  const miniModelsCard = document.getElementById("mini-modeli-card");
  if (!miniModelsCard) return;
}

function initCompetitionCard() {
  const competitionCard = document.getElementById("competition-card");
  if (!competitionCard) return;
}

function initInsectsCard() {
  const insectsCard = document.getElementById("insects-card");
  if (!insectsCard) return;
}

function initLegoInstructionsCard() {
  const legoCard = document.getElementById("lego-instructions-card");
  if (!legoCard) return;
}

function initBirdsCard() {
  const birdsCard = document.getElementById("birds-card");
  if (!birdsCard) return;
}

function initPlantsCard() {
  const plantsCard = document.getElementById("plants-card");
  if (!plantsCard) return;
}

function initRobotsCard() {
  const robotsCard = document.getElementById("robots-card");
  if (!robotsCard) return;
}

function initAirplanesCard() {
  const airplanesCard = document.getElementById("airplanes-card");
  if (!airplanesCard) return;
}

function initSpecialEquipmentCard() {
  const specialCard = document.getElementById("special-equipment-card");
  if (!specialCard) return;
}

function initSportCard() {
  const sportCard = document.getElementById("sport-card");
  if (!sportCard) return;
}

function initTransportCard() {
  const transportCard = document.getElementById("transport-card");
  if (!transportCard) return;
}

function initWalkingCard() {
  const walkingCard = document.getElementById("walking-card");
  if (!walkingCard) return;
}

function initNoSmartHubCard() {
  const noSmartHubCard = document.getElementById("no-smart-hub-card");
  if (!noSmartHubCard) return;
  const strikethroughText = noSmartHubCard.querySelector(".strikethrough-text");
  noSmartHubCard.addEventListener("mouseenter", function () {
    if (strikethroughText) {
      strikethroughText.style.textDecoration = "line-through";
      strikethroughText.style.color = "#ff0000";
    }
  });
  noSmartHubCard.addEventListener("mouseleave", function () {
    if (strikethroughText) {
      strikethroughText.style.textDecoration = "none";
      strikethroughText.style.color = "";
    }
  });
}

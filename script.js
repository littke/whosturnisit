document.addEventListener("DOMContentLoaded", function () {
  function setDynamicVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  setDynamicVh();

  window.addEventListener("resize", setDynamicVh);
});

let players = [];
let playersStartingOrder = [];
let currentPlayerIndex = 0;
const colors = [
  "#FFCCCC",
  "#CCFFCC",
  "#CCCCFF",
  "#FFFFCC",
  "#FFCCFF",
  "#CCFFFF",
];
// Grab the sounds from the DOM
const sounds = Array.from(document.querySelectorAll("audio"));

function addPlayer() {
  const playerNameInput = document.getElementById("playerName");
  const playerName = playerNameInput.value.trim();
  if (playerName) {
    players.push(playerName);
    playersStartingOrder.push(playerName);
    const setupPlayerList = document.getElementById("setupPlayerList");
    const listItem = document.createElement("li");
    listItem.textContent = playerName;
    setupPlayerList.appendChild(listItem);
    playerNameInput.value = "";
  }

  playerNameInput.focus();

  return false;
}

function startGame() {
  if (players.length > 0) {
    document.getElementById("setup").style.display = "none";
    document.getElementById("game").style.display = "flex";
    document.getElementById("currentPlayer").textContent =
      players[currentPlayerIndex];
    document.body.style.backgroundColor =
      colors[currentPlayerIndex % colors.length];

    const gamePlayerList = document.getElementById("gamePlayerList");

    // Add players to the gamePlayerList
    players.forEach((player) => {
      const listItem = document.createElement("li");
      listItem.textContent = player;
      gamePlayerList.appendChild(listItem);
    });

    // Mark the first player as current
    updatePlayerListTurn();
    sounds[0].play();

    // Initialize SortableJS on the gamePlayerList
    new Sortable(gamePlayerList, {
      animation: 150,
      onEnd: function (event) {
        players = Array.from(gamePlayerList.children).map(
          (item) => item.textContent
        );

        // Find the new index of the current player by looking at .current in the DOM
        currentPlayerIndex = Array.from(gamePlayerList.children).findIndex(
          (item) => item.classList.contains("current")
        );
      },
    });

    // Handle click on a player in the gamePlayerList, make it that players turn
    gamePlayerList.addEventListener("click", function (event) {
      if (event.target.tagName === "LI") {
        currentPlayerIndex =
          Array.from(gamePlayerList.children).indexOf(event.target) - 1;
        document.getElementById("currentPlayer").textContent =
          players[currentPlayerIndex];
        updatePlayerListTurn();
      }
    });
  } else {
    alert("Please add at least one player.");
  }
}

/*
 * Update the player list to show which player's turn it is.
 */
function updatePlayerListTurn() {
  const playerListItems = document.querySelectorAll("#gamePlayerList li");
  playerListItems.forEach((item, index) => {
    if (index === currentPlayerIndex) {
      item.classList.add("current");
    } else {
      item.classList.remove("current");
    }
  });
}

function nextTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  currentPlayerName = players[currentPlayerIndex];
  currentPlayerStartingOrder = playersStartingOrder.indexOf(currentPlayerName);

  document.getElementById("currentPlayer").textContent =
    players[currentPlayerIndex];

  updatePlayerListTurn();

  document.body.style.backgroundColor =
    colors[currentPlayerIndex % colors.length];

  // Pause any other sounds
  sounds.forEach((sound) => {
    sound.pause();
    sound.currentTime = 0;
  });

  // Play the current player's sound
  if (sounds[currentPlayerStartingOrder]) {
    sounds[currentPlayerStartingOrder].play();
  }
}

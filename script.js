let players = [];
let currentPlayerIndex = 0;
const colors = [
  "#FFCCCC",
  "#CCFFCC",
  "#CCCCFF",
  "#FFFFCC",
  "#FFCCFF",
  "#CCFFFF",
];

function addPlayer(e) {
  const playerNameInput = document.getElementById("playerName");
  const playerName = playerNameInput.value.trim();
  if (playerName) {
    players.push(playerName);
    const playerList = document.getElementById("playerList");
    const listItem = document.createElement("li");
    listItem.textContent = playerName;
    playerList.appendChild(listItem);
    playerNameInput.value = "";
  }

  e.preventDefault();
}

function startGame() {
  if (players.length > 0) {
    document.getElementById("setup").style.display = "none";
    document.getElementById("game").style.display = "flex";
    document.getElementById("currentPlayer").textContent =
      players[currentPlayerIndex];
    document.body.style.backgroundColor =
      colors[currentPlayerIndex % colors.length];
  } else {
    alert("Please add at least one player.");
  }
}

function nextTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  document.getElementById("currentPlayer").textContent =
    players[currentPlayerIndex];
  document.body.style.backgroundColor =
    colors[currentPlayerIndex % colors.length];
}

let players = [];
let playersStartingOrder = [];
let currentPlayerIndex = 0;
let gameStarted = false;
let timerInterval = null;
let growInterval = null;
let gameOptions = {};
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

function addPlayer(player) {
  const playerNameInput = document.getElementById("playerName");
  const playerName = playerNameInput.value.trim() || player;
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
  gameStarted = true;
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

    // Save the game options from setup
    gameOptions.timer = document.getElementById("useTimer").checked;
    gameOptions.growSlow = document.getElementById("useGrowSlow").checked;
    gameOptions.voiceCommands =
      document.getElementById("useVoiceCommands").checked;

    // Mark the first player as current
    updatePlayer(0);
    updatePlayerList();

    if (
      gameOptions.voiceCommands &&
      !window.location.search.includes("devmode")
    ) {
      startSpeechRecognition();
    }

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
        updatePlayerList();
      }
    });
  } else {
    alert("Please add at least one player.");
  }
}

/*
 * A function to update which player is currently playing.
 */
function updatePlayer(currentPlayerIndex) {
  currentPlayerName = players[currentPlayerIndex];
  currentPlayerStartingOrder = playersStartingOrder.indexOf(currentPlayerName);

  document.getElementById("currentPlayer").textContent =
    players[currentPlayerIndex];

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

  if (gameOptions.timer) startTimer();

  // If the growSlow option is enabled, start the grow animation
  if (gameOptions.growSlow) {
    const player = document.getElementById("currentPlayer");
    const timer = document.getElementById("timer");

    let size = 1;

    // Start of turn should always be the same size,
    // so clear any previous growInterval
    if (growInterval) {
      clearInterval(growInterval);

      // Remove transition when shrinking
      player.style.transition = "none";
      timer.style.transition = "none";

      player.style.scale = size;
      timer.style.scale = size;

      // After 1 second, re-add transition
      setTimeout(() => {
        player.style.transition = "scale 1.5s ease-in-out";
        timer.style.transition = "scale 1.5s ease-in-out";
      }, 1000);
    }

    growInterval = setInterval(() => {
      // Slowly increase the font size
      size = size * 1.02;

      // But only up to a certain limit
      if (size > 2) {
        size = 2;
      }

      player.style.scale = size;
      timer.style.scale = size;

      // Start shaking once it's at a certain size
      if (size > 1.9) {
        player.classList.add("shake");

        // Remove the shake after 1 second
        setTimeout(() => {
          player.classList.remove("shake");
        }, 750);
      }
    }, 5000);
  }
}

/*
 * Update the player list to show which player's turn it is.
 */
function updatePlayerList() {
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

  updatePlayer(currentPlayerIndex);
  updatePlayerList();
}

function previousTurn() {
  currentPlayerIndex =
    (currentPlayerIndex - 1 + players.length) % players.length;

  updatePlayer(currentPlayerIndex);
  updatePlayerList();
}

/*
 * Start the timer for the current player, counting from 0:00 and incrementing by 1 second.
 */
function startTimer() {
  let time = 0;
  const timer = document.getElementById("timer");
  timer.textContent = "0:00";

  if (timerInterval) {
    clearInterval(timerInterval); // Clear any previous interval
  }

  timerInterval = setInterval(() => {
    time++;
    timer.textContent = `${Math.floor(time / 60)}:${(time % 60)
      .toString()
      .padStart(2, "0")}`;
  }, 1000);

  return timerInterval;
}

// Prevent scrolling and refreshing on iPad
document.addEventListener("touchmove", function (e) {
  e.preventDefault();
});

// Confirm before refreshing
window.onbeforeunload = function () {
  if (gameStarted && !window.location.search.includes("devmode")) {
    return "Are you sure you want to leave? Your game will be lost.";
  }
};

// Handle space and arrows keys left and right
document.addEventListener("keydown", function (e) {
  if (e.key === " " && gameStarted) {
    nextTurn();
  } else if (e.key === "ArrowRight") {
    nextTurn();
  } else if (e.key === "ArrowLeft") {
    previousTurn();
  }
});

// Handle swipe left and right on touch devices
let startX = null;
let startY = null;
let endX = null;
let endY = null;
let threshold = 50;

document.addEventListener("touchstart", function (e) {
  // Don't trigger when sorting the player list
  if (e.target.tagName === "LI") {
    return;
  }

  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

document.addEventListener("touchend", function (e) {
  endX = e.changedTouches[0].clientX;
  endY = e.changedTouches[0].clientY;
  if (startX && startY && endX && endY) {
    let dx = endX - startX;
    let dy = endY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) {
        previousTurn();
      } else if (dx < -threshold) {
        nextTurn();
      }
    }
  }
  startX = null;
  startY = null;
  endX = null;
  endY = null;
});

// Dev mode: If URL has ?players=jon,unke,etc, add players to the list and start
const urlParams = new URLSearchParams(window.location.search);
const playersParam = urlParams.get("players");
if (playersParam) {
  let players = playersParam.split(",");
  players.forEach((player) => addPlayer(player));

  startGame();
}

// Listen for "I'm done" voice command and advance the turn
function startSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in your browser.");
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function (event) {
    const last = event.results.length - 1;
    const command = event.results[last][0].transcript.toLowerCase();
    console.log(command);
    if (
      command.includes("i'm done") ||
      command.includes("i am done") ||
      command.includes("next player") ||
      command.includes("i pass")
    ) {
      nextTurn();
    }
  };

  // Handle errors
  recognition.onerror = function (event) {
    console.error(event.error);
  };

  // Start the recognition
  recognition.start();
}

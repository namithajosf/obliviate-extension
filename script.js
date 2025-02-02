let port = chrome.runtime.connect({ name: "popup" });

port.onMessage.addListener((message) => {
  if (message.action === "updateScore") {
    console.log("Received score update:", message.score);
    document.getElementById("score").innerText = message.score + " points";
  }
});

// Request current score when popup opens
port.postMessage({ action: "getProductivityScore" });

//Start Timer Display
function startTimerDisplay(){
  updateTimerDisplay();
  setInterval(updateTimerDisplay, 1000);
}

// Update Timer Display (for popup)
function updateTimerDisplay() {
  chrome.storage.local.get(['workTime', 'breakTime', 'isOnBreak'], (result) => {
    const time = result.isOnBreak ? result.breakTime : result.workTime;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (result.isOnBreak) {
      // Show break timer section
      document.getElementById("workTimerSection").style.display = "none";
      document.getElementById("breakTimerSection").style.display = "block";
      document.getElementById("breakCountdown").textContent = timerText;
    } else {
      // Show work timer section
      document.getElementById("workTimerSection").style.display = "block";
      document.getElementById("breakTimerSection").style.display = "none";
      document.getElementById("breakTimer").textContent = timerText;
    }
  });
}

// Sync the timer display every second
function startTimerSync() {
  setInterval(updateTimerDisplay, 1000);
}

// Start Break Button (for popup)
document.getElementById("startBreak")?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "startBreak" });
});

// End Break Button (for popup)
document.getElementById("endBreak")?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "endBreak" });
});

// Load Productivity Score (for popup)
function loadProductivityScore() {
  chrome.storage.local.get(['productivityScore'], (result) => {
    const score = result.productivityScore || 0;
    document.getElementById("score").textContent = score;
  });
}
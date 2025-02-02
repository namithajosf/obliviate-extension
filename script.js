let port = chrome.runtime.connect({ name: "popup" });

port.onMessage.addListener((message) => {
    if (message.action === "updateScore") {
        console.log("Received score update:", message.score);
        document.getElementById("score").innerText = message.score + " points";
    }
});

// Request current score when popup opens
port.postMessage({ action: "getProductivityScore" });

// Start Timer Display (for popup)
function startTimerDisplay() {
  updateTimerDisplay(); // Initial update
  setInterval(updateTimerDisplay, 1000); // Update every second
}

// Update Timer Display (for popup)
function updateTimerDisplay() {
  chrome.storage.local.get(['workTime', 'breakTime', 'isOnBreak'], (result) => {
    const time = result.isOnBreak ? result.breakTime : result.workTime;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById("breakTimer").textContent =
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });
}

// Start Break Button (for popup)
document.getElementById("startBreak")?.addEventListener("click", () => {
  // Hide work timer section and show break timer section
  document.getElementById("workTimerSection").style.display = "none";
  document.getElementById("breakTimerSection").style.display = "block";

  // Start the break countdown
  startBreakCountdown();
});

// Start Break Countdown
let breakInterval;
function startBreakCountdown() {
  let breakTime = 5 * 60; // 5 minutes
  const breakCountdownElement = document.getElementById("breakCountdown");

  breakInterval = setInterval(() => {
    if (breakTime > 0) {
      breakTime--;
      const minutes = Math.floor(breakTime / 60);
      const seconds = breakTime % 60;
      breakCountdownElement.textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      endBreak();
    }
  }, 1000);
}

// End Break Button (for popup)
document.getElementById("endBreak")?.addEventListener("click", () => {
  endBreak();
});

// End Break Logic
function endBreak() {
  clearInterval(breakInterval); // Stop the break countdown
  // Switch back to work timer section
  document.getElementById("workTimerSection").style.display = "block";
  document.getElementById("breakTimerSection").style.display = "none";
  // Notify the user
  alert("Break ended! Time to get back to work.");
}

// Load Productivity Score (for popup)
function loadProductivityScore() {
  chrome.storage.local.get(['productivityScore'], (result) => {
    const score = result.productivityScore || 0;
    document.getElementById("score").textContent = score;
  });
}
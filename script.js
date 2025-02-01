// Load saved data when the popup opens
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("settings.html")) {
    loadUserDefinedSites();
  } else {
    loadProductivityScore();
    startTimerDisplay();
  }
});

// Load User-Defined Sites (for settings page)
function loadUserDefinedSites() {
  chrome.storage.local.get(['productiveSites', 'distractingSites'], (result) => {
    const productiveSites = result.productiveSites || [];
    const distractingSites = result.distractingSites || [];

    // Display productive sites
    const productiveList = document.getElementById("productiveSitesList");
    productiveList.innerHTML = productiveSites
      .map(site => `<li>${site}</li>`)
      .join('');

    // Display distracting sites
    const distractingList = document.getElementById("distractingSitesList");
    distractingList.innerHTML = distractingSites
      .map(site => `<li>${site}</li>`)
      .join('');
  });
}

// Add Productive Site (for settings page)
document.getElementById("addProductiveSite")?.addEventListener("click", () => {
  const input = document.getElementById("productiveSiteInput");
  const site = input.value.trim();

  if (site) {
    chrome.storage.local.get(['productiveSites'], (result) => {
      const productiveSites = result.productiveSites || [];
      productiveSites.push(site);
      chrome.storage.local.set({ productiveSites }, () => {
        loadUserDefinedSites(); // Refresh the list
        input.value = ''; // Clear the input
      });
    });
  }
});

// Add Distracting Site (for settings page)
document.getElementById("addDistractingSite")?.addEventListener("click", () => {
  const input = document.getElementById("distractingSiteInput");
  const site = input.value.trim();

  if (site) {
    chrome.storage.local.get(['distractingSites'], (result) => {
      const distractingSites = result.distractingSites || [];
      distractingSites.push(site);
      chrome.storage.local.set({ distractingSites }, () => {
        loadUserDefinedSites(); // Refresh the list
        input.value = ''; // Clear the input
      });
    });
  }
});

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
      endBreak(); // Call endBreak when countdown finishes naturally
    }
  }, 1000);
}

// End Break Button (for popup)
document.getElementById("endBreak")?.addEventListener("click", () => {
  endBreak(); // Call endBreak when user manually ends the break
});

// End Break Logic
function endBreak() {
  clearInterval(breakInterval); // Stop the break countdown
  // Switch back to work timer section
  document.getElementById("workTimerSection").style.display = "block";
  document.getElementById("breakTimerSection").style.display = "none";
  // Notify the user
  showNotification("Break Ended", "Time to get back to work!");
}

// Show Notification
function showNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body: message });
      }
    });
  }
}

// Load Productivity Score (for popup)
function loadProductivityScore() {
  chrome.storage.local.get(['productivityScore'], (result) => {
    const score = result.productivityScore || 0;
    document.getElementById("score").textContent = score;
  });
}
// Load saved data when the popup opens
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("settings.html")) {
    loadUserDefinedSites();
  } else {
    loadProductivityScore();
    updateTimerDisplay();
    startTimerSync(); // Sync the timer display every second
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
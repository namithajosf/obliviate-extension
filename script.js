// Load saved data when the popup opens
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("settings.html")) {
    loadUserDefinedSites();
  } else {
    loadProductivityScore();
    startBreakTimer();
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

// Break Timer Logic (for popup)
let workTime = 25 * 60; // 25 minutes
let timerInterval;

function startBreakTimer() {
  timerInterval = setInterval(() => {
    if (workTime > 0) {
      workTime--;
      const minutes = Math.floor(workTime / 60);
      const seconds = workTime % 60;
      document.getElementById("breakTimer").textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      clearInterval(timerInterval);
      new Notification("Time for a break!");
      workTime = 25 * 60; // Reset timer
    }
  }, 1000);
}

// Start Break Button (for popup)
document.getElementById("startBreak")?.addEventListener("click", () => {
  clearInterval(timerInterval);
  workTime = 5 * 60; // 5-minute break
  startBreakTimer();
});

// Load Productivity Score (for popup)
function loadProductivityScore() {
  chrome.storage.local.get(['productivityScore'], (result) => {
    const score = result.productivityScore || 0;
    document.getElementById("score").textContent = score;
  });
}
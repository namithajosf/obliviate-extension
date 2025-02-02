// Track active tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    const url = new URL(tab.url).hostname;
    console.log(`User is on: ${url}`);
    trackTimeSpent(url);
  });
});

// Break timer logic
let workTime = 25 * 60; // 25 minutes
let breakTime = 5 * 60; // 5 minutes
let timerInterval;
let isOnBreak = false;

// Start the work timer
function startWorkTimer() {
  isOnBreak = false;
  timerInterval = setInterval(() => {
    if (workTime > 0) {
      workTime--;
      chrome.storage.local.set({ workTime, isOnBreak }); // Update storage
    } else {
      clearInterval(timerInterval);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Time for a break!',
        message: 'Take a 5-minute break.'
      });
      workTime = 25 * 60; // Reset work timer
      startBreakTimer();
    }
  }, 1000);
}

// Start the break timer
function startBreakTimer() {
  isOnBreak = true;
  timerInterval = setInterval(() => {
    if (breakTime > 0) {
      breakTime--;
      chrome.storage.local.set({ breakTime, isOnBreak }); // Update storage
    } else {
      clearInterval(timerInterval);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Break over!',
        message: 'Time to get back to work.'
      });
      breakTime = 5 * 60; // Reset break timer
      startWorkTimer();
    }
  }, 1000);
}

// Initialize the timer when the extension loads
chrome.storage.local.get(['workTime', 'breakTime'], (result) => {
  if (result.workTime === undefined || result.breakTime === undefined) {
    chrome.storage.local.set({ workTime: 25 * 60, breakTime: 5 * 60 });
  }
  startWorkTimer();
});

// Listen for messages from the popup to start a break manually
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startBreak") {
    clearInterval(timerInterval);
    workTime = 25 * 60; // Reset work timer
    breakTime = 5 * 60; // Reset break timer
    startBreakTimer();
  }
});
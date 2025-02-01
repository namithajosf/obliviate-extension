// Track active tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      const url = new URL(tab.url).hostname;
      console.log(`User is on: ${url}`);
      trackTimeSpent(url);
    });
  });
  
  // Categorize websites
  const productiveSites = ["notion.so", "github.com"];
  function isProductive(url) {
    return productiveSites.includes(url);
  }
  
  // Track time spent on websites
  function trackTimeSpent(url) {
    chrome.storage.local.get(['timeSpent'], (result) => {
      const timeSpent = result.timeSpent || { productive: 0, distracting: 0 };
      if (isProductive(url)) {
        timeSpent.productive += 1;
      } else {
        timeSpent.distracting += 1;
      }
      chrome.storage.local.set({ timeSpent });
    });
  }
  
  // Break reminder logic
  let workTime = 25 * 60; // 25 minutes
  let breakTime = 5 * 60; // 5 minutes
  
  setInterval(() => {
    if (workTime > 0) {
      workTime--;
    } else {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Time for a break!',
        message: 'Take a 5-minute break.'
      });
      workTime = 25 * 60; // Reset timer
    }
  }, 1000);
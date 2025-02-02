console.log("Background script is running.");

let lastActiveTab = null;
let lastActiveTime = Date.now();

// Example categories (can be modified)
const productiveSites = [
  "stackoverflow.com",
  "github.com",
  "www.notion.so",
  "linkedin.com", 
  "trello.com", 
  "slack.com"
];

const distractingSites = [
  "www.youtube.com",
  "facebook.com",
  "twitter.com",
  "www.instagram.com",
  "www.reddit.com",
  "www.twitch.tv"
];

// Track active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  try {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (!tab || !tab.url) {
        console.error("Tab URL is not valid:", tab);
        return;
      }

      const url = new URL(tab.url).hostname;
      console.log(`User is on: ${url}`);

      if (isProductive(url)) {
        console.log(`${url} is a productive site.`);
      } else if (isDistracting(url)) {
        console.log(`${url} is a distracting site.`);
      } else {
        console.log(`${url} is neither productive nor distracting.`);
      }

      if (lastActiveTab) {
        const timeSpent = (Date.now() - lastActiveTime) / 1000; // Convert ms to seconds
        updateTime(lastActiveTab, timeSpent);
      }

      lastActiveTab = url;
      lastActiveTime = Date.now();
    });
  } catch (error) {
    console.error("Error in tab activation listener:", error);
  }
});

// Categorization functions
function isProductive(url) {
  return productiveSites.includes(url);
}

function isDistracting(url) {
  return distractingSites.includes(url);
}

// Update time spent on a site
function updateTime(url, timeSpent) {
  try {
    chrome.storage.local.get(['timeSpent'], (result) => {
      const timeData = result.timeSpent || { productive: 0, distracting: 0 };

      if (isProductive(url)) {
        timeData.productive += timeSpent;
        console.log(`Time spent on productive site (${url}): ${timeSpent} seconds`);
      } else if (isDistracting(url)) {
        timeData.distracting += timeSpent;
        console.log(`Time spent on distracting site (${url}): ${timeSpent} seconds`);
      } else {
        console.log(`Time spent on neutral site (${url}): ${timeSpent} seconds`);
      }

      // Log the updated timeData object
      console.log('Updated timeData:', timeData);

      chrome.storage.local.set({ timeSpent: timeData });

      // Calculate and log productivity score
      calculateProductivityScore(timeData);
    });
  } catch (error) {
    console.error("Error updating time:", error);
  }
}

// Calculate productivity score
function calculateProductivityScore(timeData) {
  const totalTime = timeData.productive + timeData.distracting;
  if (totalTime === 0) {
    console.log("No time spent yet.");
    return; // Avoid division by zero
  }

  const productivityScore = (timeData.productive / totalTime) * 100; // Percentage of time spent on productive sites
  console.log(`Productivity score: ${productivityScore.toFixed(2)}`);
  
  let popupPort = null;

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup") {
        popupPort = port;
        console.log("Popup connected.");

        // Send the current score when the popup opens
        chrome.storage.local.get("productivityScore", (result) => {
            popupPort.postMessage({ action: "updateScore", score: result.productivityScore || "0.00" });
        });

        port.onDisconnect.addListener(() => {
            console.log("Popup disconnected.");
            popupPort = null;
        });
    }
});

// Function to send updated score when available
function sendScoreToPopup(score) {
    if (popupPort) {
        popupPort.postMessage({ action: "updateScore", score: score });
    } else {
        console.log("Popup is not open, skipping message.");
    }
}


}

// Handle tab closing
chrome.tabs.onRemoved.addListener(() => {
  try {
    if (lastActiveTab) {
      const timeSpent = (Date.now() - lastActiveTime) / 1000;
      updateTime(lastActiveTab, timeSpent);
    }
    lastActiveTab = null;
    lastActiveTime = Date.now();
  } catch (error) {
    console.error("Error in tab removal listener:", error);
  }
});

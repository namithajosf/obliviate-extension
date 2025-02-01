// Load saved data
chrome.storage.local.get(['timeSpent', 'notes'], (result) => {
    const timeSpent = result.timeSpent || { productive: 0, distracting: 0 };
    document.getElementById('productiveTime').textContent = timeSpent.productive;
    document.getElementById('distractingTime').textContent = timeSpent.distracting;
    document.getElementById('score').textContent = timeSpent.productive - timeSpent.distracting;
    document.getElementById('notes').value = result.notes || '';
  });
  
  // Save notes
  document.getElementById('saveNotes').addEventListener('click', () => {
    const notes = document.getElementById('notes').value;
    chrome.storage.local.set({ notes });
  });
  
  // Set break intervals
  document.getElementById('setIntervals').addEventListener('click', () => {
    const workInterval = parseInt(document.getElementById('workInterval').value) * 60;
    const breakInterval = parseInt(document.getElementById('breakInterval').value) * 60;
    if (workInterval && breakInterval) {
      chrome.alarms.create('workTimer', { delayInMinutes: workInterval / 60 });
      chrome.alarms.create('breakTimer', { delayInMinutes: (workInterval + breakInterval) / 60 });
    }
  });
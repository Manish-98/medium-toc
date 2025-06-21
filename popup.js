const DEFAULT_PREFERENCES = {
  showLinks: false,
  includeImages: false
};

document.addEventListener('DOMContentLoaded', function () {
  loadPreferences();

  document.getElementById('saveButton').addEventListener('click', savePreferences);
});

function loadPreferences() {
  chrome.storage.sync.get(DEFAULT_PREFERENCES, function (items) {
    document.getElementById('showLinks').checked = items.showLinks;
    document.getElementById('includeImages').checked = items.includeImages;
  });
}

function savePreferences() {
  const preferences = {
    showLinks: document.getElementById('showLinks').checked,
    includeImages: document.getElementById('includeImages').checked
  };

  chrome.storage.sync.set(preferences, function () {
    showStatus('Settings saved successfully!', 'success');

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('medium.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'preferencesUpdated',
          preferences: preferences
        });
      }
    });
  });
}

function showStatus(message, type) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  statusElement.style.display = 'block';

  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

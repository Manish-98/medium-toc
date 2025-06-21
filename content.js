const DEFAULT_PREFERENCES = {
  showLinks: false,
  focusMode: false,
  defaultTocSize: 'full'
};

let currentPreferences = { ...DEFAULT_PREFERENCES };
let originalBodyContent = null;
let isFocusModeActive = false;

function loadPreferences() {
  chrome.storage.sync.get(DEFAULT_PREFERENCES, function (items) {
    currentPreferences = items;

    if (currentPreferences.focusMode) {
      enableFocusMode();
    } else if (isFocusModeActive) {
      disableFocusMode();
    }
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'preferencesUpdated') {
    currentPreferences = request.preferences;

    if (currentPreferences.focusMode && !isFocusModeActive) {
      enableFocusMode();
    } else if (!currentPreferences.focusMode && isFocusModeActive) {
      disableFocusMode();
    }

    runHeadingDetection('preferences updated');
  }
});

function enableFocusMode() {
  if (isFocusModeActive) return;

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    return;
  }

  originalBodyContent = rootElement.innerHTML;

  const article = document.querySelector('article');
  if (!article) {
    return;
  }

  rootElement.innerHTML = article.outerHTML;

  isFocusModeActive = true;
}

function disableFocusMode() {
  if (!isFocusModeActive || !originalBodyContent) return;

  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = originalBodyContent;
  }

  isFocusModeActive = false;
  originalBodyContent = null;
}

function findHeadings() {
  const allHeadings = Array.from(document.querySelectorAll('h1, h2'));

  const writtenByIndex = allHeadings.findLastIndex(heading => heading.textContent.includes('Written by'));
  if (writtenByIndex !== -1) {
    allHeadings.splice(writtenByIndex, allHeadings.length - writtenByIndex);
  }

  if (allHeadings.length === 0) {
    return [];
  }

  const hierarchy = buildHierarchy(allHeadings);

  let links = [];
  if (currentPreferences.showLinks) {
    links = extractLinks();
  }

  displayHierarchy(hierarchy, links);

  return hierarchy;
}

function extractLinks() {
  const contentSelectors = [
    'article'
  ];

  let contentElement = null;
  for (const selector of contentSelectors) {
    contentElement = document.querySelector(selector);
    if (contentElement) break;
  }

  if (!contentElement) {
    contentElement = document.body;
  }

  const allLinks = Array.from(contentElement.querySelectorAll('a[href]'));

  const links = allLinks
    .filter(link => {
      const href = link.href;
      const dataTestId = link.attributes.getNamedItem('data-testid')?.value;
      const text = link.textContent.trim();

      return text.length > 0 &&
        !href.startsWith('#') &&
        !dataTestId?.includes('authorName') &&
        !href.includes('javascript:') &&
        !text.toLowerCase().includes('share') &&
        !text.toLowerCase().includes('follow') &&
        !text.toLowerCase().includes('subscribe') &&
        !text.toLowerCase().includes('clap') &&
        !text.toLowerCase().includes('comment');
    })
    .map(link => ({
      text: link.textContent.trim(),
      href: link.href,
      title: link.title || '',
      element: link
    }))
    .filter((link, index, self) =>
      index === self.findIndex(l => l.href === link.href)
    );

  return links;
}

function buildHierarchy(headings) {
  const hierarchy = [];
  let currentH1 = null;

  headings.forEach((heading, index) => {
    const headingData = {
      element: heading,
      text: heading.textContent.trim(),
      level: parseInt(heading.tagName.charAt(1)),
      index: index
    };

    if (heading.tagName === 'H1') {
      currentH1 = {
        ...headingData,
        children: []
      };
      hierarchy.push(currentH1);

    } else if (heading.tagName === 'H2') {
      if (currentH1) {
        currentH1.children.push(headingData);
      } else {
        hierarchy.push({
          ...headingData,
          children: []
        });
      }
    }
  });

  return hierarchy;
}

function displayHierarchy(hierarchy, links = []) {
  if (hierarchy.length === 0) {
    return;
  }

  hierarchy.forEach((section, sectionIndex) => {
    if (section.children && section.children.length > 0) {
      section.children.forEach((child, childIndex) => {
      });
    }
  });

  if (window.TOCHelper && window.TOCHelper.createTOCComponent) {
    window.TOCHelper.createTOCComponent(hierarchy, links, currentPreferences.defaultTocSize);
  } else {
    console.warn('TOCHelper not available, TOC component not created');
  }
}

let lastRunTime = 0;
const runInterval = 300;
function runHeadingDetection(reason) {
  const now = Date.now();
  if (now - lastRunTime >= runInterval) {
    lastRunTime = now;
    findHeadings();
  }
}

loadPreferences();

window.addEventListener('DOMContentLoaded', () => runHeadingDetection('DOM loaded'));
window.addEventListener('popstate', () => runHeadingDetection('navigation'));
window.addEventListener('hashchange', () => runHeadingDetection('hash'));
window.addEventListener('load', () => runHeadingDetection('page load'));

let currentUrl = location.href;
setInterval(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    runHeadingDetection('SPA navigation');
  }
}, 1000);

const observer = new MutationObserver((mutations) => {
  let significantChange = false;
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const hasHeadings = node.matches && (
            node.matches('h1, h2') ||
            node.querySelector('h1, h2')
          );
          if (hasHeadings) {
            significantChange = true;
          }
        }
      });
    }
  });

  if (significantChange) {
    runHeadingDetection('DOM change');
  }
});
observer.observe(document.body, { childList: true, subtree: true });

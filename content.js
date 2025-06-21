console.log('Medium TOC Extension loaded');

const DEFAULT_PREFERENCES = {
  showLinks: false,
  includeImages: false
};

let currentPreferences = { ...DEFAULT_PREFERENCES };

function loadPreferences() {
  chrome.storage.sync.get(DEFAULT_PREFERENCES, function (items) {
    currentPreferences = items;
    console.log('Loaded preferences:', currentPreferences);
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'preferencesUpdated') {
    currentPreferences = request.preferences;
    console.log('Preferences updated:', currentPreferences);
    runHeadingDetection('preferences updated');
  }
});

function findHeadings() {
  console.log('Looking for H1 and H2 headings...');
  const allHeadings = Array.from(document.querySelectorAll('h1, h2'));

  const writtenByIndex = allHeadings.findLastIndex(heading => heading.textContent.includes('Written by'));
  if (writtenByIndex !== -1) {
    allHeadings.splice(writtenByIndex, allHeadings.length - writtenByIndex);
  }

  console.log(`Found ${allHeadings.length} total headings (H1 + H2)`);

  if (allHeadings.length === 0) {
    console.log('No H1 or H2 headings found on this page');
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
  console.log('Extracting links from the blog...');

  const contentSelectors = [
    'article'
  ];

  let contentElement = null;
  for (const selector of contentSelectors) {
    contentElement = document.querySelector(selector);
    if (contentElement) break;
  }

  if (!contentElement) {
    console.log('Could not find main content area, searching entire page');
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

  console.log(`Extracted ${links.length} unique links`);
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
  console.log('\n=== HIERARCHICAL STRUCTURE ===');

  if (hierarchy.length === 0) {
    console.log('No hierarchy created');
    return;
  }

  hierarchy.forEach((section, sectionIndex) => {
    console.log(`${sectionIndex + 1}. ${section.level === 1 ? 'H1' : 'H2'}: "${section.text}"`);

    if (section.children && section.children.length > 0) {
      section.children.forEach((child, childIndex) => {
        console.log(`   ${sectionIndex + 1}.${childIndex + 1}. H2: "${child.text}"`);
      });
    }

    if (sectionIndex < hierarchy.length - 1) {
      console.log('');
    }
  });

  const totalH1 = hierarchy.filter(item => item.level === 1).length;
  const totalH2 = hierarchy.reduce((count, item) => count + (item.children ? item.children.length : 0), 0);
  const orphanedH2 = hierarchy.filter(item => item.level === 2).length;

  console.log('\n=== SUMMARY ===');
  console.log(`Total H1 sections: ${totalH1}`);
  console.log(`Total H2 subsections: ${totalH2}`);
  if (orphanedH2 > 0) {
    console.log(`Orphaned H2s (no parent H1): ${orphanedH2}`);
  }

  if (currentPreferences.showLinks && links.length > 0) {
    console.log('\n=== EXTRACTED LINKS ===');
    links.forEach((link, index) => {
      console.log(`${index + 1}. "${link.text}"`);
      console.log(`   URL: ${link.href}`);
      if (link.title) {
        console.log(`   Title: ${link.title}`);
      }
      console.log('');
    });
    console.log(`Total links found: ${links.length}`);
  }

  if (window.TOCHelper && window.TOCHelper.createTOCComponent) {
    window.TOCHelper.createTOCComponent(hierarchy, links);
  } else {
    console.warn('TOCHelper not available, TOC component not created');
  }
}

let lastRunTime = 0;
const runInterval = 300;
function runHeadingDetection(reason) {
  const now = Date.now();
  console.log(`now: ${now}, lastRunTime: ${lastRunTime}, runInterval: ${runInterval}`);
  if (now - lastRunTime >= runInterval) {
    lastRunTime = now;
    console.log(`\n🔍 Running heading detection on: ${window.location.href} (${reason})`);
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
    console.log('\n🔄 Significant DOM changes detected, re-checking headings...');
    runHeadingDetection('DOM change');
  }
});
observer.observe(document.body, { childList: true, subtree: true });

console.log('✅ URL change detection and DOM observer set up');
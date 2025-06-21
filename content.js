console.log('Medium TOC Extension loaded');

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

  displayHierarchy(hierarchy);

  return hierarchy;
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

function displayHierarchy(hierarchy) {
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
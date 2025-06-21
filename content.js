function findHeadings() {
  console.log('Looking for H1 and H2 headings...');
  const h1Tags = document.querySelectorAll('h1');
  const h2Tags = document.querySelectorAll('h2');
  
  console.log(`Found ${h1Tags.length} H1 tags:`, h1Tags);
  console.log(`Found ${h2Tags.length} H2 tags:`, h2Tags);
  
  const allHeadings = [...h1Tags, ...h2Tags];
  
  if (allHeadings.length > 0) {
    console.log('All headings found:');
    allHeadings.forEach((heading, index) => {
      console.log(`${index + 1}. ${heading.tagName}: "${heading.textContent.trim()}"`);
    });
  } else {
    console.log('No H1 or H2 headings found on this page');
  }
  
  return allHeadings;
}

function runHeadingDetection() {
  console.log(`Running heading detection on: ${window.location.href}`);
  
  setTimeout(() => {
    findHeadings();
  }, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runHeadingDetection);
} else {
  runHeadingDetection();
}

let currentUrl = window.location.href;

function checkForUrlChange() {
  if (window.location.href !== currentUrl) {
    const oldUrl = currentUrl;
    currentUrl = window.location.href;
    
    console.log(`URL changed from: ${oldUrl}`);
    console.log(`URL changed to: ${currentUrl}`);
    
    runHeadingDetection();
  }
}

setInterval(checkForUrlChange, 500);

const observer = new MutationObserver((mutations) => {
  checkForUrlChange();
  
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
    console.log('Significant DOM changes detected, re-checking headings...');
    setTimeout(() => {
      findHeadings();
    }, 500);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('URL change detection and DOM observer set up');
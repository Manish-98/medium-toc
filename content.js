console.log('Medium TOC Extension loaded');

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', findHeadings);
} else {
  setTimeout(findHeadings, 1000);
}
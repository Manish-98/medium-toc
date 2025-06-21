function removeExistingTOC() {
  const existingTOC = document.getElementById('medium-toc-extension');
  if (existingTOC) {
    existingTOC.remove();
  }
}

function createTOCContainer() {
  const tocContainer = document.createElement('div');
  tocContainer.id = 'medium-toc-extension';
  tocContainer.className = 'medium-toc-container';
  return tocContainer;
}

function createTOCHeader() {
  const header = document.createElement('div');
  header.className = 'medium-toc-header';
  
  const title = document.createElement('span');
  title.textContent = 'Table of Contents';
  header.appendChild(title);
  
  return header;
}

function createMinimizeButton(container) {
  const minimizeButton = document.createElement('button');
  minimizeButton.className = 'medium-toc-minimize-button';
  minimizeButton.textContent = '−';
  minimizeButton.title = 'Minimize';
  
  minimizeButton.onclick = () => {
    const isMinimized = container.classList.contains('minimized');
    console.log('Minimize button clicked. Current state:', isMinimized ? 'minimized' : 'expanded');
    
    if (isMinimized) {
      container.classList.remove('minimized');
      minimizeButton.textContent = '−';
      minimizeButton.title = 'Minimize';
      console.log('Expanding TOC container');
      
      // Move button back to header
      const header = container.querySelector('.medium-toc-header');
      if (header) {
        header.appendChild(minimizeButton);
      }
    } else {
      container.classList.add('minimized');
      minimizeButton.textContent = '+';
      minimizeButton.title = 'Expand';
      console.log('Minimizing TOC container');
      
      // Move button directly to container for visibility
      container.appendChild(minimizeButton);
    }
    
    console.log('Container classes after toggle:', container.className);
  };
  
  return minimizeButton;
}

function createSectionLink(section, sectionIndex) {
  const sectionLink = document.createElement('a');
  sectionLink.textContent = `${sectionIndex + 1}. ${section.text}`;
  sectionLink.className = 'medium-toc-section-link';
  sectionLink.href = '#';
  sectionLink.onclick = (e) => {
    e.preventDefault();
    section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return sectionLink;
}

function createChildLink(child, sectionIndex, childIndex) {
  const childLink = document.createElement('a');
  childLink.textContent = `${sectionIndex + 1}.${childIndex + 1}. ${child.text}`;
  childLink.className = 'medium-toc-child-link';
  childLink.href = '#';
  childLink.onclick = (e) => {
    e.preventDefault();
    child.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return childLink;
}

function createChildItem(child, sectionIndex, childIndex) {
  const childItem = document.createElement('div');
  childItem.className = 'medium-toc-child-item';
  
  const childLink = createChildLink(child, sectionIndex, childIndex);
  childItem.appendChild(childLink);
  
  return childItem;
}

function createSectionItem(section, sectionIndex) {
  const sectionItem = document.createElement('div');
  sectionItem.className = 'medium-toc-section-item';

  const sectionLink = createSectionLink(section, sectionIndex);
  sectionItem.appendChild(sectionLink);

  if (section.children && section.children.length > 0) {
    section.children.forEach((child, childIndex) => {
      const childItem = createChildItem(child, sectionIndex, childIndex);
      sectionItem.appendChild(childItem);
    });
  }

  return sectionItem;
}

function populateTOCContent(container, hierarchy) {
  hierarchy.forEach((section, sectionIndex) => {
    const sectionItem = createSectionItem(section, sectionIndex);
    container.appendChild(sectionItem);
  });
}

function createTOCComponent(hierarchy) {
  if (hierarchy.length === 0) {
    return;
  }

  removeExistingTOC();
  
  const tocContainer = createTOCContainer();
  const header = createTOCHeader();
  const minimizeButton = createMinimizeButton(tocContainer);
  
  header.appendChild(minimizeButton);
  tocContainer.appendChild(header);
  
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'medium-toc-content';
  
  populateTOCContent(contentWrapper, hierarchy);
  tocContainer.appendChild(contentWrapper);
  
  document.body.appendChild(tocContainer);
}

window.TOCHelper = {
  createTOCComponent,
  removeExistingTOC,
  createTOCContainer,
  createTOCHeader,
  createMinimizeButton,
  createSectionLink,
  createChildLink,
  createChildItem,
  createSectionItem,
  populateTOCContent
}; 
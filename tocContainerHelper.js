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

function createLinkItem(link, linkIndex) {
  const linkItem = document.createElement('div');
  linkItem.className = 'medium-toc-link-item';

  const numberSpan = document.createElement('span');
  numberSpan.textContent = `${linkIndex + 1}. `;
  numberSpan.className = 'medium-toc-link-number';

  const linkElement = document.createElement('a');
  linkElement.textContent = link.text;
  linkElement.className = 'medium-toc-link';
  linkElement.href = link.href;
  linkElement.target = '_blank';
  linkElement.rel = 'noopener noreferrer';
  linkElement.title = link.title || link.href;

  linkItem.appendChild(numberSpan);
  linkItem.appendChild(linkElement);
  return linkItem;
}

function createLinksSection(links) {
  if (!links || links.length === 0) {
    return null;
  }

  const linksSection = document.createElement('div');
  linksSection.className = 'medium-toc-links-section';

  const linksHeader = document.createElement('div');
  linksHeader.className = 'medium-toc-links-header';
  linksHeader.textContent = 'Links';
  linksSection.appendChild(linksHeader);

  const linksList = document.createElement('div');
  linksList.className = 'medium-toc-links-list';

  links.forEach((link, index) => {
    const linkItem = createLinkItem(link, index);
    linksList.appendChild(linkItem);
  });

  linksSection.appendChild(linksList);
  return linksSection;
}

function populateTOCContent(container, hierarchy, links = []) {
  hierarchy.forEach((section, sectionIndex) => {
    const sectionItem = createSectionItem(section, sectionIndex);
    container.appendChild(sectionItem);
  });

  // Add links section if links are provided
  if (links && links.length > 0) {
    const linksSection = createLinksSection(links);
    if (linksSection) {
      container.appendChild(linksSection);
    }
  }
}

function createTOCComponent(hierarchy, links = []) {
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

  populateTOCContent(contentWrapper, hierarchy, links);
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
  populateTOCContent,
  createLinkItem,
  createLinksSection
}; 
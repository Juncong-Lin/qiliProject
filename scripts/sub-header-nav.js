// Sub-header navigation functionality
class SubHeaderNavigation {
  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Add click event listeners to all sub-header links
    const subHeaderLinks = document.querySelectorAll('.sub-header-link');
    subHeaderLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        this.handleNavigation(event);
      });
    });
  }
  handleNavigation(event) {
    event.preventDefault();
    const clickedLink = event.target;
    const category = clickedLink.textContent.trim();

    // Remove active class from all links
    document.querySelectorAll('.sub-header-link').forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to clicked link
    clickedLink.classList.add('active');

    // Handle different category actions
    switch(category) {
      case 'All Products':
        if (typeof loadAllProducts === 'function') {
          loadAllProducts();
        } else {
          // Fallback to navigate to index page
          window.location.href = 'index.html';
        }
        break;
      case 'Print Heads':
        this.handlePrintHeadsNavigation();
        break;
      case 'Inkjet Printers':
        this.handleInkjetPrintersNavigation();
        break;
      case 'Print Spare Parts':
        this.handlePrintSparePartsNavigation();
        break;
      case 'Upgrading Kit':
        this.handleCategoryNavigation('Upgrading Kit');
        break;
      case 'Material':
        this.handleCategoryNavigation('Material');
        break;
      case 'LED & LCD':
        this.handleCategoryNavigation('LED & LCD');
        break;
      case 'Laser':
        this.handleCategoryNavigation('Laser');
        break;
      case 'Cutting':
        this.handleCategoryNavigation('Cutting');
        break;
      case 'Channel Letter':
        this.handleCategoryNavigation('Channel Letter');
        break;
      case 'CNC':
        this.handleCategoryNavigation('CNC');
        break;
      case 'Displays':
        this.handleCategoryNavigation('Displays');
        break;
      case 'Other':
        this.handleCategoryNavigation('Other');
        break;
      default:
        console.log(`Navigating to ${category} category`);
        break;
    }
  }
  handlePrintHeadsNavigation() {
    // Navigate to index page if not already there, then show all printhead products
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      // We're on the main page, show expanded Print Heads menu
      this.expandPrintHeadsMenu();
    } else {
      // Navigate to index page with print heads focus
      window.location.href = 'index.html#printheads';
    }
  }

  handleInkjetPrintersNavigation() {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      // We're on the main page, show expanded Inkjet Printers menu
      this.expandInkjetPrintersMenu();
    } else {
      // Navigate to index page with inkjet printers focus
      window.location.href = 'index.html#inkjet-printers';
    }
  }

  handlePrintSparePartsNavigation() {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      // We're on the main page, show expanded Print Spare Parts menu
      this.expandPrintSparePartsMenu();
    } else {
      // Navigate to index page with print spare parts focus
      window.location.href = 'index.html#print-spare-parts';
    }
  }

  handleCategoryNavigation(category) {
    // For other categories, navigate to index page or show relevant content
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      console.log(`Showing ${category} category`);
      // You can add specific filtering logic here when implemented
    } else {
      // Navigate to index page
      window.location.href = 'index.html';
    }
  }

  expandPrintHeadsMenu() {
    // Find and expand the Print Heads menu in sidebar
    const printHeadsLink = document.querySelector('a[href="javascript:void(0)"][onclick*="expandable"]:not([onclick*="loadAllProducts"])');
    if (printHeadsLink && printHeadsLink.textContent.includes('Print Heads')) {
      printHeadsLink.click();
    }
  }

  expandInkjetPrintersMenu() {
    // Find and expand the Inkjet Printers menu in sidebar
    const inkjetLink = document.querySelector('a.expandable[href="javascript:void(0)"]:not([onclick])');
    if (inkjetLink && inkjetLink.textContent.includes('Inkjet Printers')) {
      inkjetLink.click();
    }
  }

  expandPrintSparePartsMenu() {
    // Find and expand the Print Spare Parts menu in sidebar
    const sparePartsLink = Array.from(document.querySelectorAll('a.expandable[href="javascript:void(0)"]'))
      .find(link => link.textContent.includes('Print Spare Parts'));
    if (sparePartsLink) {
      sparePartsLink.click();
    }
  }
  // Method to set active link based on current page/category
  setActiveCategory(category) {
    document.querySelectorAll('.sub-header-link').forEach(link => {
      link.classList.remove('active');
      if (link.textContent.trim() === category) {
        link.classList.add('active');
      }
    });
  }

  // Handle URL hash navigation
  handleHashNavigation(hash) {
    switch(hash) {
      case 'printheads':
        this.setActiveCategory('Print Heads');
        this.expandPrintHeadsMenu();
        break;
      case 'inkjet-printers':
        this.setActiveCategory('Inkjet Printers');
        this.expandInkjetPrintersMenu();
        break;
      case 'print-spare-parts':
        this.setActiveCategory('Print Spare Parts');
        this.expandPrintSparePartsMenu();
        break;
      default:
        this.setActiveCategory('All Products');
        break;
    }
  }
}

// Initialize sub-header navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.subHeaderNav = new SubHeaderNavigation();
  
  // Handle URL hash navigation
  const hash = window.location.hash.substring(1);
  if (hash) {
    window.subHeaderNav.handleHashNavigation(hash);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubHeaderNavigation;
}

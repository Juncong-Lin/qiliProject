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
  }  handlePrintHeadsNavigation() {
    // Navigate to index page if not already there, then show all printhead products
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      // We're on the main page, show all printhead products
      this.expandPrintHeadsMenu();
      
      // Show all printhead products combined
      if (typeof window.loadAllPrintheadProducts === 'function') {
        // Reset scroll position before loading products to prevent jumping
        window.scrollTo(0, 0);
        
        // Load products with a small delay
        setTimeout(() => {
          window.loadAllPrintheadProducts();
          
          // Update URL hash without causing page reload
          if (history.pushState) {
            history.pushState(null, null, '#printheads');
          } else {
            location.hash = '#printheads';
          }
        }, 50);
      }
    } else {
      // Navigate to index page with print heads focus
      // Add a parameter to indicate this is a direct navigation to prevent auto-scrolling
      window.location.href = 'index.html#printheads?noscroll=true';
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
  }  // Handle URL hash navigation
  handleHashNavigation(hash) {
    console.log('Handling hash navigation for:', hash);
    
    // Check if this is a brand-specific printhead hash (e.g., 'printheads-epson')
    if (hash.startsWith('printheads-')) {
      const brand = hash.replace('printheads-', '');
      console.log('Loading brand-specific printheads for:', brand);
      
      this.setActiveCategory('Print Heads');
      this.expandPrintHeadsMenu();
      
      // Load brand-specific printhead products only if we're on the index page
      if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        if (typeof window.loadPrintheadProducts === 'function') {
          console.log('Loading printhead products for brand:', brand);
          
          // Prevent automatic scrolling when loading through hash navigation
          const originalScrollToProducts = window.scrollToProducts;
          if (originalScrollToProducts) {
            // Temporarily disable the scroll function
            window.scrollToProducts = function() {
              // Do a gentler scroll or no scroll at all
              window.scrollTo({
                top: 0,
                behavior: 'auto'
              });
            };
            
            // Load brand-specific products
            setTimeout(() => {
              window.loadPrintheadProducts(brand);
              
              // Restore original function after a delay
              setTimeout(() => {
                window.scrollToProducts = originalScrollToProducts;
              }, 500);
            }, 100);
          } else {
            // If scrollToProducts isn't defined, just load products normally
            setTimeout(() => window.loadPrintheadProducts(brand), 100);
          }
        } else {
          console.warn('loadPrintheadProducts function not available');
        }
      }
      return; // Exit early since we handled the brand-specific case
    }
    
    // First set the active category in the sub-header
    switch(hash) {      case 'printheads':
        this.setActiveCategory('Print Heads');
        
        // Expand the print heads menu in the sidebar
        this.expandPrintHeadsMenu();
          // Load all printhead products only if we're on the index page
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
          if (typeof window.loadAllPrintheadProducts === 'function') {
            console.log('Loading all printhead products');
            
            // Prevent automatic scrolling when loading through hash navigation
            const originalScrollToProducts = window.scrollToProducts;
            if (originalScrollToProducts) {
              // Temporarily disable the scroll function
              window.scrollToProducts = function() {
                // Do a gentler scroll or no scroll at all
                window.scrollTo({
                  top: 0,
                  behavior: 'auto'
                });
              };
              
              // Load products
              setTimeout(() => {
                window.loadAllPrintheadProducts();
                
                // Restore original function after a delay
                setTimeout(() => {
                  window.scrollToProducts = originalScrollToProducts;
                }, 500);
              }, 100);
            } else {
              // If scrollToProducts isn't defined, just load products normally
              setTimeout(() => window.loadAllPrintheadProducts(), 100);
            }
          } else {
            console.warn('loadAllPrintheadProducts function not available');
          }
        }
        break;
        
      case 'inkjet-printers':
        this.setActiveCategory('Inkjet Printers');
        this.expandInkjetPrintersMenu();
        break;
        
      case 'print-spare-parts':
        this.setActiveCategory('Print Spare Parts');
        this.expandPrintSparePartsMenu();
        break;
        
      case 'upgrading-kit':
        this.setActiveCategory('Upgrading Kit');
        break;
        
      case 'material':
        this.setActiveCategory('Material');
        break;
        
      case 'led-lcd':
        this.setActiveCategory('LED & LCD');
        break;
        
      case 'laser':
        this.setActiveCategory('Laser');
        break;
        
      case 'cutting':
        this.setActiveCategory('Cutting');
        break;
        
      case 'channel-letter':
        this.setActiveCategory('Channel Letter');
        break;
        
      case 'cnc':
        this.setActiveCategory('CNC');
        break;
        
      case 'displays':
        this.setActiveCategory('Displays');
        break;
        
      case 'other':
        this.setActiveCategory('Other');
        break;
        
      default:
        this.setActiveCategory('All Products');
        if (typeof window.loadAllProducts === 'function') {
          window.loadAllProducts();
        }
        break;
    }
  }
}

// Helper function to check if we should avoid scrolling based on URL
function shouldAvoidScroll() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('noscroll');
}

// Initialize sub-header navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.subHeaderNav = new SubHeaderNavigation();
    // Handle URL hash navigation on initial page load
  let hash = window.location.hash.substring(1);
  
  // Check if the hash contains parameters to prevent scrolling
  const shouldSkipScroll = window.location.search.includes('noscroll=true') || 
                          hash.includes('noscroll=true');
  
  // Clean up the hash by removing any parameters
  if (hash.includes('?')) {
    hash = hash.split('?')[0];
  }
  
  if (hash) {
    // If we should skip scrolling, temporarily disable the scroll function
    if (shouldSkipScroll && window.scrollToProducts) {
      const originalScrollToProducts = window.scrollToProducts;
      window.scrollToProducts = function() { /* do nothing */ };
      
      // Process the hash navigation
      window.subHeaderNav.handleHashNavigation(hash);
      
      // Restore the original function after a delay
      setTimeout(() => {
        window.scrollToProducts = originalScrollToProducts;
      }, 1000);
    } else {
      // Normal hash navigation
      window.subHeaderNav.handleHashNavigation(hash);
    }
  }
  
  // Also listen for hash changes while on the page
  window.addEventListener('hashchange', function() {
    let newHash = window.location.hash.substring(1);
    
    // Clean up the hash by removing any parameters
    if (newHash.includes('?')) {
      newHash = newHash.split('?')[0];
    }
    
    if (newHash) {
      window.subHeaderNav.handleHashNavigation(newHash);
    }
  });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubHeaderNavigation;
}

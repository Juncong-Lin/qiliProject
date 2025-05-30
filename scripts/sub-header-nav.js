// Sub-header navigation functionality
class SubHeaderNavigation {
  constructor() {
    this.activeSubmenu = null;
    this.submenuTimeout = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Add event listeners to all sub-header links with submenus
    const subHeaderLinks = document.querySelectorAll('.sub-header-link[data-submenu]');
    const submenus = document.querySelectorAll('.sub-header-submenu');
    
    subHeaderLinks.forEach(link => {
      // Mouse enter - show submenu
      link.addEventListener('mouseenter', (event) => {
        this.showSubmenu(event.target);
      });
      
      // Mouse leave - hide submenu with delay
      link.addEventListener('mouseleave', (event) => {
        this.hideSubmenuWithDelay();
      });      // Click event for both submenu toggle and navigation
      link.addEventListener('click', (event) => {
        const submenuId = link.getAttribute('data-submenu');
        const linkText = link.textContent.trim();
        
        // Check if we're on the index page by looking for product grid or if load functions exist
        const isIndexPage = window.loadSpecificCategory && window.loadAllPrintheadProducts;          // Handle navigation based on the category
        let hash = '';
        if (linkText === 'Inkjet Printers') {
            hash = '#inkjet-printers';
        } else if (linkText === 'Print Heads') {
            hash = '#print-heads';
        } else if (linkText === 'Print Spare Parts') {
            hash = '#print-spare-parts';
        } else if (linkText === 'Upgrading Kit') {
            hash = '#upgrading-kit';
        } else if (linkText === 'Material') {
            hash = '#material';
        } else if (linkText === 'LED & LCD') {
            hash = '#led-lcd';
        } else if (linkText === 'Laser') {
            hash = '#laser';
        } else if (linkText === 'Cutting') {
            hash = '#cutting';
        } else if (linkText === 'Channel Letter') {
            hash = '#channel-letter';
        } else if (linkText === 'CNC') {
            hash = '#cnc';
        } else if (linkText === 'Displays') {
            hash = '#displays';
        } else if (linkText === 'Other') {
            hash = '#other';
        }

        if (isIndexPage) {
          // We're on index page - use existing category loading functions
          if (linkText === 'Inkjet Printers' && window.loadSpecificCategory) {
            window.loadSpecificCategory('Inkjet Printers');
            this.setActiveCategory('Inkjet Printers');
            window.location.hash = hash;
          } else if (linkText === 'Print Heads' && window.loadAllPrintheadProducts) {
            window.loadAllPrintheadProducts();
            this.setActiveCategory('Print Heads');
            window.location.hash = hash;
          } else if (linkText === 'Print Spare Parts' && window.loadSpecificCategory) {
            window.loadSpecificCategory('Print Spare Parts');
            this.setActiveCategory('Print Spare Parts');
            window.location.hash = hash;
          } else if (linkText === 'Upgrading Kit' && window.loadSpecificCategory) {
            window.loadSpecificCategory('Upgrading Kit');
            this.setActiveCategory('Upgrading Kit');
          }          else if (linkText === 'Material' && window.loadSpecificCategory) {
            window.loadSpecificCategory('Material');
            this.setActiveCategory('Material');
            window.location.hash = hash;
          } else if (linkText === 'LED & LCD' && window.loadSpecificCategory) {
            window.loadSpecificCategory('LED & LCD');
            this.setActiveCategory('LED & LCD');
            window.location.hash = hash;
          } else if (linkText === 'Laser' && window.loadSpecificCategory) {
            window.loadSpecificCategory('Laser');
            this.setActiveCategory('Laser');
            window.location.hash = hash;          } else if (linkText === 'Cutting' && window.loadSpecificCategory) {
            window.loadSpecificCategory('Cutting');
            this.setActiveCategory('Cutting');
            window.location.hash = hash;
          } else if (linkText === 'Channel Letter' && window.loadSpecificCategory) {
            window.loadSpecificCategory('Channel Letter');
            this.setActiveCategory('Channel Letter');
            window.location.hash = hash;
          } else if (linkText === 'CNC' && window.loadSpecificCategory) {
            window.loadSpecificCategory('CNC');
            this.setActiveCategory('CNC');
            window.location.hash = hash;          } else if (linkText === 'Displays' && window.loadSpecificCategory) {
            window.loadSpecificCategory('Displays');
            this.setActiveCategory('Displays');
            window.location.hash = hash;
          } else if (linkText === 'Other' && window.loadSpecificCategory) {
            window.loadSpecificCategory('Other');
            this.setActiveCategory('Other');
            window.location.hash = hash;
          }
        } else {
          // We're on a different page - navigate to index page with hash
          event.preventDefault();
          
          if (linkText === 'Inkjet Printers') {
            hash = '#inkjet-printers';
          } else if (linkText === 'Print Heads') {
            hash = '#print-heads';
          } else if (linkText === 'Print Spare Parts') {
            hash = '#print-spare-parts';
          } else if (linkText === 'Upgrading Kit') {
            hash = '#upgrading-kit';
          } else if (linkText === 'Material') {
            hash = '#material';
          } else if (linkText === 'LED & LCD') {
            hash = '#led-lcd';
          } else if (linkText === 'Laser') {
            hash = '#laser';
          } else if (linkText === 'Cutting') {
            hash = '#cutting';
          } else if (linkText === 'Channel Letter') {
            hash = '#channel-letter';
          } else if (linkText === 'CNC') {
            hash = '#cnc';
          } else if (linkText === 'Displays') {
            hash = '#displays';
          } else if (linkText === 'Other') {
            hash = '#other';
          }
          
          // Navigate to index page with the appropriate hash
          if (hash) {
            window.location.href = 'index.html' + hash;
            return;
          }
        }
        
        // For mobile: toggle submenu display
        if (submenuId) {
          this.toggleSubmenu(event.target);
        }
        
        // Don't prevent default to allow any additional onclick handlers
        return true;
      });
    });
    
    // Add event listeners to submenus themselves
    submenus.forEach(submenu => {
      submenu.addEventListener('mouseenter', () => {
        this.clearSubmenuTimeout();
      });
      
      submenu.addEventListener('mouseleave', () => {
        this.hideSubmenuWithDelay();
      });
    });
    
    // Hide submenu when clicking outside
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.sub-header') && !event.target.closest('.sub-header-submenu')) {
        this.hideAllSubmenus();
      }
    });
      // Handle "See All Departments" link separately
    const allProductsLink = document.querySelector('.all-products-link');
    if (allProductsLink) {
      allProductsLink.addEventListener('click', (event) => {
        event.preventDefault();
        this.hideAllSubmenus();
        
        // Check if we're on the index page
        const isIndexPage = window.loadAllProducts && typeof window.loadAllProducts === 'function';
        
        if (isIndexPage) {
          // We're on index page - use existing function
          this.setActiveCategory('See All Departments');
          window.loadAllProducts();
        } else {
          // We're on a different page - navigate to index page
          window.location.href = 'index.html';
        }
      });
    }
  }

  showSubmenu(link) {
    this.clearSubmenuTimeout();
    const submenuId = link.getAttribute('data-submenu');
    
    if (submenuId) {
      // Hide all other submenus
      this.hideAllSubmenus();
      
      // Show the target submenu
      const submenu = document.getElementById(`submenu-${submenuId}`);
      if (submenu) {
        submenu.classList.add('active');
        this.activeSubmenu = submenu;
      }
      
      // Update active state
      this.setActiveCategory(link.textContent.trim());
    }
  }

  hideSubmenuWithDelay() {
    this.submenuTimeout = setTimeout(() => {
      this.hideAllSubmenus();
    }, 300); // 300ms delay
  }

  clearSubmenuTimeout() {
    if (this.submenuTimeout) {
      clearTimeout(this.submenuTimeout);
      this.submenuTimeout = null;
    }
  }

  toggleSubmenu(link) {
    const submenuId = link.getAttribute('data-submenu');
    
    if (submenuId) {
      const submenu = document.getElementById(`submenu-${submenuId}`);
      
      if (submenu && submenu.classList.contains('active')) {
        this.hideAllSubmenus();
      } else {
        this.showSubmenu(link);
      }
    }
  }
  hideAllSubmenus() {
    this.clearSubmenuTimeout();
    const activeSubmenus = document.querySelectorAll('.sub-header-submenu.active');
    activeSubmenus.forEach(submenu => {
      submenu.classList.remove('active');
    });
    this.activeSubmenu = null;
  }

  // Method to set active link based on current page/category
  setActiveCategory(category) {
    document.querySelectorAll('.sub-header-link').forEach(link => {
      link.classList.remove('active');
      if (link.textContent.trim() === category) {
        link.classList.add('active');
      }
    });
  }// Handle URL hash navigation
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
    switch(hash) {
      case 'print-heads':
      case 'printheads':
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
        this.setActiveCategory('See All Departments');
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
  // Check if we're using shared subheader (placeholder exists)
  const hasSharedSubheader = document.getElementById('shared-subheader-placeholder');
  
  // Only auto-initialize if NOT using shared subheader
  if (!hasSharedSubheader) {
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
  }
  
  // Always listen for hash changes while on the page
  window.addEventListener('hashchange', function() {
    let newHash = window.location.hash.substring(1);
    
    // Clean up the hash by removing any parameters
    if (newHash.includes('?')) {
      newHash = newHash.split('?')[0];
    }
    
    if (newHash && window.subHeaderNav && window.subHeaderNav.handleHashNavigation) {
      window.subHeaderNav.handleHashNavigation(newHash);
    }
  });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubHeaderNavigation;
}

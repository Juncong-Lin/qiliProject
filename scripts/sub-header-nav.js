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
          }          // Navigate to index page with the appropriate hash
          if (hash) {
            UrlUtils.navigateToIndex(hash);
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
    });    // "See All Departments" link was removed - navigation now starts directly with categories
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
    
    // Synchronize with category navigation in yellow line
    this.syncCategoryNavigation(category);
  }
  
  // Method to synchronize the category navigation in yellow line
  syncCategoryNavigation(category) {
    // Only proceed if we're on a page with the category navigation
    const categoryLinks = document.querySelectorAll('.category-nav-link');
    if (categoryLinks.length === 0) return;
    
    // Update active state for category navigation
    categoryLinks.forEach(link => {
      link.classList.remove('active');
      if (link.textContent.trim() === category) {
        link.classList.add('active');
      }
    });
  }

  // Methods to expand sidebar menus (for navigation compatibility)
  expandPrintHeadsMenu() {
    // Find and expand the print heads menu in the sidebar if it exists
    const printHeadsLink = document.querySelector('[onclick*="loadAllPrintheadProducts"]');
    if (printHeadsLink) {
      const submenu = printHeadsLink.nextElementSibling;
      if (submenu && submenu.classList.contains('submenu')) {
        printHeadsLink.classList.add('expanded');
        submenu.style.display = 'block';
      }
    }
  }

  expandInkjetPrintersMenu() {
    // Find and expand the inkjet printers menu in the sidebar if it exists
    const inkjetLink = document.querySelector('[onclick*="loadSpecificCategory"][onclick*="Inkjet Printers"]:not([onclick*="Eco-Solvent"]):not([onclick*="UV"]):not([onclick*="Solvent"])');
    if (inkjetLink) {
      const submenu = inkjetLink.nextElementSibling;
      if (submenu && submenu.classList.contains('submenu')) {
        inkjetLink.classList.add('expanded');
        submenu.style.display = 'block';
      }
    }
  }

  expandPrintSparePartsMenu() {
    // Find and expand the print spare parts menu in the sidebar if it exists
    const sparePartsLink = document.querySelector('[onclick*="loadPrintSpareParts"]');
    if (sparePartsLink) {
      const submenu = sparePartsLink.nextElementSibling;
      if (submenu && submenu.classList.contains('submenu')) {
        sparePartsLink.classList.add('expanded');
        submenu.style.display = 'block';
      }
    }
  }

  // Handle hash navigation - called from external scripts
  handleHashNavigation(hash) {
    if (!hash) return;
    
    // Handle printhead-specific hashes
    if (hash === 'print-heads' || hash === 'printheads') {
      if (window.loadAllPrintheadProducts) {
        window.loadAllPrintheadProducts();
        this.setActiveCategory('Print Heads');
        this.expandPrintHeadsMenu();
      }
      return;
    }
    
    if (hash.startsWith('printheads-')) {
      const brand = hash.replace('printheads-', '');
      if (window.loadPrintheadProducts) {
        window.loadPrintheadProducts(brand);
        this.setActiveCategory('Print Heads');
        this.expandPrintHeadsMenu();
      }
      return;
    }
    
    // Handle other category hashes
    const categoryMap = {
      'inkjet-printers': 'Inkjet Printers',
      'print-spare-parts': 'Print Spare Parts',
      'upgrading-kit': 'Upgrading Kit',
      'material': 'Material',
      'led-lcd': 'LED & LCD',
      'laser': 'Laser',
      'cutting': 'Cutting',
      'channel-letter': 'Channel Letter',
      'cnc': 'CNC',
      'displays': 'Displays',
      'other': 'Other'
    };
    
    const categoryName = categoryMap[hash];
    if (categoryName && window.loadSpecificCategory) {
      window.loadSpecificCategory(categoryName);
      this.setActiveCategory(categoryName);
      
      // Expand appropriate sidebar menu
      if (categoryName === 'Inkjet Printers') {
        this.expandInkjetPrintersMenu();
      } else if (categoryName === 'Print Spare Parts') {
        this.expandPrintSparePartsMenu();
      }
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

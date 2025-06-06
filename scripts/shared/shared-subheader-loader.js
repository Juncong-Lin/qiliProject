// Shared Subheader Loader
async function loadSharedSubheader() {
  try {
    const response = await fetch('components/shared-subheader.html');
    const subheaderHTML = await response.text();
    
    // Find the placeholder element for the subheader
    const placeholder = document.getElementById('shared-subheader-placeholder');
    if (placeholder) {
      // Replace placeholder with actual subheader content
      placeholder.innerHTML = subheaderHTML;
      
      // Reinitialize sub-header navigation after content is loaded
      initializeSubHeaderAfterLoad();
    } else {
      // Fallback: Insert after main header if placeholder not found
      const headerElement = document.querySelector('.qili-header, .checkout-header');
      if (headerElement) {
        headerElement.insertAdjacentHTML('afterend', subheaderHTML);
        
        // Reinitialize sub-header navigation after content is loaded
        initializeSubHeaderAfterLoad();
      }
    }
  } catch (error) {
    console.error('Error loading shared subheader:', error);
  }
}

// Global navigation handler functions for the shared subheader
window.handleNavigationClick = function(hash) {  // Check if we're on the index page
  if (UrlUtils.isIndexPage()) {
    // We're on index page - update hash and let existing navigation handle it
    if (hash) {
      window.location.hash = hash;
    } else {
      // For "See All Departments", load all products
      if (window.loadAllProducts && typeof window.loadAllProducts === 'function') {
        window.loadAllProducts();
      }
    }  } else {
    // We're on a different page - navigate to index with hash
    UrlUtils.navigateToIndex(hash || '');
  }
};

window.handleCategoryClick = function(categoryName) {
  // Check if we're on the index page
  if (UrlUtils.isIndexPage() && window.loadSpecificCategory && typeof window.loadSpecificCategory === 'function') {
    // We're on index page - use existing function
    
    // Map category names to their correct hash values for consistency
    let hashValue = '';
    if (categoryName === 'Eco-Solvent Inkjet Printers - With XP600 Printhead') {
      hashValue = '#eco-solvent-xp600-printers';
    } else if (categoryName === 'Eco-Solvent Inkjet Printers - With I1600 Printhead') {
      hashValue = '#eco-solvent-i1600-printers';
    } else if (categoryName === 'Eco-Solvent Inkjet Printers - With I3200 Printhead') {
      hashValue = '#eco-solvent-i3200-printers';
    } else {
      // Default hash conversion for other categories
      const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '').replace(/'/g, '');
      hashValue = '#' + categorySlug;
    }
    
    // First update the hash to ensure correct browser history
    if (history.pushState) {
      history.pushState(null, null, hashValue);
    } else {
      window.location.hash = hashValue;
    }
    
    // Then load the category content
    window.loadSpecificCategory(categoryName);
  } else {
    // We're on a different page - navigate to index and handle the category loading
    let hashValue = '';
    if (categoryName === 'Eco-Solvent Inkjet Printers - With XP600 Printhead') {
      hashValue = '#eco-solvent-xp600-printers';
    } else if (categoryName === 'Eco-Solvent Inkjet Printers - With I1600 Printhead') {
      hashValue = '#eco-solvent-i1600-printers';
    } else if (categoryName === 'Eco-Solvent Inkjet Printers - With I3200 Printhead') {
      hashValue = '#eco-solvent-i3200-printers';
    } else {
      // Default hash conversion
      const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '').replace(/'/g, '');
      hashValue = '#category-' + categorySlug;
    }
    
    // Navigate to index page with the appropriate hash    UrlUtils.navigateToIndex(hashValue);
  }
};

// Helper function to fix Eco-Solvent submenu items click behavior
function fixEcoSolventSubmenuItems() {
  // We specifically want to ensure these problematic submenu items work on first click
  setTimeout(() => {
    // Find and fix the eco-solvent submenu items
    const ecosolventItems = document.querySelectorAll('.sub-header-submenu-item');
    
    ecosolventItems.forEach(item => {
      // Target only the problematic items
      if (item.textContent.includes('With XP600 Printhead') ||
          item.textContent.includes('With I1600 Printhead') ||
          item.textContent.includes('With I3200 Printhead')) {
            
        // Determine which category to load based on text content
        let categoryName = "";
        let hashValue = "";
        
        if (item.textContent.includes('With XP600 Printhead')) {
          categoryName = 'Eco-Solvent Inkjet Printers - With XP600 Printhead';
          hashValue = 'eco-solvent-xp600-printers';
        } else if (item.textContent.includes('With I1600 Printhead')) {
          categoryName = 'Eco-Solvent Inkjet Printers - With I1600 Printhead';
          hashValue = 'eco-solvent-i1600-printers';
        } else if (item.textContent.includes('With I3200 Printhead')) {
          categoryName = 'Eco-Solvent Inkjet Printers - With I3200 Printhead';
          hashValue = 'eco-solvent-i3200-printers';
        }
        
        // Only continue if we found a match
        if (categoryName && hashValue) {
          // Clone and replace the element to override any existing click handlers
          const newItem = item.cloneNode(true);
          item.parentNode.replaceChild(newItem, item);
          
          // Add a direct click event handler that will work on any page
          newItem.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Hide any active submenus
            document.querySelectorAll('.sub-header-submenu.active').forEach(submenu => {
              submenu.classList.remove('active');
            });
            
            // Check if we're on the index page or another page
            if (UrlUtils.isIndexPage() && window.loadSpecificCategory) {
              // We're on the index page - update hash and load content directly
              if (history.pushState) {
                history.pushState(null, null, `#${hashValue}`);
              } else {
                window.location.hash = `#${hashValue}`;
              }
              
              // Then load the category content
              window.loadSpecificCategory(categoryName);
            } else {
              // We're on a different page (like detail.html) - navigate to index page with hash
              UrlUtils.navigateToIndex(`#${hashValue}`);
            }
          });
        }
      }
    });
  }, 300); // Small delay to ensure shared subheader is fully loaded
}

window.handlePrintheadClick = function(brand) {
  // Check if we're on the index page
  if (UrlUtils.isIndexPage() && window.loadPrintheadProducts && typeof window.loadPrintheadProducts === 'function') {
    // We're on index page - use existing function
    window.loadPrintheadProducts(brand);
    window.location.hash = 'printheads-' + brand;  } else {
    // We're on a different page - navigate to index with printhead hash
    UrlUtils.navigateToIndex('#printheads-' + brand);
  }
};

// Function to initialize sub-header navigation after shared content is loaded
function initializeSubHeaderAfterLoad() {
  // Wait a bit to ensure DOM is fully updated
  setTimeout(() => {
    // Create a new instance of SubHeaderNavigation if the class exists
    if (typeof SubHeaderNavigation !== 'undefined') {
      window.subHeaderNav = new SubHeaderNavigation();
      
      // Fix for Eco-Solvent submenu items clicking issue
      fixEcoSolventSubmenuItems();
      
      // Handle URL hash navigation on initial page load if there's a hash
      let hash = window.location.hash.substring(1);
      
      // Check if the hash contains parameters to prevent scrolling
      const shouldSkipScroll = window.location.search.includes('noscroll=true') || 
                              hash.includes('noscroll=true');
      
      // Clean up the hash by removing any parameters
      if (hash.includes('?')) {
        hash = hash.split('?')[0];
      }
      
      if (hash && window.subHeaderNav.handleHashNavigation) {
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
  }, 50); // Small delay to ensure DOM is updated
}

// Load the subheader when the DOM is ready
document.addEventListener('DOMContentLoaded', loadSharedSubheader);

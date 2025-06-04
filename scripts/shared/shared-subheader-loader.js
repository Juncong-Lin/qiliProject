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
    window.loadSpecificCategory(categoryName);  } else {
    // We're on a different page - navigate to index and handle the category loading
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '').replace(/'/g, '');
    
    // Navigate to index page with category hash
    UrlUtils.navigateToIndex('#category-' + categorySlug);
  }
};

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

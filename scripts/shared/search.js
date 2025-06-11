// Search functionality for the header
class SearchSystem {
  constructor() {
    this.searchInput = null;
    this.searchButton = null;
    this.isInitialized = false;
  }

  init() {
    // Wait for the header to be loaded
    this.waitForHeader();
  }
  waitForHeader() {
    // Check if header elements exist, if not wait and try again
    const checkInterval = setInterval(() => {
      this.searchInput = document.querySelector('.search-bar');
      this.searchButton = document.querySelector('.search-button');

      if (this.searchInput && this.searchButton && !this.isInitialized) {
        this.setupEventListeners();
        this.isInitialized = true;
        clearInterval(checkInterval);
        
        // Check for URL search parameters
        this.handleURLSearchParams();
      }
    }, 100); // Check every 100ms

    // Stop checking after 10 seconds to avoid infinite loop
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  }

  setupEventListeners() {
    if (!this.searchInput || !this.searchButton) return;

    // Handle search button click
    this.searchButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.performSearch();
    });

    // Handle Enter key press in search input
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch();
      }
    });

    // Handle input changes for live search (optional)
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });
  }

  performSearch() {
    const searchTerm = this.searchInput.value.trim();
    
    if (!searchTerm) {
      this.showSearchMessage('Please enter a search term');
      return;
    }

    // Redirect to index page if not already there, then perform search
    if (!this.isIndexPage()) {
      // Navigate to index page with search parameter
      window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
      return;
    }

    // Perform search on current page
    this.searchProducts(searchTerm);
  }  searchProducts(searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();
    let searchResults = [];

    console.log('Search initiated for term:', searchTerm);

    try {
      // Check if product data is available, if not wait for it to load
      const hasProducts = window.printerProducts || window.printheadProducts || 
                         window.printSparePartProducts || window.upgradingKitProducts;
      
      console.log('Product data availability:', {
        printerProducts: !!window.printerProducts,
        printheadProducts: !!window.printheadProducts,
        printSparePartProducts: !!window.printSparePartProducts,
        upgradingKitProducts: !!window.upgradingKitProducts
      });
      
      if (!hasProducts) {
        console.log('No product data available, waiting...');
        // Wait for product data to load, then retry search
        this.waitForProductData(() => this.searchProducts(searchTerm));
        return;
      }

      // Search in all product datasets
      // Search printer products
      if (window.printerProducts) {
        for (const category in window.printerProducts) {
          const products = window.printerProducts[category];
          const matches = products.filter(product => 
            this.productMatchesSearch(product, searchTermLower)
          );
          searchResults = searchResults.concat(matches.map(p => ({...p, type: 'printer'})));
        }
      }

      // Search printhead products  
      if (window.printheadProducts) {
        for (const brand in window.printheadProducts) {
          const products = window.printheadProducts[brand];
          const matches = products.filter(product => 
            this.productMatchesSearch(product, searchTermLower)
          );
          searchResults = searchResults.concat(matches.map(p => ({...p, type: 'printhead'})));
        }
      }

      // Search print spare parts
      if (window.printSparePartProducts) {
        for (const brand in window.printSparePartProducts) {
          const products = window.printSparePartProducts[brand];
          const matches = products.filter(product => 
            this.productMatchesSearch(product, searchTermLower)
          );
          searchResults = searchResults.concat(matches.map(p => ({...p, type: 'printsparepart'})));
        }
      }

      // Search upgrading kit products
      if (window.upgradingKitProducts) {
        for (const brand in window.upgradingKitProducts) {
          const products = window.upgradingKitProducts[brand];
          const matches = products.filter(product => 
            this.productMatchesSearch(product, searchTermLower)
          );
          searchResults = searchResults.concat(matches.map(p => ({...p, type: 'upgradingkit'})));        }
      }

      console.log('Search completed. Found', searchResults.length, 'results');
      this.displaySearchResults(searchResults, searchTerm);

    } catch (error) {
      console.error('Search error:', error);
      this.showSearchMessage('Search temporarily unavailable. Please try again.');
    }
  }

  productMatchesSearch(product, searchTerm) {
    if (!product) return false;

    // Search in product name
    if (product.name && product.name.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in product keywords
    if (product.keywords && product.keywords.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in product category
    if (product.category && product.category.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in product subcategory
    if (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in product brand
    if (product.brand && product.brand.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in product description (if available)
    if (product.description && product.description.toLowerCase().includes(searchTerm)) {
      return true;
    }

    return false;
  }
  displaySearchResults(results, searchTerm) {
    // Hide hero banner
    if (window.hideHeroBanner) {
      window.hideHeroBanner();
    }

    // Hide any active submenus
    if (window.hideActiveSubmenus) {
      window.hideActiveSubmenus();
    }

    // Clear any sub-header highlighting for search results
    this.clearSubHeaderHighlight();

    // Update page header to show search results count
    if (window.updatePageHeader) {
      window.updatePageHeader(`Found ${results.length} result${results.length !== 1 ? 's' : ''}`);
    }

    // Update breadcrumb
    this.updateSearchBreadcrumb(searchTerm);

    const productsGrid = document.querySelector('.js-prodcts-grid');
    if (!productsGrid) {
      this.showSearchMessage('Unable to display search results');
      return;
    }

    // Remove any existing search results header since we're showing count in page title
    const existingHeader = document.querySelector('.search-results-header');
    if (existingHeader) {
      existingHeader.remove();
    }    if (results.length === 0) {
      productsGrid.innerHTML = `
        <div class="search-no-results">
          <h2>No results found for "${searchTerm}"</h2>
          <p>Try adjusting your search terms or browse our categories.</p>
          <div class="search-suggestions">
            <h3>Popular categories:</h3>
            <div class="suggestion-links">
              <a href="javascript:void(0)" onclick="window.loadAllPrintheadProducts && window.loadAllPrintheadProducts()">Print Heads</a>
              <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Inkjet Printers')">Inkjet Printers</a>
              <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Print Spare Parts')">Print Spare Parts</a>
              <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Upgrading Kit')">Upgrading Kit</a>
            </div>
          </div>
        </div>
      `;    } else {
      // Use existing renderProducts function if available
      if (window.renderProducts) {
        const productsHTML = window.renderProducts(results, 'mixed');
        productsGrid.innerHTML = productsHTML;
        
        // Re-attach event listeners
        if (window.attachAddToCartListeners) {
          window.attachAddToCartListeners();
        }
      } else {
        // Fallback rendering
        this.renderSearchResults(results, productsGrid);
      }
    }

    productsGrid.classList.remove('showing-coming-soon');

    // Scroll to products
    if (window.scrollToProducts) {
      window.scrollToProducts();
    }

    // Update URL with search parameter
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('search', searchTerm);
    window.history.pushState(null, '', newUrl);
  }
  renderSearchResults(results, container) {
    // Remove the search results info since it's now displayed in the header
    let html = '';

    results.forEach(product => {
      html += `
        <div class="product-container">        
          <div class="product-image-container">
            <a href="detail.html?productId=${product.id}&type=${product.type}" class="product-image-link">
              <img class="product-image" src="${product.image}">
            </a>
          </div>
          <div class="product-name limit-text-to-3-lines">
            <a href="detail.html?productId=${product.id}&type=${product.type}" class="product-link">
              ${product.name}
            </a>
          </div>
          <div class="product-price">
            ${(() => {
              if (product.lower_price !== undefined || product.higher_price !== undefined) {
                // Use the same price formatting as the main site
                const formatPriceRange = window.formatPriceRange || ((lower, higher) => {
                  if (lower && higher) {
                    return `USD:$${(lower/100).toFixed(0)} - $${(higher/100).toFixed(0)}`;
                  } else if (lower) {
                    return `USD:$${(lower/100).toFixed(0)}`;
                  } else {
                    return 'Contact for Price';
                  }
                });
                return formatPriceRange(product.lower_price, product.higher_price);
              } else if (product.price) {
                return 'USD:$' + (product.price/100).toFixed(2);
              } else {
                return 'Contact for Price';
              }
            })()}
          </div>
          <div class="product-spacer"></div>
          <a class="add-to-cart-button button-primary" href="detail.html?productId=${product.id}&type=${product.type}">
            View Details
          </a>
        </div>`;
    });

    container.innerHTML = html;  }

  updateSearchBreadcrumb(searchTerm) {
    let breadcrumbElement = document.querySelector('.breadcrumb-nav');
    if (!breadcrumbElement) {
      breadcrumbElement = document.createElement('div');
      breadcrumbElement.className = 'breadcrumb-nav';

      const mainElement = document.querySelector('.main');
      if (mainElement) {
        mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
      }
    }

    breadcrumbElement.innerHTML = `
      <a href="javascript:void(0)" onclick="window.loadAllProducts && window.loadAllProducts()" class="breadcrumb-link">Home</a>
      <span class="breadcrumb-separator">&gt;</span>
      <span class="breadcrumb-current">Search: "${searchTerm}"</span>
    `;
  }
  handleSearchInput(value) {
    // Optional: implement live search suggestions
    // For now, we'll keep it simple and only search on Enter/Click
  }

  handleURLSearchParams() {
    // Check if there's a search parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm) {
      // Set the search input value
      if (this.searchInput) {
        this.searchInput.value = searchTerm;
      }
      
      // Perform the search automatically
      this.searchProducts(searchTerm);
    }
  }

  showSearchMessage(message) {
    // Show temporary message to user
    const existingMessage = document.querySelector('.search-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'search-message';
    messageDiv.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    // Remove message after 3 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  isIndexPage() {
    return window.location.pathname.includes('index.html') || 
           window.location.pathname === '/' || 
           window.location.pathname.endsWith('/');
  }
  waitForProductData(callback) {
    // Show loading message
    this.showSearchMessage('Products are loading. Please wait...');
    
    // Check for product data availability every 100ms
    const checkInterval = setInterval(() => {
      const hasProducts = window.printerProducts || window.printheadProducts || 
                         window.printSparePartProducts || window.upgradingKitProducts;
      
      if (hasProducts) {
        clearInterval(checkInterval);
        callback();
      }
    }, 100);

    // Stop checking after 10 seconds to avoid infinite loop
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!(window.printerProducts || window.printheadProducts || 
            window.printSparePartProducts || window.upgradingKitProducts)) {
        this.showSearchMessage('Unable to load product data. Please refresh the page and try again.');
      }
    }, 10000);
  }

  clearSubHeaderHighlight() {
    // Remove any active highlighting from sub-header links
    const subHeaderLinks = document.querySelectorAll('.sub-header-link');
    subHeaderLinks.forEach(link => {
      link.classList.remove('active');
    });
  }
}

// Initialize search system
const searchSystem = new SearchSystem();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  searchSystem.init();
});

// Make search system globally available
window.searchSystem = searchSystem;

import {cart, addToCart} from '../../data/cart.js'; 
import {products} from '../../data/products.js';
import {printheadProducts} from '../../data/printhead-products.js';
import { formatCurrency } from '../shared/money.js';

// Unified product rendering function with optional type parameter
function renderProducts(productList, type = 'regular') {
  let productsHTML = '';
  productList.forEach((product) => {
    productsHTML += `
      <div class="product-container">        
        <div class="product-image-container">
          <a href="detail.html?productId=${product.id}" class="product-image-link">
            <img class="product-image" src="${product.image}">
          </a>
        </div>
        <div class="product-name limit-text-to-3-lines">
          <a href="detail.html?productId=${product.id}" class="product-link">
            ${product.name}
          </a>
        </div>        
        <div class="product-price">
          ${type === 'printhead' ? '$' + formatCurrency(product.price) : 
            (product.getPrice ? product.getPrice() : formatCurrency(product.price))}
        </div>
        <div class="product-quantity-section">
          <div class="product-quantity-container">
            <select>
              <option selected value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>
          <div class="added-message">Added</div>
        </div>
        <div class="product-spacer"></div>
        <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>`;
  });
  return productsHTML;
}

// Function to load printhead products for a specific brand
window.loadPrintheadProducts = function(brand) {
  const brandProducts = printheadProducts[brand];
  if (brandProducts) {
    // Hide the submenu after selection
    hideActiveSubmenus();
    
    // Hide hero banner for specific category views
    hideHeroBanner();
    
    // Highlight selected menu item
    highlightSelectedMenuItem(brand);
      // Add loading animation
    showLoadingState();
    
    // Small delay for smooth transition
    setTimeout(() => {      const productsHTML = renderProducts(brandProducts, 'printhead');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page title or add a header to show which brand is selected
      updatePageHeader(`${brand.charAt(0).toUpperCase() + brand.slice(1)} Printheads`);
          // Update breadcrumb navigation
    updateBreadcrumb(brand);
      
      // Scroll to top of products
      scrollToProducts();
    }, 200);
  }
};

// Function to load all printhead products from all brands
window.loadAllPrintheadProducts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Print Heads') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Combine all printhead products from all brands
    let allPrintheadProducts = [];
    for (const brand in printheadProducts) {
      allPrintheadProducts = allPrintheadProducts.concat(printheadProducts[brand]);
    }      const productsHTML = renderProducts(allPrintheadProducts, 'printhead');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show print heads category
    updatePageHeader('Print Heads');
      // Update breadcrumb navigation
    updateBreadcrumb('printHeads');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load all regular products (default view)
window.loadAllProducts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Highlight selected menu item
  highlightSelectedMenuItem('all');
  
  // Show hero banner for main homepage view
  showHeroBanner();
  
  // Add loading animation
  showLoadingState();
    // Small delay for smooth transition
  setTimeout(() => {
    const productsHTML = renderProducts(products);
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners
    attachAddToCartListeners();
      // Reset page header
    updatePageHeader('All Products');
      // Update breadcrumb navigation
    updateBreadcrumb('all');
    
    // Scroll to top of products
    scrollToProducts();
  }, 200);
};

// Function to hide all active submenus
function hideActiveSubmenus() {
  document.querySelectorAll('.submenu.active').forEach(submenu => {
    submenu.classList.remove('active');
  });
  document.querySelectorAll('.expandable.active').forEach(link => {
    link.classList.remove('active');
  });
}

// Function to show loading state
function showLoadingState() {
  const productsGrid = document.querySelector('.js-prodcts-grid');
  productsGrid.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading products...</p>
    </div>
  `;
  productsGrid.classList.remove('showing-coming-soon');
}

// Function to scroll to products section
function scrollToProducts() {
  // Get the main container to scroll to
  const mainElement = document.querySelector('.main');
  
  if (mainElement) {
    // Scroll to the main section with a slight offset to show the header
    window.scrollTo({
      top: mainElement.offsetTop - 120, // Reduce the scroll distance with an offset
      behavior: 'smooth'
    });
  }
}

// Function to update page header
function updatePageHeader(title) {
  let headerElement = document.querySelector('.page-header');
  if (!headerElement) {
    // Create header if it doesn't exist
    headerElement = document.createElement('h2');
    headerElement.className = 'page-header';
    headerElement.style.margin = '20px 0';
    headerElement.style.textAlign = 'center';
    headerElement.style.fontSize = '24px';
    headerElement.style.fontWeight = 'bold';
    
    const mainElement = document.querySelector('.main');
    mainElement.insertBefore(headerElement, mainElement.firstChild);
  }
  headerElement.textContent = title;
}

// Function to update breadcrumb navigation
function updateBreadcrumb(brand) {
  let breadcrumbElement = document.querySelector('.breadcrumb-nav');
  if (!breadcrumbElement) {
    // Create breadcrumb if it doesn't exist
    breadcrumbElement = document.createElement('div');
    breadcrumbElement.className = 'breadcrumb-nav';
    
    const mainElement = document.querySelector('.main');
    mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
  }
  
  // Check if we're on the detail page
  const isDetailPage = window.location.pathname.includes('detail.html');
  
  if (brand && brand !== 'all') {
    // Special case for 'printHeads' which is the main category
    if (brand === 'printHeads') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Print Heads</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Print Heads</span>
        `;
      }
    } else {
      if (isDetailPage) {
        // On detail page, make brand level clickable to go back to brand listings
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#printheads" class="breadcrumb-link">Print Heads</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" class="breadcrumb-link" onclick="loadPrintheadProducts('${brand}')">${brand.charAt(0).toUpperCase() + brand.slice(1)} Printheads</a>
        `;
      } else {
        // On index page, brand level is current/non-clickable
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllPrintheadProducts()" class="breadcrumb-link">Print Heads</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">${brand.charAt(0).toUpperCase() + brand.slice(1)} Printheads</span>
        `;
      }
    }
  } else {
    if (isDetailPage) {
      breadcrumbElement.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
      `;
    } else {
      breadcrumbElement.innerHTML = `
        <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
      `;
    }
  }
}

// Function to attach add to cart event listeners
function attachAddToCartListeners() {
  document.querySelectorAll('.js-add-to-cart')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const productId = button.dataset.productId;
        
        // Get the quantity from the dropdown
        const productContainer = button.closest('.product-container');
        const quantitySelect = productContainer.querySelector('select');
        const quantity = Number(quantitySelect.value);

        // Call addToCart with the selected quantity
        addToCart(productId, quantity);
        updateCartQuantity();

        // Show the 'Added' message
        const addedMessage = productContainer.querySelector('.added-message');
        if (addedMessage) {
          addedMessage.style.display = 'block';
          setTimeout(() => {
            addedMessage.style.display = 'none';
          }, 2000);
        }
      });
    });
}

// Load default products on page load
document.addEventListener('DOMContentLoaded', () => {
  // Only run on the main index page, not on checkout or other pages
  const isIndexPage = document.querySelector('.products-grid') || document.querySelector('#products-grid');
  
  if (isIndexPage) {
    // Initialize cart quantity display on page load immediately
    updateCartQuantity();
    
    // Small delay to ensure sub-header navigation is initialized
    setTimeout(() => {
      // Check if there's a hash in the URL that should load specific content
      const hash = window.location.hash.substring(1);    
      if (hash) {
        // If there's a hash, let the sub-header navigation handle it instead of loading all products
        // Check if sub-header navigation is available and can handle the hash
        if (window.subHeaderNav && window.subHeaderNav.handleHashNavigation) {
          // Sub-header nav will handle the hash, don't load all products
          return;
        } else {
          // Fallback: wait a bit more for sub-header to initialize
          setTimeout(() => {
            if (window.subHeaderNav && window.subHeaderNav.handleHashNavigation) {
              return;
            } else {
              // If still no sub-header nav, try to handle hash ourselves or load all products
              handleHashFallback(hash);
            }
          }, 200);
          return;
        }
      } else {
        // Only load all products if there's no hash
        loadAllProducts();
      }
    }, 100);
  }
});

// Initialize hero banner visibility on page load
document.addEventListener('DOMContentLoaded', () => {
  // Show hero banner by default on index page when no hash is present
  setTimeout(() => {
    const hash = window.location.hash;
    const isIndexPage = document.querySelector('.products-grid') || document.querySelector('#products-grid');
    
    if (isIndexPage && !hash) {
      // Show hero banner for default homepage view
      showHeroBanner();
    }
  }, 150);
});

// Fallback function to handle hash navigation when sub-header nav is not available
function handleHashFallback(hash) {
  if (hash === 'print-heads' || hash === 'printheads') {
    if (window.loadAllPrintheadProducts) {
      window.loadAllPrintheadProducts();
    } else {
      loadAllProducts();
    }
  } else if (hash.startsWith('printheads-')) {
    const brand = hash.replace('printheads-', '');
    if (window.loadPrintheadProducts) {
      window.loadPrintheadProducts(brand);
    } else {
      loadAllProducts();
    }
  } else if (window.loadSpecificCategory) {
    // Try to handle other category hashes
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
    
    if (categoryMap[hash]) {
      window.loadSpecificCategory(categoryMap[hash]);
    } else {
      loadAllProducts();
    }
  } else {
    loadAllProducts();
  }
}

function updateCartQuantity() {
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  
  const cartQuantityElement = document.querySelector('.js-cart-quantity');
  if (cartQuantityElement) {
    cartQuantityElement.innerHTML = cartQuantity;
  }
}

// Function to find any product by ID (regular or printhead)
export function findProductById(productId) {
  // First check regular products
  let product = products.find(p => p.id === productId);
  
  // If not found, check printhead products
  if (!product) {
    for (const brand in printheadProducts) {
      const brandProducts = printheadProducts[brand];
      product = brandProducts.find(p => p.id === productId);
      if (product) break;
    }
  }
  
  return product;
}

// Function to highlight selected menu item
function highlightSelectedMenuItem(brand) {
  // Remove the 'selected-brand' class from all submenu items
  document.querySelectorAll('.department-link.selected-brand').forEach(link => {
    link.classList.remove('selected-brand');
  });

  // Add the 'selected-brand' class to the currently selected submenu item
  if (brand && brand !== 'all') {
    const brandLink = document.querySelector(`[onclick="loadPrintheadProducts('${brand}')"]`);
    if (brandLink) {
      brandLink.classList.add('selected-brand');
    }
  } else {
    // Highlight "All Products" if showing all products
    const allProductsLink = document.querySelector(`[onclick="loadAllProducts()"]`);
    if (allProductsLink) {
      allProductsLink.classList.add('selected-brand');
    }
  }
}

// Add click handler for printhead submenu items to auto-collapse
document.addEventListener('DOMContentLoaded', () => {
  // Add click listeners to all printhead submenu items
  const printheadLinks = document.querySelectorAll('[onclick*="loadPrintheadProducts"]');
  printheadLinks.forEach(link => {
    link.addEventListener('click', function() {
      // No direct style changes here! Only rely on .selected-brand class
    });
  });
  
  // Add click listener to "All Products" link
  const allProductsLink = document.querySelector('[onclick="loadAllProducts()"]');
  if (allProductsLink) {
    allProductsLink.addEventListener('click', function() {
      // No direct style changes here! Only rely on .selected-brand class
    });
  }
});

// --- Highlight sub-header link when sidebar is clicked (handles nested/child links) ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.department-link').forEach(link => {
    link.addEventListener('click', function(e) {
      // Find the main sidebar category for this link
      let sidebarCategory = link.textContent.trim();
      // If this is a child link, try to get the parent expandable's text
      const expandableParent = link.closest('.department-group, .department-subgroup');
      let mainCategory = sidebarCategory;
      if (expandableParent) {
        const parentExpandable = expandableParent.querySelector('.expandable');
        if (parentExpandable && parentExpandable !== link) {
          mainCategory = parentExpandable.textContent.trim();
        }
      }
      // Map sidebar category names to sub-header link names if needed
      const categoryMap = {
        'See All Departments': 'See All Departments',
        'Inkjet Printers': 'Inkjet Printers',
        'Print Heads': 'Print Heads',
        'Print Spare Parts': 'Print Spare Parts',
        'Upgrading Kit': 'Upgrading Kit',
        'Material': 'Material',
        'LED & LCD': 'LED & LCD',
        'Laser': 'Laser',
        'Cutting': 'Cutting',
        'Channel Letter': 'Channel Letter',
        'CNC': 'CNC',
        'Displays': 'Displays',
        'Other': 'Other',
      };
      // Use mainCategory if it matches a sub-header, else fallback to sidebarCategory
      const matchCategory = categoryMap[mainCategory] || categoryMap[sidebarCategory];
      document.querySelectorAll('.sub-header-link').forEach(subLink => {
        subLink.classList.remove('active');
        if (matchCategory && subLink.textContent.trim() === matchCategory) {
          subLink.classList.add('active');
        }
      });
    });
  });
});

// Function to handle loading of specific category products
window.loadSpecificCategory = function(categoryName) {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Add loading animation
  showLoadingState();

  // --- Highlight the corresponding nav item (including special sidebar categories) ---
  const subHeaderMap = {
    'Eco-Solvent Inkjet Printers': 'Inkjet Printers',
    'Solvent Inket Printers': 'Inkjet Printers',
    'UV Inkjet Printers': 'Inkjet Printers',
    'Sublimation Printers': 'Inkjet Printers',
    'Double Side Printers': 'Inkjet Printers',
    // fallback: categoryName itself
  };
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (
      link.textContent.trim() === (subHeaderMap[categoryName] || categoryName)
    ) {
      link.classList.add('active');
    }
  });

  // Convert category for use in hash navigation
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');

  // Update URL hash without triggering a navigation
  if (history.pushState) {
    history.pushState(null, null, `#${categorySlug}`);
  } else {
    location.hash = `#${categorySlug}`;
  }
  // For now, just show placeholder content
  setTimeout(() => {
    const message = `<div class="coming-soon">
      <h2>${categoryName} Products</h2>
      <p>Products for this category will be available soon!</p>
    </div>`;
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = message;
    productsGrid.classList.add('showing-coming-soon');

    // Update page header
    updatePageHeader(categoryName);

    // Update breadcrumb
    let breadcrumbElement = document.querySelector('.breadcrumb-nav');
    if (!breadcrumbElement) {
      breadcrumbElement = document.createElement('div');
      breadcrumbElement.className = 'breadcrumb-nav';

      const mainElement = document.querySelector('.main');
      mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
    }
    breadcrumbElement.innerHTML = `
      <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
      <span class="breadcrumb-separator">&gt;</span>
      <span class="breadcrumb-current">${categoryName}</span>
    `;

    // Scroll to products
    scrollToProducts();
  }, 200);
};

// Function to load Inkjet Printers
window.loadInkjetPrinters = function() {
  window.loadSpecificCategory('Inkjet Printers');
};

// Function to load Print Spare Parts  
window.loadPrintSpareParts = function() {
  window.loadSpecificCategory('Print Spare Parts');
};

// Function to show the hero banner
function showHeroBanner() {
  const heroBanner = document.querySelector('.hero-banner');
  if (heroBanner) {
    heroBanner.style.display = 'block';
    // Add a small delay to trigger the animation
    setTimeout(() => {
      heroBanner.classList.add('show');
      // Initialize carousel after hero banner is shown
      setTimeout(() => {
        if (!window.heroCarousel) {
          window.heroCarousel = new HeroCarousel();
        }
      }, 100);
    }, 10);
  }
}

// Function to hide the hero banner
function hideHeroBanner() {
  const heroBanner = document.querySelector('.hero-banner');
  if (heroBanner) {
    heroBanner.classList.remove('show');
    // Hide the element after the animation completes
    setTimeout(() => {
      heroBanner.style.display = 'none';
    }, 300);
  }
}

// Hero Carousel Functionality
class HeroCarousel {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.hero-slide');
    this.indicators = document.querySelectorAll('.hero-indicator');
    this.autoplayInterval = null;
    this.autoplayDelay = 8000; // 8 seconds
    
    console.log(`Hero Carousel initialized with ${this.slides.length} slides`);
    this.init();
  }
  
  init() {
    if (this.slides.length === 0) {
      console.log('No slides found for carousel');
      return;
    }
    
    // Start autoplay
    this.startAutoplay();
    console.log('Carousel autoplay started');
    
    // Pause autoplay on hover
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
      heroCarousel.addEventListener('mouseenter', () => this.stopAutoplay());
      heroCarousel.addEventListener('mouseleave', () => this.startAutoplay());
    }
  }
  
  goToSlide(index) {
    if (index < 0 || index >= this.slides.length) return;
    
    // Remove active class from current slide and indicator
    this.slides[this.currentSlide].classList.remove('active');
    this.indicators[this.currentSlide].classList.remove('active');
    
    // Add active class to new slide and indicator
    this.currentSlide = index;
    this.slides[this.currentSlide].classList.add('active');
    this.indicators[this.currentSlide].classList.add('active');
    
    // Reset autoplay
    this.stopAutoplay();
    this.startAutoplay();
  }
  
  next() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }
  
  prev() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }
  
  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.next();
    }, this.autoplayDelay);
  }
  
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize carousel if hero banner is already visible
  const heroBanner = document.querySelector('.hero-banner');
  if (heroBanner && heroBanner.style.display !== 'none') {
    window.heroCarousel = new HeroCarousel();
  }
});

// Global function to ensure carousel is initialized when needed
window.initializeHeroCarousel = function() {
  if (!window.heroCarousel && document.querySelector('.hero-slide')) {
    window.heroCarousel = new HeroCarousel();
  }
};


// Temporarily commented out cart imports - preserved for future reuse
// import {cart, addToCart} from '../../data/cart.js'; 
import {products} from '../../data/products.js';
import {printheadProducts} from '../../data/printhead-products.js';
import {printerProducts, getXP600Printers, getI1600Printers, getI3200Printers} from '../../data/printer-products.js';
import {printSparePartProducts} from '../../data/printsparepart-products.js';
import {upgradingKitProducts} from '../../data/upgradingkit-products.js';
import {materialProducts} from '../../data/material-products.js';
import {ledAndLcdProducts} from '../../data/ledAndLcd-products.js';
import {channelLetterBendingMechineProducts} from '../../data/channelLetterBendingMechine-products.js';
import {otherProducts} from '../../data/other-products.js';
import { formatCurrency, formatPriceRange } from '../shared/money.js';

// Early search parameter detection to prevent hero banner flash
// Check immediately if this is a search request and hide hero banner
const urlParams = new URLSearchParams(window.location.search);
const isSearchRequest = urlParams.has('search');

// If this is a search request, immediately hide the hero banner to prevent flash
if (isSearchRequest) {
  // Add CSS to immediately hide hero banner before it renders
  const style = document.createElement('style');
  style.textContent = `
    .hero-banner {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  
  // Also set a flag for the search system to know this is an early detection
  window.isEarlySearchDetection = true;
}

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
        </div>        <div class="product-price">
          ${(() => {
            if (type === 'regular' && product.getPrice) {
              return product.getPrice();
            } else if (product.lower_price !== undefined || product.higher_price !== undefined) {
              return formatPriceRange(product.lower_price, product.higher_price);
            } else if (product.price) {
              return 'USD:$' + formatCurrency(product.price);
            } else {
              return 'USD: #NA';
            }
          })()}</div>
        <!-- Temporarily commented out quantity section - not needed for View Details -->
        <!--
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
        --><div class="product-spacer"></div>
        <a class="add-to-cart-button button-primary" href="detail.html?productId=${product.id}">
          View Details
        </a>
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
    
    // Highlight selected menu item(brand);
    highlightSelectedMenuItem(brand);
      // Add loading animation
    showLoadingState();
    
    // Small delay for smooth transition
    setTimeout(() => {      const productsHTML = renderProducts(brandProducts, 'printhead');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();        // Update page title or add a header to show which brand is selected
      updatePageHeader(`${brand.charAt(0).toUpperCase() + brand.slice(1)} Printheads`, brandProducts.length);
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
    attachAddToCartListeners();      // Update page title or add a header to show print heads category
    updatePageHeader('Print Heads', allPrintheadProducts.length);
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
    // Initialize hero carousel
  if (!heroCarousel) {
    console.log('Creating new HeroCarousel instance');
    heroCarousel = new HeroCarousel();
    window.heroCarousel = heroCarousel;
  } else {
    console.log('HeroCarousel already exists');
  }
  
  // Clear products grid for homepage - just show hero banner
  const productsGrid = document.querySelector('.js-prodcts-grid');
  productsGrid.innerHTML = '';
  productsGrid.classList.remove('showing-coming-soon');
  
  // Remove page header for clean homepage
  const pageHeader = document.querySelector('.page-header');
  if (pageHeader) {
    pageHeader.remove();
  }
  
  // Remove breadcrumb for clean homepage
  const breadcrumbElement = document.querySelector('.breadcrumb-nav');
  if (breadcrumbElement) {
    breadcrumbElement.remove();
  }
};

// Function to load XP600 printer products
window.loadXP600Printers = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item
  highlightSelectedMenuItem('xp600-printers');
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    const xp600Printers = getXP600Printers();
    const productsHTML = renderProducts(xp600Printers, 'printer');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
      // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title
    updatePageHeader('XP600 Inkjet Printers', xp600Printers.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('xp600-printers');
    
    // Scroll to top of products
    scrollToProducts();
  }, 200);
};

// Function to load I1600 printer products
window.loadI1600Printers = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item
  highlightSelectedMenuItem('i1600-printers');
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    const i1600Printers = getI1600Printers();
    const productsHTML = renderProducts(i1600Printers, 'printer');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
      // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title
    updatePageHeader('I1600 Inkjet Printers', i1600Printers.length);
      // Update breadcrumb navigation
    updateBreadcrumb('i1600-printers');
    
    // Scroll to top of products
    scrollToProducts();
  }, 200);
};

// Function to load I3200 printer products
window.loadI3200Printers = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item
  highlightSelectedMenuItem('i3200-printers');
  
  // Show "Coming Soon" message briefly for smooth transition
  showComingSoonMessage();
  
  // Small delay for smooth transition
  setTimeout(() => {
    const i3200Printers = getI3200Printers();
    const productsHTML = renderProducts(i3200Printers, 'printer');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
      // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title
    updatePageHeader('I3200 Inkjet Printers', i3200Printers.length);
      // Update breadcrumb navigation
    updateBreadcrumb('i3200-printers');
    
    // Scroll to top of products
    scrollToProducts();
  }, 200);
};

// Function to load upgrading kit products for a specific brand
window.loadUpgradingKitProducts = function(brand) {
  const brandProducts = upgradingKitProducts[brand];
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
    setTimeout(() => {
      const productsHTML = renderProducts(brandProducts, 'upgradingkit');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page title or add a header to show which brand is selected
      updatePageHeader(`${brand.charAt(0).toUpperCase() + brand.slice(1)} Upgrading Kit`, brandProducts.length);
      
      // Update breadcrumb navigation
      updateBreadcrumb(brand, 'upgradingkit');
      
      // Scroll to top of products
      scrollToProducts();
    }, 200);
  }
};

// Function to load all upgrading kit products from all brands
window.loadAllUpgradingKitProducts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Upgrading Kit') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Combine all upgrading kit products from all brands
    let allUpgradingKitProducts = [];
    for (const brand in upgradingKitProducts) {
      allUpgradingKitProducts = allUpgradingKitProducts.concat(upgradingKitProducts[brand]);
    }
    
    const productsHTML = renderProducts(allUpgradingKitProducts, 'upgradingkit');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show upgrading kit category
    updatePageHeader('Upgrading Kit', allUpgradingKitProducts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('upgradingKit');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load LED & LCD products for a specific category
window.loadLedLcdProducts = function(category) {
  const categoryProducts = ledAndLcdProducts[category];
  if (categoryProducts) {
    // Hide the submenu after selection
    hideActiveSubmenus();
    
    // Hide hero banner for specific category views
    hideHeroBanner();
    
    // Highlight selected menu item
    highlightSelectedMenuItem(category);
    
    // Add loading animation
    showLoadingState();
    
    // Small delay for smooth transition
    setTimeout(() => {
      const productsHTML = renderProducts(categoryProducts, 'ledlcd');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page title or add a header to show which category is selected
      updatePageHeader(`${category.charAt(0).toUpperCase() + category.slice(1)} LED & LCD`, categoryProducts.length);
      
      // Update breadcrumb navigation
      updateBreadcrumb(`led-lcd-${category}`);
      
      // Scroll to top of products
      scrollToProducts();
    }, 200);
  }
};

// Function to load all LED & LCD products from all categories
window.loadAllLedLcdProducts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'LED & LCD') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Combine all LED & LCD products from all categories
    let allLedLcdProducts = [];
    for (const category in ledAndLcdProducts) {
      allLedLcdProducts = allLedLcdProducts.concat(ledAndLcdProducts[category]);
    }
    
    const productsHTML = renderProducts(allLedLcdProducts, 'ledlcd');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show LED & LCD category
    updatePageHeader('LED & LCD', allLedLcdProducts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('led-lcd');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
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

// Function to show hero banner
function showHeroBanner() {
  const heroBanner = document.querySelector('.hero-banner');
  if (heroBanner) {
    heroBanner.style.display = 'block';
    // Add the show class for CSS transition
    setTimeout(() => {
      heroBanner.classList.add('show');
    }, 10);
  }
}

// Function to hide hero banner
function hideHeroBanner() {
  const heroBanner = document.querySelector('.hero-banner');
  if (heroBanner) {
    heroBanner.classList.remove('show');
    // Hide after transition completes
    setTimeout(() => {
      heroBanner.style.display = 'none';
    }, 600);
  }
}

// Function to show coming soon message
function showComingSoonMessage() {
  const productsGrid = document.querySelector('.js-prodcts-grid');
  productsGrid.innerHTML = `
    <div class="coming-soon">
      <h2>Loading Products...</h2>
      <p>Please wait while we load the products for you.</p>
    </div>
  `;
  productsGrid.classList.add('showing-coming-soon');
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

// Function to update page header with optional product count
function updatePageHeader(title, productCount = null) {
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
  
  // Format title with product count if provided
  if (productCount !== null && productCount !== undefined) {
    headerElement.textContent = `${title} (Total: ${productCount})`;
  } else {
    headerElement.textContent = title;
  }
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
    } else if (brand === 'printSpareParts') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Print Spare Parts</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Print Spare Parts</span>
        `;
      }
    } else if (brand === 'epsonPrinterSpareParts') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#print-spare-parts" class="breadcrumb-link">Print Spare Parts</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Epson Printer Spare Parts</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllPrintSpareParts()" class="breadcrumb-link">Print Spare Parts</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Epson Printer Spare Parts</span>        `;
      }    } else if (brand === 'rolandPrinterSpareParts') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#print-spare-parts" class="breadcrumb-link">Print Spare Parts</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Roland Printer Spare Parts</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllPrintSpareParts()" class="breadcrumb-link">Print Spare Parts</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Roland Printer Spare Parts</span>
        `;
      }    } else if (brand === 'canonPrinterSpareParts') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#print-spare-parts" class="breadcrumb-link">Print Spare Parts</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Canon Printer Spare Parts</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllPrintSpareParts()" class="breadcrumb-link">Print Spare Parts</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Canon Printer Spare Parts</span>
        `;
      }    } else if (brand === 'ricohPrinterSpareParts') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#print-spare-parts" class="breadcrumb-link">Print Spare Parts</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Ricoh Printer Spare Parts</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllPrintSpareParts()" class="breadcrumb-link">Print Spare Parts</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Ricoh Printer Spare Parts</span>
        `;
      }
    } else if (brand === 'upgradingKit') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Upgrading Kit</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Upgrading Kit</span>
        `;
      }
    } else if (brand === 'hoson' || brand === 'mimaki' || brand === 'mutoh' || brand === 'roll_to_roll_style' || brand === 'uv_flatbed' || brand === 'without_cable_work') {
      // These are upgrading kit brands
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#upgrading-kit" class="breadcrumb-link">Upgrading Kit</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" class="breadcrumb-link" onclick="loadUpgradingKitProducts('${brand}')">${brand.charAt(0).toUpperCase() + brand.slice(1).replace(/_/g, ' ')} Products</a>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllUpgradingKitProducts()" class="breadcrumb-link">Upgrading Kit</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">${brand.charAt(0).toUpperCase() + brand.slice(1).replace(/_/g, ' ')} Products</span>        `;
      }
    } else if (brand === 'material') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Material</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Material</span>
        `;
      }
    } else if (brand.startsWith('material-')) {
      // These are material categories like material-adhevie, material-flex, etc.
      const materialCategory = brand.substring(9); // Remove 'material-' prefix
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#material" class="breadcrumb-link">Material</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" class="breadcrumb-link" onclick="loadMaterialProducts('${materialCategory}')">${materialCategory.charAt(0).toUpperCase() + materialCategory.slice(1)} Materials</a>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllMaterialProducts()" class="breadcrumb-link">Material</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">${materialCategory.charAt(0).toUpperCase() + materialCategory.slice(1)} Materials</span>        `;
      }
    } else if (brand.startsWith('led-lcd-')) {
      // These are LED & LCD categories like led-lcd-display, led-lcd-outdoor, etc.
      const ledLcdCategory = brand.substring(8); // Remove 'led-lcd-' prefix
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#led-lcd" class="breadcrumb-link">LED & LCD</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" class="breadcrumb-link" onclick="loadLedLcdProducts('${ledLcdCategory}')">${ledLcdCategory.charAt(0).toUpperCase() + ledLcdCategory.slice(1)} LED & LCD</a>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllLedLcdProducts()" class="breadcrumb-link">LED & LCD</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">${ledLcdCategory.charAt(0).toUpperCase() + ledLcdCategory.slice(1)} LED & LCD</span>        `;
      }
    } else if (brand.startsWith('channel-letter-')) {
      // These are Channel Letter categories like channel-letter-aluminum, channel-letter-automatic, etc.
      const channelLetterCategory = brand.substring(15); // Remove 'channel-letter-' prefix
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#channel-letter" class="breadcrumb-link">Channel Letter</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">${channelLetterCategory.charAt(0).toUpperCase() + channelLetterCategory.slice(1)} Channel Letter</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" class="breadcrumb-link" onclick="loadChannelLetterProducts('${channelLetterCategory}')">${channelLetterCategory.charAt(0).toUpperCase() + channelLetterCategory.slice(1)} Channel Letter</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllChannelLetterProducts()" class="breadcrumb-link">Channel Letter</a>        `;
      }
    } else if (brand.startsWith('other-')) {
      // These are Other categories like other-spectrophotometer, etc.
      const otherCategory = brand.substring(6); // Remove 'other-' prefix
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="index.html#other" class="breadcrumb-link">Other</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">${otherCategory.charAt(0).toUpperCase() + otherCategory.slice(1)} Other Products</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" class="breadcrumb-link" onclick="loadOtherProducts('${otherCategory}')">${otherCategory.charAt(0).toUpperCase() + otherCategory.slice(1)} Other Products</a>
          <span class="breadcrumb-separator">&gt;</span>
          <a href="javascript:void(0)" onclick="loadAllOtherProducts()" class="breadcrumb-link">Other</a>
        `;
      }
    } else if (brand === 'other') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Other</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Other</span>
        `;
      }
    } else if (brand === 'channel-letter') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Channel Letter</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Channel Letter</span>
        `;
      }
    } else if (brand === 'led-lcd') {
      if (isDetailPage) {
        breadcrumbElement.innerHTML = `
          <a href="index.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">LED & LCD</span>
        `;
      } else {
        breadcrumbElement.innerHTML = `
          <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">LED & LCD</span>
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
    }  } else {
    // For homepage (all products), remove breadcrumb completely for clean look
    if (breadcrumbElement) {
      breadcrumbElement.remove();
    }
  }
}

// Function to attach add to cart event listeners
// Temporarily disabled since we're using "View Details" instead of "Add to Cart"
function attachAddToCartListeners() {
  // No-op function - cart functionality is temporarily disabled
  // Original cart functionality is preserved in comments for future reuse
  /*
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
  */
}

// Load default products on page load
document.addEventListener('DOMContentLoaded', () => {
  // Only run on the main index page, not on checkout or other pages
  const isIndexPage = document.querySelector('.products-grid') || document.querySelector('#products-grid');
    if (isIndexPage) {
    // Initialize cart quantity display on page load immediately - temporarily disabled
    // updateCartQuantity();
      // Small delay to ensure sub-header navigation is initialized
    setTimeout(() => {
      // Check for search parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const isSearchRequest = urlParams.has('search');
      
      // If this is a search request, don't load default products - let search system handle it
      if (isSearchRequest) {
        return;
      }
      
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
        // Only load all products if there's no hash and no search request
        loadAllProducts();
      }
    }, 100);
  }
});

// Initialize hero banner visibility on page load
document.addEventListener('DOMContentLoaded', () => {
  // Show hero banner by default on index page when no hash is present and no search request
  setTimeout(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const isSearchRequest = urlParams.has('search');
    const isIndexPage = document.querySelector('.products-grid') || document.querySelector('#products-grid');
    
    if (isIndexPage && !hash && !isSearchRequest) {
      // Show hero banner for default homepage view only
      showHeroBanner();
        // Initialize hero carousel
      if (!heroCarousel) {
        heroCarousel = new HeroCarousel();
        window.heroCarousel = heroCarousel;
      }
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
  } else if (hash === 'print-spare-parts') {
    if (window.loadAllPrintSpareParts) {
      window.loadAllPrintSpareParts();
    } else {
      loadAllProducts();
    }  } else if (hash === 'epson-printer-spare-parts') {
    if (window.loadEpsonPrinterSpareParts) {
      window.loadEpsonPrinterSpareParts();
    } else {
      loadAllProducts();
    }  } else if (hash === 'roland-printer-spare-parts') {
    if (window.loadRolandPrinterSpareParts) {
      window.loadRolandPrinterSpareParts();
    } else {
      loadAllProducts();
    }  } else if (hash === 'canon-printer-spare-parts') {
    if (window.loadCanonPrinterSpareParts) {
      window.loadCanonPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'ricoh-printer-spare-parts') {
    if (window.loadRicohPrinterSpareParts) {
      window.loadRicohPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'infiniti-challenger-printer-spare-parts') {
    if (window.loadInfinitiChallengerPrinterSpareParts) {
      window.loadInfinitiChallengerPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'flora-printer-spare-parts') {
    if (window.loadFloraPrinterSpareParts) {
      window.loadFloraPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'galaxy-printer-spare-parts') {
    if (window.loadGalaxyPrinterSpareParts) {
      window.loadGalaxyPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'mimaki-printer-spare-parts') {
    if (window.loadMimakiPrinterSpareParts) {
      window.loadMimakiPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'mutoh-printer-spare-parts') {
    if (window.loadMutohPrinterSpareParts) {
      window.loadMutohPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'wit-color-printer-spare-parts') {
    if (window.loadWitColorPrinterSpareParts) {
      window.loadWitColorPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'gongzheng-printer-spare-parts') {
    if (window.loadGongzhengPrinterSpareParts) {
      window.loadGongzhengPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'human-printer-spare-parts') {
    if (window.loadHumanPrinterSpareParts) {
      window.loadHumanPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'teflon-printer-spare-parts') {
    if (window.loadTeflonPrinterSpareParts) {
      window.loadTeflonPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'wiper-printer-spare-parts') {
    if (window.loadWiperPrinterSpareParts) {
      window.loadWiperPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'xaar-printer-spare-parts') {
    if (window.loadXaarPrinterSpareParts) {
      window.loadXaarPrinterSpareParts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'toshiba-printer-spare-parts') {
    if (window.loadToshibaPrinterSpareParts) {
      window.loadToshibaPrinterSpareParts();
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
  } else if (hash === 'upgrading-kit') {
    if (window.loadAllUpgradingKitProducts) {
      window.loadAllUpgradingKitProducts();
    } else {
      loadAllProducts();
    }
  } else if (hash === 'material') {
    if (window.loadAllMaterialProducts) {
      window.loadAllMaterialProducts();
    } else {
      loadAllProducts();
    }  } else if (hash.startsWith('material-')) {
    const materialCategory = hash.replace('material-', '');
    if (window.loadMaterialProducts) {
      window.loadMaterialProducts(materialCategory);
    } else {
      loadAllProducts();
    }  } else if (hash === 'led-lcd') {
    if (window.loadAllLedLcdProducts) {
      window.loadAllLedLcdProducts();
    } else {
      loadAllProducts();
    }
  } else if (hash.startsWith('led-lcd-')) {
    const ledLcdCategory = hash.replace('led-lcd-', '');
    if (window.loadLedLcdProducts) {
      window.loadLedLcdProducts(ledLcdCategory);
    } else {
      loadAllProducts();
    }
  } else if (hash === 'channel-letter') {
    if (window.loadAllChannelLetterProducts) {
      window.loadAllChannelLetterProducts();
    } else {
      loadAllProducts();
    }  } else if (hash.startsWith('channel-letter-')) {
    const channelLetterCategory = hash.replace('channel-letter-', '');
    if (window.loadChannelLetterProducts) {
      window.loadChannelLetterProducts(channelLetterCategory);
    } else {
      loadAllProducts();
    }
  } else if (hash === 'other') {
    if (window.loadAllOtherProducts) {
      window.loadAllOtherProducts();
    } else {
      loadAllProducts();
    }
  } else if (hash.startsWith('other-')) {
    const otherCategory = hash.replace('other-', '');
    if (window.loadOtherProducts) {
      window.loadOtherProducts(otherCategory);
    } else {
      loadAllProducts();
    }
  } else if (window.loadSpecificCategory) {// Try to handle other category hashes
    const categoryMap = {
      'inkjet-printers': 'Inkjet Printers',
      'inkjetprinters-ecosolvent': 'Eco-Solvent Inkjet Printers',
      'eco-solvent-xp600-printers': 'Eco-Solvent Inkjet Printers - With XP600 Printhead',
      'eco-solvent-i1600-printers': 'Eco-Solvent Inkjet Printers - With I1600 Printhead',
      'eco-solvent-i3200-printers': 'Eco-Solvent Inkjet Printers - With I3200 Printhead',
      'eco-solvent-inkjet-printers---with-xp600-printhead': 'Eco-Solvent Inkjet Printers - With XP600 Printhead',
      'eco-solvent-inkjet-printers---with-i1600-printhead': 'Eco-Solvent Inkjet Printers - With I1600 Printhead',
      'eco-solvent-inkjet-printers---with-i3200-printhead': 'Eco-Solvent Inkjet Printers - With I3200 Printhead',
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
  // Temporarily disabled since cart is hidden from header
  // Original cart quantity functionality is preserved for future reuse
  /*
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  
  const cartQuantityElement = document.querySelector('.js-cart-quantity');
  if (cartQuantityElement) {
    cartQuantityElement.innerHTML = cartQuantity;
  }
  */
}

// Function to find any product by ID (regular, printhead, print spare parts, or upgrading kit)
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
  
  // If not found, check print spare part products
  if (!product) {
    for (const brand in printSparePartProducts) {
      const brandProducts = printSparePartProducts[brand];
      product = brandProducts.find(p => p.id === productId);
      if (product) break;
    }
  }
  
  // If not found, check upgrading kit products
  if (!product) {
    for (const brand in upgradingKitProducts) {
      const brandProducts = upgradingKitProducts[brand];
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
        'Dispalys': 'Displays',
        'Other': 'Other'
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
    'Epson Printer Spare Parts': 'Print Spare Parts',
    'Roland Printer Spare Parts': 'Print Spare Parts',
    'Canon Printer Spare Parts': 'Print Spare Parts',
    'Ricoh Printer Spare Parts': 'Print Spare Parts',
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
  // Small delay for smooth transition
  setTimeout(() => {
    // Special handling for printer categories
    if (categoryName === 'Inkjet Printers') {
      // Load all printer products
      let allPrinters = [];
      for (const category in printerProducts) {
        allPrinters = allPrinters.concat(printerProducts[category]);
      }
      
      const productsHTML = renderProducts(allPrinters, 'printer');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('Inkjet Printers', allPrinters.length);
      
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
        <span class="breadcrumb-current">Inkjet Printers</span>
      `;    } else if (categoryName === 'Eco-Solvent Inkjet Printers - With XP600 Printhead') {
      // Load XP600 printers instead of showing placeholder
      const xp600Printers = getXP600Printers();
      const productsHTML = renderProducts(xp600Printers, 'printer');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('XP600 Eco-Solvent Inkjet Printers', xp600Printers.length);
      
      // Update breadcrumb
      let breadcrumbElement = document.querySelector('.breadcrumb-nav');
      if (!breadcrumbElement) {
        breadcrumbElement = document.createElement('div');
        breadcrumbElement.className = 'breadcrumb-nav';

        const mainElement = document.querySelector('.main');
        mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
      }      breadcrumbElement.innerHTML = `
        <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="loadInkjetPrinters()" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Eco-Solvent Inkjet Printers')" class="breadcrumb-link">Eco-Solvent Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">With XP600 Printhead</span>
      `;
    } else if (categoryName === 'Eco-Solvent Inkjet Printers - With I1600 Printhead') {
      // Load I1600 printers instead of showing placeholder
      const i1600Printers = getI1600Printers();
      const productsHTML = renderProducts(i1600Printers, 'printer');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('I1600 Eco-Solvent Inkjet Printers', i1600Printers.length);
      
      // Update breadcrumb
      let breadcrumbElement = document.querySelector('.breadcrumb-nav');
      if (!breadcrumbElement) {
        breadcrumbElement = document.createElement('div');
        breadcrumbElement.className = 'breadcrumb-nav';

        const mainElement = document.querySelector('.main');
        mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
      }      breadcrumbElement.innerHTML = `
        <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="loadInkjetPrinters()" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Eco-Solvent Inkjet Printers')" class="breadcrumb-link">Eco-Solvent Inkjet Printers</a>        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">With I1600 Printhead</span>
      `;
    } else if (categoryName === 'Eco-Solvent Inkjet Printers - With I3200 Printhead') {
      // Load I3200 printers instead of showing placeholder
      const i3200Printers = getI3200Printers();
      const productsHTML = renderProducts(i3200Printers, 'printer');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('I3200 Eco-Solvent Inkjet Printers', i3200Printers.length);
      
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
        <a href="javascript:void(0)" onclick="loadInkjetPrinters()" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Eco-Solvent Inkjet Printers')" class="breadcrumb-link">Eco-Solvent Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">With I3200 Printhead</span>
      `;} else if (categoryName === 'Eco-Solvent Inkjet Printers') {
      // Load all eco-solvent printers (XP600, I1600, and I3200)
      const xp600Printers = getXP600Printers();
      const i1600Printers = getI1600Printers();
      const i3200Printers = getI3200Printers();
      const allEcoSolventPrinters = [...xp600Printers, ...i1600Printers, ...i3200Printers];
      const productsHTML = renderProducts(allEcoSolventPrinters, 'printer');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('Eco-Solvent Inkjet Printers', allEcoSolventPrinters.length);
      
      // Update breadcrumb
      let breadcrumbElement = document.querySelector('.breadcrumb-nav');
      if (!breadcrumbElement) {
        breadcrumbElement = document.createElement('div');
        breadcrumbElement.className = 'breadcrumb-nav';

        const mainElement = document.querySelector('.main');
        mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
      }      breadcrumbElement.innerHTML = `        <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="loadInkjetPrinters()" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">Eco-Solvent Inkjet Printers</span>
      `;
    } else if (categoryName === 'Print Spare Parts') {
      // Load all print spare parts
      let allPrintSpareParts = [];
      for (const category in printSparePartProducts) {
        allPrintSpareParts = allPrintSpareParts.concat(printSparePartProducts[category]);
      }
      
      const productsHTML = renderProducts(allPrintSpareParts, 'printsparepart');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
      
      // Update page header
      updatePageHeader('Print Spare Parts', allPrintSpareParts.length);
      
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
        <span class="breadcrumb-current">Print Spare Parts</span>
      `;    } else if (categoryName === 'Epson Printer Spare Parts') {
      // Load Epson printer spare parts specifically
      const epsonSpareParts = printSparePartProducts.epson || [];
      
      const productsHTML = renderProducts(epsonSpareParts, 'printsparepart');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('Epson Printer Spare Parts', epsonSpareParts.length);
      
      // Update breadcrumb
      let breadcrumbElement = document.querySelector('.breadcrumb-nav');
      if (!breadcrumbElement) {
        breadcrumbElement = document.createElement('div');
        breadcrumbElement.className = 'breadcrumb-nav';

        const mainElement = document.querySelector('.main');
        mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
      }      breadcrumbElement.innerHTML = `
        <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Print Spare Parts')" class="breadcrumb-link">Print Spare Parts</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">Epson Printer Spare Parts</span>
      `;    } else if (categoryName === 'Roland Printer Spare Parts') {
      // Load Roland printer spare parts specifically
      const rolandSpareParts = printSparePartProducts.roland || [];
      
      const productsHTML = renderProducts(rolandSpareParts, 'printsparepart');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('Roland Printer Spare Parts', rolandSpareParts.length);
      
      // Update breadcrumb      let breadcrumbElement = document.querySelector('.breadcrumb-nav');
      if (!breadcrumbElement) {
        breadcrumbElement = document.createElement('div');
        breadcrumbElement.className = 'breadcrumb-nav';

        const mainElement = document.querySelector('.main');
        mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
      }
      breadcrumbElement.innerHTML = `
        <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Print Spare Parts')" class="breadcrumb-link">Print Spare Parts</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">Roland Printer Spare Parts</span>
      `;    } else if (categoryName === 'Canon Printer Spare Parts') {
      // Load Canon printer spare parts specifically
      const canonSpareParts = printSparePartProducts.canon || [];
      
      const productsHTML = renderProducts(canonSpareParts, 'printsparepart');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('Canon Printer Spare Parts', canonSpareParts.length);
      
      // Update breadcrumb
      let breadcrumbElement = document.querySelector('.breadcrumb-nav');
      if (!breadcrumbElement) {
        breadcrumbElement = document.createElement('div');
        breadcrumbElement.className = 'breadcrumb-nav';

        const mainElement = document.querySelector('.main');
        mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
      }      breadcrumbElement.innerHTML = `
        <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Print Spare Parts')" class="breadcrumb-link">Print Spare Parts</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">Canon Printer Spare Parts</span>
      `;    } else if (categoryName === 'Ricoh Printer Spare Parts') {
      // Load Ricoh printer spare parts specifically
      const ricohSpareParts = printSparePartProducts.ricoh || [];
      
      const productsHTML = renderProducts(ricohSpareParts, 'printsparepart');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('Ricoh Printer Spare Parts', ricohSpareParts.length);
      
      // Update breadcrumb
      let breadcrumbElement = document.querySelector('.breadcrumb-nav');
      if (!breadcrumbElement) {
        breadcrumbElement = document.createElement('div');
        breadcrumbElement.className = 'breadcrumb-nav';

        const mainElement = document.querySelector('.main');
        mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
      }      breadcrumbElement.innerHTML = `
        <a href="javascript:void(0)" onclick="loadAllProducts()" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('Print Spare Parts')" class="breadcrumb-link">Print Spare Parts</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">Ricoh Printer Spare Parts</span>
      `;
    } else if (categoryName === 'Upgrading Kit') {
      // Load all upgrading kit products
      let allUpgradingKitProducts = [];
      for (const brand in upgradingKitProducts) {
        allUpgradingKitProducts = allUpgradingKitProducts.concat(upgradingKitProducts[brand]);
      }
      
      const productsHTML = renderProducts(allUpgradingKitProducts, 'upgradingkit');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page header
      updatePageHeader('Upgrading Kit', allUpgradingKitProducts.length);
      
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
        <span class="breadcrumb-current">Upgrading Kit</span>
      `;
    } else {
      // For other categories, show placeholder content
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
    }

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

// Function to load all print spare parts
window.loadAllPrintSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Print Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get all print spare parts
    let allPrintSpareParts = [];
    for (const category in printSparePartProducts) {
      allPrintSpareParts = allPrintSpareParts.concat(printSparePartProducts[category]);
    }
    
    const productsHTML = renderProducts(allPrintSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show print spare parts category
    updatePageHeader('Print Spare Parts', allPrintSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('printSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Epson Printer Spare Parts specifically
window.loadEpsonPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Epson Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {    // Get Epson printer spare parts
    const epsonSpareParts = printSparePartProducts.epson || [];
    
    const productsHTML = renderProducts(epsonSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show Epson printer spare parts category
    updatePageHeader('Epson Printer Spare Parts', epsonSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('epsonPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Roland Printer Spare Parts specifically
window.loadRolandPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Roland Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {    // Get Roland printer spare parts
    const rolandSpareParts = printSparePartProducts.roland || [];
    
    const productsHTML = renderProducts(rolandSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show Roland printer spare parts category
    updatePageHeader('Roland Printer Spare Parts', rolandSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('rolandPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Canon Printer Spare Parts specifically
window.loadCanonPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Canon Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {    // Get Canon printer spare parts
    const canonSpareParts = printSparePartProducts.canon || [];
    
    const productsHTML = renderProducts(canonSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show Canon printer spare parts category
    updatePageHeader('Canon Printer Spare Parts', canonSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('canonPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Ricoh Printer Spare Parts specifically
window.loadRicohPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Ricoh Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {    // Get Ricoh printer spare parts
    const ricohSpareParts = printSparePartProducts.ricoh || [];
    
    const productsHTML = renderProducts(ricohSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show Ricoh printer spare parts category
    updatePageHeader('Ricoh Printer Spare Parts', ricohSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('ricohPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Infiniti/Challenger Printer Spare Parts specifically
window.loadInfinitiChallengerPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Infiniti / Challenger Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Infiniti/Challenger printer spare parts
    const infinitiChallengerSpareParts = printSparePartProducts.infiniti_challenger || [];
    
    const productsHTML = renderProducts(infinitiChallengerSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show Infiniti/Challenger printer spare parts category
    updatePageHeader('Infiniti / Challenger Printer Spare Parts', infinitiChallengerSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('infinitiChallengerPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Flora Printer Spare Parts specifically
window.loadFloraPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Flora Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Flora printer spare parts
    const floraSpareParts = printSparePartProducts.flora || [];
    
    const productsHTML = renderProducts(floraSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show Flora printer spare parts category
    updatePageHeader('Flora Printer Spare Parts', floraSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('floraPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Galaxy Printer Spare Parts specifically
window.loadGalaxyPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Galaxy Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition

  setTimeout(() => {
    // Get Galaxy printer spare parts
    const galaxySpareParts = printSparePartProducts.galaxy || [];
    
    const productsHTML = renderProducts(galaxySpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show Galaxy printer spare parts category
    updatePageHeader('Galaxy Printer Spare Parts', galaxySpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('galaxyPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Mimaki Printer Spare Parts specifically
window.loadMimakiPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Mimaki Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Mimaki printer spare parts
    const mimakiSpareParts = printSparePartProducts.mimaki || [];
    
    const productsHTML = renderProducts(mimakiSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show Mimaki printer spare parts category
    updatePageHeader('Mimaki Printer Spare Parts', mimakiSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('mimakiPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Mutoh Printer Spare Parts specifically
window.loadMutohPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Mutoh Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Mutoh printer spare parts
    const mutohSpareParts = printSparePartProducts.mutoh || [];
    
    const productsHTML = renderProducts(mutohSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title or add a header to show Mutoh printer spare parts category
    updatePageHeader('Mutoh Printer Spare Parts', mutohSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('mutohPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Wit-color Printer Spare Parts specifically
window.loadWitColorPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Wit-color Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Wit-color printer spare parts
    const witcolorSpareParts = printSparePartProducts.witcolor || [];
    
    const productsHTML = renderProducts(witcolorSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title or add a header to show Wit-color printer spare parts category
    updatePageHeader('Wit-color Printer Spare Parts', witColorSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('witColorPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Gongzheng Printer Spare Parts specifically
window.loadGongzhengPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Gongzheng Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Gongzheng printer spare parts
    const gongzhengSpareParts = printSparePartProducts.gongzheng || [];
    
    const productsHTML = renderProducts(gongzhengSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title or add a header to show Gongzheng printer spare parts category
    updatePageHeader('Gongzheng Printer Spare Parts', gongzhengSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('gongzhengPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Human Printer Spare Parts specifically
window.loadHumanPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Human Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Human printer spare parts
    const humanSpareParts = printSparePartProducts.human || [];
    
    const productsHTML = renderProducts(humanSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title or add a header to show Human printer spare parts category
    updatePageHeader('Human Printer Spare Parts', humanSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('humanPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Teflon Printer Spare Parts specifically
window.loadTeflonPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Teflon Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Teflon printer spare parts
    const teflonSpareParts = printSparePartProducts.teflon || [];
    
    const productsHTML = renderProducts(teflonSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title or add a header to show Teflon printer spare parts category
    updatePageHeader('Teflon Printer Spare Parts', teflonSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('teflonPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Wiper Printer Spare Parts specifically
window.loadWiperPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Wiper Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Wiper printer spare parts
    const wiperSpareParts = printSparePartProducts.wiper || [];
    
    const productsHTML = renderProducts(wiperSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title or add a header to show Wiper printer spare parts category
    updatePageHeader('Wiper Printer Spare Parts', wiperSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('wiperPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Xaar Printer Spare Parts specifically
window.loadXaarPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Xaar Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Xaar printer spare parts
    const xaarSpareParts = printSparePartProducts.xaar || [];
    
    const productsHTML = renderProducts(xaarSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title or add a header to show Xaar printer spare parts category
    updatePageHeader('Xaar Printer Spare Parts', xaarSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('xaarPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load Toshiba Printer Spare Parts specifically
window.loadToshibaPrinterSpareParts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Toshiba Printer Spare Parts') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Get Toshiba printer spare parts
    const toshibaSpareParts = printSparePartProducts.toshiba || [];
    
    const productsHTML = renderProducts(toshibaSpareParts, 'printsparepart');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
    
    // Update page title or add a header to show Toshiba printer spare parts category
    updatePageHeader('Toshiba Printer Spare Parts', toshibaSpareParts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('toshibaPrinterSpareParts');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Hero Carousel functionality
class HeroCarousel {
  constructor() {
    console.log('HeroCarousel constructor called');
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.hero-slide');
    this.indicators = document.querySelectorAll('.hero-indicator');
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 seconds
    
    console.log(`Found ${this.slides.length} slides and ${this.indicators.length} indicators`);
    
    if (this.slides.length > 0) {
      this.init();
    } else {
      console.warn('No hero slides found!');
    }
  }
  
  init() {
    console.log('Initializing hero carousel');
    // Show first slide
    this.showSlide(0);
    
    // Start auto-play
    this.startAutoPlay();
    
    // Add event listeners for manual navigation
    this.addEventListeners();
  }
    showSlide(index) {
    console.log(`Showing slide ${index}`);
    // Hide all slides
    this.slides.forEach((slide, i) => {
      slide.style.opacity = '0';
      slide.style.transform = i < index ? 'translateX(-100%)' : 'translateX(100%)';
      slide.style.zIndex = '1';
      slide.classList.remove('active');
    });
    
    // Show current slide
    if (this.slides[index]) {
      this.slides[index].style.opacity = '1';
      this.slides[index].style.transform = 'translateX(0)';
      this.slides[index].style.zIndex = '2';
      this.slides[index].classList.add('active');
      console.log(`Slide ${index} is now active`);
    }
    
    // Update indicators
    this.indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
    
    this.currentSlide = index;
  }
    goToSlide(index) {
    if (index >= 0 && index < this.slides.length) {
      this.showSlide(index);
      this.restartAutoPlay();
    }
  }
  
  next() {
    this.nextSlide();
    this.restartAutoPlay();
  }
  
  prev() {
    this.previousSlide();
    this.restartAutoPlay();
  }
  
  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(nextIndex);
  }
  
  previousSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prevIndex);
  }
  
  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  restartAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
  
  addEventListeners() {
    // Pause auto-play on hover
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
      heroCarousel.addEventListener('mouseenter', () => this.stopAutoPlay());
      heroCarousel.addEventListener('mouseleave', () => this.startAutoPlay());
    }
  }
}

// Initialize hero carousel
let heroCarousel;

// Make heroCarousel globally accessible
window.heroCarousel = null;

// Expose product data globally for search system
window.printerProducts = printerProducts;
window.printheadProducts = printheadProducts;
window.printSparePartProducts = printSparePartProducts;
window.upgradingKitProducts = upgradingKitProducts;

// Expose utility functions globally for search system
window.updatePageHeader = updatePageHeader;
window.hideHeroBanner = hideHeroBanner;
window.hideActiveSubmenus = hideActiveSubmenus;
window.renderProducts = renderProducts;
window.attachAddToCartListeners = attachAddToCartListeners;
window.scrollToProducts = scrollToProducts;

// Function to load material products for a specific category
window.loadMaterialProducts = function(category) {
  const categoryProducts = materialProducts[category];
  if (categoryProducts) {
    // Hide the submenu after selection
    hideActiveSubmenus();
    
    // Hide hero banner for specific category views
    hideHeroBanner();
    
    // Highlight selected menu item
    highlightSelectedMenuItem(category);
    
    // Add loading animation
    showLoadingState();
    
    // Small delay for smooth transition
    setTimeout(() => {
      const productsHTML = renderProducts(categoryProducts, 'material');
      const productsGrid = document.querySelector('.js-prodcts-grid');
      productsGrid.innerHTML = productsHTML;
      productsGrid.classList.remove('showing-coming-soon');
      
      // Re-attach event listeners for the new add to cart buttons
      attachAddToCartListeners();
        // Update page title or add a header to show which category is selected
      updatePageHeader(`${category.charAt(0).toUpperCase() + category.slice(1)} Materials`, categoryProducts.length);
      
      // Update breadcrumb navigation
      updateBreadcrumb(`material-${category}`);
      
      // Scroll to top of products
      scrollToProducts();
    }, 200);
  }
};

// Function to load all material products from all categories
window.loadAllMaterialProducts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Material') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Combine all material products from all categories
    let allMaterialProducts = [];
    for (const category in materialProducts) {
      allMaterialProducts = allMaterialProducts.concat(materialProducts[category]);
    }
    
    const productsHTML = renderProducts(allMaterialProducts, 'material');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show material category
    updatePageHeader('Material', allMaterialProducts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('material');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load specific channel letter category products
window.loadChannelLetterProducts = function(category) {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Channel Letter') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    const productsToShow = channelLetterBendingMechineProducts[category] || [];
    const productsHTML = renderProducts(productsToShow, 'channel-letter');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    updatePageHeader(`${categoryName} Channel Letter`, productsToShow.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('channel-letter', category);
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      // Scroll to top of products
      scrollToProducts();
    }
  }, 200);
};

// Function to load all channel letter products from all categories
window.loadAllChannelLetterProducts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Channel Letter') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Combine all channel letter products from all categories
    let allChannelLetterProducts = [];
    for (const category in channelLetterBendingMechineProducts) {
      allChannelLetterProducts = allChannelLetterProducts.concat(channelLetterBendingMechineProducts[category]);
    }
    
    const productsHTML = renderProducts(allChannelLetterProducts, 'channel-letter');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show channel letter category
    updatePageHeader('Channel Letter', allChannelLetterProducts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('channel-letter');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};

// Function to load specific other category products
window.loadOtherProducts = function(category) {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Other') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    const productsToShow = otherProducts[category] || [];
    const productsHTML = renderProducts(productsToShow, 'other');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    updatePageHeader(`${categoryName} Other Products`, productsToShow.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('other', category);
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      // Scroll to top of products
      scrollToProducts();
    }
  }, 200);
};

// Function to load all other products from all categories
window.loadAllOtherProducts = function() {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Hide hero banner for specific category views
  hideHeroBanner();
  
  // Highlight selected menu item in the navigation
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === 'Other') {
      link.classList.add('active');
    }
  });
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    // Combine all other products from all categories
    let allOtherProducts = [];
    for (const category in otherProducts) {
      allOtherProducts = allOtherProducts.concat(otherProducts[category]);
    }
    
    const productsHTML = renderProducts(allOtherProducts, 'other');
    const productsGrid = document.querySelector('.js-prodcts-grid');
    productsGrid.innerHTML = productsHTML;
    productsGrid.classList.remove('showing-coming-soon');
    
    // Re-attach event listeners for the new add to cart buttons
    attachAddToCartListeners();
      // Update page title or add a header to show other category
    updatePageHeader('Other Products', allOtherProducts.length);
    
    // Update breadcrumb navigation
    updateBreadcrumb('other');
    
    // Check if we need to skip scrolling
    const urlSearchParams = new URLSearchParams(window.location.search);
    const skipScroll = urlSearchParams.get('noscroll') === 'true';
    
    // Scroll to top of products only if not skipping
    if (!skipScroll) {
      scrollToProducts();
    }
  }, 200);
};


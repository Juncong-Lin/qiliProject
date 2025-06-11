// Temporarily commented out cart imports - preserved for future reuse
// import {cart, addToCart} from '../../data/cart.js'; 
import {products} from '../../data/products.js';
import {printheadProducts} from '../../data/printhead-products.js';
import {printerProducts, getXP600Printers, getI1600Printers, getI3200Printers} from '../../data/printer-products.js';
import {printSparePartProducts} from '../../data/printsparepart-products.js';
import {upgradingKitProducts} from '../../data/upgradingkit-products.js';
import { formatCurrency, formatPriceRange } from '../shared/money.js';

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
              return 'Price not available';
            }
          })()}        </div>
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
    updatePageHeader('XP600 Inkjet Printers');
    
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
    updatePageHeader('I1600 Inkjet Printers');
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
    updatePageHeader('I3200 Inkjet Printers');
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
      updatePageHeader(`${brand.charAt(0).toUpperCase() + brand.slice(1)} Upgrading Kit`);
      
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
    updatePageHeader('Upgrading Kit');
    
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
          <span class="breadcrumb-current">${brand.charAt(0).toUpperCase() + brand.slice(1).replace(/_/g, ' ')} Products</span>
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
    }
  } else if (hash === 'canon-printer-spare-parts') {
    if (window.loadCanonPrinterSpareParts) {
      window.loadCanonPrinterSpareParts();
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
      updatePageHeader('Inkjet Printers');
      
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
      updatePageHeader('XP600 Eco-Solvent Inkjet Printers');
      
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
      updatePageHeader('I1600 Eco-Solvent Inkjet Printers');
      
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
      updatePageHeader('I3200 Eco-Solvent Inkjet Printers');
      
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
      updatePageHeader('Eco-Solvent Inkjet Printers');
      
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
      updatePageHeader('Print Spare Parts');
      
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
      updatePageHeader('Epson Printer Spare Parts');
      
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
      updatePageHeader('Roland Printer Spare Parts');
      
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
      updatePageHeader('Canon Printer Spare Parts');
      
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
      updatePageHeader('Ricoh Printer Spare Parts');
      
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
      updatePageHeader('Upgrading Kit');
      
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
    updatePageHeader('Print Spare Parts');
    
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
    updatePageHeader('Epson Printer Spare Parts');
    
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
    updatePageHeader('Roland Printer Spare Parts');
    
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
    updatePageHeader('Canon Printer Spare Parts');
    
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
    updatePageHeader('Ricoh Printer Spare Parts');
    
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


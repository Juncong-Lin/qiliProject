import {cart, addToCart} from '../data/cart.js'; 
import {products} from '../data/products.js';
import {printheadProducts} from '../data/printhead-products.js';
import { formatCurrency } from './utils/money.js';

// Function to render regular products
function renderProducts(productList) {
  let productsHTML = '';
  productList.forEach((product) => {
    productsHTML += `
      <div class="product-container">        <div class="product-image-container">
          <a href="detail.html?productId=${product.id}" class="product-image-link">
            <img class="product-image" src="${product.image}">
          </a>
        </div>
        <div class="product-name limit-text-to-3-lines">
          <a href="detail.html?productId=${product.id}" class="product-link">
            ${product.name}
          </a>
        </div>        <div class="product-price">
          ${product.getPrice ? product.getPrice() : formatCurrency(product.price)}
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

// Function to render printhead products without ratings
function renderPrintheadProducts(productList) {
  let productsHTML = '';
  productList.forEach((product) => {
    productsHTML += `
      <div class="product-container">
        <div class="product-image-container">
          <a href="detail.html?productId=${product.id}" class="product-image-link">
            <img class="product-image" src="${product.image}">
          </a>
        </div>        <div class="product-name limit-text-to-3-lines">
          <a href="detail.html?productId=${product.id}" class="product-link">
            ${product.name}
          </a>
        </div>        <div class="product-price">
          $${formatCurrency(product.price)}
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
    
    // Highlight selected menu item
    highlightSelectedMenuItem(brand);
    
    // Add loading animation
    showLoadingState();
    
    // Small delay for smooth transition
    setTimeout(() => {
      const productsHTML = renderPrintheadProducts(brandProducts);
      document.querySelector('.js-prodcts-grid').innerHTML = productsHTML;
      
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
    }
    
    const productsHTML = renderPrintheadProducts(allPrintheadProducts);
    document.querySelector('.js-prodcts-grid').innerHTML = productsHTML;
    
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
  
  // Add loading animation
  showLoadingState();
  
  // Small delay for smooth transition
  setTimeout(() => {
    const productsHTML = renderProducts(products);
    document.querySelector('.js-prodcts-grid').innerHTML = productsHTML;
    
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
  loadAllProducts();
});

function updateCartQuantity() {
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
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

// Function to handle loading of specific category products
window.loadSpecificCategory = function(categoryName) {
  // Hide the submenu after selection
  hideActiveSubmenus();
  
  // Add loading animation
  showLoadingState();
  
  // Highlight the corresponding nav item
  document.querySelectorAll('.sub-header-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.trim() === categoryName) {
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
    document.querySelector('.js-prodcts-grid').innerHTML = message;
    
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


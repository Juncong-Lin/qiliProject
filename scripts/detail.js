import { products } from '../data/products.js';
import { printheadProducts } from '../data/printhead-products.js';
import { cart, addToCart } from '../data/cart.js';
import { updateCartQuantity } from './utils/cart-quantity.js';
import { parseMarkdown } from './utils/markdown-parser.js';

let productId;
let productType = 'regular'; // Can be 'regular' or 'printhead'
let productBrand = '';

// Get the product ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
productId = urlParams.get('productId');

// Find the product in our data - check both regular products and printhead products
let product = products.find(product => product.id === productId);

// If not found in regular products, search in printhead products
if (!product) {
  for (const brand in printheadProducts) {
    const brandProducts = printheadProducts[brand];
    product = brandProducts.find(p => p.id === productId);
    if (product) {
      productType = 'printhead';
      productBrand = brand;
      break;
    }
  }
}

if (product) {
  // Unified breadcrumb rendering
  updateBreadcrumbDetail(product, productType, productBrand);

  // Update the product details on the page
  document.querySelector('.js-product-image').src = product.image;
  document.querySelector('.js-product-name').textContent = product.name;
    
  // Handle rating display - hide rating elements for printhead products since ratings were removed
  const ratingElement = document.querySelector('.js-product-rating');
  const ratingCountElement = document.querySelector('.js-product-rating-count');
  
  if (product.rating && typeof product.rating === 'object' && product.rating.stars) {
    // For regular products that still have ratings
    ratingElement.src = `images/ratings/rating-${Math.round(product.rating.stars * 10)}.png`;
    ratingElement.style.display = 'block';
    ratingCountElement.textContent = `(${product.rating.count})`;
    ratingCountElement.style.display = 'block';
  } else {
    // For printhead products or products without ratings, hide rating elements
    const ratingContainer = document.querySelector('.product-rating-container');
    if (ratingContainer) ratingContainer.style.display = 'none';
  }
  
  // Handle price display - printhead products have price in cents, regular products have getPrice() method
  const priceText = product.getPrice ? product.getPrice() : `$${(product.price / 100).toFixed(2)}`;
  document.querySelector('.js-product-price').textContent = priceText;
  
  // If there's an original price (for sale items), show it
  const originalPriceElement = document.querySelector('.js-product-original-price');
  if (product.originalPrice) {
    const originalPriceText = `$${(product.originalPrice / 100).toFixed(2)}`;
    originalPriceElement.textContent = originalPriceText;
    originalPriceElement.style.display = 'block';
  } else {
    originalPriceElement.style.display = 'none';
  }
  
  // Add product tags if any
  const tagsContainer = document.querySelector('.js-product-tags');
  if (productType === 'printhead') {
    tagsContainer.innerHTML = `
      <div class="product-tag primary">
        <span>Original OEM</span>
      </div>
      <div class="product-tag">
        <span>In Stock</span>
      </div>
    `;
  } else if (product.tags && product.tags.length > 0) {
    tagsContainer.innerHTML = product.tags.map(tag => 
      `<div class="product-tag">
        <span>${tag}</span>
      </div>`
    ).join('');
  }
  
  // Set basic product description
  document.querySelector('.js-product-description').textContent = product.description || 'No description available.';
  
  // Update the page title
  document.title = `${product.name} - Qilitrading.com`;
    // For printhead products, try to load additional product information
  if (productType === 'printhead') {
    loadPrintheadDetails(product);
  } else {
    // For regular products, set up default content
    setupRegularProductContent(product);
  }

  // Set up the product image gallery
  setupImageGallery(product);
  
  // Set up product information tabs
  setupProductTabs();
  
} else {
  // Handle case when product is not found
  document.querySelector('.product-detail-grid').innerHTML = `
    <div class="error-message">
      Product not found. <a href="index.html">Return to homepage</a>
    </div>
  `;
}

/**
 * Sets up the product image gallery with thumbnails
 */
function setupImageGallery(product) {
  let mainImagePath = product.image;
  if (productType === 'printhead') {
    try {
      const imageParts = mainImagePath.split('/');
      const fileName = imageParts[imageParts.length - 1];
      const basePath = mainImagePath.substring(0, mainImagePath.lastIndexOf('/') + 1);
      const baseFileName = fileName.split('.img_')[0];
      const imagePaths = [];      for (let i = 1; i <= 10; i++) {
        imagePaths.push(`${basePath}${baseFileName}.img_${i}.jpg`);
      }
      
      // Check which images actually exist before creating thumbnails
      const thumbnailsContainer = document.querySelector('.js-product-thumbnails');
      let validImages = [];
      let loadPromises = [];
      
      // Create promises to check each image
      imagePaths.forEach((path, index) => {
        const promise = new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ path, index, exists: true });
          img.onerror = () => resolve({ path, index, exists: false });
          img.src = path;
        });
        loadPromises.push(promise);
      });
      
      // Wait for all image checks to complete
      Promise.all(loadPromises).then((results) => {
        // Filter only existing images
        validImages = results.filter(img => img.exists);
        
        let thumbnailsHTML = '';
        if (validImages.length === 0) {
          // If no thumbnail images exist, use the main product image
          thumbnailsHTML = `
            <div class="thumbnail-item active" data-image="${product.image}" data-index="0">
              <img src="${product.image}" alt="${product.name} thumbnail" class="thumbnail-img">
            </div>
          `;
        } else {
          // Create thumbnails for existing images only
          validImages.forEach((img, i) => {
            thumbnailsHTML += `
              <div class="thumbnail-item ${i === 0 ? 'active' : ''}" data-image="${img.path}" data-index="${i}">
                <img src="${img.path}" alt="${product.name} thumbnail ${i + 1}" class="thumbnail-img">
              </div>
            `;
          });
          
          // Set main image to first valid image
          document.querySelector('.js-product-image').src = validImages[0].path;
        }          thumbnailsContainer.innerHTML = thumbnailsHTML;
        
        // Now setup scrolling logic with the actual thumbnails
        let startIndex = 0;
        const maxVisible = 5;
        const thumbnails = Array.from(document.querySelectorAll('.thumbnail-item'));
        
        function updateVisibleThumbnails() {
          thumbnails.forEach((thumb, idx) => {
            if (idx >= startIndex && idx < startIndex + maxVisible) {
              thumb.style.display = '';
            } else {
              thumb.style.display = 'none';
            }
          });
        }
        
        // Only show arrows if we have more thumbnails than maxVisible
        const leftArrow = document.querySelector('.js-thumbnail-arrow-left');
        const rightArrow = document.querySelector('.js-thumbnail-arrow-right');
        
        if (thumbnails.length <= maxVisible) {
          // Hide arrows if we don't need them
          leftArrow.style.display = 'none';
          rightArrow.style.display = 'none';
          // Show all thumbnails when we have 5 or fewer
          thumbnails.forEach(thumb => thumb.style.display = '');
        } else {
          // Show arrows and setup scrolling
          leftArrow.style.display = 'flex';
          rightArrow.style.display = 'flex';
          
          updateVisibleThumbnails();
          
          function updateArrows() {
            leftArrow.disabled = startIndex === 0;
            rightArrow.disabled = startIndex + maxVisible >= thumbnails.length;
          }
          updateArrows();
          
          leftArrow.addEventListener('click', () => {
            if (startIndex > 0) {
              startIndex--;
              updateVisibleThumbnails();
              updateArrows();
            }
          });
          
          rightArrow.addEventListener('click', () => {
            if (startIndex + maxVisible < thumbnails.length) {
              startIndex++;
              updateVisibleThumbnails();
              updateArrows();
            }
          });
        }
        
        // Thumbnail click event
        thumbnails.forEach(thumbnail => {
          thumbnail.addEventListener('click', () => {
            document.querySelector('.js-product-image').src = thumbnail.dataset.image;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
          });
        });
        
      });
    } catch (error) {
      console.error('Error setting up image gallery:', error);
    }
  }
}

/**
 * Load detailed information for printhead products
 */
async function loadPrintheadDetails(product) {
  try {
    // Extract the path to the markdown file
    const imagePath = product.image;
    
    // Get the brand and model name from the image path
    // Format: images/products-detail/Inkjet Printheads/Epson Printhead/Epson F1440-A1 (DX5) Printhead for Chinese Printer/image/...
    const pathParts = imagePath.split('/');
    const brandFolder = pathParts[3]; // "Epson Printhead"
    const modelFolder = pathParts[4]; // "Epson F1440-A1 (DX5) Printhead for Chinese Printer"
    
    // Construct path to MD file
    const mdFilePath = `images/products-detail/Inkjet Printheads/${brandFolder}/${modelFolder}/${modelFolder}.md`;
    
    // Fetch the markdown file content
    const response = await fetch(mdFilePath);
    
    if (!response.ok) {
      console.log('Failed to load product details from:', mdFilePath);
      return;
    }
    
    const mdContent = await response.text();
    
    // Parse the markdown content into sections
    const contentSections = separatePrintheadContent(mdContent);
    
    // Update product description with the short description
    if (contentSections.shortDescription) {
      document.querySelector('.js-product-description').innerHTML = parseMarkdown(contentSections.shortDescription);
    }
    
    // Update the product details tab content
    document.querySelector('.js-product-details-content').innerHTML = parseMarkdown(contentSections.mainContent) || '';
      // Update compatibility section if available
    if (contentSections.compatibility) {
      document.querySelector('.js-product-compatibility').innerHTML = parseMarkdown(contentSections.compatibility);
    } else {
      document.querySelector('.product-compatibility-section').style.display = 'none';
    }
      // Update specifications section if available
    if (contentSections.specifications) {
      document.querySelector('.js-product-specifications').innerHTML = parseMarkdown(contentSections.specifications);
    } else {
      document.querySelector('.product-specifications-section').style.display = 'none';
    }
    
    // For printhead products, hide reviews section since they don't have review content
    document.querySelector('.product-reviews-section').style.display = 'none';
    
  } catch (error) {
    console.error('Error loading printhead details:', error);
  }
}

/**
 * Separate the markdown content into different sections based on content
 */
function separatePrintheadContent(mdContent) {
  // Define the sections we want to extract
  const sections = {
    shortDescription: '',
    mainContent: '',
    compatibility: '',
    specifications: '',
    notices: ''
  };
  
  // Split content into lines
  const lines = mdContent.split('\n');
  
  // Initial processing to extract the main title and short description
  let currentSection = 'mainContent';
  let titleFound = false;
  let shortDescEnded = false;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip HTML comments or empty lines at the beginning
    if (line.startsWith('<!--') || (line === '' && !titleFound)) {
      continue;
    }
    
    // Extract main title (first H1)
    if (line.startsWith('# ') && !titleFound) {
      sections.mainContent += line + '\n\n';
      titleFound = true;
      continue;
    }
    
    // Short description is the text right after the title until a blank line
    if (titleFound && !shortDescEnded) {
      if (line === '') {
        shortDescEnded = true;
      } else {
        sections.shortDescription += line + '\n';
      }
      continue;
    }
    
    // Detect section based on headers or content
    if (line.toLowerCase().includes('compatibility') || 
        line.toLowerCase().includes('compatible with') ||
        line.toLowerCase().includes('to be used with')) {
      currentSection = 'compatibility';
      sections[currentSection] += line + '\n';
    }
    else if (line.toLowerCase().includes('specification') || 
             line.toLowerCase().includes('model:') || 
             line.toLowerCase().includes('ink compatibility:')) {
      currentSection = 'specifications';
      sections[currentSection] += line + '\n';
    }
    else if (line.toLowerCase().includes('notice') || 
             line.toLowerCase().includes('attention') ||
             line.toLowerCase().includes('warning')) {
      currentSection = 'notices';
      sections[currentSection] += line + '\n';
    }
    else {
      // Add the line to the current section
      sections[currentSection] += line + '\n';
    }
  }
  
  // If we have notices, add them to the specifications section
  if (sections.notices) {
    if (sections.specifications) {
      sections.specifications += '\n\n' + sections.notices;
    } else {
      sections.specifications = sections.notices;
    }
  }
  
  return sections;
}

/**
 * Set up the product information tabs
 */
function setupProductTabs() {
  const tabHeaders = document.querySelectorAll('.tab-header');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabHeaders.forEach(header => {
    header.addEventListener('click', () => {
      // Remove active class from all headers and panels
      tabHeaders.forEach(h => h.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked header
      header.classList.add('active');
      
      // Add active class to corresponding panel
      const tabId = header.dataset.tab;
      document.getElementById(tabId).classList.add('active');
    });
  });
}

/**
 * Set up content for regular (non-printhead) products
 */
function setupRegularProductContent(product) {
  // Set basic product details content
  document.querySelector('.js-product-details-content').innerHTML = `
    <p>This is a high-quality product designed to meet your needs. Check the specifications below for detailed information.</p>
  `;
  
  // Set compatibility content
  document.querySelector('.js-product-compatibility').innerHTML = `
    <p>This product is compatible with various systems and applications. Please check the specifications for detailed compatibility information.</p>
  `;
  
  // Set specifications content
  const specs = product.specifications || {};
  let specsHTML = '<table class="product-table"><tbody>';
  
  // Add basic specifications if available
  if (product.brand) {
    specsHTML += `<tr><td><strong>Brand</strong></td><td>${product.brand}</td></tr>`;
  }
  if (product.category) {
    specsHTML += `<tr><td><strong>Category</strong></td><td>${product.category}</td></tr>`;
  }
  if (product.model) {
    specsHTML += `<tr><td><strong>Model</strong></td><td>${product.model}</td></tr>`;
  }
  
  // Add any additional specifications from the product object
  Object.keys(specs).forEach(key => {
    specsHTML += `<tr><td><strong>${key}</strong></td><td>${specs[key]}</td></tr>`;
  });
  
  specsHTML += '</tbody></table>';
  document.querySelector('.js-product-specifications').innerHTML = specsHTML;
  
  // Set reviews content
  document.querySelector('.js-product-reviews').innerHTML = `
    <p>Customer reviews for this product will be displayed here. Currently showing placeholder content.</p>
    <div style="padding: 20px; background-color: #f9f9f9; border-radius: 4px; margin-top: 15px;">
      <p><strong>Review System Coming Soon</strong></p>
      <p>We're working on implementing a comprehensive review system. Check back soon to see what other customers think about this product!</p>
    </div>
  `;
}

// Add to cart functionality
document.querySelector('.js-add-to-cart')
  .addEventListener('click', () => {
    if (!productId) return;

    const quantitySelect = document.querySelector('.js-quantity-selector');
    const quantity = Number(quantitySelect.value);

    addToCart(productId, quantity);
    updateCartQuantity();

    // Show the "Added" message
    const addedMessage = document.querySelector('.js-added-message');
    addedMessage.style.opacity = '1';

    // Hide the message after 2 seconds
    setTimeout(() => {
      addedMessage.style.opacity = '0';
    }, 2000);
  });

function updateBreadcrumbDetail(product, productType, productBrand) {
  let breadcrumbElement = document.querySelector('.breadcrumb-nav');
  if (!breadcrumbElement) {
    // Create breadcrumb if it doesn't exist
    breadcrumbElement = document.createElement('div');
    breadcrumbElement.className = 'breadcrumb-nav';
    const mainElement = document.querySelector('.main');
    mainElement.insertBefore(breadcrumbElement, mainElement.firstChild);
  }
  if (productType === 'printhead') {
    if (!productBrand || productBrand === 'all' || productBrand === 'printHeads') {
      breadcrumbElement.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">Print Heads</span>
      `;
    } else {
      breadcrumbElement.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#printheads" class="breadcrumb-link">Print Heads</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">${productBrand.charAt(0).toUpperCase() + productBrand.slice(1)} Printheads</span>
      `;
    }
  } else {
    // For regular products, show category, subcategory, brand if available
    let html = `<a href="index.html" class="breadcrumb-link">Home</a>`;
    if (product.category) {
      html += `<span class="breadcrumb-separator">&gt;</span><a href="index.html#${product.category.toLowerCase().replace(/\s+/g, '-')}", class="breadcrumb-link">${product.category}</a>`;
    }
    if (product.subcategory) {
      html += `<span class="breadcrumb-separator">&gt;</span><a href="index.html#${product.subcategory.toLowerCase().replace(/\s+/g, '-')}", class="breadcrumb-link">${product.subcategory}</a>`;
    }
    if (product.brand) {
      html += `<span class="breadcrumb-separator">&gt;</span><span class="breadcrumb-current">${product.brand}</span>`;
    }
    breadcrumbElement.innerHTML = html;
  }
}

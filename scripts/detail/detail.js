import { products } from '../../data/products.js';
import { printheadProducts } from '../../data/printhead-products.js';
import { printerProducts } from '../../data/printer-products.js';
import { cart, addToCart } from '../../data/cart.js';
import { updateCartQuantity } from '../shared/cart-quantity.js';
import { parseMarkdown } from '../shared/markdown-parser.js';

let productId;
let productType = 'regular'; // Can be 'regular', 'printhead', or 'printer'
let productBrand = '';

// Get the product ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
productId = urlParams.get('id') || urlParams.get('productId');

// Find the product in our data - check regular products, printhead products, and printer products
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

// If not found in printhead products, search in printer products
if (!product) {
  for (const category in printerProducts) {
    const categoryProducts = printerProducts[category];
    product = categoryProducts.find(p => p.id === productId);
    if (product) {
      productType = 'printer';
      productBrand = category;
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
  } else if (productType === 'printer') {
    // For printer products, set up printer-specific content
    setupPrinterProductContent(product);
  } else {
    // For regular products, set up default content
    setupRegularProductContent(product);
  }
  // Set up the product image gallery
  setupImageGallery(product);
  
  // Set up product information tabs
  setupProductTabs();
  
  // Initialize cart quantity display on page load
  updateCartQuantity();
  
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
        const rightArrow = document.querySelector('.js-thumbnail-arrow-right');          // Check if we're on mobile (integrated mobile functionality)
        const isMobile = window.innerWidth <= 768;
          if (isMobile) {
          // On mobile, show arrows and setup touch scrolling
          leftArrow.style.display = 'flex';
          rightArrow.style.display = 'flex';
          // Show all thumbnails on mobile (scroll-based approach)
          thumbnails.forEach(thumb => thumb.style.display = '');
          
          // Setup mobile-specific touch scrolling and arrow functionality
          setupMobileArrowScrolling(leftArrow, rightArrow, thumbnailsContainer);
        } else {
          // Show arrows and setup scrolling (desktop - visibility-based approach)
          leftArrow.style.display = 'flex';
          rightArrow.style.display = 'flex';
          
          // If we have 5 or fewer thumbnails, show all and disable arrow functionality
          if (thumbnails.length <= maxVisible) {
            // Show all thumbnails when we have 5 or fewer
            thumbnails.forEach(thumb => thumb.style.display = '');
            // Disable arrows since no scrolling is needed
            leftArrow.disabled = true;
            rightArrow.disabled = true;
          } else {
            // Enable arrows and setup scrolling for more than 5 thumbnails
            leftArrow.disabled = false;
            rightArrow.disabled = false;
            
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
            });          }
        }
          // Thumbnail click event
        thumbnails.forEach(thumbnail => {
          thumbnail.addEventListener('click', () => {
            document.querySelector('.js-product-image').src = thumbnail.dataset.image;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
          });
        });

        // Mobile touch scrolling for thumbnails
        setupMobileTouchScrolling(thumbnailsContainer);
        
        // Mobile-friendly image sizing
        setupMobileImageSizing();
        
        // Handle window resize to switch between mobile and desktop scrolling modes
        function handleResize() {
          const isMobileNow = window.innerWidth <= 768;
          const leftArrowResize = document.querySelector('.js-thumbnail-arrow-left');
          const rightArrowResize = document.querySelector('.js-thumbnail-arrow-right');
          
          // Always show arrows regardless of thumbnail count
          leftArrowResize.style.display = 'flex';
          rightArrowResize.style.display = 'flex';
            if (isMobileNow) {
            // Switch to mobile mode: show all thumbnails, enable mobile scrolling
            thumbnails.forEach(thumb => thumb.style.display = '');
            setupMobileArrowScrolling(leftArrowResize, rightArrowResize, thumbnailsContainer);          } else {
            // Switch to desktop mode: use visibility-based scrolling
            // Clean up mobile scroll handlers
            if (leftArrowResize._mobileHandler) {
              leftArrowResize.removeEventListener('click', leftArrowResize._mobileHandler, true);
            }
            if (rightArrowResize._mobileHandler) {
              rightArrowResize.removeEventListener('click', rightArrowResize._mobileHandler, true);
            }
            
            // Restore normal overflow for desktop visibility-based scrolling
            thumbnailsContainer.style.overflow = 'hidden';
            thumbnailsContainer.style.scrollBehavior = 'auto';
            
            if (thumbnails.length <= maxVisible) {
              // Show all thumbnails and disable arrows when we have 5 or fewer
              thumbnails.forEach(thumb => thumb.style.display = '');
              leftArrowResize.disabled = true;
              rightArrowResize.disabled = true;
            } else {
              // Enable arrows and reset to beginning for more than 5 thumbnails
              leftArrowResize.disabled = false;
              rightArrowResize.disabled = false;
              startIndex = 0; // Reset to beginning
              updateVisibleThumbnails();
              updateArrows();
            }
          }
        }
        
        // Listen for resize events
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        
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

/**
 * Set up content for printer products
 */
function setupPrinterProductContent(product) {
  // Set product description with detailed information
  document.querySelector('.js-product-description').innerHTML = product.description || 'High-quality inkjet printer designed for professional printing applications.';
  
  // Set detailed product content
  document.querySelector('.js-product-details-content').innerHTML = `
    <h3>Product Overview</h3>
    <p>This professional inkjet printer offers ${product.specifications?.width || 'wide format'} printing capabilities with high-quality output suitable for various applications including signage, banners, and promotional materials.</p>
    
    ${product.specifications?.heads ? `<h4>Print Technology</h4>
    <ul>
      <li>Print Heads: ${product.specifications.heads}</li>
      <li>Print Technology: ${product.specifications.printTechnology || 'Eco-solvent inkjet'}</li>
      <li>Print Speed: ${product.specifications.printSpeed || 'High-speed printing'}</li>
    </ul>` : ''}
    
    ${product.specifications?.applications ? `<h4>Applications</h4>
    <ul>
      ${product.specifications.applications.map(app => `<li>${app}</li>`).join('')}
    </ul>` : ''}
    
    <h4>Key Features</h4>
    <ul>
      <li>Professional grade printing quality</li>
      <li>Reliable and durable construction</li>
      <li>Cost-effective printing solution</li>
      <li>Easy maintenance and operation</li>
    </ul>
  `;
  
  // Set compatibility content
  document.querySelector('.js-product-compatibility').innerHTML = `
    <h3>Compatible Media</h3>
    <p>This printer is compatible with a wide range of media types including:</p>
    <ul>
      <li>Vinyl materials</li>
      <li>Banner materials</li>
      <li>Canvas</li>
      <li>Photo paper</li>
      <li>Adhesive materials</li>
    </ul>
    
    ${product.specifications?.inkTypes ? `<h4>Ink Compatibility</h4>
    <ul>
      ${product.specifications.inkTypes.map(ink => `<li>${ink}</li>`).join('')}
    </ul>` : ''}
  `;
  
  // Set specifications content with detailed specs
  let specsHTML = '<table class="product-table"><tbody>';
  
  // Add basic specifications
  if (product.model) {
    specsHTML += `<tr><td><strong>Model</strong></td><td>${product.model}</td></tr>`;
  }
  if (product.specifications?.width) {
    specsHTML += `<tr><td><strong>Print Width</strong></td><td>${product.specifications.width}</td></tr>`;
  }
  if (product.specifications?.heads) {
    specsHTML += `<tr><td><strong>Print Heads</strong></td><td>${product.specifications.heads}</td></tr>`;
  }
  if (product.specifications?.printSpeed) {
    specsHTML += `<tr><td><strong>Print Speed</strong></td><td>${product.specifications.printSpeed}</td></tr>`;
  }
  if (product.specifications?.resolution) {
    specsHTML += `<tr><td><strong>Resolution</strong></td><td>${product.specifications.resolution}</td></tr>`;
  }
  if (product.specifications?.dimensions) {
    specsHTML += `<tr><td><strong>Dimensions</strong></td><td>${product.specifications.dimensions}</td></tr>`;
  }
  if (product.specifications?.weight) {
    specsHTML += `<tr><td><strong>Weight</strong></td><td>${product.specifications.weight}</td></tr>`;
  }
  if (product.specifications?.powerConsumption) {
    specsHTML += `<tr><td><strong>Power Consumption</strong></td><td>${product.specifications.powerConsumption}</td></tr>`;
  }
  if (product.specifications?.operatingEnvironment) {
    specsHTML += `<tr><td><strong>Operating Environment</strong></td><td>${product.specifications.operatingEnvironment}</td></tr>`;
  }
  
  // Add price range
  if (product.priceRange) {
    specsHTML += `<tr><td><strong>Price Range</strong></td><td>${product.priceRange}</td></tr>`;
  }
  
  specsHTML += '</tbody></table>';
  document.querySelector('.js-product-specifications').innerHTML = specsHTML;
  
  // Set reviews content for printers
  document.querySelector('.js-product-reviews').innerHTML = `
    <p>Customer reviews for this printer will be displayed here. Currently showing placeholder content.</p>
    <div style="padding: 20px; background-color: #f9f9f9; border-radius: 4px; margin-top: 15px;">
      <p><strong>Professional Printer Reviews Coming Soon</strong></p>
      <p>We're working on implementing a comprehensive review system for our industrial printers. Check back soon to see what other customers think about this printer's performance, reliability, and print quality!</p>
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
    }, 2000);  });

/**
 * Setup mobile touch scrolling for thumbnail gallery
 */
function setupMobileTouchScrolling(thumbnailsContainer) {
  if (!thumbnailsContainer) return;
  
  let touchStartX = 0;
  let touchEndX = 0;
  
  thumbnailsContainer.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  thumbnailsContainer.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const touchDiff = touchStartX - touchEndX;
    // Scroll the container by the swipe distance
    thumbnailsContainer.scrollLeft += touchDiff;
  }
}

/**
 * Setup mobile-friendly image sizing
 */
function setupMobileImageSizing() {
  function adjustImageHeight() {
    const imageContainer = document.querySelector('.product-main-image-container');
    const image = document.querySelector('.product-image');
    
    if (imageContainer && image) {
      // For mobile phones in portrait mode
      if (window.innerWidth < 600 && window.innerHeight > window.innerWidth) {
        const maxHeight = window.innerHeight * 0.45; // 45% of screen height
        image.style.maxHeight = `${maxHeight}px`;
      } else if (window.innerWidth < 900) {
        // For tablets or phones in landscape
        const maxHeight = window.innerHeight * 0.65; // 65% of screen height
        image.style.maxHeight = `${maxHeight}px`;
      } else {
        // For desktop
        image.style.maxHeight = '500px';
      }
    }
  }
  
  // Call once on load and on resize
  adjustImageHeight();
  window.addEventListener('resize', adjustImageHeight);
  window.addEventListener('orientationchange', adjustImageHeight);
}

/**
 * Setup mobile arrow scrolling for thumbnail navigation
 */
function setupMobileArrowScrolling(leftArrow, rightArrow, thumbnailsContainer) {
  if (!leftArrow || !rightArrow || !thumbnailsContainer) return;
  
  const scrollAmount = 90; // Approximate width of thumbnail + margin
  
  // Remove existing mobile handlers to avoid duplicates
  leftArrow.removeEventListener('click', leftArrow._mobileHandler, true);
  rightArrow.removeEventListener('click', rightArrow._mobileHandler, true);
  
  // Create new mobile handlers
  leftArrow._mobileHandler = function(e) {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      thumbnailsContainer.scrollLeft -= scrollAmount;
    }
  };
  
  rightArrow._mobileHandler = function(e) {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      thumbnailsContainer.scrollLeft += scrollAmount;
    }
  };
  
  // Add mobile handlers with high priority (capture phase)
  leftArrow.addEventListener('click', leftArrow._mobileHandler, true);
  rightArrow.addEventListener('click', rightArrow._mobileHandler, true);
  
  // Setup mobile scroll behavior
  thumbnailsContainer.style.overflow = 'hidden auto';
  thumbnailsContainer.style.scrollBehavior = 'smooth';
}

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
      `;    } else {      breadcrumbElement.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#printheads" class="breadcrumb-link">Print Heads</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#printheads-${productBrand}" class="breadcrumb-link">${productBrand.charAt(0).toUpperCase() + productBrand.slice(1)} Printheads</a>
      `;
    }  } else if (productType === 'printer') {
    // For printer products, show proper breadcrumb navigation
    if (productBrand === 'eco-solvent-xp600') {
      breadcrumbElement.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="loadAllPrinters()" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="loadXP600Printers()" class="breadcrumb-link">XP600 Eco-Solvent Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">${product.name}</span>
      `;
    } else {
      breadcrumbElement.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="javascript:void(0)" onclick="loadAllPrinters()" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">${product.name}</span>
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

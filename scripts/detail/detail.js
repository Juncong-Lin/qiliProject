import { products } from '../../data/products.js';
import { printheadProducts } from '../../data/printhead-products.js';
import { printerProducts, getI1600Printers, getI3200Printers } from '../../data/printer-products.js';
import { printSparePartProducts, getPrintSparePartById } from '../../data/printsparepart-products.js';
import { cart, addToCart } from '../../data/cart.js';
import { updateCartQuantity } from '../shared/cart-quantity.js';
import { parseMarkdown } from '../shared/markdown-parser.js';
import { displayDocumentContent } from '../shared/document-content-extractor.js';

let productId;
let productType = 'regular'; // Can be 'regular', 'printhead', 'printer', or 'printsparepart'
let productBrand = '';

// Get the product ID and type from URL parameters
const urlParams = new URLSearchParams(window.location.search);
productId = urlParams.get('id') || urlParams.get('productId') || urlParams.get('product');
const urlProductType = urlParams.get('productType');

// If productType is specified in URL, use it directly
if (urlProductType) {
  productType = urlProductType;
}

let product = null;

// If product type is specified in URL, search in the appropriate data structure
if (productType === 'printsparepart' || productType === 'print-spare-parts') {
  product = getPrintSparePartById(productId);
  if (product) {
    // Map brand to old category name for breadcrumb compatibility
    const brandToCategoryMap = {
      'epson': 'epson-printer-spare-parts',
      'roland': 'roland-printer-spare-parts', 
      'canon': 'canon-printer-spare-parts'
    };
    productBrand = brandToCategoryMap[product.brand] || 'epson-printer-spare-parts';
  }
} else if (productType === 'printhead') {
  // Search in printhead products
  for (const brand in printheadProducts) {
    const brandProducts = printheadProducts[brand];
    product = brandProducts.find(p => p.id === productId);
    if (product) {
      productBrand = brand;
      break;
    }
  }
} else if (productType === 'printer') {
  // Search in printer products
  for (const category in printerProducts) {
    const categoryProducts = printerProducts[category];
    product = categoryProducts.find(p => p.id === productId);
    if (product) {
      productBrand = category;
      break;
    }
  }
} else {
  // Search in regular products or auto-detect if no productType specified
  product = products.find(product => product.id === productId);
}

// If productType was not specified in URL and product not found, try auto-detection
if (!product && !urlProductType) {
  // Search in printhead products
  for (const brand in printheadProducts) {
    const brandProducts = printheadProducts[brand];
    product = brandProducts.find(p => p.id === productId);
    if (product) {
      productType = 'printhead';
      productBrand = brand;
      break;
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

  // If not found in printer products, search in print spare parts
  if (!product) {
    product = getPrintSparePartById(productId);
    if (product) {
      productType = 'printsparepart';
      // Map brand to old category name for breadcrumb compatibility
      const brandToCategoryMap = {
        'epson': 'epson-printer-spare-parts',
        'roland': 'roland-printer-spare-parts', 
        'canon': 'canon-printer-spare-parts'
      };
      productBrand = brandToCategoryMap[product.brand] || 'epson-printer-spare-parts';
    }
  }
}

if (product) {
  // Unified breadcrumb rendering
  updateBreadcrumbDetail(product, productType, productBrand);

  // Update the product details on the page
  document.querySelector('.js-product-image').src = product.image;
  document.querySelector('.js-product-name').textContent = product.name;
    // For printer products, hide the product description (red box)
  if (productType === 'printer') {
    const descriptionElement = document.querySelector('.js-product-description');
    if (descriptionElement) {
      descriptionElement.style.display = 'none';
    }
  }
    
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
    // Handle price display - different product types have different price formats
  let priceText;
  if (product.getPrice) {
    // Regular products with getPrice() method
    priceText = product.getPrice();
  } else if (productType === 'printsparepart') {
    // Print spare parts store price in cents
    priceText = `$${(product.price / 100).toFixed(2)}`;
  } else {
    // Printhead and printer products also store price in cents
    priceText = `$${(product.price / 100).toFixed(2)}`;
  }
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
  document.querySelector('.js-product-description').textContent = product.description || '';
    // Update the page title
  document.title = `${product.name} - Qilitrading.com`;  // Load content based on product type
  if (productType === 'printhead') {
    loadPrintheadDetails(product);
  } else if (productType === 'printsparepart' || productType === 'print-spare-parts') {
    setupPrintSparePartContent(product);  } else if (productType === 'printer') {
    setupPrinterProductContent(product);
  } else {
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
  const thumbnailsContainer = document.querySelector('.js-product-thumbnails');
  
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
        
        // Setup thumbnail gallery functionality
        setupThumbnailGalleryLogic();
        
      });
    } catch (error) {
      console.error('Error setting up printhead image gallery:', error);
    }
  } else if (productType === 'printer' && product.additionalImages && product.additionalImages.length > 0) {
    // Handle printer products with additional images
    try {
      // Start with main product image
      const allImages = [
        { path: product.image, label: 'Main Product Image' }
      ];
      
      // Add additional images with descriptive labels
      product.additionalImages.forEach((imagePath, index) => {
        let label = 'Additional Image';
        if (imagePath.includes('ink-supply-system')) {
          label = 'Ink Supply System';
        } else if (imagePath.includes('maintenance-station')) {
          label = 'Maintenance Station';
        } else if (imagePath.includes('media-pinch-roller')) {
          label = 'Media Pinch Roller';
        }
        allImages.push({ path: imagePath, label: label });
      });
      
      // Check which images actually exist
      let validImages = [];
      let loadPromises = [];
      
      allImages.forEach((imageObj, index) => {
        const promise = new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ ...imageObj, index, exists: true });
          img.onerror = () => resolve({ ...imageObj, index, exists: false });
          img.src = imageObj.path;
        });
        loadPromises.push(promise);
      });
      
      // Wait for all image checks to complete
      Promise.all(loadPromises).then((results) => {
        // Filter only existing images
        validImages = results.filter(img => img.exists);
        
        let thumbnailsHTML = '';
        if (validImages.length === 0) {
          // Fallback to main product image only
          thumbnailsHTML = `
            <div class="thumbnail-item active" data-image="${product.image}" data-index="0">
              <img src="${product.image}" alt="${product.name} thumbnail" class="thumbnail-img">
            </div>
          `;
        } else {
          // Create thumbnails for existing images
          validImages.forEach((img, i) => {
            thumbnailsHTML += `
              <div class="thumbnail-item ${i === 0 ? 'active' : ''}" data-image="${img.path}" data-index="${i}" title="${img.label}">
                <img src="${img.path}" alt="${img.label}" class="thumbnail-img">
              </div>
            `;
          });
          
          // Set main image to first valid image
          document.querySelector('.js-product-image').src = validImages[0].path;
        }
        
        thumbnailsContainer.innerHTML = thumbnailsHTML;
        
        // Setup thumbnail gallery functionality
        setupThumbnailGalleryLogic();
        
      });
    } catch (error) {
      console.error('Error setting up printer image gallery:', error);
      // Fallback to main image only
      setupSingleImageGallery(product);    }  } else if (productType === 'printsparepart') {
    // For print spare parts - they typically have only a main image
    setupSingleImageGallery(product);
  } else {
    // For products with only main image (regular products or printers without additional images)
    setupSingleImageGallery(product);
  }
}

/**
 * Setup gallery for products with multiple images (like print spare parts)
 */
function setupMultipleImageGallery(product) {
  const thumbnailsContainer = document.querySelector('.js-product-thumbnails');
  
  let thumbnailsHTML = '';
  product.images.forEach((imagePath, index) => {
    thumbnailsHTML += `
      <div class="thumbnail-item ${index === 0 ? 'active' : ''}" data-image="${imagePath}" data-index="${index}">
        <img src="${imagePath}" alt="${product.name} thumbnail ${index + 1}" class="thumbnail-img">
      </div>
    `;
  });
  
  thumbnailsContainer.innerHTML = thumbnailsHTML;
  
  // Set main image to first image
  document.querySelector('.js-product-image').src = product.images[0];
  
  // Setup thumbnail gallery functionality
  setupThumbnailGalleryLogic();
}

/**
 * Setup gallery for products with only a main image
 */
function setupSingleImageGallery(product) {
  const thumbnailsContainer = document.querySelector('.js-product-thumbnails');
  thumbnailsContainer.innerHTML = `
    <div class="thumbnail-item active" data-image="${product.image}" data-index="0">
      <img src="${product.image}" alt="${product.name} thumbnail" class="thumbnail-img">
    </div>
  `;
  
  // Hide arrows for single image
  const leftArrow = document.querySelector('.js-thumbnail-arrow-left');
  const rightArrow = document.querySelector('.js-thumbnail-arrow-right');
  if (leftArrow) leftArrow.style.display = 'none';
  if (rightArrow) rightArrow.style.display = 'none';
  
  // Setup basic thumbnail click functionality
  const thumbnail = document.querySelector('.thumbnail-item');
  if (thumbnail) {
    thumbnail.addEventListener('click', () => {
      document.querySelector('.js-product-image').src = thumbnail.dataset.image;
    });
  }
}

/**
 * Setup thumbnail gallery navigation logic (shared between printhead and printer galleries)
 */
function setupThumbnailGalleryLogic() {
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
  
  // Check if we're on mobile (integrated mobile functionality)
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // On mobile, show arrows and setup touch scrolling
    leftArrow.style.display = 'flex';
    rightArrow.style.display = 'flex';
    // Show all thumbnails on mobile (scroll-based approach)
    thumbnails.forEach(thumb => thumb.style.display = '');
    
    // Setup mobile-specific touch scrolling and arrow functionality
    setupMobileArrowScrolling(leftArrow, rightArrow, document.querySelector('.js-product-thumbnails'));
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
      });
    }
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
  setupMobileTouchScrolling(document.querySelector('.js-product-thumbnails'));
  
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
      setupMobileArrowScrolling(leftArrowResize, rightArrowResize, document.querySelector('.js-product-thumbnails'));
    } else {
      // Switch to desktop mode: use visibility-based scrolling
      // Clean up mobile scroll handlers
      if (leftArrowResize._mobileHandler) {
        leftArrowResize.removeEventListener('click', leftArrowResize._mobileHandler, true);
      }
      if (rightArrowResize._mobileHandler) {
        rightArrowResize.removeEventListener('click', rightArrowResize._mobileHandler, true);
      }
      
      // Restore normal overflow for desktop visibility-based scrolling
      document.querySelector('.js-product-thumbnails').style.overflow = 'hidden';
      document.querySelector('.js-product-thumbnails').style.scrollBehavior = 'auto';
      
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
async function setupRegularProductContent(product) {
  try {
    // Extract the path to the markdown file from the image path
    const imagePath = product.image;
    
    // Get the path components from the image path
    // Expected format: images/products-detail/Inkjet Printers/.../Product Name/Product Name.md
    const pathParts = imagePath.split('/');
    if (pathParts.length >= 5 && pathParts[2] === 'Inkjet' && pathParts[3] === 'Printers') {
      // Find the product folder (usually the second-to-last folder before the image file)
      const productFolder = pathParts[pathParts.length - 2]; // Folder containing the image
      const pathUpToProduct = pathParts.slice(0, -1).join('/'); // Path up to the product folder
      
      // Try to find markdown file with same name as product folder
      let mdFilePath = `${pathUpToProduct}/${productFolder}.md`;
      
      // If image has a special suffix like "(the economic version)", try that for the MD file too
      const imageName = pathParts[pathParts.length - 1];
      const baseImageName = imageName.split('.')[0];
      if (baseImageName !== productFolder) {
        mdFilePath = `${pathUpToProduct}/${baseImageName}.md`;
      }
      
      // Fetch the markdown file content
      const response = await fetch(mdFilePath);
      if (!response.ok) {
        // Fallback to hardcoded content if markdown file is not found
        setupFallbackRegularProductContent(product);
        return;
      }
      
      const mdContent = await response.text();
      
      // Update product description and content with the markdown content
      // For regular products, we'll use the entire markdown content as the main content
      const parsedContent = parseMarkdown(mdContent);
      
      // Update the product details tab content with the full markdown content
      document.querySelector('.js-product-details-content').innerHTML = parsedContent || '';
      
      // Hide compatibility and specifications sections since we're loading everything from markdown
      document.querySelector('.product-compatibility-section').style.display = 'none';
      document.querySelector('.product-specifications-section').style.display = 'none';
      
    } else {
      // If path doesn't match expected format, use fallback
      setupFallbackRegularProductContent(product);
    }
    
  } catch (error) {
    console.error('Error loading regular product details:', error);
    // Fallback to hardcoded content if there's an error
    setupFallbackRegularProductContent(product);
  }
}

/**
 * Fallback function for regular product content when markdown loading fails
 */
function setupFallbackRegularProductContent(product) {
  // Set minimal fallback content
  document.querySelector('.js-product-details-content').innerHTML = `
    <h3>${product.name}</h3>
    <p>Product information is currently being updated. Please contact us for detailed specifications.</p>
  `;

  // Hide sections since we don't have structured data
  document.querySelector('.product-compatibility-section').style.display = 'none';
  document.querySelector('.product-specifications-section').style.display = 'none';
}

/**
 * Set up content for printer products (now uses unified PDF/document logic for all printers)
 */
function setupPrinterProductContent(product) {
  // Set basic product description
  document.querySelector('.js-product-description').innerHTML = product.description || 'High-quality inkjet printer designed for professional printing applications.';
  
  // Try to use the PDF/document viewer functionality for printer products
  try {
    addDocumentViewerForAllPrinters(product, productId);
  } catch (error) {
    console.error('Error loading document viewer for printer:', error);
    // Fallback to basic content if document viewer fails
    setupBasicPrinterContent(product);
  }
}

/**
 * Fallback function for printer content when document loading fails
 */
function setupBasicPrinterContent(product) {
  // Set basic content for printers that don't have documents or when document loading fails
  document.querySelector('.js-product-details-content').innerHTML = `
    <h3>Product Overview</h3>
    <p>This professional inkjet printer offers high-quality printing capabilities suitable for various applications.</p>
    <p>For detailed specifications and documentation, please contact our support team.</p>
  `;
  
  // Hide sections that aren't relevant for basic printer display
  const compatibilitySection = document.querySelector('.product-compatibility-section');
  const specificationsSection = document.querySelector('.product-specifications-section');
  
  if (compatibilitySection) compatibilitySection.style.display = 'none';
  if (specificationsSection) specificationsSection.style.display = 'none';
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

// Function to extract and display document content directly for all printer products
function addDocumentViewerForAllPrinters(product, productId) {
  // This function should only be called for printer products
  // The calling function should ensure this is a printer product
  
  // Hide product title for printer products per user request
  const productTitleElement = document.querySelector('.product-title-container');
  if (productTitleElement) {
    productTitleElement.style.display = 'none';
  }// Extract information from the product image path to determine the document path
  const imagePath = product.image;
  
  // Extract folder path components
  const pathSegments = imagePath.split('/');
  const basePath = pathSegments.slice(0, -1).join('/');
  const productFolder = pathSegments[pathSegments.length - 2];
  
  // Direct approach: scan the folder and find relevant PDF or DOCX files
  (async () => {
    try {
      // Try to load the product folder content (this won't work in browser due to CORS,
      // but we'll fall back to predefined patterns)
      
      // Prepare a list of possible document filenames
      const documentFiles = [];
        // Extract different name variations from the product data
      const variations = [];
      
      // 1. Get filename from image path (most common case)
      const fullImageFilename = pathSegments[pathSegments.length - 1];
      const filenameWithoutExt = fullImageFilename.substring(0, fullImageFilename.lastIndexOf('.'));
      variations.push(filenameWithoutExt);
      
      // 2. Use product name
      variations.push(product.name);
      
      // 3. Use product model ID
      variations.push(productId);
      
      // 4. Handle XP600 filename inconsistencies specifically
      if (productId === 'AM1802XP') {
        variations.push('AM1802XP 1.8meter Inkjet printer with 2 XP600 Print head (the economic version)');
        variations.push('AM1802XP 1.8meter Inkjet Printer With 2XP600 Print Head(The Economic Version)');
        variations.push('AM1802XP 1.8meter Inkjet printer with 2 XP600 Print head (The Economic Version)');
        variations.push('AM1802XP 1.8meter Inkjet Printer With 2 XP600 Print Head (the economic version)');
      }
      
      // 4. Some products have capitalization differences
      if (filenameWithoutExt.includes('(')) {
        const baseName = filenameWithoutExt.substring(0, filenameWithoutExt.lastIndexOf('(') - 1);
        const suffix = filenameWithoutExt.substring(filenameWithoutExt.lastIndexOf('('));
        
        // Add variation with different casing in suffix
        variations.push(`${baseName} ${suffix.toLowerCase()}`);
        variations.push(`${baseName} ${suffix.toUpperCase()}`);
        
        // Add variations with different spacing
        variations.push(`${baseName}${suffix}`);
        
        // Add truncated name variations
        variations.push(baseName);
        variations.push(`${baseName}(t`);  // Special case observed
      }
      
      // Generate all possible document paths
      variations.forEach(name => {
        // Standard extensions
        documentFiles.push(`${basePath}/${name}.pdf`);
        documentFiles.push(`${basePath}/${name}.docx`);
        documentFiles.push(`${basePath}/${name}.doc`);
        
        // Try with normalized casing for extensions
        const normalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        documentFiles.push(`${basePath}/${normalizedName}.pdf`);
        documentFiles.push(`${basePath}/${normalizedName}.docx`);
        documentFiles.push(`${basePath}/${normalizedName}.doc`);
      });
        // Extra check - look for documents with similar model IDs
      // For example, "AM1802XP" might match "AM1802XP 1.8meter Inkjet Printer With 2XP600 Print Head(The Economic Version).pdf"
      const productIdVariations = [
        productId,
        productId.toLowerCase(),
        productId.toUpperCase(),
        `${productId} `,
        `${productId}-`
      ];
      
      productIdVariations.forEach(idVar => {
        documentFiles.push(`${basePath}/*${idVar}*.pdf`);
        documentFiles.push(`${basePath}/*${idVar}*.docx`);
        documentFiles.push(`${basePath}/*${idVar}*.doc`);
      });
      
      // Try different folder structures/naming conventions
      let folderName = '';
      for (const segment of pathSegments) {
        if (segment.includes(productId)) {
          folderName = segment;
          break;
        }
      }
      
      if (folderName) {
        // Extract possible subpaths where documents might be located
        const possibleFolderPaths = [
          `${basePath}`,
          `${pathSegments.slice(0, -2).join('/')}/${folderName}`,
          `${pathSegments.slice(0, -3).join('/')}/${folderName}`
        ];
        
        // Check all possible paths for documents
        possibleFolderPaths.forEach(path => {
          documentFiles.push(`${path}/${productId}*.pdf`);
          documentFiles.push(`${path}/${productId}*.docx`);
          documentFiles.push(`${path}/${productId}*.doc`);
        });
      }      
      console.log('Searching for documents with these patterns:', documentFiles);
      
      // Temporary timeout to ensure this doesn't block indefinitely
      let documentFound = false;
      const maxWaitTime = 5000;
      const startTime = Date.now();
      
      // Try each possible document path and use the first one that exists
      for (const path of documentFiles) {        try {
          // Check if we've spent too long looking
          if (Date.now() - startTime > maxWaitTime) {
            break;
          }
          
          // Skip wildcard paths (they won't work with fetch directly)            if (path.includes('*')) continue;
            
            const response = await fetch(path, { method: 'HEAD' });          if (response.ok) {
            // Extract and display the document content directly in product details
            displayDocumentContent(productId, path);
            documentFound = true;
            return; // Exit after finding the first valid document
          }
        } catch (error) {
          // Continue trying other paths
        }
      }
      
      // FALLBACK: If no document is found through the patterns, try direct known file paths
      if (!documentFound) {        // These are specific to the printer models observed in the screenshots
        const knownDocuments = {
          // XP600 printhead model documents
          'AM1802XP': `${pathSegments.slice(0, -1).join('/')}/AM1802XP 1.8meter Inkjet printer with 2 XP600 Print head (the economic version).pdf`,
          'AM1601XP': `${pathSegments.slice(0, -1).join('/')}/AM1601XP 1.6meter Inkjet printer with 1 XP600 Printhead (the economic version).pdf`,
          'AM1901XP': `${pathSegments.slice(0, -1).join('/')}/AM1901XP 1.9meter Inkjet printer with 1 XP600 Printhead (the economic version).pdf`,
          
          // i1600 printhead model documents
          'AM1601i16': `${pathSegments.slice(0, -2).join('/')}/with I1600 Printhead/AM1601i16 1.6meter Inkjet printer with 1 i1600 Printhead (the economic version).pdf`,
          'AM1802i16': `${pathSegments.slice(0, -2).join('/')}/with I1600 Printhead/AM1802i16 1.8meter Inkjet printer with 2 i1600 Printhead (the economic version).pdf`,
          'AM1901i16': `${pathSegments.slice(0, -2).join('/')}/with I1600 Printhead/AM1901i16 1.9meter Inkjet printer with 1 i1600 Printhead (the economic version).pdf`,
          
          // i3200 printhead model documents
          'AM1601i32': `${pathSegments.slice(0, -2).join('/')}/with I3200 Printhead/AM1601i32 1.6meter Inkjet printer with 1 i3200 Printhead (the economic version).pdf`,
          'AM1802i32': `${pathSegments.slice(0, -2).join('/')}/with I3200 Printhead/AM1802i32 1.8meter Inkjet printer with 2 i3200 Printhead (the economic version).pdf`,
          'AM1901i32': `${pathSegments.slice(0, -2).join('/')}/with I3200 Printhead/AM1901i32 1.9meter Inkjet printer with 1 i3200 Printhead (the economic version).pdf`,
        };
        
        // Add an additional AM1802XP specific check due to observed naming inconsistencies
        if (productId === 'AM1802XP') {
          knownDocuments['AM1802XP'] = `${pathSegments.slice(0, -1).join('/')}/AM1802XP 1.8meter Inkjet printer with 2 XP600 Print head (the economic version).pdf`;
        }
          // Try the known path for this product
        if (knownDocuments[productId]) {
          try {
            const response = await fetch(knownDocuments[productId], { method: 'HEAD' });
            if (response.ok) {
              displayDocumentContent(productId, knownDocuments[productId]);
              documentFound = true;
              return;
            }
          } catch (error) {
            // Continue to alternative casing attempt
          }
        }
          // Try with alternative casing for the filename (some files have inconsistent casing)
        if (!documentFound && knownDocuments[productId]) {
          // Try multiple casing variations
          const altCasings = [
            // Original path
            knownDocuments[productId],
            // Economic Version capitalized
            knownDocuments[productId].replace('economic version', 'Economic Version'),
            // Change "Print head" to "Printhead"
            knownDocuments[productId].replace('Print head', 'Printhead'),
            // Change "Printhead" to "Print head"
            knownDocuments[productId].replace('Printhead', 'Print head'),
            // Change spacing around parentheses
            knownDocuments[productId].replace(' (', '('),
            // Change "printer" to "Printer"
            knownDocuments[productId].replace('printer', 'Printer'),
            // Change "with" to "With"
            knownDocuments[productId].replace(' with ', ' With ')
          ];
            for (const altPath of altCasings) {
            try {
              const response = await fetch(altPath, { method: 'HEAD' });
              if (response.ok) {
                displayDocumentContent(productId, altPath);
                documentFound = true;
                return;
              }
            } catch (error) {
              // Continue to next alternative casing
            }
          }
        }
      }
        // If we reach here, no document was found
      if (!documentFound) {
        console.error('No document found for product:', productId);
        const detailsContainer = document.querySelector('.js-product-details-content');
        if (detailsContainer) {
          // Display a more helpful error with debug info
          detailsContainer.innerHTML = `
            <div class="document-error">
              <p>Product documentation could not be loaded.</p>
              <p>Please check the browser console for detailed error messages.</p>
              <div class="debug-info" style="margin-top: 20px; color: #777; font-size: 0.8em;">
                <p>Debug Information (for developers):</p>
                <p>Product ID: ${productId}</p>
                <p>Image Path: ${imagePath}</p>
                <p>Base Path: ${basePath}</p>
              </div>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error('Error searching for document:', error);
    }
  })();
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
        <a href="index.html#inkjet-printers" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#inkjetprinters-ecosolvent" class="breadcrumb-link">Eco-Solvent Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#eco-solvent-xp600-printers" class="breadcrumb-link">With XP600 Printhead</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">${product.name}</span>
      `;
    } else if (productBrand === 'eco-solvent-i3200') {
      breadcrumbElement.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#inkjet-printers" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#inkjetprinters-ecosolvent" class="breadcrumb-link">Eco-Solvent Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#eco-solvent-i3200-printers" class="breadcrumb-link">With I3200 Printhead</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">${product.name}</span>
      `;
    } else if (productBrand === 'eco-solvent-i1600') {
      breadcrumbElement.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#inkjet-printers" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#inkjetprinters-ecosolvent" class="breadcrumb-link">Eco-Solvent Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#eco-solvent-i1600-printers" class="breadcrumb-link">With I1600 Printhead</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">${product.name}</span>
      `;
    } else {
      breadcrumbElement.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">&gt;</span>
        <a href="index.html#inkjet-printers" class="breadcrumb-link">Inkjet Printers</a>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">${product.name}</span>
      `;
    }  } else if (productType === 'printsparepart') {
    // For print spare parts, show proper breadcrumb navigation based on brand
    const brandName = product.brand.charAt(0).toUpperCase() + product.brand.slice(1);
    breadcrumbElement.innerHTML = `
      <a href="index.html" class="breadcrumb-link">Home</a>
      <span class="breadcrumb-separator">&gt;</span>
      <a href="index.html#print-spare-parts" class="breadcrumb-link">Print Spare Parts</a>
      <span class="breadcrumb-separator">&gt;</span>
      <a href="javascript:void(0)" onclick="window.loadSpecificCategory && window.loadSpecificCategory('${brandName} Printer Spare Parts')" class="breadcrumb-link">${brandName} Printer Spare Parts</a>
      <span class="breadcrumb-separator">&gt;</span>
      <span class="breadcrumb-current">${product.name}</span>
    `;
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

/**
 * Set up content for print spare parts products
 */
async function setupPrintSparePartContent(product) {
  try {
    // Extract the path to the markdown file from the image path
    const imagePath = product.image;
    
    // Get the brand folder and product folder from the image path
    // Format: images/products-detail/Print Spare Parts/Canon Printer Spare Parts/Product Name/image/...
    const pathParts = imagePath.split('/');
    const brandFolder = pathParts[3]; // "Canon Printer Spare Parts"
    const productFolder = pathParts[4]; // Product name folder
    
    // Construct path to MD file
    const mdFilePath = `images/products-detail/Print Spare Parts/${brandFolder}/${productFolder}/${productFolder}.md`;
    
    // Fetch the markdown file content
    const response = await fetch(mdFilePath);
    if (!response.ok) {
      // Fallback to hardcoded content if markdown file is not found
      setupFallbackPrintSparePartContent(product);
      return;
    }
    
    const mdContent = await response.text();
    
    // Update product description and content with the markdown content
    // For spare parts, we'll use the entire markdown content as the main content
    const parsedContent = parseMarkdown(mdContent);
    
    // Update the product details tab content with the full markdown content
    document.querySelector('.js-product-details-content').innerHTML = parsedContent || '';
    
    // Hide compatibility and specifications sections since spare parts typically don't have structured sections
    document.querySelector('.product-compatibility-section').style.display = 'none';
    document.querySelector('.product-specifications-section').style.display = 'none';
    
  } catch (error) {
    console.error('Error loading print spare part details:', error);
    // Fallback to hardcoded content if there's an error
    setupFallbackPrintSparePartContent(product);
  }
}

/**
 * Fallback function for print spare part content when markdown loading fails
 */
function setupFallbackPrintSparePartContent(product) {
  // Set minimal fallback content
  const brandName = product.brand.charAt(0).toUpperCase() + product.brand.slice(1);
  
  document.querySelector('.js-product-details-content').innerHTML = `
    <h3>${product.name}</h3>
    <p>${brandName} printer spare part. Product information is currently being updated. Please contact us for detailed specifications.</p>
  `;
  
  // Hide sections since we don't have detailed data
  document.querySelector('.product-compatibility-section').style.display = 'none';
  document.querySelector('.product-specifications-section').style.display = 'none';
}

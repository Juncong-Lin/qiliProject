import { products } from '../data/products.js';
import { printheadProducts } from '../data/printhead-products.js';
import { cart, addToCart } from '../data/cart.js';
import { updateCartQuantity } from './utils/cart-quantity.js';

let productId;

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
    if (product) break;
  }
}

if (product) {
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
    if (ratingElement) ratingElement.style.display = 'none';
    if (ratingCountElement) ratingCountElement.style.display = 'none';
  }
  
  // Handle price display - printhead products have price in cents, regular products have getPrice() method
  const priceText = product.getPrice ? product.getPrice() : `$${(product.price / 100).toFixed(2)}`;
  document.querySelector('.js-product-price').textContent = priceText;
  
  document.querySelector('.js-product-description').textContent = product.description || 'No description available.';
  
  // Update the page title
  document.title = `${product.name} - Qilitrading.com`;
} else {
  // Handle case when product is not found
  document.querySelector('.product-detail-grid').innerHTML = `
    <div class="error-message">
      Product not found. <a href="index.html">Return to homepage</a>
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

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
  
  // Handle rating display - printhead products have rating object, regular products have rating.stars path
  if (product.rating && typeof product.rating === 'object') {
    if (product.rating.stars) {
      // For printhead products, show star rating differently
      document.querySelector('.js-product-rating').src = `images/ratings/rating-${Math.round(product.rating.stars * 10)}.png`;
      document.querySelector('.js-product-rating-count').textContent = `(${product.rating.count})`;
    } else {
      // For regular products
      document.querySelector('.js-product-rating').src = product.rating.stars;
      document.querySelector('.js-product-rating-count').textContent = `(${product.rating.count})`;
    }
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

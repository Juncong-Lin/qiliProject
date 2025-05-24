import {cart, addToCart} from '../data/cart.js'; 
import {products} from '../data/products.js';
import { formatCurrency } from './utils/money.js';


let productsHTML = '';
products.forEach((product) => {
  productsHTML += `
    <div class="product-container">      <div class="product-image-container">
        <a href="detail.html?productId=${product.id}" class="product-image-link">
          <img class="product-image" src="${product.image}">
        </a>
      </div>      <div class="product-name limit-text-to-2-lines">
        <a href="detail.html?productId=${product.id}" class="product-link">
          ${product.name}
        </a>
      </div>

      <div class="product-price">
        ${product.getPrice()}
      </div>

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

      <div class="product-spacer"></div>

      <div class="added-message">Added</div>

      <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
        Add to Cart
      </button>
    </div>`
});

document.querySelector('.js-prodcts-grid').innerHTML = productsHTML;

function updateCartQuantity() {
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

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


import {cart, removeFromCart, updateDeliveryOption} from '../../data/cart.js';   
import {products} from '../../data/products.js';
import {printheadProducts} from '../../data/printhead-products.js';
import {formatCurrency} from '../utils/money.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import {deliveryOptions, getDeliveryOption} from '../../data/deleveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';
import { updateCartQuantity } from '../utils/cart-quantity.js';

export function renderOrderSummary() {
// Get unique items and total quantity for the heading
const uniqueItems = cart.length;
const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

// Start with empty HTML - the page title is now rendered separately in checkout.js
let cartSummaryHTML = ``;

cart.forEach((cartItem) => {
  const productId = cartItem.productId;
  let matchingProduct;
  
  // First search in regular products
  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });
  
  // If not found in regular products, search in printhead products
  if (!matchingProduct) {
    for (const brand in printheadProducts) {
      const brandProducts = printheadProducts[brand];
      const found = brandProducts.find(product => product.id === productId);
      if (found) {
        matchingProduct = found;
        break;
      }
    }
  }

  if (!matchingProduct) {
    console.error('Product not found for ID:', productId);
    return; // Skip this item if product not found
  }

  const deliveryOptionId = cartItem.deliveryOptionId;
  let deliveryOption;
  deliveryOptions.forEach((option) => {
    if (option.id === deliveryOptionId) {
      deliveryOption = option;
      }
  });

  if (!deliveryOption) {
    console.error('Delivery option not found for ID:', deliveryOptionId);
    deliveryOption = deliveryOptions[0]; // Use first delivery option as fallback
  }

  const today = dayjs();
  const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
  const dateString = deliveryDate.format('dddd, MMMM D');    cartSummaryHTML += `
      <div class="cart-item-container 
      js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">
          Delivery date: ${dateString}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              $${formatCurrency(matchingProduct.priceCents || matchingProduct.price)}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
                Update
              </span>
              <span class="delete-quantity-link link-primary \
              js-delete-link" data-product-id="${matchingProduct.id}">
                Delete
              </span>
              <span class="js-quantity-select-container-${matchingProduct.id}" style="display:none;"></span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deleveryOptionsHTML(matchingProduct,cartItem)}
          </div>
        </div>
      </div>
    `;
  });

  document.querySelector('.js-order-summary')
    .innerHTML = cartSummaryHTML;
  document.querySelectorAll('.js-delete-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        removeFromCart(productId);

        // Update cart quantity in header immediately
        updateCartQuantity();

        // Check if cart is empty after removal
        if (cart.length === 0) {
          // Refresh the page to show empty cart message
          window.location.reload();
          return;
        }        // Update by re-rendering the order summary
        renderOrderSummary();
        renderPaymentSummary();
      });
    });


  document.querySelectorAll('.js-delivery-option')
    .forEach((element) => {
      element.addEventListener('click', () => {
        const {productId, deliveryOptionId} = element.dataset;
        updateDeliveryOption(productId, deliveryOptionId);
        renderOrderSummary();
        renderPaymentSummary();
      });
    });

  document.querySelectorAll('.js-update-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        const container = document.querySelector(`.js-quantity-select-container-${productId}`);
        // Create select dropdown
        let selectHTML = '<select class="js-quantity-select">';
        for (let i = 1; i <= 10; i++) {
          selectHTML += `<option value="${i}">${i}</option>`;
        }
        selectHTML += '</select>';
        container.innerHTML = selectHTML;
        container.style.display = '';
        // Hide update link
        link.style.display = 'none';
        // Set current value
        const select = container.querySelector('select');
        select.value = document.querySelector(`.js-quantity-label-${productId}`).textContent;
        select.focus();        select.addEventListener('change', () => {
          const newQuantity = Number(select.value);
          const cartItem = cart.find(item => item.productId === productId);
          cartItem.quantity = newQuantity;
          localStorage.setItem('cart', JSON.stringify(cart));
          
          // Update cart quantity in header immediately
          updateCartQuantity();
          
          // Update UI
          document.querySelector(`.js-quantity-label-${productId}`).textContent = newQuantity;
          container.style.display = 'none';
          link.style.display = '';          // Update summary only
          renderOrderSummary();
          renderPaymentSummary();
        });
      });
    });
}

function deleveryOptionsHTML(matchingProduct, cartItem) {
  let html = '';
  deliveryOptions.forEach((deliveryOption) => {
    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');
    const priceString = deliveryOption.priceCents === 0
      ? 'FREE'
      : `$${formatCurrency(deliveryOption.priceCents)} - Shipping`;

    const isChecked = deliveryOption.id === cartItem.deliveryOptionId;    html +=
    `
      <div class="delivery-option js-delivery-option"
      data-product-id="${matchingProduct.id}"
      data-delivery-option-id="${deliveryOption.id}">
        <input type="radio"
          ${isChecked ? 'checked' : ''}
        class="delivery-option-input"
          name="delivery-option-${matchingProduct.id}">
        <div class="delivery-option-info">
          <span class="delivery-option-date">${dateString}</span>
          <span class="delivery-option-price">${priceString}</span>
        </div>
      </div>
    `;
  });
  return html;
}


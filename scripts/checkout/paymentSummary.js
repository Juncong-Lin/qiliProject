import {cart} from '../../data/cart.js';
import {formatCurrency} from '../utils/money.js';
import {getProduct,products} from '../../data/products.js'; 
import {removeFromCart, updateDeliveryOption} from '../../data/cart.js';
import {deliveryOptions, getDeliveryOption} from '../../data/deleveryOptions.js';


export function renderPaymentSummary() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    productPriceCents += product. priceCents * cartItem.quantity;

    const deliveryOptions = getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOptions.priceCents;
  });

  const totalBeforeTax = productPriceCents + shippingPriceCents;
  const tax = totalBeforeTax * 0.1;
  const total = totalBeforeTax + tax;

  let paymentSummaryHTML = `
    <div class="payment-summary-title">
      Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items (${cart.length}):</div>
      <div class="payment-summary-money">$${formatCurrency(productPriceCents)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">$${formatCurrency(shippingPriceCents)}</div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">$${formatCurrency(totalBeforeTax)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">$${formatCurrency(tax)}</div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">$${formatCurrency(total)}</div>
    </div>

    <button class="place-order-button button-primary js-place-order">
      Place your order
    </button>
  `;

  document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;

  document.querySelector('.js-place-order')
  .addEventListener('click', () => {
    alert('Your order has been placed!');
    cart.forEach((cartItem) => {
      const product = getProduct(cartItem.productId);
      removeFromCart(product.id);
    });
    renderPaymentSummary();
    renderOrderSummary();
  });
}




export function renderOrderSummary() {
  let paymentSummaryHTML = `
    <div class="order-summary-title">
      Order Summary
    </div>
  `;
  cart.forEach((cartItem) => {
    const metchingProduct = products.find((product) => product.id === cartItem.productId);
    paymentSummaryHTML += `
      <div class="order-summary-item js-cart-item-container-${cartItem.productId}">
        <div class="order-summary-product-image-container">
          <img class="order-summary-product-image"
            src="${metchingProduct.image}">
        </div>
        <div class="order-summary-product-details">
          <div class="product-name">
            ${metchingProduct.name}
          </div>
          <div class="product-price">
            $${formatCurrency(metchingProduct.priceCents)}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label">${
                cartItem.quantity
              }</span>
            </span>
            <span class="update-quantity-link link-primary">
              Update
            </span>
            <span class="delete-quantity-link link-primary 
            js-delete-link" data-product-id="${metchingProduct.id}">
              Delete
            </span>
          </div>
        </div>
      </div>
    `;
  });
  document.querySelector('.js-order-summary')
    .innerHTML = paymentSummaryHTML;
}

import {cart} from '../../data/cart.js';
import {formatCurrency} from '../utils/money.js';
import {getProduct,products} from '../../data/products.js'; 
import {printheadProducts} from '../../data/printhead-products.js';
import {removeFromCart, updateDeliveryOption} from '../../data/cart.js';
import {deliveryOptions, getDeliveryOption} from '../../data/deleveryOptions.js';


export function renderPaymentSummary() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    let product;
    
    // First search in regular products
    product = products.find((p) => p.id === cartItem.productId);
    
    // If not found in regular products, search in printhead products
    if (!product) {
      for (const brand in printheadProducts) {
        const brandProducts = printheadProducts[brand];
        const found = brandProducts.find(p => p.id === cartItem.productId);
        if (found) {
          product = found;
          break;
        }
      }
    }
    
    // Handle different price formats: priceCents (regular) vs price (printhead)
    const pricePerItem = product.priceCents || product.price;
    productPriceCents += pricePerItem * cartItem.quantity;

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

    <button class="place-order-button button-primary">
      Place your order
    </button>
  `;
  document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;
}

export function renderOrderSummary() {
  let paymentSummaryHTML = `
    <div class="order-summary-title">
      Order Summary
    </div>
  `;  cart.forEach((cartItem) => {
    let matchingProduct;
    
    // First search in regular products
    matchingProduct = products.find((product) => product.id === cartItem.productId);
    
    // If not found in regular products, search in printhead products
    if (!matchingProduct) {
      for (const brand in printheadProducts) {
        const brandProducts = printheadProducts[brand];
        const found = brandProducts.find(product => product.id === cartItem.productId);
        if (found) {
          matchingProduct = found;
          break;
        }
      }
    }
    paymentSummaryHTML += `
      <div class="order-summary-item js-cart-item-container-${cartItem.productId}">
        <div class="order-summary-product-image-container">
          <img class="order-summary-product-image"
            src="${matchingProduct.image}">
        </div>
        <div class="order-summary-product-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            $${formatCurrency(matchingProduct.priceCents || matchingProduct.price)}
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
            js-delete-link" data-product-id="${matchingProduct.id}">
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

import {cart, cleanInvalidItems} from '../../data/cart.js';
import {formatCurrency} from '../shared/money.js';
import {getProduct,products} from '../../data/products.js';
import {printheadProducts} from '../../data/printhead-products.js';
import {printerProducts} from '../../data/printer-products.js';
import {removeFromCart, updateDeliveryOption} from '../../data/cart.js';
import {deliveryOptions, getDeliveryOption} from '../../data/deleveryOptions.js';


export function renderPaymentSummary() {
  // First, clean invalid items from cart
  const allValidProductIds = [];
  
  // Collect all valid product IDs
  products.forEach(p => allValidProductIds.push(p.id));
  
  for (const brand in printheadProducts) {
    printheadProducts[brand].forEach(p => allValidProductIds.push(p.id));
  }
  
  for (const category in printerProducts) {
    printerProducts[category].forEach(p => allValidProductIds.push(p.id));
  }
  
  // Clean cart of invalid items
  cleanInvalidItems(allValidProductIds);
  
  // If cart is empty after cleaning, show empty cart message
  if (cart.length === 0) {
    document.querySelector('.js-payment-summary').style.display = 'none';
    document.querySelector('.checkout-grid').style.display = 'none';
    document.querySelector('.js-empty-cart').style.display = 'block';
    const pageTitleElement = document.querySelector('.page-title');
    if (pageTitleElement) {
      pageTitleElement.style.display = 'none';
    }
    return;
  }
  
  let productPriceCents = 0;
  let shippingPriceCents = 0;cart.forEach((cartItem) => {
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
    
    // If not found in printhead products, search in printer products
    if (!product) {
      for (const category in printerProducts) {
        const categoryProducts = printerProducts[category];
        const found = categoryProducts.find(p => p.id === cartItem.productId);
        if (found) {
          product = found;
          break;
        }
      }
    }
    
    // Skip if product not found to avoid errors
    if (!product) {
      console.warn(`Product with ID ${cartItem.productId} not found`);
      return;
    }
    
    // Handle different price formats: priceCents (regular) vs price (printhead)
    const pricePerItem = product.priceCents || product.price;
    productPriceCents += pricePerItem * cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOption.priceCents;
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
    
    // If not found in printhead products, search in printer products
    if (!matchingProduct) {
      for (const category in printerProducts) {
        const categoryProducts = printerProducts[category];
        const found = categoryProducts.find(product => product.id === cartItem.productId);
        if (found) {
          matchingProduct = found;
          break;
        }
      }
    }
    
    // Skip if product not found to avoid errors
    if (!matchingProduct) {
      console.warn(`Product with ID ${cartItem.productId} not found`);
      return;
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

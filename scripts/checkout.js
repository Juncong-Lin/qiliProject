import {renderOrderSummary} from './checkout/orderSummary.js';
import {renderPaymentSummary} from './checkout/paymentSummary.js';
import { cart } from '../data/cart.js';
import { updateCartQuantity } from './utils/cart-quantity.js';

// Checkout.js loaded
// Cart data available from import

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // DOM Content Loaded
  
  // Update cart quantity in header
  updateCartQuantity();
  
  // Calculate unique items and total quantity
  const uniqueItems = cart ? cart.length : 0;
  const totalQuantity = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  // Unique items and total quantity calculated

  // Handle empty cart state
  if (uniqueItems === 0) {
    // Cart is empty, showing empty cart message
    // Hide checkout elements
    document.querySelector('.checkout-grid').style.display = 'none';
    // Show empty cart message
    document.querySelector('.js-empty-cart').style.display = 'block';
    const pageTitleElement = document.querySelector('.page-title');
    if (pageTitleElement) {
      pageTitleElement.style.display = 'none';    }  } else {  
    // Cart has items, rendering checkout
    // Show normal checkout view
    document.querySelector('.checkout-grid').style.display = 'grid';
    document.querySelector('.js-empty-cart').style.display = 'none';
    
    const checkoutHeaderMiddle = document.querySelector('.checkout-header-middle-section');
    if (checkoutHeaderMiddle) {
      checkoutHeaderMiddle.innerHTML = '';
    }
      // Add page title above everything
    const mainElement = document.querySelector('.main');
    const emptyCartMessage = document.querySelector('.js-empty-cart');
    const paymentSummary = document.querySelector('.js-payment-summary');
    
    // Create page title element
    const pageTitleElement = document.createElement('div');
    pageTitleElement.className = 'page-title';
    pageTitleElement.innerHTML = `Checkout (Items: ${uniqueItems}, Total quantity: ${totalQuantity})`;
    
    // Insert page title after the empty cart message (which is hidden)
    mainElement.insertBefore(pageTitleElement, emptyCartMessage.nextSibling);
    
    renderPaymentSummary(); // Render payment summary first
    renderOrderSummary(); // Then render order summary
  }
});


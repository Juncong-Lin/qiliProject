import {renderOrderSummary} from './checkout/orderSummary.js';
import {renderPaymentSummary} from './checkout/paymentSummary.js';
import { cart } from '../data/cart.js';
import { updateCartQuantity } from './utils/cart-quantity.js';

console.log('Checkout.js loaded');
console.log('Cart:', cart);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  // Update cart quantity in header
  updateCartQuantity();
  
  // Calculate unique items and total quantity
  const uniqueItems = cart ? cart.length : 0;
  const totalQuantity = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  console.log('Unique items:', uniqueItems);
  console.log('Total quantity:', totalQuantity);

  // Handle empty cart state
  if (uniqueItems === 0) {
    console.log('Cart is empty, showing empty cart message');
    // Hide checkout elements
    document.querySelector('.checkout-grid').style.display = 'none';
    // Show empty cart message
    document.querySelector('.js-empty-cart').style.display = 'block';
    const pageTitleElement = document.querySelector('.page-title');
    if (pageTitleElement) {
      pageTitleElement.style.display = 'none';
    }
  } else {  
    console.log('Cart has items, rendering checkout');
    // Show normal checkout view
    document.querySelector('.checkout-grid').style.display = 'grid';
    document.querySelector('.js-empty-cart').style.display = 'none';
    
    const checkoutHeaderMiddle = document.querySelector('.checkout-header-middle-section');
    if (checkoutHeaderMiddle) {
      checkoutHeaderMiddle.innerHTML = '';
    }
    
    renderOrderSummary();
    renderPaymentSummary();
  }
});


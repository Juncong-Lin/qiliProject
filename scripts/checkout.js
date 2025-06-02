import {renderOrderSummary} from './checkout/orderSummary.js';
import {renderPaymentSummary} from './checkout/paymentSummary.js';
import { cart } from '../data/cart.js';

// Calculate unique items and total quantity
const uniqueItems = cart.length;
const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

// Handle empty cart state
if (uniqueItems === 0) {
  // Hide checkout elements
  document.querySelector('.checkout-grid').style.display = 'none';
  // Show empty cart message
  document.querySelector('.js-empty-cart').style.display = 'block';
  const pageTitleElement = document.querySelector('.page-title');
  if (pageTitleElement) {
    pageTitleElement.style.display = 'none';
  }
} else {  // Show normal checkout view
  document.querySelector('.checkout-grid').style.display = 'grid';
  document.querySelector('.js-empty-cart').style.display = 'none';
  document.querySelector('.checkout-header-middle-section').innerHTML = '';
  
  renderOrderSummary();
  renderPaymentSummary();
}


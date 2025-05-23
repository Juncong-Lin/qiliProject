import {renderOrderSummary} from './checkout/orderSummary.js';
import {renderPaymentSummary} from './checkout/paymentSummary.js';
import { cart } from '../data/cart.js';

// Calculate unique items and total quantity
const uniqueItems = cart.length;
const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

document.querySelector('.checkout-header-middle-section').innerHTML =
  `Checkout (Items: ${uniqueItems}, Total quantity: ${totalQuantity})`;

renderOrderSummary();
renderPaymentSummary();


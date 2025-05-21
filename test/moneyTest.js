import {formatCurrency} from '../scripts/utils/money.js';

console.log('test suite: formatCurrency function test');
// basic test
console.log('basic test');
if (formatCurrency(2095) === '20.95') {
  console.log('passed');
} else {
  console.log('failed');
}

// edge case test
console.log('rounding up to the nearst test '); 
if (formatCurrency(2000.5) === '20.01') {
  console.log('passed');
} else {  
  console.log('failed');
}

console.log('working with 0');
if (formatCurrency(0 === '0.00')) {
  console.log('passed');
} else {  
  console.log('failed');    
}


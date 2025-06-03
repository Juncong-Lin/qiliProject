export let cart = JSON.parse(localStorage.getItem('cart'));

if (!cart) {
  cart = [{
    productId: 'sample-product-1',
    quantity: 1,
    deliveryOptionId: '1'
  },{
    productId: 'sample-product-2',
    quantity: 1,
    deliveryOptionId: '2'
  },{
    productId: 'sample-product-3',
    quantity: 1,
    deliveryOptionId: '1'
  }];
  // Save the default cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
}

function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart (productId, quantity = 1) {
  let matchingItem;
  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += quantity;
  } else {  
    cart.push({
      productId : productId,    
      quantity: quantity,
      deliveryOptionId: '1'
    })
  }
  saveToStorage();
}

export function removeFromCart(productId) {
  const newCart = [];
  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  });
  cart = newCart;
  saveToStorage();
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  let matchingItem;
  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });
  matchingItem.deliveryOptionId = deliveryOptionId;
  saveToStorage();
}

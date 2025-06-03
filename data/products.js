import { formatCurrency } from '../scripts/utils/money.js';  
import { printheadProducts } from './printhead-products.js';

// Helper to flatten and convert printhead products to main product format
function getAllPrintheadProducts() {
  const all = [];
  Object.entries(printheadProducts).forEach(([brand, arr]) => {
    arr.forEach(prod => {
      all.push({
        id: prod.id,
        image: prod.image,
        name: prod.name,
        priceCents: prod.price, // products.js expects priceCents
        keywords: [brand, 'printhead'],
        description: prod.name + ' - High quality printhead from QiliTrading.com. Contact us for more details.'
      });
    });
  });
  return all;
}

export function getProduct(productId) {
  let matchingProduct;
  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });
  return matchingProduct;
}

class Product {
  id;
  image; 
  name;
  priceCents;
  keywords;
  description;

  constructor(productDetails) {
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.priceCents = productDetails.priceCents;
    this.keywords = productDetails.keywords;
    this.description = productDetails.description || `${productDetails.name} - High quality product from QiliTrading.com. Contact us for more details.`;
  }
  getPrice() {
    return `$${formatCurrency(this.priceCents)}`;
  }
  extraInfoHTML() {
    return '';
  }
}

class ProductWithSize extends Product {
  sizeChartLink;
  constructor(productDetails) {
    super(productDetails);
    this.sizeChartLink = productDetails.sizeChartLink;
  }

  extraInfoHTML() {
    // super.extraInfoHTML();
    return `
      <a href="${this.sizeChartLink}" target="_blank">
        Size Chart
      </a>
    `;
  }
}


export const products = getAllPrintheadProducts().map(productDetails => {
  return new Product(productDetails);
});
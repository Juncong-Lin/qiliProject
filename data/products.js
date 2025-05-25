import { formatCurrency } from '../scripts/utils/money.js';  

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


export const products = [
  {
    id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    image: 'images/products/Epson-DX5-Printhead-for-Chinese-Printers-Epson-F186000-Universal-New-Version-6578.jpg',
    name: 'Epson (DX5) Printhead for Chinese Printers',
    priceCents: 109700,
    keywords: [
      "Epson DX5",
      "Printhead",
      "Chinese Printers"
    ]
  },

  {
    id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
    image: 'images/products/epson-dx7-printhead.jpeg',
    name: 'Epson (DX5) Printhead for Chinese Printers',
    priceCents: 109700,
    keywords: [
      "Epson DX5",
      "Printhead",
      "Chinese Printers"
    ]
  },
].map((productDetails) => {
  if (productDetails.type === 'clothing') {
    return new ProductWithSize(productDetails);
  } 
  return new Product(productDetails);
})
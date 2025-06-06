// Print Spare Parts products data organized by categories
export const printSparePartProducts = {
  'epson-printer-spare-parts': [
    {
      id: 'mainboard-epson-f6070-f6080',
      name: 'Mainboard of Epson F6070, F6080',
      image: 'images/products-detail/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson F6070 ,F6080/Mainboard of Epson F6070 ,F6080.img_1.jpg',
      images: [
        'images/products-detail/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson F6070 ,F6080/Mainboard of Epson F6070 ,F6080.img_1.jpg',
        'images/products-detail/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson F6070 ,F6080/Mainboard of Epson F6070 ,F6080.img_2.jpg',
        'images/products-detail/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson F6070 ,F6080/Mainboard of Epson F6070 ,F6080.img_3.jpg',
        'images/products-detail/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson F6070 ,F6080/Mainboard of Epson F6070 ,F6080.img_4.jpg',
        'images/products-detail/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson F6070 ,F6080/Mainboard of Epson F6070 ,F6080.img_5.jpg'
      ],      price: 45000, 
      priceRange: '$750 - $950',
      factory: 'Epson',
      category: 'Print Spare Parts',
      subcategory: 'Epson Printer Spare Parts',
      productType: 'Mainboard',

      specifications: {
        partType: 'Mainboard',
        manufacturer: 'Epson',
        condition: 'New/Original'
      },
      features: [
        'Original Epson mainboard',
        'Direct replacement part',
        'Quality tested and verified',
        'Complete control board assembly'
      ],
      tags: ['epson', 'mainboard', 'spare-parts', 'f6070', 'f6080', 'control-board'],
      keywords: 'epson mainboard f6070 f6080 control board spare parts replacement',
      inStock: true,
      rating: 4.5,
      ratingCount: 12
    },
    {
      id: 'mainboard-epson-s30680-s30675',
      name: 'Mainboard of Epson S30680, S30675',
      image: 'images/products-detail/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson S30680 S30675/Mainboard of Epson S30680 S30675.img_1.jpg',
      images: [
        'images/products-detail/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson S30680 S30675/Mainboard of Epson S30680 S30675.img_1.jpg'
      ],      price: 67000, 
      priceRange: '$850 - $1050',
      factory: 'Epson',
      category: 'Print Spare Parts',
      subcategory: 'Epson Printer Spare Parts',
      productType: 'Mainboard',
      specifications: {
        partType: 'Mainboard',
        manufacturer: 'Epson',
        condition: 'New/Original',
      },
      features: [
        'Original Epson mainboard',
        'Direct replacement part',
        'Professional commercial grade',
        'Complete control system',
        'Advanced temperature control',
        'Automatic media handling support'
      ],
      tags: ['epson', 'mainboard', 'spare-parts', 's30680', 's30675', 'control-board'],
      keywords: 'epson mainboard s30680 s30675 control board spare parts replacement commercial',
      inStock: true,
      rating: 4.7,
      ratingCount: 8
    }
  ]
};

// Category structure for navigation
export const printSparePartCategories = {
  'print-spare-parts': {
    name: 'Print Spare Parts',
    description: 'Original and compatible spare parts for various printer models',
    subcategories: {
      'epson-printer-spare-parts': {
        name: 'Epson Printer Spare Parts',
        description: 'Original Epson printer spare parts and replacement components',
        products: 'epson-printer-spare-parts'
      }
    }
  }
};

// Helper function to get products by category
export function getPrintSparePartsByCategory(category) {
  return printSparePartProducts[category] || [];
}

// Helper function to get all print spare parts
export function getAllPrintSpareParts() {
  const allProducts = [];
  Object.values(printSparePartProducts).forEach(categoryProducts => {
    allProducts.push(...categoryProducts);
  });
  return allProducts;
}

// Helper function to get product by ID
export function getPrintSparePartById(productId) {
  const allProducts = getAllPrintSpareParts();
  return allProducts.find(product => product.id === productId);
}

// Helper function to search products
export function searchPrintSpareParts(searchTerm) {
  const allProducts = getAllPrintSpareParts();
  const term = searchTerm.toLowerCase();
  
  return allProducts.filter(product => 
    product.name.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.keywords.toLowerCase().includes(term) ||
    product.tags.some(tag => tag.toLowerCase().includes(term))
  );
}

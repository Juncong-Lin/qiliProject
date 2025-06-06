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
      ],
      price: 85000, // $850 estimated price
      priceRange: '$750 - $950',
      description: 'Original Mainboard for Epson F6070 and F6080 printers. High-quality replacement part manufactured by Epson.',
      factory: 'Epson',
      category: 'Print Spare Parts',
      subcategory: 'Epson Printer Spare Parts',
      productType: 'Mainboard',
      compatibility: [
        'Epson F6070',
        'Epson F6080'
      ],
      specifications: {
        partType: 'Mainboard/Control Board',
        manufacturer: 'Epson',
        compatibleModels: 'Epson F6070, F6080',
        partNumber: 'TBD', // To be determined from supplier
        warranty: '90 days',
        condition: 'New/Original'
      },
      features: [
        'Original Epson mainboard',
        'Direct replacement part',
        'Compatible with F6070 and F6080 models',
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
      ],
      price: 92000, // $920 estimated price
      priceRange: '$850 - $1050',
      description: 'Original Mainboard for Epson S30680 and S30675 printers. Professional-grade replacement part for commercial printing applications.',
      factory: 'Epson',
      category: 'Print Spare Parts',
      subcategory: 'Epson Printer Spare Parts',
      productType: 'Mainboard',
      compatibility: [
        'Epson S30680',
        'Epson S30675'
      ],
      specifications: {
        partType: 'Mainboard/Control Board',
        manufacturer: 'Epson',
        compatibleModels: 'Epson S30680, S30675',
        partNumber: 'TBD', // To be determined from supplier
        warranty: '90 days',
        condition: 'New/Original',
        printWidth: '1.6 meters',
        maximumMediaWidth: '1.6 meter',
        printHead: 'Epson XP600 print head',
        numberOfPrintHeads: '1 piece',
        resolution: '360 x 720 dpi',
        printingSpeed: '4Pass Mode 12 square meters per Hour',
        printingMedia: 'PP Paper, Photo Paper, Vinyl, Transfer Paper, Blue back paper etc.',
        color: 'CMYK',
        ink: 'Eco-Solvent ink, Sublimation Ink (or other water based ink)',
        inkCapacity: '1 Liter per Color',
        connectionPort: 'USB/NET',
        printHeadToMediaDistance: '2mm to 3 mm',
        printingLocationSystem: 'Raster and Servo system',
        inkDryingSystem: 'Fan and heater',
        motorAndDriverSystem: 'Combined high precision motor and driver for Carriage and Step',
        printingSystem: 'Sengyang',
        inkStation: 'Aluminum high precision Print head Maintenance Station',
        ripSoftware: 'Maintop, RIIN, Photoprint',
        photoFormat: 'JPG, TIFF, BMP, PDF',
        heatingSystem: 'Automatic Temperature Control system equipment',
        mediaSupplySystem: 'Automatic Media roll-up system',
        maximumMediaWeight: '80kgs',
        powerDemand: '50/60HZ 220V AC',
        workingTemperature: '20-25°C',
        workingHumidity: '40-70%'
      },
      features: [
        'Original Epson mainboard',
        'Direct replacement part',
        'Compatible with S30680 and S30675 models',
        'Professional commercial grade',
        'Complete control system',
        'Advanced temperature control',
        'Automatic media handling support'
      ],
      tags: ['epson', 'mainboard', 'spare-parts', 's30680', 's30675', 'control-board', 'commercial'],
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

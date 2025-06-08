// Print Spare Parts products data for all brands
export const printSparePartProducts = {
  epson: [
    {
      id: 'mainboard-epson-f6070-f6080',
      name: 'Mainboard of Epson F6070, F6080',
      image: 'images/products/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson F6070 ,F6080/Mainboard of Epson F6070 ,F6080.img_1.jpg',
      price: 45000
    },
    {
      id: 'mainboard-epson-s30680-s30675',
      name: 'Mainboard of Epson S30680, S30675',
      image: 'images/products/Print Spare Parts/Epson Printer Spare Parts/Mainboard of Epson S30680 S30675/Mainboard of Epson S30680 S30675.img_1.jpg',
      price: 67000
    }
  ],
  roland: [
    {
      id: 'mainboard-roland-re640-rf640-vs640-vs640i',
      name: 'Mainboard of Roland RE-640,RF-640,VS-640,VS-640i',
      image: 'images/products/Print Spare Parts/Roland Printer Spare Parts/Mainboard of Roland RE-640,RF-640,VS-640,VS-640i Part Number 6000005184/Mainboard of Roland RE-640,RF-640,VS-640,VS-640i Part Number 6000005184.img_1.jpg',
      price: 52000
    },
    {
      id: 'mainboard-roland-rs640-rs540',
      name: 'Mainboard of Roland RS-640 RS-540',
      image: 'images/products/Print Spare Parts/Roland Printer Spare Parts/Mainboard of Roland RS-640 RS-540 Part Number 6700989010/Mainboard of Roland RS-640 RS-540 Part Number 6700989010.img_1.jpg',
      price: 48000
    },
    {
      id: 'mainboard-roland-vp540-vp640',
      name: 'Mainboard of Roland VP-540 VP640',
      image: 'images/products/Print Spare Parts/Roland Printer Spare Parts/Mainboard of Roland VP-540 VP640 Part Number 6700469010/Mainboard of Roland VP-540 VP640 Part Number 6700469010.img_1.jpg',
      price: 55000
    },
    {
      id: 'motor-cleaning-station-roland-sj645',
      name: 'Motor for cleaning station of Roland SJ-645',
      image: 'images/products/Print Spare Parts/Roland Printer Spare Parts/Motor for cleaning station of Roland SJ-645 SH1421-5042 PART Number 22435106/Motor for cleaning station of Roland SJ-645 SH1421-5042 PART Number 22435106.img_1.jpg',
      price: 18500
    }
  ],
  canon: [
    {
      id: 'release-lever-w6200',
      name: 'Canon imagePROGRAF W6200 Release Lever',
      image: 'images/products/Print Spare Parts/Canon Printer Spare Parts/Canon imagePROGRAF W6200 Release Lever/image/Canon imagePROGRAF W6200 Release Lever.img_1.jpg',
      price: 2800
    },
    {
      id: 'suction-fan-unit-ipf9010s',
      name: 'Canon IPF-9010S Suction Fan Unit',
      image: 'images/products/Print Spare Parts/Canon Printer Spare Parts/Canon IPF-9010S Suction Fan Unit/image/Canon IPF-9010S Suction Fan Unit.img_1.jpg',
      price: 8500
    }
  ],
  ricoh: [
    {
      id: 'generic-ricoh-gen4-cap-top',
      name: 'Generic Ricoh Gen4 Cap Top',
      image: 'images/products/Print Spare Parts/Ricoh Printer Spare Parts/Generic Ricoh Gen4 Cap Top/image/Generic Ricoh Gen4 Cap Top.img_1.jpg',
      price: 2500
    },
    {
      id: 'generic-ricoh-gen5-cap-top',
      name: 'Generic Ricoh Gen5 Cap Top',
      image: 'images/products/Print Spare Parts/Ricoh Printer Spare Parts/Generic Ricoh Gen5 Cap Top/image/Generic Ricoh Gen5 Cap Top.img_1.jpg',
      price: 2800
    },
    {
      id: 'generic-ricoh-gh2220-head-cable',
      name: 'Generic Ricoh GH2220 Head Cable; 24pin, 50cm',
      image: 'images/products/Print Spare Parts/Ricoh Printer Spare Parts/Generic Ricoh GH2220 Head Cable; 24pin, 50cm/image/Generic Ricoh GH2220 Head Cable; 24pin, 50cm.img_1.jpg',
      price: 3500
    }
  ]
};

// Helper function to get print spare part by ID
export function getPrintSparePartById(id) {
  // Search through all brands
  for (const brand in printSparePartProducts) {
    const product = printSparePartProducts[brand].find(item => item.id === id);
    if (product) {
      // Return product with brand information
      return { ...product, brand };
    }
  }
  return null;
}

// Helper function to get print spare parts by category (for backward compatibility)
export function getPrintSparePartsByCategory(category) {
  // Map old category names to new brand keys
  const categoryMap = {
    'epson-printer-spare-parts': 'epson',
    'roland-printer-spare-parts': 'roland',
    'canon-printer-spare-parts': 'canon',
    'ricoh-printer-spare-parts': 'ricoh'
  };
  
  const brand = categoryMap[category];
  if (brand && printSparePartProducts[brand]) {
    return printSparePartProducts[brand];
  }
  
  return [];
}

# Price Update Feature Summary

## Overview
Successfully modified 8 scraper files to include price update functionality. Each file can now:

1. **Check existing product prices** from the original data source
2. **Compare with stored prices** in the respective `xxxx.js` file
3. **Update prices directly** in both `products_data.json` and `xxxx.js` files when changes are detected

## Modified Files
1. `channelLetterBendingMechine_update_price.py` (classid/44)
2. `inkjetPrinter_update_price.py` (classid/12) 
3. `ledAndLcd_update_price.py` (classid/38)
4. `material_update_price.py` (classid/4)
5. `other_update_price.py` (classid/389)
6. `printhead_update_price.py` (classid/109)
7. `printSparePart_update_price.py` (classid/132)
8. `upgradingKit_update_price.py` (classid/43)

## Usage Options

### Option 1: Interactive Menu
When you run any of the scraper files normally, if existing data is found, you'll see:
```
Existing data found for [filename]
Choose an option:
1. Run full scraper (discover new products)
2. Update prices only (check existing products for price changes)
Enter your choice (1 or 2):
```

### Option 2: Command Line Argument
You can directly run price updates using:
```bash
python [filename]_update_price.py update_prices
```

## New Functions Added

### `update_prices_in_js_file(js_path, updated_products)`
- Updates the JavaScript file with new price values
- Uses regex to find and replace specific product entries
- Maintains the exact format of the JS file

### `check_and_update_prices()`
- Main price checking function
- Searches through all listing pages to find each product
- Compares current prices with stored prices
- Updates both JSON and JS files when changes are detected
- Includes progress tracking and error handling

## Features
- **Automatic price comparison**: Compares `lower_price` and `higher_price` values
- **Safe updates**: Only modifies files when actual price changes are detected  
- **Progress tracking**: Shows current product being checked (X/Y format)
- **Error handling**: Continues processing even if individual products fail
- **Delay between requests**: Includes 1-second delay to avoid overwhelming the server
- **Backup preservation**: Updates both JSON (data backup) and JS (final output) files

## File Structure Requirements
Each scraper expects this structure:
```
products/
├── [scriptname]_update_price.py
├── [scriptname]/
│   ├── [scriptname].js
│   ├── products_data.json
│   └── [brand folders with product data]
```

## Error Handling
- Gracefully handles missing files
- Continues processing when individual products can't be found
- Reports errors but doesn't stop the entire process
- Validates file existence before attempting updates

All files are ready to use with the new price update functionality!

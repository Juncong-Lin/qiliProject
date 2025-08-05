# Save this file as xxxx.py (e.g., printhead_scraper.py)
# The output folder will be named 'xxxx' (e.g., 'printhead_scraper') in the same directory as this script

import os
import re
import sys
import requests
import io
import time
import json
import shutil
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from PIL import Image

# --- Configuration ---
BASE_URL = "https://signchinasign.com"
URL_TEMPLATE = "https://signchinasign.com/index.php/Product/index/p/{page_num}/classid/44/price/index.php"
TOTAL_PAGES = 3
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
BRANDS = ['Plate','Automatic','Special','Aluminum','Letter','Outdoor', 'Display', 'Hoson',  'Roland', 'Epson', 'Mimaki', 'Mutoh', 'Witcolor', 'Galaxy','Human', 'Gongzheng', 'Flora', 'Xuli', 'Xenos', 'Yongli', 'Zhongye', 'Skyjet', 'Yaselan', 'Teckwin', 'Ricoh', 'TitanJet','Seiko', 'Skycolor', 'Myjet', 'Phaeton', 'Meitu', 'JHF', 'Kingfisher', 'Liyu', 'Locor'
]
MAX_RETRIES = 3  # Maximum number of retries for any task

# --- Utility Functions ---

def get_script_name():
    """Returns the script name without the .py extension."""
    return os.path.splitext(os.path.basename(__file__))[0]

def sanitize_filename(name):
    """Removes invalid characters for a valid folder or file name."""
    sanitized = re.sub(r'[\\/*?:"<>|]', "", name)
    return " ".join(sanitized.split()).strip()

def process_and_save_image(image_bytes, output_path, target_size=1000):
    """Processes an image to fit proportionally into a 1000x1000 canvas and saves it as JPEG."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        w, h = img.size
        ratio = min(target_size/w, target_size/h)
        new_w, new_h = int(w*ratio), int(h*ratio)
        img_resized = img.resize((new_w, new_h), Image.LANCZOS)
        canvas = Image.new('RGB', (target_size, target_size), (255, 255, 255))
        canvas.paste(img_resized, ((target_size-new_w)//2, (target_size-new_h)//2))
        canvas.save(output_path, format='JPEG', quality=95)
        return True
    except Exception as e:
        print(f"    - ERROR: Failed to process image. Reason: {e}")
        return False

def format_price(price_str):
    """Formats the price string into 'Price: USD:XXX-YYY' format."""
    if "not found" in price_str.lower():
        return "Price: Not available"
    cleaned = re.sub(r'[$\s]|USD', '', price_str, flags=re.IGNORECASE)
    if '-' in cleaned:
        return f"Price: USD:{cleaned}"
    elif cleaned:
        return f"Price: USD:{cleaned}-{cleaned}"
    else:
        return "Price: Not available"

def get_brand(product_name, brands_list):
    """Determines the brand from the product name, adding new brands dynamically."""
    for brand in brands_list:
        if brand.lower() in product_name.lower():
            return brand
    potential_brand = product_name.split()[0]
    if potential_brand:
        print(f"    - Adding new brand: {potential_brand}")
        brands_list.append(potential_brand)
        return potential_brand
    return None

def generate_id(name):
    """Generates a unique ID from the product name."""
    name = re.sub(r'[^\w-]', '-', name)
    name = re.sub(r'-+', '-', name)
    return name.strip('-')

def parse_price(price_str):
    """Parses price string to extract lower and higher prices as integers."""
    if "not found" in price_str.lower() or not price_str:
        return None, None
    cleaned = re.sub(r'[^\d\.\- ]', '', price_str)
    numbers = re.findall(r'\d+(?:\.\d+)?', cleaned)
    if not numbers:
        return None, None
    if len(numbers) == 1:
        price = float(numbers[0])
        return int(price * 100), int(price * 100)
    elif len(numbers) >= 2:
        lower = float(numbers[0])
        higher = float(numbers[1])
        return int(lower * 100), int(higher * 100)
    return None, None

def load_previous_products(md_path):
    """Loads previously scraped product names from the xxxx.md file."""
    previous_products = set()
    if os.path.exists(md_path):
        with open(md_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('- '):
                    product_name = line[2:].strip()
                    previous_products.add(product_name)
    return previous_products

def rename_brand_folders(output_dir, script_name):
    """Renames brand folders from 'Brand xxxx' to 'Brand'."""
    for folder_name in os.listdir(output_dir):
        if os.path.isdir(os.path.join(output_dir, folder_name)):
            # Check if folder ends with script_name
            if folder_name.endswith(f" {script_name}"):
                brand_name = folder_name[:-len(f" {script_name}")]
                old_path = os.path.join(output_dir, folder_name)
                new_path = os.path.join(output_dir, brand_name)
                try:
                    if os.path.exists(new_path):
                        print(f"    - WARNING: Folder '{new_path}' already exists. Merging contents.")
                        # Move contents of old folder to new folder
                        for item in os.listdir(old_path):
                            shutil.move(os.path.join(old_path, item), os.path.join(new_path, item))
                        shutil.rmtree(old_path)
                    else:
                        shutil.move(old_path, new_path)
                        print(f"    - Renamed folder '{folder_name}' to '{brand_name}'")
                except Exception as e:
                    print(f"    - ERROR: Failed to rename folder '{folder_name}' to '{brand_name}'. Reason: {e}")

def update_image_paths(products_by_brand, script_name):
    """Updates image paths in products_by_brand to remove script_name from brand folder."""
    for brand_key, products in products_by_brand.items():
        for product in products:
            old_image = product['image']
            # Replace 'Brand xxxx' with 'Brand' in the image path
            parts = old_image.split('/')
            if len(parts) > 3 and parts[2].endswith(f" {script_name}"):
                parts[2] = parts[2][:-len(f" {script_name}")]
                new_image = '/'.join(parts)
                product['image'] = new_image
    return products_by_brand

# --- Price Update Functions ---

def update_prices_in_js_file(js_path, updated_products):
    """Updates prices in the JavaScript file for products that have changed."""
    if not os.path.exists(js_path):
        print(f"JavaScript file not found: {js_path}")
        return False
    
    try:
        with open(js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        updated_count = 0
        for product in updated_products:
            # Create pattern to match the specific product entry - more flexible pattern
            old_id = re.escape(product['id'])
            # Pattern matches: id, name, image, lower_price, higher_price
            pattern = rf"(\s+{{\s*\n\s*id:\s*'{old_id}',\s*\n\s*name:\s*'[^']*',\s*\n\s*image:\s*'[^']*',\s*\n\s*lower_price:\s*)[^,\n]*(\s*,\s*\n\s*higher_price:\s*)[^,\n]*(\s*\n\s*}})"
            
            lower_price = 'null' if product['lower_price'] is None else str(product['lower_price'])
            higher_price = 'null' if product['higher_price'] is None else str(product['higher_price'])
            
            replacement = rf"\g<1>{lower_price}\g<2>{higher_price}\g<3>"
            new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
            
            if new_content != content:
                content = new_content
                updated_count += 1
                print(f"    - Updated prices for: {product['name']}")
            else:
                # Try a simpler approach - find the product block and replace line by line
                lines = content.split('\n')
                found_product = False
                for i, line in enumerate(lines):
                    if f"id: '{product['id']}'" in line:
                        found_product = True
                        # Look for lower_price and higher_price in the next few lines
                        for j in range(i, min(i+10, len(lines))):
                            if 'lower_price:' in lines[j]:
                                old_lower = lines[j]
                                lines[j] = re.sub(r'lower_price:\s*\d+', f'lower_price: {lower_price}', lines[j])
                                if lines[j] != old_lower:
                                    print(f"    - Updated lower_price for: {product['name']}")
                            elif 'higher_price:' in lines[j]:
                                old_higher = lines[j]
                                lines[j] = re.sub(r'higher_price:\s*\d+', f'higher_price: {higher_price}', lines[j])
                                if lines[j] != old_higher:
                                    print(f"    - Updated higher_price for: {product['name']}")
                        break
                
                if found_product:
                    content = '\n'.join(lines)
                    updated_count += 1
        
        if updated_count > 0:
            with open(js_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Successfully updated {updated_count} products in {js_path}")
            return True
        else:
            print("No price updates needed in JavaScript file")
            return False
            
    except Exception as e:
        print(f"Error updating JavaScript file: {e}")
        return False

def check_and_update_prices():
    """Main function to check prices and update the JavaScript file."""
    root_folder_name = get_script_name()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, root_folder_name)
    js_path = os.path.join(output_dir, f"{root_folder_name}.js")
    
    if not os.path.exists(js_path):
        print(f"JavaScript file not found: {js_path}")
        print("Please run the main scraper first to generate the initial data.")
        return
    
    # Load existing products from JSON
    products_data_path = os.path.join(output_dir, 'products_data.json')
    if not os.path.exists(products_data_path):
        print(f"Products data file not found: {products_data_path}")
        print("Please run the main scraper first to generate the initial data.")
        return
    
    with open(products_data_path, 'r', encoding='utf-8') as f:
        products_by_brand = json.load(f)
    
    print("Starting price update check...")
    print(f"Checking prices for products in: {js_path}")
    
    updated_products = []
    total_products = sum(len(products) for products in products_by_brand.values())
    current_product = 0
    
    with requests.Session() as session:
        for brand_key, products in products_by_brand.items():
            for product in products:
                current_product += 1
                print(f"\nChecking product ({current_product}/{total_products}): {product['name']}")
                
                # Find the product URL by searching through listing pages
                product_url = None
                for page_num in range(1, TOTAL_PAGES + 1):
                    try:
                        listing_url = URL_TEMPLATE.format(page_num=page_num)
                        response = session.get(listing_url, headers=HEADERS, timeout=15)
                        response.raise_for_status()
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        product_list = soup.select_one('div#con_1.list_bigpic')
                        if not product_list:
                            continue
                            
                        product_boxes = product_list.select('div.product_box')
                        for box in product_boxes:
                            link_tag = box.select_one('h3 > a')
                            if link_tag and link_tag.get('href'):
                                temp_url = urljoin(BASE_URL, link_tag['href'])
                                temp_response = session.get(temp_url, headers=HEADERS, timeout=10)
                                temp_soup = BeautifulSoup(temp_response.content, 'html.parser')
                                name_tag = temp_soup.select_one('h1.text-capitalize')
                                if name_tag:
                                    temp_name = name_tag.get_text(strip=True)
                                    if temp_name == product['name']:
                                        product_url = temp_url
                                        break
                        
                        if product_url:
                            break
                            
                    except Exception as e:
                        print(f"  - Error searching for product: {e}")
                        continue
                
                if not product_url:
                    print(f"  - Product URL not found for: {product['name']}")
                    continue
                
                # Get current price from the product page
                try:
                    response = session.get(product_url, headers=HEADERS, timeout=20)
                    response.raise_for_status()
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    product_container = soup.select_one('div.row.sh_page.bg-white')
                    if not product_container:
                        print(f"  - Could not find product container")
                        continue
                    
                    price_tag = product_container.select_one('span.sp_price')
                    current_price_str = price_tag.get_text(strip=True) if price_tag else "Price not found"
                    
                    lower_price, higher_price = parse_price(current_price_str)
                    
                    # Compare with stored prices
                    if (lower_price != product['lower_price'] or higher_price != product['higher_price']):
                        print(f"  - Price changed!")
                        print(f"    Old: {product['lower_price']} - {product['higher_price']}")
                        print(f"    New: {lower_price} - {higher_price}")
                        
                        # Update the product data
                        product['lower_price'] = lower_price
                        product['higher_price'] = higher_price
                        updated_products.append(product.copy())
                    else:
                        print(f"  - Price unchanged: {lower_price} - {higher_price}")
                        
                except Exception as e:
                    print(f"  - Error checking price: {e}")
                    continue
                
                # Add small delay to avoid overwhelming the server
                time.sleep(1)
    
    if updated_products:
        print(f"\nFound {len(updated_products)} products with price changes")
        
        # Update the JSON file
        with open(products_data_path, 'w', encoding='utf-8') as f:
            json.dump(products_by_brand, f, indent=2)
        print(f"Updated products data: {products_data_path}")
        
        # Update the JavaScript file
        update_prices_in_js_file(js_path, updated_products)
        
        print("\nUpdated products:")
        for product in updated_products:
            print(f"- {product['name']}: {product['lower_price']} - {product['higher_price']}")
    else:
        print("\nNo price changes found")
    
    print("\nPrice update check completed!")

# --- Core Scraping Functions ---

def scrape_product_details(product_url, session, output_dir, script_name, brands_list, current_product_number, total_products_found, retry_count=0):
    """Scrapes a single product detail page and returns product data."""
    try:
        print(f"  - Scraping product page ({current_product_number}/{total_products_found}): {product_url} (Attempt {retry_count + 1}/{MAX_RETRIES})")
        response = session.get(product_url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        product_container = soup.select_one('div.row.sh_page.bg-white')
        if not product_container:
            print(f"  - WARNING: Could not find product container on {product_url}.")
            return None, retry_count + 1

        name_tag = product_container.select_one('h1.text-capitalize')
        product_name = name_tag.get_text(strip=True) if name_tag else "Unknown Product"
        sanitized_name = sanitize_filename(product_name)
        if not sanitized_name:
            print(f"  - WARNING: Invalid product name '{product_name}'.")
            return None, retry_count + 1
        print(f"    - Found Product: {product_name}")

        brand = get_brand(product_name, brands_list)
        if not brand:
            print(f"    - WARNING: Could not determine brand for '{product_name}'.")
            return None, retry_count + 1

        price_tag = product_container.select_one('span.sp_price')
        product_price = price_tag.get_text(strip=True) if price_tag else "Price not found"

        product_details = ""
        details_card = product_container.select_one('div.sp_collapse_block div.card')
        if details_card:
            details_clone = BeautifulSoup(str(details_card), 'html.parser')
            if details_clone.select_one('div.card-header'):
                details_clone.select_one('div.card-header').decompose()
            if details_clone.select_one('div.card-body'):
                details_clone.select_one('div.card-body').decompose()
            product_details = details_clone.get_text(separator='\n', strip=True)
        if not product_details:
            product_details = "No details found."

        brand_folder = os.path.join(output_dir, brand)  # Use brand name directly
        os.makedirs(brand_folder, exist_ok=True)

        product_folder = os.path.join(brand_folder, sanitized_name)
        os.makedirs(product_folder, exist_ok=True)

        image_folder = os.path.join(product_folder, 'image')
        os.makedirs(image_folder, exist_ok=True)
        image_filename = f"{sanitized_name}.jpg"
        image_path = os.path.join(image_folder, image_filename)

        image_tag = product_container.select_one('img#zoom_03')
        if image_tag and image_tag.get('src'):
            image_url = urljoin(BASE_URL, image_tag['src'])
            try:
                img_response = session.get(image_url, stream=True, headers=HEADERS, timeout=20)
                img_response.raise_for_status()
                if process_and_save_image(img_response.content, image_path):
                    print(f"    - Image saved to: {os.path.basename(image_path)}")
                else:
                    print(f"    - FAILED to process image for {product_name}")
            except requests.RequestException as e:
                print(f"    - ERROR: Image download failed {image_url}. Reason: {e}")
        else:
            print("    - WARNING: No product image found.")

        md_filename = f"{sanitized_name}.md"
        md_path = os.path.join(product_folder, md_filename)
        formatted_price = format_price(product_price)
        md_content = (
            f"# {product_name}\n\n"
            f"{formatted_price}\n\n"
            f"Product Details:\n\n"
            f"{product_details}"
        )
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        print(f"    - Details saved to: {os.path.basename(md_path)}")

        lower_price, higher_price = parse_price(product_price)
        product_id = generate_id(product_name)
        image_rel_path = f"products/{script_name}/{brand}/{sanitized_name}/image/{sanitized_name}.jpg"

        return {
            'id': product_id,
            'name': product_name,
            'image': image_rel_path,
            'lower_price': lower_price,
            'higher_price': higher_price,
            'brand': brand
        }, retry_count

    except requests.RequestException as e:
        print(f"  - ERROR: Failed to access {product_url}. Reason: {e}")
        return None, retry_count + 1
    except Exception as e:
        print(f"  - ERROR: Unexpected error processing {product_url}. Reason: {e}")
        return None, retry_count + 1

def load_existing_products_from_js(js_path):
    """Load existing products from the xxxx.js file."""
    products_by_brand = {}
    if not os.path.exists(js_path):
        print(f"No existing JS file found at {js_path}")
        return products_by_brand
    
    try:
        with open(js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract the products object using regex
        import re
        pattern = r'export const \w+Products = ({.*?});'
        match = re.search(pattern, content, re.DOTALL)
        if not match:
            print("Could not parse existing JS file")
            return products_by_brand
        
        # Convert JS object to Python dict (simplified parsing)
        js_obj = match.group(1)
        # This is a simplified approach - for production, use a proper JS parser
        lines = js_obj.split('\n')
        current_brand = None
        
        for line in lines:
            line = line.strip()
            if line.endswith(': ['):
                current_brand = line.replace(':', '').strip()
                products_by_brand[current_brand] = []
            elif line.startswith('{') and current_brand:
                # Extract product info
                product = {}
                product_lines = []
                
        print(f"Loaded existing products from {js_path}")
        return products_by_brand
    except Exception as e:
        print(f"Error loading existing JS file: {e}")
        return products_by_brand

def update_js_file_prices(js_path, products_by_brand, root_folder_name):
    """Update the JS file with new price information."""
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    total_products_overall = sum(len(products) for products in products_by_brand.values())
    
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(f"// Total products: {total_products_overall}, Prices updated: {current_time}\n")
        f.write(f"export const {root_folder_name}Products = {{\n")
        for brand_key in sorted(products_by_brand.keys()):
            f.write(f"  {brand_key}: [\n")
            for product in products_by_brand[brand_key]:
                lower_price = 'null' if product['lower_price'] is None else product['lower_price']
                higher_price = 'null' if product['higher_price'] is None else product['higher_price']
                name_escaped = product['name'].replace("'", "\\'")
                f.write(f"    {{\n")
                f.write(f"      id: '{product['id']}',\n")
                f.write(f"      name: '{name_escaped}',\n")
                f.write(f"      image: '{product['image']}',\n")
                f.write(f"      lower_price: {lower_price},\n")
                f.write(f"      higher_price: {higher_price}\n")
                f.write(f"    }},\n")
            f.write(f"  ],\n")
        f.write(f"}};\n")
    print(f"JavaScript file updated: {js_path}")

def check_and_update_product_price(product_url, session, product_name):
    """Check current price for a specific product and return updated price info."""
    try:
        print(f"    - Checking price for: {product_name}")
        response = session.get(product_url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        product_container = soup.select_one('div.row.sh_page.bg-white')
        if not product_container:
            return None, None
        
        price_tag = product_container.select_one('span.sp_price')
        product_price = price_tag.get_text(strip=True) if price_tag else "Price not found"
        
        lower_price, higher_price = parse_price(product_price)
        return lower_price, higher_price
        
    except Exception as e:
        print(f"    - ERROR: Failed to check price for {product_name}. Reason: {e}")
        return None, None

def main():
    root_folder_name = get_script_name()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, root_folder_name)
    js_path = os.path.join(output_dir, f"{root_folder_name}.js")
    
    if not os.path.exists(js_path):
        print(f"ERROR: No existing JS file found at {js_path}")
        print("Please run the original scraper first to generate the initial data.")
        return
    
    print(f"\nPrice Update Tool Started for {root_folder_name}")
    print("This will check and update prices for all existing products.")
    input("Press Enter to continue...")

    # Load existing products from JS file
    with open(js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    # Parse existing products (simple approach)
    products_by_brand = {brand.lower(): [] for brand in BRANDS}
    
    # Load products data from JSON if available
    products_data_path = os.path.join(output_dir, 'products_data.json')
    if os.path.exists(products_data_path):
        with open(products_data_path, 'r', encoding='utf-8') as f:
            products_by_brand = json.load(f)

    else:
        print("No existing products data found.")
        return
    
    total_products = sum(len(products) for products in products_by_brand.values())
    print(f"Found {total_products} existing products to check for price updates.")
    
    updated_count = 0
    
    # Phase 1: Get all product URLs from listing pages to find current products
    print("\n--- Phase 1: Collecting current product URLs ---")
    listing_tasks = [('listing', URL_TEMPLATE.format(page_num=page_num), 0) for page_num in range(1, TOTAL_PAGES + 1)]
    current_product_urls = {}  # product_name -> product_url
    
    with requests.Session() as session:
        while listing_tasks:
            task_type, url, retry_count = listing_tasks.pop(0)
            if retry_count >= MAX_RETRIES:
                print(f"ERROR: Max retries ({MAX_RETRIES}) reached for listing page {url}. Skipping.")
                continue
            print(f"Scraping listing page: {url}")
            try:
                response = session.get(url, headers=HEADERS, timeout=15)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')
                product_list = soup.select_one('div#con_1.list_bigpic')
                if not product_list:
                    continue
                product_boxes = product_list.select('div.product_box')
                for box in product_boxes:
                    link_tag = box.select_one('h3 > a')
                    if link_tag and link_tag.get('href'):
                        product_url = urljoin(BASE_URL, link_tag['href'])
                        # Get product name from the detail page
                        temp_response = session.get(product_url, headers=HEADERS, timeout=20)
                        temp_soup = BeautifulSoup(temp_response.content, 'html.parser')
                        name_tag = temp_soup.select_one('h1.text-capitalize')
                        product_name = name_tag.get_text(strip=True) if name_tag else "Unknown Product"
                        current_product_urls[product_name] = product_url
            except requests.RequestException as e:
                print(f"ERROR: Failed to access {url}. Reason: {e}")
                listing_tasks.append((task_type, url, retry_count + 1))
                time.sleep(5)
        
        # Phase 2: Check prices for existing products
        print(f"\n--- Phase 2: Checking prices for {total_products} products ---")
        for brand_key, products in products_by_brand.items():
            for product in products:
                product_name = product['name']
                if product_name in current_product_urls:
                    product_url = current_product_urls[product_name]
                    new_lower, new_higher = check_and_update_product_price(product_url, session, product_name)
                    
                    if new_lower is not None and new_higher is not None:
                        old_lower = product.get('lower_price')
                        old_higher = product.get('higher_price')
                        
                        if old_lower != new_lower or old_higher != new_higher:
                            print(f"    - PRICE UPDATED: {product_name}")
                            print(f"      Old: {old_lower}-{old_higher}, New: {new_lower}-{new_higher}")
                            product['lower_price'] = new_lower
                            product['higher_price'] = new_higher
                            updated_count += 1
                        else:
                            print(f"    - No price change: {product_name}")
                    else:
                        print(f"    - Could not get current price for: {product_name}")
                else:
                    print(f"    - Product not found in current listings: {product_name}")
    
    # Save updated data
    with open(products_data_path, 'w', encoding='utf-8') as f:
        json.dump(products_by_brand, f, indent=2)
    
    # Update JS file
    update_js_file_prices(js_path, products_by_brand, root_folder_name)
    
    print(f"\n--- Price Update Complete ---")
    print(f"Total products checked: {total_products}")
    print(f"Products with price updates: {updated_count}")
    print(f"Updated data saved to: {js_path}")

if __name__ == "__main__":
    main()
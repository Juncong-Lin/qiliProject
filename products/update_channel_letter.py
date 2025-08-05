#!/usr/bin/env python3
"""
Script to add price update functionality to channelLetterBendingMechine_update_price.py
"""

import os
import re

def add_price_update_functions(file_path):
    """Add price update functions to a scraper file"""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if price update functions already exist
        if 'def update_prices_in_js_file' in content:
            print(f"Price update functions already exist in {file_path}")
            return False
        
        # Find the location to insert the price update functions
        insert_point = content.find('# --- Core Scraping Functions ---')
        if insert_point == -1:
            print(f"Could not find insertion point in {file_path}")
            return False
        
        price_update_code = '''# --- Price Update Functions ---

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
            # Create pattern to match the specific product entry
            old_id = re.escape(product['id'])
            pattern = rf"(\\s+{{\\s*\\n\\s*id: '{old_id}',\\s*\\n\\s*name: '[^']*',\\s*\\n\\s*image: '[^']*',\\s*\\n\\s*lower_price: )[^,\\n]*(\\s*,\\s*\\n\\s*higher_price: )[^,\\n]*(\\s*\\n\\s*}})"
            
            lower_price = 'null' if product['lower_price'] is None else str(product['lower_price'])
            higher_price = 'null' if product['higher_price'] is None else str(product['higher_price'])
            
            replacement = rf"\\g<1>{lower_price}\\g<2>{higher_price}\\g<3>"
            new_content = re.sub(pattern, replacement, content)
            
            if new_content != content:
                content = new_content
                updated_count += 1
                print(f"    - Updated prices for: {product['name']}")
        
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
                print(f"\\nChecking product ({current_product}/{total_products}): {product['name']}")
                
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
        print(f"\\nFound {len(updated_products)} products with price changes")
        
        # Update the JSON file
        with open(products_data_path, 'w', encoding='utf-8') as f:
            json.dump(products_by_brand, f, indent=2)
        print(f"Updated products data: {products_data_path}")
        
        # Update the JavaScript file
        update_prices_in_js_file(js_path, updated_products)
        
        print("\\nUpdated products:")
        for product in updated_products:
            print(f"- {product['name']}: {product['lower_price']} - {product['higher_price']}")
    else:
        print("\\nNo price changes found")
    
    print("\\nPrice update check completed!")

'''
        
        # Insert the price update functions
        new_content = content[:insert_point] + price_update_code + content[insert_point:]
        
        # Update the main function
        old_main_found = re.search(r'def main\(\):\s*\n(\s*)root_folder_name = get_script_name\(\)\s*\n(\s*)script_dir = os\.path\.dirname\(os\.path\.abspath\(__file__\)\)\s*\n(\s*)output_dir = os\.path\.join\(script_dir, root_folder_name\)\s*\n(\s*)os\.makedirs\(output_dir, exist_ok=True\)\s*\n(\s*)md_path = os\.path\.join\(output_dir, f"\{root_folder_name\}\.md"\)\s*\n(\s*)products_data_path = os\.path\.join\(output_dir, \'products_data\.json\'\)\s*\n\s*# Load previously scraped products\s*\n(\s*)previous_products = load_previous_products\(md_path\)', new_content)
        
        if old_main_found:
            indent = old_main_found.group(1)  # Get the indentation
            replacement = f'''def main():
{indent}# Check for command line arguments
{indent}if len(sys.argv) > 1 and sys.argv[1] == "update_prices":
{indent}    check_and_update_prices()
{indent}    return
{indent}
{indent}root_folder_name = get_script_name()
{indent}script_dir = os.path.dirname(os.path.abspath(__file__))
{indent}output_dir = os.path.join(script_dir, root_folder_name)
{indent}os.makedirs(output_dir, exist_ok=True)
{indent}md_path = os.path.join(output_dir, f"{{root_folder_name}}.md")
{indent}products_data_path = os.path.join(output_dir, 'products_data.json')

{indent}# Check if user wants to update prices instead of scraping
{indent}js_path = os.path.join(output_dir, f"{{root_folder_name}}.js")
{indent}if os.path.exists(js_path):
{indent}    print(f"\\nExisting data found for {{root_folder_name}}")
{indent}    print("Choose an option:")
{indent}    print("1. Run full scraper (discover new products)")
{indent}    print("2. Update prices only (check existing products for price changes)")
{indent}    choice = input("Enter your choice (1 or 2): ").strip()
{indent}    
{indent}    if choice == "2":
{indent}        check_and_update_prices()
{indent}        return
{indent}    elif choice != "1":
{indent}        print("Invalid choice. Exiting.")
{indent}        return

{indent}# Load previously scraped products
{indent}previous_products = load_previous_products(md_path)'''
            
            new_content = new_content.replace(old_main_found.group(0), replacement)
        
        # Write the updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Successfully updated {file_path}")
        return True
        
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

def main():
    """Apply price update functionality to channelLetterBendingMechine_update_price.py"""
    
    products_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(products_dir, 'channelLetterBendingMechine_update_price.py')
    
    if os.path.exists(file_path):
        print(f"Updating channelLetterBendingMechine_update_price.py...")
        add_price_update_functions(file_path)
    else:
        print(f"File not found: {file_path}")
    
    print("Update completed!")

if __name__ == "__main__":
    main()

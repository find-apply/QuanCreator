import os
import shutil
import re

# Configuration
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
ASSETS_DIR = os.path.join(PUBLIC_DIR, "assets", "images")
INDEX_HTML = os.path.join(PROJECT_ROOT, "index.html")

LOGO_SOURCE = os.path.join(ASSETS_DIR, "quancreator-logo.png")
FAVICON_DEST_PNG = os.path.join(ASSETS_DIR, "invoke-favicon.png")
# Note: We will use the PNG as the favicon source, replacing the SVG link in HTML.

def swap_assets():
    print(f"Looking for logo at: {LOGO_SOURCE}")
    if not os.path.exists(LOGO_SOURCE):
        print("Error: QuanCreator logo not found.")
        return

    print(f"Copying {LOGO_SOURCE} to {FAVICON_DEST_PNG}...")
    shutil.copyfile(LOGO_SOURCE, FAVICON_DEST_PNG)
    print("Asset swap complete.")

def update_index_html():
    print(f"Updating {INDEX_HTML}...")
    if not os.path.exists(INDEX_HTML):
        print("Error: index.html not found.")
        return

    with open(INDEX_HTML, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update Title (just in case, though it looked correct in inspection)
    content = re.sub(r'<title>.*?</title>', '<title>QuanCreator</title>', content)

    # Update Favicon Link
    # Replace the svg link with the png link
    content = re.sub(
        r'<link id="invoke-favicon" rel="icon" type="image/svg\+xml" href="assets/images/invoke-favicon\.svg" />',
        '<link id="invoke-favicon" rel="icon" type="image/png" href="assets/images/invoke-favicon.png" />',
        content
    )
    # Also handle the case where it might be type="icon" or just href update if regex missed
    # The view_file output showed: <link id="invoke-favicon" rel="icon" type="icon" href="assets/images/invoke-favicon.svg" />
    content = re.sub(
        r'<link id="invoke-favicon" rel="icon" type="icon" href="assets/images/invoke-favicon\.svg" />',
        '<link id="invoke-favicon" rel="icon" type="image/png" href="assets/images/invoke-favicon.png" />',
        content
    )

    with open(INDEX_HTML, 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html updated.")

if __name__ == "__main__":
    swap_assets()
    update_index_html()

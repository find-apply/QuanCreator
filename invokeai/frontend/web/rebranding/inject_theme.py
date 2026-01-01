import os

# Configuration
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STYLES_DIR = os.path.join(PROJECT_ROOT, "src", "features", "ui", "styles")
THEME_CSS_PATH = os.path.join(STYLES_DIR, "dockview-theme-invoke.css")
QUAN_THEME_CSS_PATH = os.path.join(STYLES_DIR, "quancreator-theme.css")
INDEX_HTML = os.path.join(PROJECT_ROOT, "index.html")

# Define overrides
# Using a purple/indigo theme as a placeholder for QuanCreator
THEME_OVERRIDES = """
:root, .dockview-theme-invoke, .invokeai-root {
  /* Brand Colors Override */
  --invoke-colors-invokeBlue-300: #8b5cf6 !important; /* Violet */
  --invoke-colors-invokeBlue-500: #7c3aed !important;
  --invoke-colors-invokeBlue-700: #5b21b6 !important;
  --invoke-colors-base-50: #f5f3ff !important;
  --invoke-colors-base-900: #1e1b4b !important; /* Dark Indigo */
  
  /* Accent Colors */
  --invoke-colors-accent-100: #ede9fe !important;
  --invoke-colors-accent-400: #a78bfa !important;
}
"""

def inject_theme():
    # Option 1: Append to the existing theme file (Simple and destructive but effective for "Force inject")
    print(f"Injecting theme overrides into {THEME_CSS_PATH}...")
    
    if not os.path.exists(THEME_CSS_PATH):
        print("Error: Theme CSS not found.")
        return

    # Check if we already injected
    with open(THEME_CSS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "QuanCreator Theme Overrides" in content:
        print("Theme overrides already present.")
        return

    with open(THEME_CSS_PATH, 'a', encoding='utf-8') as f:
        f.write("\n\n/* QuanCreator Theme Overrides */\n")
        f.write(THEME_OVERRIDES)
    
    print("Theme injected.")

if __name__ == "__main__":
    inject_theme()

import os
import json
import re

# Configuration
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES_DIR = os.path.join(PROJECT_ROOT, "public", "locales")
EN_JSON_PATH = os.path.join(LOCALES_DIR, "en.json")

def sanitize_json_value(value):
    if isinstance(value, str):
        # Case insensitive replace for generic "Invoke" -> "QuanCreator"
        # adjust checking to avoid breaking keys if we were iterating keys, but here we process values
        # We might want to be careful about "InvokeAI" vs "Invoke"
        new_val = re.sub(r'\bInvoke\b', 'QuanCreator', value)
        new_val = re.sub(r'\bInvokeAI\b', 'QuanCreator', new_val) # Handle InvokeAI specifically if needed
        return new_val
    elif isinstance(value, dict):
        return {k: sanitize_json_value(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [sanitize_json_value(v) for v in value]
    return value

def sanitize_locales():
    print(f"Sanitizing {EN_JSON_PATH}...")
    if not os.path.exists(EN_JSON_PATH):
        print("Error: en.json not found.")
        return

    with open(EN_JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sanitized_data = sanitize_json_value(data)

    with open(EN_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(sanitized_data, f, indent=4)
    print("en.json sanitized.")

# Future: Add function to scan source files for console.logs if needed.

if __name__ == "__main__":
    sanitize_locales()

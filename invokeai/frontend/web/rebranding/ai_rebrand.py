import os
import sys
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
SCRIPT_DIR = Path(__file__).parent
ENV_PATH = SCRIPT_DIR.parent / '.env'
load_dotenv(ENV_PATH)

API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    print("Error: GOOGLE_API_KEY not found in .env file.")
    sys.exit(1)

client = genai.Client(api_key=API_KEY)

# Configuration
# Using a known capable multimodal model. 
# If you have access to specific preview models, you can update this.
MODEL_NAME = "gemini-2.0-flash-exp" 

LOGO_PATH = SCRIPT_DIR / "images" / "quancreator-logo.png"

def rebrand_interface(image_path: str, output_path: str = "rebranded_concept.png"):
    """
    Sends an interface screenshot and the new logo to Gemini to generate a rebranded concept.
    """
    print(f"Using model: {MODEL_NAME}")
    
    if not os.path.exists(image_path):
        print(f"Error: Input image not found at {image_path}")
        return

    contents = []
    
    contents.append(types.Part.from_text(text="You are an expert UI/UX designer. Your task is to rebrand the provided application interface screenshot."))
    contents.append(types.Part.from_text(text="1. Replace existing branding (Invoke) with 'QuantiCreator' style."))
    contents.append(types.Part.from_text(text="2. Apply a modern, vibrant aesthetic using a Violet/Indigo color palette (replacing the current dark/gray/blue theme)."))
    contents.append(types.Part.from_text(text="3. Ensure the design feels premium and 'state of the art'."))
    contents.append(types.Part.from_text(text="4. Output the result as a high-quality visualization of the new interface."))

    # Load input image
    try:
        input_image_bytes = Path(image_path).read_bytes()
        contents.append(types.Part.from_bytes(data=input_image_bytes, mime_type="image/png"))
    except Exception as e:
        print(f"Error reading input image: {e}")
        return

    if LOGO_PATH.exists():
        print(f"Attaching logo from {LOGO_PATH}")
        contents.append(types.Part.from_text(text="\n\nHere is the new logo 'QuanCreator' that must be seamlessly integrated:"))
        try:
            contents.append(types.Part.from_bytes(data=LOGO_PATH.read_bytes(), mime_type="image/png"))
        except Exception as e:
            print(f"Error reading logo image: {e}")
    else:
        print(f"Warning: Logo not found at {LOGO_PATH}. Proceeding without explicit logo attachment.")

    contents.append(types.Part.from_text(text="Provide a detailed description of the design changes, including specific CSS color codes and placement suggestions. If you can provide a textual representation or code snippet for the changes, please do so."))

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents
        )
        
        print("\n--- Gemini Rebranding Suggestion ---\n")
        print(response.text)
        
        # Save response to file
        output_text_path = Path(output_path).with_suffix('.txt')
        with open(output_text_path, "w") as f:
            f.write(response.text)
        print(f"\nSuggestion saved to {output_text_path}")

    except Exception as e:
        print(f"Error communicating with Gemini: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ai_rebrand.py <path_to_ui_screenshot>")
        print("Example: python ai_rebrand.py ./screenshot.png")
    else:
        rebrand_interface(sys.argv[1])

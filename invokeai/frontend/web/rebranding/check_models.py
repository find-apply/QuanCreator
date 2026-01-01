import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv("../.env")
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

print("Available Models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"Content Generation: {m.name}")
    if 'generateImages' in m.supported_generation_methods: # hypothetical attribute check
         print(f"Image Generation: {m.name}")

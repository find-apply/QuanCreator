import base64
import io
import os
from typing import Literal, Optional

from pathlib import Path
from dotenv import load_dotenv
import requests


from PIL import Image
from pydantic import Field

from invokeai.app.invocations.baseinvocation import (
    BaseInvocation,
    BaseInvocationOutput,
    InvocationContext,
    invocation,
    invocation_output,
)
from invokeai.app.invocations.fields import (
    FieldDescriptions,
    Input,
    InputField,
    OutputField,
    UIType,
    WithMetadata,
)
from invokeai.app.invocations.primitives import ImageField, ImageOutput
from invokeai.backend.model_manager.configs.external_api import Gemini2_5_Config, Gemini3_Pro_Config

@invocation(
    "gemini_2_5_flash_image_gen",
    title="Gemini 2.5 Flash Image Gen",
    tags=["image", "gemini", "api"],
    category="generation",
    version="1.0.0",
)
class Gemini25FlashImageGenInvocation(BaseInvocation, WithMetadata):
    """Generates an image using Gemini 2.5 Flash."""

    prompt: str = InputField(description=FieldDescriptions.raw_prompt)
    model: Gemini2_5_Config = InputField(
        description="The Gemini 2.5 Flash model to use",
        ui_type=UIType.Gemini2_5Model,
    )
    
    def invoke(self, context: InvocationContext) -> ImageOutput:
        # Try to load .env from the project root
        env_path = Path(__file__).parents[3] / ".env"
        load_dotenv(dotenv_path=env_path)

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is not set.")

        # Use Imagen 4 endpoint as discovered from list_models
        url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={api_key}"
        
        payload = {
            "instances": [
                {
                    "prompt": self.prompt
                }
            ],
            "parameters": {
                "sampleCount": 1
            }
        }

        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Parse Imagen 4 prediction format (consistent with newer API)
            if "predictions" not in data or not data["predictions"]:
                 raise ValueError("No predictions returned from API.")
            
            prediction = data["predictions"][0]
            
            if isinstance(prediction, str):
                b64_data = prediction
            elif isinstance(prediction, dict) and "bytesBase64Encoded" in prediction:
                b64_data = prediction["bytesBase64Encoded"]
            elif isinstance(prediction, dict) and "mimeType" in prediction and "bytesBase64Encoded" in prediction:
                 b64_data = prediction["bytesBase64Encoded"]
            else:
                 raise ValueError(f"Unexpected prediction format: {prediction.keys() if isinstance(prediction, dict) else prediction}")

            image_data = base64.b64decode(b64_data)
            image = Image.open(io.BytesIO(image_data))
            
            image_dto = context.images.save(image=image)
            return ImageOutput(
                image=ImageField(image_name=image_dto.image_name),
                width=image_dto.width,
                height=image_dto.height
            )

        except Exception as e:
            raise RuntimeError(f"Failed to generate image with Gemini 2.5 Flash: {e}")


@invocation(
    "gemini_3_pro_image_gen",
    title="Gemini 3 Pro Image Gen",
    tags=["image", "gemini", "api"],
    category="generation",
    version="1.0.0",
)
class Gemini3ProImageGenInvocation(BaseInvocation, WithMetadata):
    """Generates an image using Gemini 3 Pro."""

    prompt: str = InputField(description=FieldDescriptions.raw_prompt)
    model: Gemini3_Pro_Config = InputField(
        description="The Gemini 3 Pro model to use",
        ui_type=UIType.Gemini3ProModel,
    )
    
    def invoke(self, context: InvocationContext) -> ImageOutput:
        # Try to load .env from the project root
        env_path = Path(__file__).parents[3] / ".env"
        load_dotenv(dotenv_path=env_path)

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is not set.")

        # Use Imagen 4 endpoint for Gemini 3 Pro
        url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={api_key}"
        
        payload = {
            "instances": [
                {
                    "prompt": self.prompt
                }
            ],
            "parameters": {
                "sampleCount": 1
            }
        }

        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Parse Imagen 4 prediction format (consistent with newer API)
            if "predictions" not in data or not data["predictions"]:
                 raise ValueError("No predictions returned from API.")
            
            prediction = data["predictions"][0]
            
            if isinstance(prediction, str):
                b64_data = prediction
            elif isinstance(prediction, dict) and "bytesBase64Encoded" in prediction:
                b64_data = prediction["bytesBase64Encoded"]
            elif isinstance(prediction, dict) and "mimeType" in prediction and "bytesBase64Encoded" in prediction:
                 b64_data = prediction["bytesBase64Encoded"]
            else:
                 raise ValueError(f"Unexpected prediction format: {prediction.keys() if isinstance(prediction, dict) else prediction}")

            image_data = base64.b64decode(b64_data)
            image = Image.open(io.BytesIO(image_data))
            
            image_dto = context.images.save(image=image)
            return ImageOutput(
                image=ImageField(image_name=image_dto.image_name),
                width=image_dto.width,
                height=image_dto.height
            )

        except Exception as e:
            raise RuntimeError(f"Failed to generate image with Gemini 3 Pro: {e}")

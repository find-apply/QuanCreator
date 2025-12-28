from typing import Any, Literal, Self

from pydantic import Field

from invokeai.backend.model_manager.configs.base import Config_Base
from invokeai.backend.model_manager.model_on_disk import ModelOnDisk
from invokeai.backend.model_manager.taxonomy import BaseModelType, ModelFormat, ModelType


class Gemini2_5_Config(Config_Base):
    """Model config for Gemini 2.5 Flash Image Gen."""

    type: Literal[ModelType.Main] = Field(default=ModelType.Main)
    base: Literal[BaseModelType.Any] = Field(default=BaseModelType.Any)
    format: Literal[ModelFormat.API] = Field(default=ModelFormat.API)

    @classmethod
    def from_model_on_disk(cls, mod: ModelOnDisk, override_fields: dict[str, Any]) -> Self:
        # This is a placeholder. API models are typically not probed from disk.
        # If we ever have a file representing this model, we'd check it here.
        raise NotImplementedError

import { logger } from 'app/logging/logger';
import { getPrefixedId } from 'features/controlLayers/konva/util';
import { selectMainModelConfig } from 'features/controlLayers/store/paramsSlice';
import { Graph } from 'features/nodes/util/graph/generation/Graph';
import { selectPresetModifiedPrompts } from 'features/nodes/util/graph/graphBuilderUtils';
import type { GraphBuilderArg, GraphBuilderReturn } from 'features/nodes/util/graph/types';
import { UnsupportedGenerationModeError } from 'features/nodes/util/graph/types';
import { assert } from 'tsafe';

const log = logger('system');

export const buildGeminiGraph = (arg: GraphBuilderArg): GraphBuilderReturn => {
  const { generationMode, state, manager } = arg;

  log.debug({ generationMode, manager: manager?.id }, 'Building Gemini graph');

  const model = selectMainModelConfig(state);
  assert(model, 'No model selected');
  assert(model.base === 'any', 'Selected model is not an API model');

  // API models only support txt2img mode
  if (generationMode !== 'txt2img') {
    throw new UnsupportedGenerationModeError(`Gemini API model only supports text-to-image generation.`);
  }

  const prompts = selectPresetModifiedPrompts(state);

  const g = new Graph(getPrefixedId('gemini_graph'));

  const positivePrompt = g.addNode({
    id: getPrefixedId('positive_prompt'),
    type: 'string',
  });

  // Create the Gemini image generation node
  const geminiNode = g.addNode({
    type: 'gemini_2_5_flash_image_gen',
    id: getPrefixedId('gemini_gen'),
    prompt: prompts.positive,
  });

  // Set the output node
  g.setMetadataReceivingNode(geminiNode);

  return {
    g,
    positivePrompt,
  };
};

export const PRESET_PLACEHOLDER = '{prompt}';

export const buildPresetModifiedPrompt = (presetPrompt: string, currentPrompt: string) => {
  return presetPrompt.includes(PRESET_PLACEHOLDER)
    ? presetPrompt.replace(PRESET_PLACEHOLDER, currentPrompt)
    : `${currentPrompt} ${presetPrompt}`;
};

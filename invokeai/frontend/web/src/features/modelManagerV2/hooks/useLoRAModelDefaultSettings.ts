import { isNil } from 'es-toolkit/compat';
import { DEFAULT_LORA_WEIGHT_CONFIG } from 'features/controlLayers/store/lorasSlice';
import { useMemo } from 'react';
import type { LoRAModelConfig } from 'services/api/types';

export const useLoRAModelDefaultSettings = (modelConfig: LoRAModelConfig) => {
  const defaultSettingsDefaults = useMemo(() => {
    return {
      weight: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isEnabled: !isNil((modelConfig as any)?.default_settings?.weight),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (modelConfig as any)?.default_settings?.weight ?? DEFAULT_LORA_WEIGHT_CONFIG.initial,
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps
  }, [(modelConfig as any)?.default_settings]);

  return defaultSettingsDefaults;
};

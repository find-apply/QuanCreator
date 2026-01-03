import { Badge, Flex, IconButton, Spacer, Text, Tooltip } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { selectStylePresetViewMode, viewModeChanged } from 'features/stylePresets/store/stylePresetSlice';
import { useTemplateStore } from 'features/template-gallery/store/useTemplateStore';
import type { MouseEventHandler } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiEyeBold, PiStackSimpleBold, PiXBold } from 'react-icons/pi';

import StylePresetImage from './StylePresetImage';

export const ActiveStylePreset = () => {
  const viewMode = useAppSelector(selectStylePresetViewMode);
  const { activeTemplateId, templates, setActiveTemplate } = useTemplateStore();
  const activeTemplate = templates.find((t) => t.id === activeTemplateId);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleClearActiveStylePreset = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.stopPropagation();
      dispatch(viewModeChanged(false));
      setActiveTemplate(null);
    },
    [dispatch, setActiveTemplate]
  );

  const handleFlattenPrompts = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.stopPropagation();
      dispatch(viewModeChanged(false));
      setActiveTemplate(null);
    },
    [dispatch, setActiveTemplate]
  );

  const handleToggleViewMode = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.stopPropagation();
      dispatch(viewModeChanged(!viewMode));
    },
    [dispatch, viewMode]
  );

  if (!activeTemplate) {
    return (
      <Flex h={25} alignItems="center">
        <Text fontSize="sm" fontWeight="semibold" color="base.300">
          {t('stylePresets.choosePromptTemplate')}
        </Text>
      </Flex>
    );
  }
  return (
    <Flex w="full" alignItems="center" gap={2} minW={0}>
      <StylePresetImage imageWidth={25} presetImageUrl={activeTemplate.image || null} />
      <Badge colorScheme="invokeBlue" variant="subtle" justifySelf="flex-start">
        {activeTemplate.name}
      </Badge>
      <Spacer />
      <Tooltip label={t('stylePresets.toggleViewMode')}>
        <IconButton
          onClick={handleToggleViewMode}
          variant="outline"
          size="sm"
          aria-label={t('stylePresets.toggleViewMode')}
          colorScheme={viewMode ? 'invokeBlue' : 'base'}
          icon={<PiEyeBold />}
        />
      </Tooltip>
      <Tooltip label={t('stylePresets.flatten')}>
        <IconButton
          onClick={handleFlattenPrompts}
          variant="outline"
          size="sm"
          aria-label={t('stylePresets.flatten')}
          icon={<PiStackSimpleBold />}
        />
      </Tooltip>
      <Tooltip label={t('stylePresets.clearTemplateSelection')}>
        <IconButton
          onClick={handleClearActiveStylePreset}
          variant="outline"
          size="sm"
          aria-label={t('stylePresets.clearTemplateSelection')}
          icon={<PiXBold />}
        />
      </Tooltip>
    </Flex>
  );
};

import type { SystemStyleObject } from '@invoke-ai/ui-library';
import { Flex, IconButton, useDisclosure } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppSelector } from 'app/store/storeHooks';
import {
  $isStylePresetsMenuOpen,
  selectStylePresetActivePresetId,
} from 'features/stylePresets/store/stylePresetSlice';
import { TemplateGallery } from 'features/template-gallery/components/TemplateGallery';
import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiCaretDownBold } from 'react-icons/pi';

import { ActiveStylePreset } from './ActiveStylePreset';

const _hover: SystemStyleObject = {
  bg: 'base.750',
};

export const StylePresetMenuTrigger = () => {
  const isMenuOpen = useStore($isStylePresetsMenuOpen);
  const { t } = useTranslation();
  const activeStylePresetId = useAppSelector(selectStylePresetActivePresetId);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleToggle = useCallback(() => {
    $isStylePresetsMenuOpen.set(!isMenuOpen);
  }, [isMenuOpen]);

  const handleClick = useCallback(() => {
    if (!activeStylePresetId) {
      onOpen();
    } else {
      handleToggle();
    }
  }, [activeStylePresetId, handleToggle, onOpen]);

  const handleChevronClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      handleToggle();
    },
    [handleToggle]
  );

  return (
    <>
      <Flex
        onClick={handleClick}
        backgroundColor="base.800"
        justifyContent="space-between"
        alignItems="center"
        py={2}
        px={3}
        borderRadius="base"
        gap={2}
        role="button"
        _hover={_hover}
        transitionProperty="background-color"
        transitionDuration="normal"
        w="full"
      >
        <ActiveStylePreset />
        <IconButton
          aria-label={t('stylePresets.viewList')}
          variant="ghost"
          icon={<PiCaretDownBold />}
          size="sm"
          onClick={handleChevronClick}
        />
      </Flex>
      <TemplateGallery isOpen={isOpen} onClose={onClose} />
    </>
  );
};

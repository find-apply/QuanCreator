import type { SystemStyleObject } from '@invoke-ai/ui-library';
import { Flex, IconButton, useDisclosure } from '@invoke-ai/ui-library';
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
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleClick = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const handleChevronClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onOpen();
    },
    [onOpen]
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

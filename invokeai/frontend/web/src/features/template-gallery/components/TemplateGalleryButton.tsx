import { IconButton, useDisclosure } from '@invoke-ai/ui-library';
import React from 'react';
import { PiBookOpenTextBold } from 'react-icons/pi';

import { TemplateGallery } from './TemplateGallery';

export const TemplateGalleryButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        aria-label="Template Gallery"
        tooltip="Template Gallery"
        icon={<PiBookOpenTextBold />}
        size="sm"
        variant="ghost"
        onClick={onOpen}
      />
      <TemplateGallery isOpen={isOpen} onClose={onClose} />
    </>
  );
};

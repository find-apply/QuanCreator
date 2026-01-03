import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  VStack,
} from '@invoke-ai/ui-library';
import type { PromptCategory, PromptTemplate } from 'features/template-gallery/types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: PromptTemplate;
  onSubmit: (data: any) => Promise<void>;
  categories: PromptCategory[];
  isLoading?: boolean;
}

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  template,
  onSubmit,
  categories,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (template) {
        setName(template.name);
        setDescription(template.description || '');
        setPositivePrompt(template.positivePrompt);
        setNegativePrompt(template.negativePrompt || '');
        setCategoryId(template.categoryId || (template.categoryIds && template.categoryIds[0]) || '');
      } else {
        setName('');
        setDescription('');
        setPositivePrompt('');
        setNegativePrompt('');
        setCategoryId('');
      }
    }
  }, [isOpen, template]);

  const handleSubmit = async () => {
    await onSubmit({
      name,
      description,
      positivePrompt,
      negativePrompt,
      categoryIds: categoryId ? [categoryId] : [],
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{template ? 'Edit Template' : 'Create Template'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template Name" />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Template Description"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="Select Category">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Positive Prompt</FormLabel>
              <Textarea
                value={positivePrompt}
                onChange={(e) => setPositivePrompt(e.target.value)}
                placeholder="Positive Prompt"
                minH="100px"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Negative Prompt</FormLabel>
              <Textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Negative Prompt"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button colorScheme="invokeBlue" onClick={handleSubmit} isLoading={isLoading}>
            {template ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

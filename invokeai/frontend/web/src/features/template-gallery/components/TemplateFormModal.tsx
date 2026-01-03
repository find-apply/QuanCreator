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
import type { PromptCategory, PromptTemplate, TemplateFormData } from 'features/template-gallery/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: PromptTemplate;
  onSubmit: (data: TemplateFormData) => Promise<void>;
  categories: PromptCategory[];
  isLoading?: boolean;
  mode?: 'create' | 'edit' | 'duplicate' | 'view';
}

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  template,
  onSubmit,
  categories,
  isLoading,
  mode = 'create',
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value);
  }, []);

  const handlePositivePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPositivePrompt(e.target.value);
  }, []);

  const handleNegativePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNegativePrompt(e.target.value);
  }, []);

  const sortedCategories = useMemo(() => {
    const flattenCategories = (
      cats: PromptCategory[],
      parentId: string | null = null,
      depth: number = 0
    ): { category: PromptCategory; depth: number }[] => {
      let result: { category: PromptCategory; depth: number }[] = [];
      const children = cats.filter((c) => c.parentId === parentId || (parentId === null && !c.parentId));

      // Sort by order if available, otherwise by name
      children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      for (const child of children) {
        result.push({ category: child, depth });
        result = result.concat(flattenCategories(cats, child.id, depth + 1));
      }
      return result;
    };

    return flattenCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (isOpen) {
      if (template) {
        setName(mode === 'duplicate' ? `${template.name} (Copy)` : template.name);
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
  }, [isOpen, template, mode]);

  const handleSubmit = useCallback(async () => {
    await onSubmit({
      name,
      description,
      positivePrompt,
      negativePrompt,
      categoryIds: categoryId ? [categoryId] : [],
    });
    onClose();
  }, [onSubmit, name, description, positivePrompt, negativePrompt, categoryId, onClose]);

  const getTitle = () => {
    switch (mode) {
      case 'edit':
        return 'Edit Template';
      case 'duplicate':
        return 'Duplicate Template';
      case 'view':
        return 'View Template';
      default:
        return 'Create Template';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{getTitle()}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={handleNameChange} placeholder="Template Name" isDisabled={isReadOnly} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Template Description"
                isDisabled={isReadOnly}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                value={categoryId}
                onChange={handleCategoryChange}
                placeholder="Select Category"
                isDisabled={isReadOnly}
              >
                {sortedCategories.map(({ category, depth }) => (
                  <option key={category.id} value={category.id}>
                    {'\u00A0'.repeat(depth * 4) + category.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Positive Prompt</FormLabel>
              <Textarea
                value={positivePrompt}
                onChange={handlePositivePromptChange}
                placeholder="Positive Prompt"
                minH="100px"
                isDisabled={isReadOnly}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Negative Prompt</FormLabel>
              <Textarea
                value={negativePrompt}
                onChange={handleNegativePromptChange}
                placeholder="Negative Prompt"
                isDisabled={isReadOnly}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button colorScheme="invokeBlue" onClick={handleSubmit} isLoading={isLoading}>
              {mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

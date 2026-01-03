import {
  Button,
  Flex,
  Grid,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tab,
  TabList,
  Tabs,
  useToast,
} from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import { IAINoContentFallback } from 'common/components/IAIImageFallback';
import { negativePromptChanged, positivePromptChanged } from 'features/controlLayers/store/paramsSlice';
import { fetchCategoryData } from 'features/template-gallery/services/templateDataSource';
import { useTemplateStore } from 'features/template-gallery/store/useTemplateStore';
import type { PromptCategory, PromptTemplate } from 'features/template-gallery/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';

import { TemplateCard } from './TemplateCard';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { templates, loading, fetchTemplates, deleteTemplate, activeTemplateId, setActiveTemplate } =
    useTemplateStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Official, 2: My Templates
  const [categoryLookup, setCategoryLookup] = useState<Map<string, PromptCategory>>(new Map());

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchCategoryData().then((cats) => {
        setCategoryLookup(new Map(cats.map((c) => [c.id, c])));
      });
    }
  }, [isOpen, fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter((t: PromptTemplate) => t.isDefault);
    } else if (activeTab === 2) {
      filtered = filtered.filter((t: PromptTemplate) => !t.isDefault);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t: PromptTemplate) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.positivePrompt.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [templates, activeTab, searchQuery]);

  const handleSelectTemplate = useCallback(
    (template: PromptTemplate) => {
      dispatch(positivePromptChanged(template.positivePrompt));
      if (template.negativePrompt) {
        dispatch(negativePromptChanged(template.negativePrompt));
      }
      setActiveTemplate(template.id);
      onClose();
      toast({
        title: 'Template Applied',
        description: `Applied template: ${template.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    [dispatch, onClose, setActiveTemplate, toast]
  );

  const handleDeleteTemplate = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this template?')) {
        try {
          await deleteTemplate(id);
          toast({
            title: 'Template Deleted',
            status: 'success',
          });
        } catch {
          toast({
            title: 'Error deleting template',
            status: 'error',
          });
        }
      }
    },
    [deleteTemplate, toast]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCreateTemplate = useCallback(() => {
    alert('Create Template Modal not implemented yet');
  }, []);

  const handleDuplicate = useCallback(() => {
    // noop
  }, []);

  const handleEdit = useCallback(() => {
    // noop
  }, []);

  const handleView = useCallback(() => {
    // noop
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay />
      <ModalContent h="85vh" display="flex" flexDirection="column">
        <ModalHeader>Template Gallery</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" gap={4} flex={1} overflow="hidden">
          <Flex justify="space-between" align="center" gap={4}>
            <InputGroup maxW="400px">
              <Input placeholder="Search templates..." value={searchQuery} onChange={handleSearchChange} />
            </InputGroup>
            <Button leftIcon={<PiPlusBold />} colorScheme="invokeBlue" onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </Flex>

          <Tabs index={activeTab} onChange={setActiveTab} variant="soft-rounded" colorScheme="invokeBlue">
            <TabList>
              <Tab>All</Tab>
              <Tab>Official</Tab>
              <Tab>My Templates</Tab>
            </TabList>
          </Tabs>

          {loading.templates ? (
            <Flex justify="center" align="center" flex={1}>
              <Spinner size="xl" />
            </Flex>
          ) : filteredTemplates.length === 0 ? (
            <IAINoContentFallback label="No templates found" icon={null} />
          ) : (
            <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={4} overflowY="auto" p={1}>
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isCustom={!template.isDefault}
                  isSelected={activeTemplateId === template.id}
                  categoryLookup={categoryLookup}
                  onSelect={handleSelectTemplate}
                  onDuplicate={handleDuplicate}
                  onEdit={handleEdit}
                  onDelete={handleDeleteTemplate}
                  onView={handleView}
                />
              ))}
            </Grid>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

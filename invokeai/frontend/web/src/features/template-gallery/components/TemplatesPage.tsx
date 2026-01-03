import {
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  InputGroup,
  Spinner,
  useToast,
} from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import { IAINoContentFallback } from 'common/components/IAIImageFallback';
import { negativePromptChanged, positivePromptChanged } from 'features/controlLayers/store/paramsSlice';
import { fetchCategoryData } from 'features/template-gallery/services/templateDataSource';
import { useTemplateStore } from 'features/template-gallery/store/useTemplateStore';
import type { PromptCategory, PromptTemplate } from 'features/template-gallery/types';
import { navigationApi } from 'features/ui/layouts/navigation-api';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';

import { buildCategoryLookupFromTree, buildCategoryTree, calculateTemplateCounts, CategoryTab, getAllDescendantIds } from './CategoryTab';
import { TemplateCard } from './TemplateCard';

export const TemplatesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { templates, loading, fetchTemplates, deleteTemplate, activeTemplateId, setActiveTemplate } =
    useTemplateStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryTree, setCategoryTree] = useState<PromptCategory[]>([]);
  const [categoryLookup, setCategoryLookup] = useState<Map<string, PromptCategory>>(new Map());

  useEffect(() => {
    fetchTemplates();
    fetchCategoryData().then((cats) => {
      // Build hierarchical tree
      const tree = buildCategoryTree(cats);
      setCategoryTree(tree);
      // Build lookup from tree to preserve children references
      setCategoryLookup(buildCategoryLookupFromTree(tree));
    });
  }, [fetchTemplates]);

  // Get all category IDs to filter by (including descendants)
  const filterCategoryIds = useMemo(() => {
    if (!selectedCategoryId) {
      return null; // "All" - no filtering
    }
    const category = categoryLookup.get(selectedCategoryId);
    if (!category) {
      return [selectedCategoryId];
    }
    // Get all descendant IDs for hierarchical filtering
    return getAllDescendantIds(category);
  }, [selectedCategoryId, categoryLookup]);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category (including all descendants)
    if (filterCategoryIds) {
      filtered = filtered.filter((t: PromptTemplate) => {
        // Check if template belongs to any of the selected categories
        if (t.categoryIds && t.categoryIds.some((id) => filterCategoryIds.includes(id))) {
          return true;
        }
        if (t.categoryId && filterCategoryIds.includes(t.categoryId)) {
          return true;
        }
        return false;
      });
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
  }, [templates, filterCategoryIds, searchQuery]);

  // Calculate template counts per category
  const templateCounts = useMemo(() => {
    return calculateTemplateCounts(templates, categoryLookup);
  }, [templates, categoryLookup]);

  const handleSelectCategory = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleSelectAllCategory = useCallback(() => {
    handleSelectCategory(null);
  }, [handleSelectCategory]);

  const handleSelectTemplate = useCallback(
    (template: PromptTemplate) => {
      dispatch(positivePromptChanged(template.positivePrompt));
      if (template.negativePrompt) {
        dispatch(negativePromptChanged(template.negativePrompt));
      }
      setActiveTemplate(template.id);
      // Navigate to generate tab after selecting a template
      navigationApi.switchToTab('generate');
      toast({
        title: 'Template Applied',
        description: `Applied template: ${template.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    [dispatch, setActiveTemplate, toast]
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
    <Flex direction="column" w="full" h="full" p={6} gap={4} overflow="hidden" bg="base.900">
      <Flex justify="space-between" align="center">
        <Heading size="lg">Template Gallery</Heading>
        <Button leftIcon={<PiPlusBold />} colorScheme="invokeBlue" onClick={handleCreateTemplate}>
          Create Template
        </Button>
      </Flex>

      <Flex justify="space-between" align="center" gap={4}>
        <InputGroup maxW="400px">
          <Input placeholder="Search templates..." value={searchQuery} onChange={handleSearchChange} />
        </InputGroup>
      </Flex>

      {/* Category tabs with hierarchical dropdowns */}
      <Flex flexWrap="wrap" gap={2} alignItems="center">
        <Button
          size="sm"
          variant={selectedCategoryId === null ? 'solid' : 'ghost'}
          colorScheme={selectedCategoryId === null ? 'invokeBlue' : undefined}
          borderRadius="full"
          onClick={handleSelectAllCategory}
          px={4}
        >
          All ({templates.length})
        </Button>
        {categoryTree.map((category) => (
          <CategoryTab
            key={category.id}
            category={category}
            isSelected={selectedCategoryId === category.id}
            onSelect={handleSelectCategory}
            templateCounts={templateCounts}
          />
        ))}
      </Flex>

      {loading.templates ? (
        <Flex justify="center" align="center" flex={1}>
          <Spinner size="xl" />
        </Flex>
      ) : filteredTemplates.length === 0 ? (
        <IAINoContentFallback label="No templates found" icon={null} />
      ) : (
        <Grid
          templateColumns="repeat(auto-fill, minmax(280px, 1fr))"
          gap={4}
          overflowY="auto"
          p={1}
          flex={1}
          alignContent="start"
        >
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
    </Flex>
  );
};

export default TemplatesPage;

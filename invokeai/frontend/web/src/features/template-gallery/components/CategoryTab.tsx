import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
} from '@invoke-ai/ui-library';
import type { PromptCategory } from 'features/template-gallery/types';
import React, { memo, useCallback } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';

interface CategoryTabProps {
  category: PromptCategory;
  isSelected: boolean;
  onSelect: (categoryId: string | null) => void;
  templateCounts: Map<string, number>;
}

// Recursive menu item for nested children - supports unlimited depth
const NestedMenuItem = memo(
  ({
    category,
    onSelect,
    depth = 0,
    templateCounts,
  }: {
    category: PromptCategory;
    onSelect: (categoryId: string) => void;
    depth?: number;
    templateCounts: Map<string, number>;
  }) => {
    const count = templateCounts.get(category.id) ?? 0;
    const hasChildren = category.children && category.children.length > 0;

    const handleClick = useCallback(() => {
      onSelect(category.id);
    }, [category.id, onSelect]);

    if (hasChildren) {
      return (
        <Menu placement="right-start" isLazy>
          <MenuButton
            as={Box}
            px={3}
            py={2}
            cursor="pointer"
            _hover={{ bg: 'base.700' }}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            w="full"
            borderRadius="sm"
          >
            <Flex align="center" gap={2} flex={1}>
              {category.emoji && <Text>{category.emoji}</Text>}
              <Text fontSize="sm" noOfLines={1}>{category.name}</Text>
              {count > 0 && (
                <Text fontSize="xs" color="base.400" fontWeight="normal">({count})</Text>
              )}
            </Flex>
            <PiCaretDownBold style={{ transform: 'rotate(-90deg)', flexShrink: 0 }} />
          </MenuButton>
          <Portal>
            <MenuList 
              bg="base.800" 
              borderColor="base.600" 
              minW="220px" 
              maxH="400px"
              overflowY="auto"
              zIndex={1500 + depth * 10}
              boxShadow="lg"
            >
              {/* Option to select the parent category itself */}
              <MenuItem
                onClick={handleClick}
                bg="base.800"
                _hover={{ bg: 'invokeBlue.700' }}
                fontWeight="semibold"
              >
                <Flex align="center" gap={2}>
                  {category.emoji && <Text>{category.emoji}</Text>}
                  <Text fontSize="sm">All in {category.name}</Text>
                </Flex>
              </MenuItem>
              {/* Child categories - recursive rendering for any depth */}
              {category.children!.map((child) => (
                <NestedMenuItem
                  key={child.id}
                  category={child}
                  onSelect={onSelect}
                  depth={depth + 1}
                  templateCounts={templateCounts}
                />
              ))}
            </MenuList>
          </Portal>
        </Menu>
      );
    }

    return (
      <MenuItem 
        onClick={handleClick} 
        bg="base.800" 
        _hover={{ bg: 'base.700' }}
        pl={3 + depth * 2}
      >
        <Flex align="center" gap={2} justify="space-between" w="full">
          <Flex align="center" gap={2}>
            {category.emoji && <Text>{category.emoji}</Text>}
            <Text fontSize="sm" noOfLines={1}>{category.name}</Text>
          </Flex>
          {count > 0 && (
            <Text fontSize="xs" color="base.400">({count})</Text>
          )}
        </Flex>
      </MenuItem>
    );
  }
);
NestedMenuItem.displayName = 'NestedMenuItem';

export const CategoryTab = memo(({ category, isSelected, onSelect, templateCounts }: CategoryTabProps) => {
  const hasChildren = category.children && category.children.length > 0;
  const count = templateCounts.get(category.id) ?? 0;

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      onSelect(categoryId);
    },
    [onSelect]
  );

  const handleSelectParent = useCallback(() => {
    onSelect(category.id);
  }, [category.id, onSelect]);

  if (hasChildren) {
    return (
      <Menu isLazy placement="bottom-start">
        <MenuButton
          as={Button}
          size="sm"
          variant={isSelected ? 'solid' : 'ghost'}
          colorScheme={isSelected ? 'invokeBlue' : undefined}
          borderRadius="full"
          rightIcon={<PiCaretDownBold />}
          px={4}
        >
          <Flex align="center" gap={1}>
            {category.emoji && <Text>{category.emoji}</Text>}
            <Text>{category.name}</Text>
            {count > 0 && (
              <Text fontSize="xs" color={isSelected ? 'white' : 'base.400'} fontWeight="normal">({count})</Text>
            )}
          </Flex>
        </MenuButton>
        <Portal>
          <MenuList bg="base.800" borderColor="base.600" minW="200px" zIndex={1400}>
            {/* Option to select the parent category itself */}
            <MenuItem
              onClick={handleSelectParent}
              bg="base.800"
              _hover={{ bg: 'base.700' }}
              fontWeight="semibold"
            >
              <Flex align="center" gap={2}>
                {category.emoji && <Text>{category.emoji}</Text>}
                <Text fontSize="sm">All in {category.name}</Text>
              </Flex>
            </MenuItem>
            {/* Child categories */}
            {category.children!.map((child) => (
              <NestedMenuItem key={child.id} category={child} onSelect={handleSelectCategory} templateCounts={templateCounts} />
            ))}
          </MenuList>
        </Portal>
      </Menu>
    );
  }

  return (
    <Button
      size="sm"
      variant={isSelected ? 'solid' : 'ghost'}
      colorScheme={isSelected ? 'invokeBlue' : undefined}
      borderRadius="full"
      onClick={handleSelectParent}
      px={4}
    >
      <Flex align="center" gap={1}>
        {category.emoji && <Text>{category.emoji}</Text>}
        <Text>{category.name}</Text>
        {count > 0 && (
          <Text fontSize="xs" color={isSelected ? 'white' : 'base.400'} fontWeight="normal">({count})</Text>
        )}
      </Flex>
    </Button>
  );
});
CategoryTab.displayName = 'CategoryTab';

// Helper function to build category tree from flat list
export const buildCategoryTree = (categories: PromptCategory[]): PromptCategory[] => {
  const categoryMap = new Map<string, PromptCategory>();
  const rootCategories: PromptCategory[] = [];

  // First pass: create a map of all categories with empty children arrays
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: build the tree structure
  categories.forEach((cat) => {
    const category = categoryMap.get(cat.id)!;
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(category);
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
};

// Helper function to get all descendant category IDs (for filtering templates)
export const getAllDescendantIds = (category: PromptCategory): string[] => {
  const ids: string[] = [category.id];
  if (category.children) {
    category.children.forEach((child) => {
      ids.push(...getAllDescendantIds(child));
    });
  }
  return ids;
};

// Helper function to build a flat lookup map from the tree (preserving children references)
export const buildCategoryLookupFromTree = (tree: PromptCategory[]): Map<string, PromptCategory> => {
  const lookup = new Map<string, PromptCategory>();

  const addToLookup = (categories: PromptCategory[]) => {
    categories.forEach((cat) => {
      lookup.set(cat.id, cat);
      if (cat.children && cat.children.length > 0) {
        addToLookup(cat.children);
      }
    });
  };

  addToLookup(tree);
  return lookup;
};

// Helper function to calculate template counts per category (including descendants)
export const calculateTemplateCounts = (
  templates: { categoryId?: string; categoryIds?: string[] }[],
  categoryLookup: Map<string, PromptCategory>
): Map<string, number> => {
  const counts = new Map<string, number>();

  // Initialize all categories with 0
  categoryLookup.forEach((_, id) => {
    counts.set(id, 0);
  });

  // Count templates per category
  templates.forEach((template) => {
    const categoryIds = template.categoryIds ?? (template.categoryId ? [template.categoryId] : []);
    categoryIds.forEach((catId) => {
      const current = counts.get(catId) ?? 0;
      counts.set(catId, current + 1);
    });
  });

  // Add descendant counts to parent categories
  const addDescendantCounts = (category: PromptCategory): number => {
    let totalCount = counts.get(category.id) ?? 0;
    if (category.children) {
      category.children.forEach((child) => {
        totalCount += addDescendantCounts(child);
      });
    }
    counts.set(category.id, totalCount);
    return totalCount;
  };

  // Get root categories from lookup and process
  const roots = Array.from(categoryLookup.values()).filter((c) => !c.parentId);
  roots.forEach((root) => addDescendantCounts(root));

  return counts;
};

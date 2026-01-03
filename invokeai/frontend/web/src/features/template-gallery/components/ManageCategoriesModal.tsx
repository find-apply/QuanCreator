import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from '@invoke-ai/ui-library';
import {
  createCategoryData,
  deleteCategoryData,
  fetchCategoryData,
  updateCategoryData,
} from 'features/template-gallery/services/templateDataSource';
import type { PromptCategory } from 'features/template-gallery/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PiPencilBold, PiTrashBold } from 'react-icons/pi';

interface CategoryRowProps {
  category: PromptCategory;
  onEdit: (category: PromptCategory) => void;
  onDelete: (id: string) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ category, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => onEdit(category), [category, onEdit]);
  const handleDelete = useCallback(() => onDelete(category.id), [category.id, onDelete]);

  return (
    <Tr>
      <Td>{category.name}</Td>
      <Td>
        <Flex gap={2}>
          <IconButton aria-label="Edit" icon={<PiPencilBold />} size="sm" onClick={handleEdit} />
          <IconButton aria-label="Delete" icon={<PiTrashBold />} size="sm" colorScheme="red" onClick={handleDelete} />
        </Flex>
      </Td>
    </Tr>
  );
};

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChanged: () => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  onCategoriesChanged,
}) => {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [allCategories, setAllCategories] = useState<PromptCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<PromptCategory | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const toast = useToast();

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

    return flattenCategories(allCategories);
  }, [allCategories]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategoryData();
      setAllCategories(data);
      setCategories(data.filter((cat) => cat.type === 'user'));
    } catch {
      toast({
        title: 'Error fetching categories',
        status: 'error',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, loadCategories]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      return;
    }

    try {
      if (editingCategory) {
        await updateCategoryData(editingCategory.id, { name, parentId: parentId || null });
        toast({ title: 'Category updated', status: 'success' });
      } else {
        await createCategoryData({ name, type: 'user', parentId: parentId || null });
        toast({ title: 'Category created', status: 'success' });
      }
      setName('');
      setParentId('');
      setEditingCategory(null);
      loadCategories();
      onCategoriesChanged();
    } catch {
      toast({ title: 'Error saving category', status: 'error' });
    }
  }, [name, editingCategory, parentId, toast, loadCategories, onCategoriesChanged]);

  const handleEdit = useCallback((category: PromptCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setParentId(category.parentId || '');
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Are you sure?')) {
        return;
      }
      try {
        await deleteCategoryData(id);
        toast({ title: 'Category deleted', status: 'success' });
        loadCategories();
        onCategoriesChanged();
      } catch {
        toast({ title: 'Error deleting category', status: 'error' });
      }
    },
    [loadCategories, onCategoriesChanged, toast]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingCategory(null);
    setName('');
    setParentId('');
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleParentIdChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setParentId(e.target.value);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Categories</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Flex gap={2} alignItems="flex-end" wrap="wrap">
              <FormControl flex="1">
                <FormLabel>{editingCategory ? 'Edit Category' : 'New Category'}</FormLabel>
                <Input value={name} onChange={handleNameChange} placeholder="Category Name" />
              </FormControl>
              <FormControl flex="1">
                <FormLabel>Parent Category</FormLabel>
                <Select value={parentId} onChange={handleParentIdChange} placeholder="Select parent (optional)">
                  <option value="">None</option>
                  {sortedCategories
                    .filter(({ category }) => category.id !== editingCategory?.id) // Prevent selecting self as parent
                    .map(({ category, depth }) => (
                      <option key={category.id} value={category.id}>
                        {'\u00A0'.repeat(depth * 4) + category.name}
                      </option>
                    ))}
                </Select>
              </FormControl>
              <Button onClick={handleSave} colorScheme="invokeBlue">
                {editingCategory ? 'Update' : 'Add'}
              </Button>
              {editingCategory && <Button onClick={handleCancelEdit}>Cancel</Button>}
            </Flex>

            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((cat) => (
                  <CategoryRow key={cat.id} category={cat} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </Tbody>
            </Table>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

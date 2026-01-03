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
import React, { useEffect, useState } from 'react';
import { PiPencilBold, PiTrashBold } from 'react-icons/pi';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChanged: () => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ isOpen, onClose, onCategoriesChanged }) => {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [allCategories, setAllCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PromptCategory | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const toast = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategoryData();
      setAllCategories(data);
      setCategories(data.filter((cat) => cat.type === 'user'));
    } catch (error) {
      toast({
        title: 'Error fetching categories',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!name.trim()) return;

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
    } catch (error) {
      toast({ title: 'Error saving category', status: 'error' });
    }
  };

  const handleEdit = (category: PromptCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setParentId(category.parentId || '');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteCategoryData(id);
      toast({ title: 'Category deleted', status: 'success' });
      loadCategories();
      onCategoriesChanged();
    } catch (error) {
      toast({ title: 'Error deleting category', status: 'error' });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setParentId('');
  };

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
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name" />
              </FormControl>
              <FormControl flex="1">
                <FormLabel>Parent Category</FormLabel>
                <Select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  placeholder="Select parent (optional)"
                >
                  <option value="">None</option>
                  {allCategories
                    .filter((c) => c.id !== editingCategory?.id) // Prevent selecting self as parent
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
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
                  <Tr key={cat.id}>
                    <Td>{cat.name}</Td>
                    <Td>
                      <Flex gap={2}>
                        <IconButton
                          aria-label="Edit"
                          icon={<PiPencilBold />}
                          size="sm"
                          onClick={() => handleEdit(cat)}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<PiTrashBold />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(cat.id)}
                        />
                      </Flex>
                    </Td>
                  </Tr>
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

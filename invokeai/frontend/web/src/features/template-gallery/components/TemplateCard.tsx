import { Badge, Box, Flex, IconButton, Image, Spacer, Text } from '@invoke-ai/ui-library';
import type { PromptCategory, PromptTemplate } from 'features/template-gallery/types';
import React, { useCallback, useMemo } from 'react';
import { PiCopyBold, PiEyeBold, PiPencilBold, PiTrashBold } from 'react-icons/pi';

interface TemplateCardProps {
  template: PromptTemplate;
  isCustom: boolean;
  isSelected: boolean;
  categoryLookup: Map<string, PromptCategory>;
  onSelect: (template: PromptTemplate) => void;
  onDuplicate: (template: PromptTemplate) => void;
  onEdit: (template: PromptTemplate) => void;
  onDelete: (templateId: string) => void;
  onView: (template: PromptTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isCustom,
  isSelected,
  categoryLookup,
  onSelect,
  onDuplicate,
  onEdit,
  onDelete,
  onView,
}) => {
  const categoryInfos = useMemo(() => {
    const ids = template.categoryIds ? template.categoryIds : template.categoryId ? [template.categoryId] : [];

    const allCats = ids.map((id) => categoryLookup.get(id)).filter((c): c is PromptCategory => !!c);

    return allCats;
  }, [template.categoryIds, template.categoryId, categoryLookup]);

  const categoryInfo = categoryInfos[0];
  const type = categoryInfo?.type || (template.isDefault ? 'official' : 'user');

  let badgeColorScheme = 'blue';
  let badgeLabel = 'Public';

  if (type === 'user') {
    badgeColorScheme = 'green';
    badgeLabel = 'My Template';
  } else if (type === 'private') {
    badgeColorScheme = 'purple';
    badgeLabel = 'Private';
  }

  const handleSelect = useCallback(() => {
    onSelect(template);
  }, [onSelect, template]);

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleView = useCallback(() => {
    onView(template);
  }, [onView, template]);

  const handleDuplicate = useCallback(() => {
    onDuplicate(template);
  }, [onDuplicate, template]);

  const handleEdit = useCallback(() => {
    onEdit(template);
  }, [onEdit, template]);

  const handleDelete = useCallback(() => {
    onDelete(template.id);
  }, [onDelete, template.id]);

  return (
    <Box
      onClick={handleSelect}
      position="relative"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={isSelected ? 'invokeBlue.400' : 'base.700'}
      bg={isSelected ? 'base.800' : 'base.900'}
      _hover={{ borderColor: 'invokeBlue.400', transform: 'translateY(-2px)', shadow: 'lg' }}
      transition="all 0.2s"
      cursor="pointer"
      overflow="hidden"
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Box position="relative" h="140px" w="100%" bg="base.800">
        {template.image ? (
          <Image src={template.image} alt={template.name} objectFit="cover" w="100%" h="100%" />
        ) : (
          <Flex align="center" justify="center" h="100%" fontSize="4xl">
            {template.emoji || '🎨'}
          </Flex>
        )}
        <Box position="absolute" top={2} right={2}>
          <Badge colorScheme={badgeColorScheme}>{badgeLabel}</Badge>
        </Box>
      </Box>

      <Flex direction="column" p={3} flex={1} gap={2}>
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold" noOfLines={1}>
            {template.name}
          </Text>
        </Flex>

        <Text fontSize="sm" color="base.400" noOfLines={2}>
          {template.description}
        </Text>

        <Spacer />

        <Flex gap={2} mt={2} onClick={handleStopPropagation}>
          <IconButton aria-label="View" icon={<PiEyeBold />} size="sm" variant="ghost" onClick={handleView} />
          <IconButton
            aria-label="Duplicate"
            icon={<PiCopyBold />}
            size="sm"
            variant="ghost"
            onClick={handleDuplicate}
          />
          {isCustom && (
            <>
              <IconButton aria-label="Edit" icon={<PiPencilBold />} size="sm" variant="ghost" onClick={handleEdit} />
              <IconButton
                aria-label="Delete"
                icon={<PiTrashBold />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={handleDelete}
              />
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

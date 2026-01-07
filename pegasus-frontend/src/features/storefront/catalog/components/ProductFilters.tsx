import { useMemo, useState } from 'react';
import { Stack, Checkbox, Text, Divider, Accordion, Group, ActionIcon, Collapse, Box } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useCategoryTree } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';

interface ProductFiltersProps {
  selectedCategories: number[];
  selectedBrands: number[];
  onCategoryChange: (categoryIds: number[]) => void;
  onBrandChange: (brandIds: number[]) => void;
}

export const ProductFilters = ({
  selectedCategories,
  selectedBrands,
  onCategoryChange,
  onBrandChange,
}: ProductFiltersProps) => {
  const { data: categories, isLoading: categoriesLoading } = useCategoryTree();
  const { data: brands, isLoading: brandsLoading } = useBrands();

  const [openedCategoryIds, setOpenedCategoryIds] = useState<Set<number>>(() => new Set());

  const categoryTree = useMemo(() => categories ?? [], [categories]);

  const getDescendantIds = (category: { children?: Array<{ id: number; children?: unknown[] }> }): number[] => {
    const children = category.children ?? [];
    const direct = children.map((c) => c.id);
    const nested = children.flatMap((c) => getDescendantIds(c));
    return [...direct, ...nested];
  };

  const toggleOpenCategory = (categoryId: number) => {
    setOpenedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const handleCategoryToggle = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const handleParentCategoryToggle = (category: { id: number; children?: Array<{ id: number; children?: unknown[] }> }) => {
    const descendantIds = getDescendantIds(category);
    const subtreeIds = [category.id, ...descendantIds];

    const allDescendantsSelected = descendantIds.length > 0
      ? descendantIds.every((id) => selectedCategories.includes(id))
      : selectedCategories.includes(category.id);

    if (allDescendantsSelected) {
      onCategoryChange(selectedCategories.filter((id) => !subtreeIds.includes(id)));
      return;
    }

    onCategoryChange(Array.from(new Set([...selectedCategories, ...subtreeIds])));
  };

  const isCategoryChecked = (category: { id: number; children?: Array<{ id: number; children?: unknown[] }> }) => {
    const descendantIds = getDescendantIds(category);
    if (descendantIds.length === 0) return selectedCategories.includes(category.id);

    return descendantIds.every((id) => selectedCategories.includes(id));
  };

  const isCategoryIndeterminate = (category: { id: number; children?: Array<{ id: number; children?: unknown[] }> }) => {
    const descendantIds = getDescendantIds(category);
    if (descendantIds.length === 0) return false;

    const anySelected = descendantIds.some((id) => selectedCategories.includes(id));
    const allSelected = descendantIds.every((id) => selectedCategories.includes(id));
    return anySelected && !allSelected;
  };

  const handleChildCategoryToggle = (parentId: number, childId: number) => {
    if (selectedCategories.includes(childId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== childId && id !== parentId));
      return;
    }

    onCategoryChange(Array.from(new Set([...selectedCategories, childId])));
  };

  const handleBrandToggle = (brandId: number) => {
    if (selectedBrands.includes(brandId)) {
      onBrandChange(selectedBrands.filter((id) => id !== brandId));
    } else {
      onBrandChange([...selectedBrands, brandId]);
    }
  };

  return (
    <Stack gap="md">
      <Text fw={600} size="lg">
        Filtros
      </Text>
      <Divider />

      <Accordion defaultValue="categories" variant="contained">
        {/* Categories Filter */}
        <Accordion.Item value="categories">
          <Accordion.Control>
            <Text fw={500}>Categorías</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {categoriesLoading && <Text size="sm" c="dimmed">Cargando...</Text>}
              {categoryTree.map((category) => {
                const hasChildren = Boolean(category.children && category.children.length > 0);
                const opened = openedCategoryIds.has(category.id);

                if (!hasChildren) {
                  return (
                    <Checkbox
                      key={category.id}
                      label={category.name}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                    />
                  );
                }

                return (
                  <Stack key={category.id} gap={6}>
                    <Group justify="space-between" gap="xs" wrap="nowrap">
                      <Box style={{ flex: 1 }}>
                        <Checkbox
                          label={category.name}
                          checked={isCategoryChecked(category)}
                          indeterminate={isCategoryIndeterminate(category)}
                          onChange={() => handleParentCategoryToggle(category)}
                        />
                      </Box>

                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => toggleOpenCategory(category.id)}
                        aria-label={opened ? 'Ocultar subcategorías' : 'Mostrar subcategorías'}
                      >
                        <IconChevronDown
                          size={18}
                          style={{ transform: opened ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}
                        />
                      </ActionIcon>
                    </Group>

                    <Collapse in={opened}>
                      <Stack gap={6} ml="md">
                        {category.children?.map((child) => (
                          <Checkbox
                            key={child.id}
                            label={child.name}
                            checked={selectedCategories.includes(child.id)}
                            onChange={() => handleChildCategoryToggle(category.id, child.id)}
                          />
                        ))}
                      </Stack>
                    </Collapse>
                  </Stack>
                );
              })}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Brands Filter */}
        <Accordion.Item value="brands">
          <Accordion.Control>
            <Text fw={500}>Marcas</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {brandsLoading && <Text size="sm" c="dimmed">Cargando...</Text>}
              {brands?.map((brand) => (
                <Checkbox
                  key={brand.id}
                  label={brand.name}
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandToggle(brand.id)}
                />
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
};

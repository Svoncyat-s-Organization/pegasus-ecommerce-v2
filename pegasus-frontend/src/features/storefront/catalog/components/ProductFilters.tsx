import { Stack, Checkbox, Text, Divider, Accordion } from '@mantine/core';
import { useRootCategories } from '../hooks/useCategories';
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
  const { data: categories, isLoading: categoriesLoading } = useRootCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();

  const handleCategoryToggle = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
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
              {categories?.map((category) => (
                <Checkbox
                  key={category.id}
                  label={category.name}
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                />
              ))}
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

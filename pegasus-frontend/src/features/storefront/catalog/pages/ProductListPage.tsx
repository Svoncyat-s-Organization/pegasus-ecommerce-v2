import { useState } from 'react';
import { Container, Grid, TextInput, Group, Select, Pagination, Stack, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/ProductGrid';
import { ProductFilters } from '../components/ProductFilters';
import { useDebounce } from '@shared/hooks/useDebounce';
import { message } from 'antd';

export const ProductListPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading } = useProducts(page, pageSize, debouncedSearch || undefined);

  const handleAddToCart = (productId: number) => {
    // TODO: Implement add to cart functionality
    message.success('Producto agregado al carrito');
    console.log('Add to cart:', productId);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage - 1); // Mantine uses 1-based, backend uses 0-based
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data?.totalElements ? Math.ceil(data.totalElements / pageSize) : 0;

  return (
    <Container size="xl" py={40}>
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Text size="xl" fw={700} mb="xs">
            Catálogo de Productos
          </Text>
          <Text c="dimmed">
            Explora nuestro catálogo completo de productos
          </Text>
        </div>

        {/* Search and Sort */}
        <Group>
          <TextInput
            placeholder="Buscar productos..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Ordenar por"
            value={sortBy}
            onChange={(value) => setSortBy(value || 'name')}
            data={[
              { value: 'name', label: 'Nombre' },
              { value: 'price-asc', label: 'Precio: Menor a Mayor' },
              { value: 'price-desc', label: 'Precio: Mayor a Menor' },
              { value: 'newest', label: 'Más Recientes' },
            ]}
            style={{ width: 200 }}
          />
        </Group>

        {/* Filters and Products Grid */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <ProductFilters
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
              onCategoryChange={setSelectedCategories}
              onBrandChange={setSelectedBrands}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap="lg">
              {/* Results count */}
              {data && (
                <Text size="sm" c="dimmed">
                  {data.totalElements} productos encontrados
                </Text>
              )}

              {/* Products Grid */}
              <ProductGrid
                products={data?.content || []}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="center" mt="xl">
                  <Pagination
                    total={totalPages}
                    value={page + 1}
                    onChange={handlePageChange}
                  />
                </Group>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

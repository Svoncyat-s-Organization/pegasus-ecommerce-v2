import { useMemo, useState } from 'react';
import { Container, Grid, TextInput, Group, Select, Pagination, Stack, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useFeaturedProducts, useFilteredProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/ProductGrid';
import { ProductFilters } from '../components/ProductFilters';
import { useDebounce } from '@shared/hooks/useDebounce';

export const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>('name');

  const featuredFromUrl = searchParams.get('featured') === 'true';

  const page = useMemo(() => {
    const raw = searchParams.get('page');
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }, [searchParams]);

  const searchTerm = useMemo(() => searchParams.get('search') ?? '', [searchParams]);

  const selectedCategories = useMemo(() => {
    const multi = searchParams.getAll('categoryIds').map((v) => Number(v)).filter((n) => !Number.isNaN(n));
    if (multi.length > 0) return Array.from(new Set(multi));

    const legacy = searchParams.get('category');
    const legacyNum = legacy ? Number(legacy) : NaN;
    return !Number.isNaN(legacyNum) ? [legacyNum] : [];
  }, [searchParams]);

  const selectedBrands = useMemo(() => {
    const multi = searchParams.getAll('brandIds').map((v) => Number(v)).filter((n) => !Number.isNaN(n));
    if (multi.length > 0) return Array.from(new Set(multi));

    const legacy = searchParams.get('brand');
    const legacyNum = legacy ? Number(legacy) : NaN;
    return !Number.isNaN(legacyNum) ? [legacyNum] : [];
  }, [searchParams]);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: filteredData, isLoading: isFilteredLoading } = useFilteredProducts(
    page,
    pageSize,
    debouncedSearch || undefined,
    selectedCategories,
    selectedBrands
  );

  const { data: featuredData, isLoading: isFeaturedLoading } = useFeaturedProducts(page, pageSize);

  const data = featuredFromUrl ? featuredData : filteredData;
  const isLoading = featuredFromUrl ? isFeaturedLoading : isFilteredLoading;

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage - 1)); // Mantine uses 1-based, backend uses 0-based
    setSearchParams(next);
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
              const next = new URLSearchParams(searchParams);
              const value = e.target.value;
              if (value.trim().length === 0) {
                next.delete('search');
              } else {
                next.set('search', value);
              }
              next.set('page', '0');
              setSearchParams(next);
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
              onCategoryChange={(ids) => {
                const next = new URLSearchParams(searchParams);
                next.delete('category');
                next.delete('categoryIds');
                ids.forEach((id) => next.append('categoryIds', String(id)));
                next.set('page', '0');
                setSearchParams(next);
              }}
              onBrandChange={(ids) => {
                const next = new URLSearchParams(searchParams);
                next.delete('brand');
                next.delete('brandIds');
                ids.forEach((id) => next.append('brandIds', String(id)));
                next.set('page', '0');
                setSearchParams(next);
              }}
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

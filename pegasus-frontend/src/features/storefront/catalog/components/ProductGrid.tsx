import { SimpleGrid, Text, Center, Loader } from '@mantine/core';
import { ProductCard } from './ProductCard';
import type { ProductResponse } from '@types';

interface ProductGridProps {
  products: ProductResponse[];
  isLoading?: boolean;
}

export const ProductGrid = ({ products, isLoading }: ProductGridProps) => {
  if (isLoading) {
    return (
      <Center py={60}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Center py={60}>
        <Text c="dimmed">No se encontraron productos</Text>
      </Center>
    );
  }

  return (
    <SimpleGrid
      cols={{ base: 1, xs: 2, sm: 3, md: 4 }}
      spacing="lg"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </SimpleGrid>
  );
};

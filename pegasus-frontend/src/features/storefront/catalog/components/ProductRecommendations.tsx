import {
  Box,
  Text,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Group,
  Stack,
  Skeleton,
  Paper,
  ThemeIcon,
} from '@mantine/core';
import { IconSparkles, IconCategory, IconBuildingStore } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useRecommendations } from '../hooks/useRecommendations';
import { formatCurrency } from '@shared/utils/formatters';
import type { RecommendationItem } from '../api/recommendationApi';

interface ProductRecommendationsProps {
  /** Product ID to get recommendations for */
  productId: number;
  /** Maximum number of recommendations to show (default: 6) */
  limit?: number;
  /** Title for the section (default: "Productos similares") */
  title?: string;
}

/**
 * Component that displays AI-powered product recommendations.
 * Falls back to category/brand based recommendations if AI is unavailable.
 */
export const ProductRecommendations = ({
  productId,
  limit = 6,
  title = 'Productos similares',
}: ProductRecommendationsProps) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useRecommendations(productId, limit);

  // Don't render if there's an error or no recommendations
  if (error || (!isLoading && data?.recommendations.length === 0)) {
    return null;
  }

  const handleProductClick = (id: number) => {
    navigate(`/products/${id}`);
    // Scroll to top when navigating to a new product
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get icon based on recommendation method
  const getMethodIcon = () => {
    if (!data) return null;

    switch (data.method) {
      case 'AI_EMBEDDING':
        return <IconSparkles size={16} />;
      case 'CATEGORY_FALLBACK':
        return <IconCategory size={16} />;
      case 'BRAND_FALLBACK':
        return <IconBuildingStore size={16} />;
      default:
        return <IconSparkles size={16} />;
    }
  };

  // Get subtitle based on method
  const getMethodSubtitle = () => {
    if (!data) return '';

    switch (data.method) {
      case 'AI_EMBEDDING':
        return 'Recomendados por IA';
      case 'CATEGORY_FALLBACK':
        return 'De la misma categoría';
      case 'BRAND_FALLBACK':
        return 'De la misma marca';
      case 'FEATURED_FALLBACK':
        return 'Productos destacados';
      case 'MIXED_FALLBACK':
        return 'Productos relacionados';
      default:
        return '';
    }
  };

  return (
    <Paper withBorder radius="md" p="xl" mt={40}>
      <Group justify="space-between" mb="lg">
        <Stack gap={4}>
          <Group gap="xs">
            <Text size="lg" fw={600}>
              {title}
            </Text>
            {/* DEV: Indicador visual del método de recomendación */}
            {data && (
              <Badge
                variant="dot"
                color={data.method === 'AI_EMBEDDING' ? 'blue' : 'orange'}
                size="lg"
              >
                {data.method === 'AI_EMBEDDING' ? 'IA Activa' : 'Fallback'}
              </Badge>
            )}
          </Group>
          {data && (
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                {getMethodIcon()}
              </ThemeIcon>
              <Text size="xs" c="dimmed">
                {getMethodSubtitle()}
              </Text>
            </Group>
          )}
        </Stack>
        {data && (
          <Badge variant="light" color="gray">
            {data.totalRecommendations} productos
          </Badge>
        )}
      </Group>

      {isLoading ? (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} shadow="xs" padding="sm" radius="md" withBorder>
              <Card.Section>
                <Skeleton height={140} />
              </Card.Section>
              <Stack gap="xs" mt="sm">
                <Skeleton height={16} />
                <Skeleton height={14} width="60%" />
                <Skeleton height={20} width="40%" />
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
          {data?.recommendations.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              onClick={() => handleProductClick(item.id)}
            />
          ))}
        </SimpleGrid>
      )}
    </Paper>
  );
};

interface RecommendationCardProps {
  item: RecommendationItem;
  onClick: () => void;
}

const RecommendationCard = ({ item, onClick }: RecommendationCardProps) => {
  return (
    <Card
      shadow="xs"
      padding="sm"
      radius="md"
      withBorder
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <Card.Section>
        <Box pos="relative">
          <Image
            src={item.primaryImageUrl || '/placeholder-product.jpg'}
            height={140}
            alt={item.name}
            fit="cover"
          />
          {/* Badge de similitud IA */}
          {item.reason === 'CONTENT_SIMILARITY' && item.similarityScore && (
            <Badge
              pos="absolute"
              top={8}
              right={8}
              size="xs"
              variant="filled"
              color="blue"
              style={{ fontWeight: 600 }}
            >
              IA {Math.round(item.similarityScore * 100)}%
            </Badge>
          )}
          {/* Badge de método fallback */}
          {item.reason === 'SAME_CATEGORY' && (
            <Badge
              pos="absolute"
              top={8}
              right={8}
              size="xs"
              variant="light"
              color="orange"
            >
              Categoría
            </Badge>
          )}
          {item.reason === 'SAME_BRAND' && (
            <Badge
              pos="absolute"
              top={8}
              right={8}
              size="xs"
              variant="light"
              color="grape"
            >
              Marca
            </Badge>
          )}
        </Box>
      </Card.Section>

      <Stack gap={4} mt="sm">
        <Text size="sm" fw={500} lineClamp={2}>
          {item.name}
        </Text>

        {item.brandName && (
          <Text size="xs" c="dimmed">
            {item.brandName}
          </Text>
        )}

        <Group justify="space-between" align="flex-end" mt={4}>
          <div>
            <Text size="xs" c="dimmed">
              Desde
            </Text>
            <Text size="sm" fw={700} c="blue">
              {formatCurrency(item.minPrice)}
            </Text>
          </div>

          {item.reason === 'SAME_CATEGORY' && (
            <Badge size="xs" variant="light" color="gray">
              {item.categoryName}
            </Badge>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

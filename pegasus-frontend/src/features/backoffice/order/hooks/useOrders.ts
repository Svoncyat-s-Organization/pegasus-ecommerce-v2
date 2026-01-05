import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getOrders } from '../api/ordersApi';
import type { OrderStatus } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';

/**
 * Hook para obtener lista de pedidos con filtros y paginación
 */
export const useOrders = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();

  const debouncedSearch = useDebounce(searchTerm, 500);

  const query = useQuery({
    queryKey: ['orders', page, pageSize, debouncedSearch, statusFilter],
    queryFn: () =>
      getOrders(
        page,
        pageSize,
        debouncedSearch || undefined,
        statusFilter
      ),
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0); // Reset to first page on search
  };

  const handleStatusFilter = (status: OrderStatus | undefined) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage - 1); // Ant Design uses 1-based, backend uses 0-based
    setPageSize(newPageSize);
  };

  return {
    ...query,
    page,
    pageSize,
    searchTerm,
    statusFilter,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
  };
};

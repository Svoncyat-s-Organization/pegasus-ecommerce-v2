import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getRmas } from '../api/rmasApi';
import type { RmaStatus } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';

/**
 * Hook para obtener lista de RMAs con filtros y paginación
 */
export const useRmas = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RmaStatus | undefined>();
  const [customerFilter, setCustomerFilter] = useState<number | undefined>();

  const debouncedSearch = useDebounce(searchTerm, 500);

  const query = useQuery({
    queryKey: ['rmas', page, pageSize, debouncedSearch, statusFilter, customerFilter],
    queryFn: () =>
      getRmas(
        page,
        pageSize,
        debouncedSearch || undefined,
        statusFilter,
        customerFilter
      ),
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleStatusFilter = (status: RmaStatus | undefined) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleCustomerFilter = (customerId: number | undefined) => {
    setCustomerFilter(customerId);
    setPage(0);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage - 1);
    setPageSize(newPageSize);
  };

  return {
    ...query,
    page,
    pageSize,
    searchTerm,
    statusFilter,
    customerFilter,
    handleSearch,
    handleStatusFilter,
    handleCustomerFilter,
    handlePageChange,
  };
};

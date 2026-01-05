import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@shared/hooks/useDebounce';
import { searchWarehouses } from '../api/warehousesApi';

/**
 * Hook for warehouse list with search and filters
 */
export const useWarehouses = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const query = useQuery({
    queryKey: ['warehouses', page, pageSize, debouncedSearch, activeFilter],
    queryFn: () =>
      searchWarehouses(
        page,
        pageSize,
        debouncedSearch || undefined,
        activeFilter
      ),
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleActiveFilter = (value: boolean | undefined) => {
    setActiveFilter(value);
    setPage(0);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage - 1); // Ant Design pagination is 1-based, backend is 0-based
    setPageSize(newPageSize);
  };

  return {
    ...query,
    page,
    pageSize,
    searchTerm,
    activeFilter,
    handleSearch,
    handleActiveFilter,
    handlePageChange,
  };
};

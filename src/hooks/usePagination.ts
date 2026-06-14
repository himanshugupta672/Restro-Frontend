import { useMemo, useState, useCallback } from "react";

interface UsePaginationOptions {
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
}

interface UsePaginationResult<TItem> {
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  paginatedItems: TItem[];
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const usePagination = <TItem>(
  items: TItem[],
  options: UsePaginationOptions = {}
): UsePaginationResult<TItem> => {
  const {
    defaultRowsPerPage = 10,
    rowsPerPageOptions = [5, 10, 25],
  } = options;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [prevLength, setPrevLength] = useState(items.length);

  // Reset to first page when items length changes (e.g. after filtering)
  if (items.length !== prevLength) {
    setPrevLength(items.length);
    setPage(0);
  }

  const paginatedItems = useMemo(
    () => items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [items, page, rowsPerPage]
  );

  const onPageChange = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  return {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    paginatedItems,
    totalCount: items.length,
    onPageChange,
    onRowsPerPageChange,
  };
};

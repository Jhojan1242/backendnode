type PaginationInput = {
  page: number;
  limit: number;
};

type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export function getPagination({ page, limit }: PaginationInput) {
  return {
    skip: (page - 1) * limit,
    take: limit
  };
}

export function buildPaginationMeta(
  { page, limit }: PaginationInput,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  pagination: PaginationInput,
  totalItems: number,
  filters?: Record<string, unknown>
) {
  return {
    items,
    meta: {
      ...buildPaginationMeta(pagination, totalItems),
      ...(filters ? { filters } : {})
    }
  };
}

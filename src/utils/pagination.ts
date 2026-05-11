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

function normalizePaginationValue(value: number, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function normalizePagination({ page, limit }: PaginationInput): PaginationInput {
  return {
    page: Math.max(1, normalizePaginationValue(page, 1)),
    limit: Math.max(1, normalizePaginationValue(limit, 10))
  };
}

export function getPagination({ page, limit }: PaginationInput) {
  const normalized = normalizePagination({ page, limit });

  return {
    skip: (normalized.page - 1) * normalized.limit,
    take: normalized.limit
  };
}

export function buildPaginationMeta(
  { page, limit }: PaginationInput,
  totalItems: number
): PaginationMeta {
  const normalized = normalizePagination({ page, limit });
  const totalPages = Math.max(1, Math.ceil(totalItems / normalized.limit));

  return {
    page: normalized.page,
    limit: normalized.limit,
    totalItems,
    totalPages,
    hasNextPage: normalized.page < totalPages,
    hasPreviousPage: normalized.page > 1
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

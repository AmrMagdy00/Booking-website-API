/**
 * Pagination utilities
 * Extracted to keep service code clean
 */
export class PaginationUtil {
  static calculateMeta(
    total: number,
    page: number,
    limit: number,
  ): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}

/**
 * Normaliza y limita parámetros de paginación.
 * Garantiza que page >= 1 y 1 <= limit <= maxLimit.
 *
 * @param {Object} params
 * @param {number|string} [params.page=1]
 * @param {number|string} [params.limit=10]
 * @param {number} [maxLimit=100] - Tope máximo de resultados por página
 * @returns {{ pageNum: number, limitNum: number }}
 */
export function sanitizePagination({ page = 1, limit = 10 } = {}, maxLimit = 100) {
    const pageNum = Math.max(Math.floor(Number(page)) || 1, 1);
    const limitNum = Math.min(Math.max(Math.floor(Number(limit)) || 10, 1), maxLimit);
    return { pageNum, limitNum };
}

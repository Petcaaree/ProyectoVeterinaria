import { jest } from '@jest/globals';
import { sanitizePagination } from '../../vet/utils/paginationUtils.js';

describe('sanitizePagination', () => {

    it('retorna valores por defecto cuando no se pasan parámetros', () => {
        const result = sanitizePagination();
        expect(result).toEqual({ pageNum: 1, limitNum: 10 });
    });

    it('parsea strings numéricos correctamente', () => {
        const result = sanitizePagination({ page: '3', limit: '20' });
        expect(result).toEqual({ pageNum: 3, limitNum: 20 });
    });

    it('clampea page mínimo a 1', () => {
        const result = sanitizePagination({ page: -5, limit: 10 });
        expect(result.pageNum).toBe(1);
    });

    it('clampea page 0 a 1', () => {
        const result = sanitizePagination({ page: 0, limit: 10 });
        expect(result.pageNum).toBe(1);
    });

    it('clampea limit al maxLimit (100 por defecto)', () => {
        const result = sanitizePagination({ page: 1, limit: 500 });
        expect(result.limitNum).toBe(100);
    });

    it('clampea limit mínimo a 1', () => {
        const result = sanitizePagination({ page: 1, limit: -10 });
        expect(result.limitNum).toBe(1);
    });

    it('usa maxLimit custom cuando se proporciona', () => {
        const result = sanitizePagination({ page: 1, limit: 50 }, 25);
        expect(result.limitNum).toBe(25);
    });

    it('maneja NaN en page → default 1', () => {
        const result = sanitizePagination({ page: 'abc', limit: 10 });
        expect(result.pageNum).toBe(1);
    });

    it('maneja NaN en limit → default 10', () => {
        const result = sanitizePagination({ page: 1, limit: 'abc' });
        expect(result.limitNum).toBe(10);
    });

    it('redondea decimales hacia abajo', () => {
        const result = sanitizePagination({ page: 2.9, limit: 15.7 });
        expect(result.pageNum).toBe(2);
        expect(result.limitNum).toBe(15);
    });
});

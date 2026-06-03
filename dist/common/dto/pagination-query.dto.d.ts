export declare class PaginationQueryDto {
    page: number;
    limit: number;
    search?: string;
}
export declare function paginationMeta(page: number, limit: number, total: number): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PaginationData } from '../../types/monitoring-types';

interface TablePaginationProps {
    pagination: PaginationData;
    onPageChange: (page: number) => void;
}

export function TablePagination({ pagination, onPageChange }: TablePaginationProps) {
    if (pagination.last_page <= 1) {
        return null;
    }

    const { current_page, last_page, per_page, total } = pagination;
    const startItem = (current_page - 1) * per_page + 1;
    const endItem = Math.min(current_page * per_page, total);

    return (
        <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-xs text-muted-foreground">
                Showing {startItem} to {endItem} of {total} results
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            size="sm"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (current_page > 1) {
                                    onPageChange(current_page - 1);
                                }
                            }}
                            className={current_page === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                    {Array.from({ length: last_page }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                            <PaginationLink
                                size="sm"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(page);
                                }}
                                isActive={page === current_page}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            size="sm"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (current_page < last_page) {
                                    onPageChange(current_page + 1);
                                }
                            }}
                            className={current_page === last_page ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

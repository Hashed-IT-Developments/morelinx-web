import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
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

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const showEllipsis = last_page > 7;

        if (!showEllipsis) {
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (current_page <= 3) {
                pages.push(2, 3, 4, 'ellipsis', last_page);
            } else if (current_page >= last_page - 2) {
                pages.push('ellipsis', last_page - 3, last_page - 2, last_page - 1, last_page);
            } else {
                pages.push('ellipsis', current_page - 1, current_page, current_page + 1, 'ellipsis', last_page);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

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
                    {pageNumbers.map((page, index) =>
                        page === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
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
                        ),
                    )}
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

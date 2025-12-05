import { Button } from '@/components/ui/button';
import { PaginationContent, PaginationEllipsis, PaginationItem, Pagination as PaginationShadCn } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationComponentProps {
    search?: string;
    filters?: Record<string, string | Date | number | boolean | null>;
    pagination: PaginatedData;
}

export default function Pagination({ search, pagination, filters }: PaginationComponentProps) {
    const handlePage = (pageNumber: number) => {
        console.log(filters);
        const query: Record<string, string | number | boolean | null> = {
            page: pageNumber,
            ...(search ? { search } : {}),
            ...(filters ?? {}),
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === '' || query[key] === null || query[key] === undefined) {
                delete query[key];
            }
        });

        router.get(pagination.path, query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const maxPagesToShowMobile = 3;
    const maxPagesToShowTablet = 6;
    const maxPagesToShowDesktop = 10;

    const renderPageNumbers = (maxPagesToShow: number) => {
        let startPage = Math.max(1, pagination?.current_page - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(pagination?.last_page, startPage + maxPagesToShow - 1);
        startPage = Math.max(1, endPage - maxPagesToShow + 1);

        return Array.from({ length: endPage - startPage + 1 }, (_, index) => {
            const pageNumber = startPage + index;
            return (
                <PaginationItem key={pageNumber}>
                    <Button
                        variant={pagination?.current_page === pageNumber ? 'default' : 'ghost'}
                        onClick={() => handlePage(pageNumber)}
                        className="mx-1"
                    >
                        {pageNumber}
                    </Button>
                </PaginationItem>
            );
        });
    };

    return (
        <div className="flex w-full flex-col items-center justify-between sm:flex-row">
            <div className="flex items-center">
                <PaginationShadCn>
                    <PaginationContent>
                        <PaginationItem>
                            <Button variant="ghost" className={cn(!pagination?.prev_page_url && 'hidden')} onClick={() => handlePage(1)}>
                                <ChevronsLeft />
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="ghost"
                                className={cn(!pagination?.prev_page_url && 'hidden')}
                                onClick={() => handlePage(pagination?.current_page - 1)}
                            >
                                <ChevronLeft />
                            </Button>
                        </PaginationItem>

                        <div className="flex sm:hidden">{renderPageNumbers(maxPagesToShowMobile)}</div>
                        <div className="hidden sm:flex md:hidden">{renderPageNumbers(maxPagesToShowTablet)}</div>
                        <div className="hidden md:flex">{renderPageNumbers(maxPagesToShowDesktop)}</div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <PaginationItem>
                                    <Button variant="ghost">
                                        <PaginationEllipsis />
                                    </Button>
                                </PaginationItem>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2">
                                <div className="grid max-h-90 grid-cols-3 gap-2 overflow-y-auto">
                                    {Array.from({ length: pagination?.last_page }, (_, idx) => {
                                        const pageNumber = idx + 1;
                                        return (
                                            <Button
                                                key={pageNumber}
                                                size="sm"
                                                variant={pagination?.current_page === pageNumber ? 'default' : 'ghost'}
                                                onClick={() => handlePage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <PaginationItem>
                            <Button
                                variant="ghost"
                                className={cn(!pagination?.next_page_url && 'hidden')}
                                onClick={() => handlePage(pagination?.current_page + 1)}
                            >
                                <ChevronRight />
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="ghost"
                                className={cn(!pagination?.next_page_url && 'hidden')}
                                onClick={() => handlePage(pagination.last_page)}
                            >
                                <ChevronsRight />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </PaginationShadCn>
            </div>
            <span className="mt-2 sm:mt-0">
                Page {pagination?.current_page ?? 1} of {pagination?.last_page ?? 1}
            </span>
        </div>
    );
}

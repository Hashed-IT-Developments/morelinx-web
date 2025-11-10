import ComposableInput from '@/components/composables/input';
import { Table, TableBody, TableData, TableHeader, TableRow } from '@/components/composables/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Pencil, Search } from 'lucide-react';
import { BarangayWithTown, PaginatedData } from '../../types';

interface BarangayTableProps {
    barangaysPaginated: PaginatedData<BarangayWithTown>;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    onEditBarangay: (barangay: BarangayWithTown) => void;
}

export default function BarangayTable({ barangaysPaginated, searchQuery, setSearchQuery, onEditBarangay }: BarangayTableProps) {
    const { data, links } = barangaysPaginated;

    return (
        <>
            <div className="mb-4">
                <ComposableInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search size={16} />}
                    className="rounded-3xl"
                    placeholder="Search barangays by name or town"
                />
            </div>

            <Table>
                <TableHeader col={4}>
                    <TableData>Barangay Name</TableData>
                    <TableData>Barangay Alias</TableData>
                    <TableData>Town</TableData>
                    <TableData className="flex justify-center">Actions</TableData>
                </TableHeader>
                <TableBody className="h-[calc(100vh-22rem)] sm:h-[calc(100vh-24rem)]">
                    {data.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                            <span className="text-sm font-medium text-gray-500">
                                {searchQuery ? 'No barangays found.' : 'No barangays available.'}
                            </span>
                        </div>
                    ) : (
                        data.map((barangay) => (
                            <TableRow key={`${barangay.townId}-${barangay.id}`} col={4}>
                                <TableData>
                                    <div>
                                        <span className="font-bold sm:hidden">Barangay:&nbsp;</span>
                                        <span>{barangay.name}</span>
                                    </div>
                                </TableData>
                                <TableData>
                                    <div>
                                        <span className="font-bold sm:hidden">Barangay Alias:&nbsp;</span>
                                        <span>{barangay.barangayAlias || 'N/A'}</span>
                                    </div>
                                </TableData>
                                <TableData>
                                    <div>
                                        <span className="font-bold sm:hidden">Town:&nbsp;</span>
                                        <span>{barangay.townName}</span>
                                    </div>
                                </TableData>
                                <TableData className="flex justify-center">
                                    <Button variant="outline" size="sm" onClick={() => onEditBarangay(barangay)}>
                                        <Pencil size={14} className="mr-1" />
                                        Edit
                                    </Button>
                                </TableData>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Pagination className="mt-4">
                <PaginationContent className="flex-wrap gap-1">
                    {links.map((link, index) => {
                        const isPrev = link.label.includes('Previous');
                        const isNext = link.label.includes('Next');
                        const isEllipsis = link.label.includes('...');

                        const isFirstPage = index === 1;
                        const isLastPage = index === links.length - 2;
                        const isCurrentPage = link.active;

                        const shouldShow = isPrev || isNext || isEllipsis || isFirstPage || isLastPage || isCurrentPage;

                        if (!shouldShow) {
                            return (
                                <PaginationItem key={index} className="hidden sm:block">
                                    <Link
                                        href={link.url || '#'}
                                        className={cn(
                                            buttonVariants({
                                                variant: link.active ? 'outline' : 'ghost',
                                                size: 'icon',
                                            }),
                                            !link.url && 'cursor-not-allowed opacity-50',
                                        )}
                                        as={!link.url ? 'span' : 'a'}
                                        preserveState
                                        replace
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        onClick={(e) => !link.url && e.preventDefault()}
                                    />
                                </PaginationItem>
                            );
                        }

                        if (isEllipsis) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={index}>
                                <Link
                                    href={link.url || '#'}
                                    className={cn(
                                        buttonVariants({
                                            variant: link.active ? 'outline' : 'ghost',
                                            size: isPrev || isNext ? 'default' : 'icon',
                                        }),
                                        isPrev || isNext ? 'gap-1 px-2.5' : '',
                                        !link.url && 'cursor-not-allowed opacity-50',
                                    )}
                                    as={!link.url ? 'span' : 'a'}
                                    preserveState
                                    replace
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    onClick={(e) => !link.url && e.preventDefault()}
                                />
                            </PaginationItem>
                        );
                    })}
                </PaginationContent>
            </Pagination>
        </>
    );
}

import ComposableInput from '@/components/composables/input';
import { Table, TableBody, TableData, TableHeader, TableRow } from '@/components/composables/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Search, Pencil } from 'lucide-react';
import { Town, PaginatedData } from '../types';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from '@/components/ui/pagination';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface TownTableProps {
    townsPaginated: PaginatedData<Town>;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    onEditTown: (town: Town) => void;
    onAddBarangay: (town: Town) => void;
}

export default function TownTable({
    townsPaginated,
    searchQuery,
    setSearchQuery,
    onEditTown,
    onAddBarangay,
}: TownTableProps) {
    const { data, links } = townsPaginated;

    return (
        <>
            <div className="mb-4">
                <ComposableInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search size={16} />}
                    className="rounded-3xl"
                    placeholder="Search towns by name, feeder, or DU tag"
                />
            </div>

            <Table>
                <TableHeader col={4}>
                    <TableData>Town Name</TableData>
                    <TableData>Feeder</TableData>
                    <TableData>DU Tag</TableData>
                    <TableData className='flex justify-center'>Actions</TableData>
                </TableHeader>
                <TableBody className="h-[calc(100vh-22rem)] sm:h-[calc(100vh-24rem)]">
                    {data.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                            <span className="text-sm font-medium text-gray-500">
                                {searchQuery ? 'No towns found.' : 'No towns available.'}
                            </span>
                        </div>
                    ) : (
                        data.map((town) => (
                            <TableRow key={town.id} col={4}>
                                <TableData>
                                    <div>
                                        <span className='font-bold sm:hidden'>
                                            Town:&nbsp;
                                        </span>
                                        <span>
                                            {town.name}
                                        </span>
                                    </div>
                                </TableData>
                                <TableData>
                                    <div>
                                        <span className='font-bold sm:hidden'>
                                            Feeder:&nbsp;
                                        </span>
                                        <span>
                                            {town.feeder || 'N/A'}
                                        </span>
                                    </div>
                                </TableData>
                                <TableData>
                                    <div>
                                        <span className='font-bold sm:hidden'>
                                            DU Tag:&nbsp;
                                        </span>
                                        <span>
                                            {town.du_tag || 'N/A'}
                                        </span>
                                    </div>
                                </TableData>
                                <TableData className='flex justify-center'>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEditTown(town)}
                                        >
                                            <Pencil size={14} className="mr-1" />
                                            Edit Town
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onAddBarangay(town)}
                                        >
                                            Add Barangay
                                        </Button>
                                    </div>
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
                                        (isPrev || isNext) ? 'gap-1 px-2.5' : '',
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

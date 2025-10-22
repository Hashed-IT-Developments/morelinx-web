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
                    <TableData>Actions</TableData>
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
                                <TableData>{town.name}</TableData>
                                <TableData>{town.feeder || 'N/A'}</TableData>
                                <TableData>{town.du_tag || 'N/A'}</TableData>
                                <TableData>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEditTown(town)}
                                        >
                                            <Pencil size={14} className="mr-1" />
                                            Edit
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
                <PaginationContent>
                    {links.map((link, index) => {
                        const isPrev = link.label.includes('Previous');
                        const isNext = link.label.includes('Next');
                        const isEllipsis = link.label.includes('...');

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

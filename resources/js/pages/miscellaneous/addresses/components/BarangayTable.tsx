import ComposableInput from '@/components/composables/input';
import { Table, TableBody, TableData, TableHeader, TableRow } from '@/components/composables/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Search, Pencil } from 'lucide-react';
import { BarangayWithTown, PaginatedData } from '../types';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from '@/components/ui/pagination';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface BarangayTableProps {
    barangaysPaginated: PaginatedData<BarangayWithTown>;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    onEditBarangay: (barangay: BarangayWithTown) => void;
}

export default function BarangayTable({
    barangaysPaginated,
    searchQuery,
    setSearchQuery,
    onEditBarangay,
}: BarangayTableProps) {
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
                <TableHeader col={3}>
                    <TableData>Barangay Name</TableData>
                    <TableData>Town</TableData>
                    <TableData>Actions</TableData>
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
                            <TableRow key={`${barangay.townId}-${barangay.id}`} col={3}>
                                <TableData>{barangay.name}</TableData>
                                <TableData>{barangay.townName}</TableData>
                                <TableData>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEditBarangay(barangay)}
                                    >
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

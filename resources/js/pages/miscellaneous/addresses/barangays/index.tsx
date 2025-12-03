import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PaginatedTable, { ColumnDefinition, SortConfig } from '@/components/ui/paginated-table';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Search } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { BarangayWithTown } from '../types';
import EditBarangayForm from './components/edit-barangay-form';

interface PaginatedBarangays {
    data: BarangayWithTown[];
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    links: Array<{ url?: string; label: string; active: boolean }>;
}

interface Props {
    barangays: PaginatedBarangays;
    search?: string;
    currentSort?: {
        field?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function BarangaysIndex() {
    const page = usePage<SharedData & Props>();
    const { barangays, search: initialSearch, currentSort: backendSort } = page.props;

    const [editBarangayOpen, setEditBarangayOpen] = React.useState(false);
    const [editingBarangay, setEditingBarangay] = React.useState<BarangayWithTown | null>(null);

    const [search, setSearch] = React.useState(initialSearch || '');
    const [currentSort, setCurrentSort] = React.useState<SortConfig>(backendSort || {});

    // Debounced search
    const debouncedSearch = React.useCallback((searchTerm: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;

        router.get(route('addresses.barangays.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(search);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, debouncedSearch]);

    React.useEffect(() => {
        const flash = page.props.flash;
        const errors = page.props.errors;

        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.info) toast.info(flash.info);
        if (errors?.authorization) toast.error(errors.authorization);
    }, [page.props.flash, page.props.errors]);

    const handleEditBarangay = (barangay: BarangayWithTown) => {
        setEditingBarangay(barangay);
        setEditBarangayOpen(true);
    };

    // Handle sorting
    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const params: Record<string, string> = {};
        if (search) params.search = search;
        params.sort = field;
        params.direction = direction;

        router.get(route('addresses.barangays.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Miscellaneous', href: '#' },
        { title: 'Addresses', href: '#' },
        { title: 'Barangays', href: route('addresses.barangays.index') },
    ];

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'name',
            header: 'Barangay Name',
            sortable: true,
            render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">{String(value || 'N/A')}</span>,
        },
        {
            key: 'alias',
            header: 'Barangay Alias',
            sortable: true,
            render: (value) => <span className="text-gray-700 dark:text-gray-300">{String(value || 'N/A')}</span>,
        },
        {
            key: 'townName',
            header: 'Town',
            sortable: true,
            render: (value) => <span className="text-gray-700 dark:text-gray-300">{String(value || 'N/A')}</span>,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangays" />

            <div className="max-w-full p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Barangays</h1>
                    <p className="mt-2 text-muted-foreground">View and manage all barangays in the system.</p>
                </div>

                {/* Search Section */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search barangays by name or town..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-10 pr-10 pl-10"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            className="absolute top-2.5 right-3 flex h-5 w-5 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                                            onClick={() => setSearch('')}
                                            aria-label="Clear search"
                                        >
                                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <PaginatedTable
                    data={
                        barangays as unknown as {
                            data: Record<string, unknown>[];
                            current_page: number;
                            from: number | null;
                            last_page: number;
                            per_page: number;
                            to: number | null;
                            total: number;
                            links: Array<{ url?: string; label: string; active: boolean }>;
                        }
                    }
                    columns={columns}
                    title={`All Barangays (${barangays.total})`}
                    onSort={handleSort}
                    currentSort={currentSort}
                    actions={(row) => {
                        const barangay = row as unknown as BarangayWithTown;
                        return (
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditBarangay(barangay);
                                    }}
                                >
                                    <Pencil size={14} className="mr-1" />
                                    Edit
                                </Button>
                            </div>
                        );
                    }}
                    emptyMessage={search ? 'No barangays found.' : 'No barangays available.'}
                />

                <EditBarangayForm open={editBarangayOpen} onOpenChange={setEditBarangayOpen} barangay={editingBarangay} />
            </div>
        </AppLayout>
    );
}

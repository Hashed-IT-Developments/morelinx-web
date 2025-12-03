import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PaginatedTable, { ColumnDefinition, SortConfig } from '@/components/ui/paginated-table';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Pencil, Plus, Search, Upload } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Town } from '../types';
import CreateBarangayForm from './components/create-barangay-form';
import CreateTownForm from './components/create-town-form';
import EditTownForm from './components/edit-town-form';
import UploadExcelDialog from './components/upload-excel-dialog';

interface PaginatedTowns {
    data: Town[];
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    links: Array<{ url?: string; label: string; active: boolean }>;
}

interface Props {
    towns: PaginatedTowns;
    search?: string;
    currentSort?: {
        field?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function TownsIndex() {
    const page = usePage<SharedData & Props>();
    const { towns, search: initialSearch } = page.props;

    const [createTownOpen, setCreateTownOpen] = React.useState(false);
    const [createBarangayOpen, setCreateBarangayOpen] = React.useState(false);
    const [editTownOpen, setEditTownOpen] = React.useState(false);
    const [editingTown, setEditingTown] = React.useState<Town | null>(null);
    const [selectedTown, setSelectedTown] = React.useState<Town | null>(null);
    const [uploadOpen, setUploadOpen] = React.useState(false);

    const [search, setSearch] = React.useState(initialSearch || '');

    // Debounced search
    const debouncedSearch = React.useCallback((searchTerm: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;

        router.get(route('addresses.towns.index'), params, {
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

    const handleEditTown = (town: Town) => {
        setEditingTown(town);
        setEditTownOpen(true);
    };

    const handleAddBarangay = (town: Town) => {
        setSelectedTown(town);
        setCreateBarangayOpen(true);
    };

    const [currentSort, setCurrentSort] = React.useState<SortConfig>({});

    // Handle sorting
    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const params: Record<string, string> = {};
        if (search) params.search = search;
        params.sort = field;
        params.direction = direction;

        router.get(route('addresses.towns.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Miscellaneous', href: '#' },
        { title: 'Addresses', href: '#' },
        { title: 'Towns', href: route('addresses.towns.index') },
    ];

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'id',
            header: 'Town ID',
            sortable: true,
            render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">{String(value || 'N/A')}</span>,
        },
        {
            key: 'name',
            header: 'Town Name',
            sortable: true,
            render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">{String(value || 'N/A')}</span>,
        },
        {
            key: 'alias',
            header: 'Town Alias',
            sortable: true,
            render: (value) => <span className="text-gray-700 dark:text-gray-300">{String(value || 'N/A')}</span>,
        },
        {
            key: 'feeder',
            header: 'Feeder',
            sortable: true,
            render: (value) => <span className="text-gray-700 dark:text-gray-300">{String(value || 'N/A')}</span>,
        },
        {
            key: 'du_tag',
            header: 'DU Tag',
            sortable: true,
            render: (value) => <span className="text-gray-700 dark:text-gray-300">{String(value || 'N/A')}</span>,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Towns" />

            <div className="max-w-full p-4 lg:p-6">
                <div className="mb-4 space-y-3 lg:mb-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold lg:text-3xl">Towns</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Manage towns and their associated barangays.</p>
                        </div>
                        <Button onClick={() => setCreateTownOpen(true)} size="sm" className="sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Town
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)} className="flex-1 sm:flex-none">
                            <Upload className="mr-2 h-4 w-4" />
                            <span className="sm:inline">Upload</span>
                        </Button>
                        <a href={route('addresses.towns.export')} className="flex-1 sm:flex-none">
                            <Button variant="outline" size="sm" className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                <span className="sm:inline">Download</span>
                            </Button>
                        </a>
                    </div>
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
                                        placeholder="Search towns by name, feeder, or DU tag..."
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
                        towns as unknown as {
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
                    title={`All Towns (${towns.total})`}
                    onSort={handleSort}
                    currentSort={currentSort}
                    actions={(row) => {
                        const town = row as unknown as Town;
                        return (
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditTown(town);
                                    }}
                                >
                                    <Pencil size={14} className="mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddBarangay(town);
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Barangay
                                </Button>
                            </div>
                        );
                    }}
                    emptyMessage={search ? 'No towns found.' : 'No towns available.'}
                />

                <CreateTownForm open={createTownOpen} onOpenChange={setCreateTownOpen} />
                <EditTownForm open={editTownOpen} onOpenChange={setEditTownOpen} town={editingTown} />
                <CreateBarangayForm open={createBarangayOpen} onOpenChange={setCreateBarangayOpen} town={selectedTown} />
                <UploadExcelDialog open={uploadOpen} onOpenChange={setUploadOpen} />
            </div>
        </AppLayout>
    );
}

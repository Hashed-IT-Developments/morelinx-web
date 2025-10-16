import { useStatusUtils } from '@/components/composables/status-utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PaginatedTable, { ColumnDefinition, SortConfig } from '@/components/ui/paginated-table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, MapPin, Search, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

// --- Interfaces ---
interface Auth {
    user: object;
    permissions: Array<string>;
}

interface CustomerApplication {
    id: number;
    account_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email_address: string;
    full_address: string;
    status: string;
    created_at: string;
    customer_type?: {
        name: string;
    };
}

interface PaginatedApplications {
    data: CustomerApplication[];
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    links: Array<{ url?: string; label: string; active: boolean }>;
}

interface PageProps {
    auth: Auth;
    applications: PaginatedApplications;
    search?: string;
    currentSort?: {
        field?: string;
        direction?: 'asc' | 'desc';
    };
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
    [key: string]: unknown;
}

export default function CancelledApplicationIndex() {
    const {
        applications,
        search: initialSearch,
        currentSort: backendSort,
        flash,
        errors,
    } = usePage<PageProps>().props;
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const [search, setSearch] = useState(initialSearch || '');
    const [currentSort, setCurrentSort] = useState<SortConfig>(backendSort || {});

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (errors?.message) {
            toast.error(errors.message);
        }
    }, [flash, errors]);

    // Debounced search
    const debouncedSearch = useCallback((searchTerm: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;

        router.get(route('cancelled-applications.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(search);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, debouncedSearch]);

    // Handle sorting
    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const params: Record<string, string> = {};
        if (search) params.search = search;
        params.sort = field;
        params.direction = direction;

        router.get(route('cancelled-applications.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            className: 'w-16',
            render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">#{String(value)}</span>,
        },
        {
            key: 'account_number',
            header: 'Account Number',
            sortable: true,
            render: (value) => <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'full_name',
            header: 'Customer',
            sortable: true,
            render: (value, row) => {
                const application = row as unknown as CustomerApplication;
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600">
                            <span className="text-sm font-medium text-white">
                                {(application.first_name || '').charAt(0)}
                                {(application.last_name || '').charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{String(value)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{application.email_address}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'full_address',
            header: 'Address',
            hiddenOnTablet: true,
            render: (value) => (
                <div className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-2">{String(value)}</span>
                </div>
            ),
        },
        {
            key: 'customer_type.name',
            header: 'Type',
            sortable: false,
            render: (value) => (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {String(value || 'N/A')}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (value) => (
                <Badge variant="outline" className={`${getStatusColor(value as string)} font-medium transition-colors`}>
                    {getStatusLabel(value as string)}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            header: 'Cancelled Date',
            sortable: true,
            render: (value) => (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(value as string)}
                </div>
            ),
        },
    ];

    const formatDate = (dateString?: string) =>
        dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Cancelled Applications', href: route('cancelled-applications.index') },
            ]}
        >
            <Head title={'Cancelled Applications'} />
            <div className="space-y-6 p-4 lg:p-6">
                {/* Header Stats Card */}
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cancelled Applications</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{applications.total}</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Applications that have been cancelled
                                </p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Search Section */}
                <Card>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by customer name, account number..."
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
                        applications as unknown as {
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
                    title="Cancelled Applications"
                    onSort={handleSort}
                    currentSort={currentSort}
                />
            </div>

            <Toaster />
        </AppLayout>
    );
}

import { useStatusUtils } from '@/components/composables/status-utils';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

import Button from '@/components/composables/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import PaginatedTable, { ColumnDefinition, SortConfig } from '@/components/ui/paginated-table';

// --- Interfaces ---
interface Auth {
    user: object;
    permissions: Array<string>;
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

export default function ContractSigning() {
    const { applications, search: initialSearch, currentSort: backendSort, flash, errors } = usePage<PageProps>().props;
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const [search, setSearch] = useState(initialSearch || '');
    const [currentSort, setCurrentSort] = useState<SortConfig>(backendSort || {});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | null>(null);

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

        router.get(route('applications.contract-signing'), params, {
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

        router.get(route('applications.contract-signing'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSignClick = (e: React.MouseEvent, custApp: CustomerApplication) => {
        e.stopPropagation();
        setSelectedApplication(custApp);
        setIsModalOpen(true);
    };

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'account_number',
            header: 'Account Number',
            sortable: true,
            render: (value) => <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{String(value || 'N/A')}</span>,
        },
        {
            key: 'full_name',
            header: 'Customer',
            sortable: true,
            render: (value, row) => {
                const application = row as unknown as CustomerApplication;
                return (
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{String(value)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{application.email_address}</p>
                    </div>
                );
            },
        },
        {
            key: 'customer_type.full_text',
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
    ];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Contract Signing', href: route('applications.contract-signing') },
            ]}
        >
            <Head title="Applications for Contract Signing" />
            <div className="space-y-6 p-4 lg:p-6">
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
                    title="Applications for Contract Signing"
                    onSort={handleSort}
                    currentSort={currentSort}
                    actions={(row) => {
                        const application = row as unknown as CustomerApplication;
                        return (
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSignClick(e, application);
                                    }}
                                >
                                    Sign Contract
                                </Button>
                            </div>
                        );
                    }}
                    emptyMessage="No applications for contract signing found"
                />
            </div>

            {/* Sign Contract Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="w-full md:min-w-2xl lg:min-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Sign Contract</DialogTitle>
                        <DialogDescription>
                            {selectedApplication && `Sign contract for ${selectedApplication.first_name} ${selectedApplication.last_name}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm text-gray-500">Modal content coming soon...</p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                console.log('Signing contract for:', selectedApplication?.id);
                                setIsModalOpen(false);
                            }}
                        >
                            Sign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Toaster />
        </AppLayout>
    );
}

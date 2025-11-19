import ApplicationSummaryDialog from '@/components/application-summary-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import PaginatedTable, { ColumnDefinition, SortConfig } from '@/components/ui/paginated-table';
import AppLayout from '@/layouts/app-layout';
import { useStatusUtils } from '@/lib/status-utils';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, CreditCard, Eye, MapPin, Search, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

// --- Interfaces ---
interface Auth {
    user: object;
    permissions: Array<string>;
}

interface PageProps {
    auth: Auth;
    applications: PaginatedApplications;
    search?: string;
    forCollectionCount: number;
    cancelledCount: number;
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

export default function VerifyApplicationIndex() {
    const {
        applications,
        search: initialSearch,
        currentSort: backendSort,
        forCollectionCount,
        cancelledCount,
        flash,
        errors,
    } = usePage<PageProps>().props;
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const [search, setSearch] = useState(initialSearch || '');
    const [currentSort, setCurrentSort] = useState<SortConfig>(backendSort || {});
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [applicationToCancel, setApplicationToCancel] = useState<CustomerApplication | null>(null);
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [applicationToVerify, setApplicationToVerify] = useState<CustomerApplication | null>(null);
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);

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

        router.get(route('verify-applications.index'), params, {
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

        router.get(route('verify-applications.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Define table columns
    const columns: ColumnDefinition[] = [
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-purple-600">
                            <span className="text-sm font-medium text-white">
                                {(application.first_name || '').charAt(0)}
                                {(application.last_name || '').charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{String(value || application.identity || 'N/A')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{application.email_address}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'mobile_1',
            header: 'Contact #',
            sortable: false,
            render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{String(value || 'N/A')}</span>,
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
            key: 'customer_type.customer_type',
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

    // Handle verify payment action
    const handleVerifyPayment = (application: CustomerApplication) => {
        setApplicationToVerify(application);
        setVerifyDialogOpen(true);
    };

    // Handle view application summary
    const handleViewSummary = (application: CustomerApplication) => {
        setSelectedApplicationId(application.id);
        setSummaryDialogOpen(true);
    };

    // Handle cancel application action
    const handleCancelApplication = (application: CustomerApplication) => {
        setApplicationToCancel(application);
        setCancelDialogOpen(true);
    };

    // Confirm cancellation
    const confirmCancellation = () => {
        if (!applicationToCancel) return;

        router.post(
            route('verify-applications.cancel'),
            {
                application_id: applicationToCancel.id,
            },
            {
                preserveState: false,
                preserveScroll: true,
            },
        );

        setCancelDialogOpen(false);
        setApplicationToCancel(null);
    };

    // Close cancel dialog
    const closeCancelDialog = () => {
        setCancelDialogOpen(false);
        setApplicationToCancel(null);
    };

    // Confirm verification
    const confirmVerification = () => {
        if (!applicationToVerify) return;

        router.post(
            route('verify-applications.verify'),
            {
                application_id: applicationToVerify.id,
            },
            {
                preserveState: false,
                preserveScroll: true,
            },
        );

        setVerifyDialogOpen(false);
        setApplicationToVerify(null);
    };

    // Close verify dialog
    const closeVerifyDialog = () => {
        setVerifyDialogOpen(false);
        setApplicationToVerify(null);
    };

    const handleRowClickAction = (row: Record<string, unknown>) => {
        const application = row as unknown as CustomerApplication;
        setSelectedApplicationId(application.id);
        setSummaryDialogOpen(true);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Verify Applications', href: route('verify-applications.index') },
            ]}
        >
            <Head title={'Verify Applications'} />
            <div className="space-y-6 p-4 lg:p-6">
                {/* Header Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-l-orange-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">For Verification</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{applications.total}</p>
                                </div>
                                <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
                                    <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">For Collection</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{forCollectionCount}</p>
                                </div>
                                <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cancelledCount}</p>
                                </div>
                                <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Section */}
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
                    onRowClick={handleRowClickAction}
                    columns={columns}
                    title="Applications for Verification"
                    onSort={handleSort}
                    currentSort={currentSort}
                    actions={(row) => {
                        const application = row as unknown as CustomerApplication;
                        return (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewSummary(application);
                                    }}
                                >
                                    <Eye className="h-3 w-3" />
                                    <span className="hidden sm:inline">View</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelApplication(application);
                                    }}
                                >
                                    <span className="hidden sm:inline">Cancel</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerifyPayment(application);
                                    }}
                                >
                                    <span className="hidden sm:inline">Verify</span>
                                </Button>
                            </div>
                        );
                    }}
                />
            </div>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Cancel Application
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel the application for{' '}
                            <strong>{applicationToCancel?.full_name || applicationToCancel?.identity}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button variant="outline" onClick={closeCancelDialog}>
                            Keep Application
                        </Button>
                        <Button variant="destructive" onClick={confirmCancellation}>
                            Cancel Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Verify Confirmation Dialog */}
            <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-green-500" />
                            Verify Application
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to verify the application for{' '}
                            <strong>{applicationToVerify?.full_name || applicationToVerify?.identity}</strong>? This will move the application to
                            collection phase.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button variant="outline" onClick={closeVerifyDialog}>
                            Cancel
                        </Button>
                        <Button variant="default" onClick={confirmVerification} className="bg-green-600 hover:bg-green-700">
                            Verify Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Application Summary Dialog */}
            <ApplicationSummaryDialog applicationId={selectedApplicationId} open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} />

            <Toaster />
        </AppLayout>
    );
}

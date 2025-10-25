import ApplicationSummaryDialog from '@/components/application-summary-dialog';
import { useStatusUtils } from '@/components/composables/status-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColumnDefinition, PaginatedTable, PaginationData, SortConfig } from '@/components/ui/paginated-table';
import { useApprovalStatus } from '@/hooks/useApprovalStatus';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import ApprovalStatusDialog from '@/pages/monitoring/inspections/approval-status-dialog';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle, Eye, Search, Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import UploadDocumentsDialog from './upload-documents-dialog';

interface CustomerAccount {
    id: number;
    account_number: string;
    account_name: string;
    account_status: string;
    contact_number: string;
    email_address: string;
    is_isnap: boolean;
    barangay?: {
        id: number;
        name: string;
        town?: {
            id: number;
            name: string;
        };
    };
    customer_type?: {
        id: number;
        rate_class: string;
        customer_type: string;
    };
    customer_application?: CustomerApplication;
}

interface IsnapIndexProps {
    isnapMembers: PaginationData;
    search: string | null;
    currentSort?: {
        field?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function IsnapIndex({ isnapMembers, search, currentSort: backendSort }: IsnapIndexProps) {
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | undefined>();
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);
    const [currentSort, setCurrentSort] = useState<SortConfig>(backendSort || {});
    const [approvingAccountId, setApprovingAccountId] = useState<number | null>(null);
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const { getStatusLabel, getStatusColor, getApprovalStatusBadgeClass } = useStatusUtils();
    const { fetchApprovalStatus } = useApprovalStatus();

    // Show flash messages
    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    const debouncedSearch = useCallback((searchValue: string) => {
        const params: Record<string, string> = {};
        if (searchValue) params.search = searchValue;

        router.get(route('isnap.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, debouncedSearch]);

    const handleView = (account: CustomerAccount) => {
        setSelectedAccount(account);
        if (account.customer_application?.id) {
            setSelectedApplicationId(account.customer_application.id);
            setSummaryDialogOpen(true);
        }
    };

    const handleUpload = (account: CustomerAccount) => {
        setSelectedAccount(account);
        setUploadModalOpen(true);
    };

    const handleApprove = (account: CustomerAccount) => {
        if (!account.customer_application) {
            toast.error('No customer application found for this account.');
            return;
        }

        // Check if already being processed
        if (approvingAccountId === account.id) {
            return;
        }

        // Check if already has a payable
        const hasPayable = account.customer_application?.payables && account.customer_application.payables.length > 0;

        if (hasPayable) {
            toast.error('This ISNAP member already has a payable created.');
            return;
        }

        // Check if status is isnap_pending
        if (account.customer_application.status !== 'isnap_pending') {
            toast.error('This application is not pending ISNAP approval.');
            return;
        }

        if (confirm('Are you sure you want to approve this ISNAP member? This will create a ₱500.00 payable.')) {
            setApprovingAccountId(account.id);

            router.post(
                route('isnap.approve', account.id),
                {},
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setApprovingAccountId(null);
                    },
                },
            );
        }
    };

    // Handle sorting
    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        params.sort = field;
        params.direction = direction;

        router.get(route('isnap.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getApprovalStatus = (application: CustomerApplication) => {
        // First check if we have the approval state with status
        if (application.approval_state?.status) {
            return application.approval_state.status;
        }

        // Then check the computed properties from the HasApprovalFlow trait
        if (application.is_approval_complete === true) {
            return 'approved';
        } else if (application.is_approval_pending === true) {
            return 'pending';
        } else if (application.is_approval_rejected === true) {
            return 'rejected';
        } else if (application.has_approval_flow === false) {
            return 'no approval required';
        }

        // If we don't have the computed properties, fallback to 'pending' if we know there should be approval flow
        return 'pending';
    };

    const handleApprovalDialogOpen = async (application: CustomerApplication) => {
        // If we already have approval data, use it directly
        if (application.approval_state && application.approvals) {
            setSelectedApplication(application);
            setApprovalDialogOpen(true);
        } else {
            // Otherwise, we need to fetch it
            const data = await fetchApprovalStatus(application.id);
            if (data) {
                const enrichedApplication: CustomerApplication = {
                    ...application,
                    approval_state: data.approval_state,
                    approvals: data.approvals,
                    has_approval_flow: data.has_approval_flow,
                    is_approval_complete: data.is_approval_complete,
                    is_approval_pending: data.is_approval_pending,
                    is_approval_rejected: data.is_approval_rejected,
                };
                setSelectedApplication(enrichedApplication);
                setApprovalDialogOpen(true);
            }
        }
    };

    const handleApprovalDialogClose = () => {
        setApprovalDialogOpen(false);
        setSelectedApplication(undefined);
    };

    const columns: ColumnDefinition[] = [
        {
            key: 'account_number',
            header: 'Account Number',
            hiddenOnMobile: true,
            sortable: true,
            render: (value) => <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'account_name',
            header: 'Customer',
            sortable: true,
        },
        {
            key: 'customer_application.status',
            header: 'Status',
            sortable: true,
            render: (value) => (
                <Badge variant="outline" className={`${getStatusColor(value as string)} font-medium transition-colors`}>
                    {getStatusLabel(value as string)}
                </Badge>
            ),
        },
        {
            key: 'approval_status',
            header: 'Approval Status',
            hiddenOnMobile: true,
            sortable: false,
            render: (value, row) => {
                const account = row as unknown as CustomerAccount;
                const application = account.customer_application;

                if (!application?.id) {
                    return <span className="text-gray-400">—</span>;
                }

                const status = getApprovalStatus(application);
                const badgeClass = getApprovalStatusBadgeClass(status);

                return (
                    <Badge
                        variant="outline"
                        className={`cursor-pointer transition-colors ${badgeClass}`}
                        onClick={() => handleApprovalDialogOpen(application)}
                    >
                        {status.replace('_', ' ')}
                    </Badge>
                );
            },
        },
        {
            key: 'customer_application.created_at',
            header: 'Applied',
            sortable: true,
            render: (value) =>
                value ? (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(value as string)}
                    </div>
                ) : (
                    <span className="text-gray-400">—</span>
                ),
        },
    ];

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'ISNAP Members', href: route('isnap.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ISNAP Members" />

            <div className="m-4 space-y-4 sm:m-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">ISNAP Members</h1>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by account number or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Table */}
                <PaginatedTable
                    data={isnapMembers}
                    columns={columns}
                    currentSort={currentSort}
                    onSort={handleSort}
                    actions={(row) => {
                        const account = row as unknown as CustomerAccount;
                        return (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => handleView(account)}
                                    title="View Details"
                                >
                                    <Eye className="h-3 w-3" />
                                    <span className="hidden sm:inline">View</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                    onClick={() => handleUpload(account)}
                                    title="Upload Documents"
                                >
                                    <Upload className="h-3 w-3" />
                                    <span className="hidden sm:inline">Upload</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                                    onClick={() => handleApprove(account)}
                                    disabled={approvingAccountId === account.id || account.customer_application?.status !== 'isnap_pending'}
                                    title={
                                        approvingAccountId === account.id
                                            ? 'Processing...'
                                            : account.customer_application?.status !== 'isnap_pending'
                                              ? 'Already processed'
                                              : 'Approve Member'
                                    }
                                >
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="hidden sm:inline">{approvingAccountId === account.id ? 'Processing...' : 'Approve'}</span>
                                </Button>
                            </div>
                        );
                    }}
                    emptyMessage="No ISNAP members found"
                />
            </div>

            {/* Upload Documents Modal */}
            {selectedAccount && <UploadDocumentsDialog open={uploadModalOpen} onOpenChange={setUploadModalOpen} customerAccount={selectedAccount} />}

            {/* Application Summary Dialog */}
            {selectedApplicationId && (
                <ApplicationSummaryDialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} applicationId={selectedApplicationId} />
            )}

            {/* Approval Status Dialog */}
            {selectedApplication && (
                <ApprovalStatusDialog open={approvalDialogOpen} onOpenChange={handleApprovalDialogClose} application={selectedApplication} />
            )}

            {/* Toast Notifications */}
            <Toaster position="top-right" />
        </AppLayout>
    );
}

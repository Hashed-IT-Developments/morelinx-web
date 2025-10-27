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
    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | null>(null);
    const [selectedApplicationForSummary, setSelectedApplicationForSummary] = useState<CustomerApplication | undefined>();
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);
    const [currentSort, setCurrentSort] = useState<SortConfig>(backendSort || {});
    const [approvingApplicationId, setApprovingApplicationId] = useState<string | number | null>(null);
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

    const handleView = (application: CustomerApplication) => {
        setSelectedApplication(application);
        if (application.id) {
            setSelectedApplicationId(application.id);
            setSummaryDialogOpen(true);
        }
    };

    const handleUpload = (application: CustomerApplication) => {
        setSelectedApplication(application);
        setUploadModalOpen(true);
    };

    const handleApprove = (application: CustomerApplication) => {
        // Check if already being processed
        if (approvingApplicationId === application.id) {
            return;
        }

        // Check if already has a payable
        const hasPayable = application.payables && application.payables.length > 0;

        if (hasPayable) {
            toast.error('This ISNAP application already has a payable created.');
            return;
        }

        // Check if status is isnap_pending
        if (application.status !== 'isnap_pending') {
            toast.error('This application is not pending ISNAP approval.');
            return;
        }

        if (confirm('Are you sure you want to approve this ISNAP member? This will create a ₱500.00 payable.')) {
            setApprovingApplicationId(application.id);

            router.post(
                route('isnap.approve', application.id),
                {},
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setApprovingApplicationId(null);
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
            setSelectedApplicationForSummary(application);
            setApprovalDialogOpen(true);
        } else {
            // Otherwise, we need to fetch it
            const data = await fetchApprovalStatus(String(application.id));
            if (data) {
                const enrichedApplication: CustomerApplication = {
                    ...application,
                    approval_state: data.approval_state || undefined,
                    approvals: data.approvals,
                    has_approval_flow: data.has_approval_flow,
                    is_approval_complete: data.is_approval_complete,
                    is_approval_pending: data.is_approval_pending,
                    is_approval_rejected: data.is_approval_rejected,
                };
                setSelectedApplicationForSummary(enrichedApplication);
                setApprovalDialogOpen(true);
            }
        }
    };

    const handleApprovalDialogClose = () => {
        setApprovalDialogOpen(false);
        setSelectedApplicationForSummary(undefined);
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
            key: 'full_name',
            header: 'Customer',
            sortable: true,
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
            key: 'approval_status',
            header: 'Approval Status',
            hiddenOnMobile: true,
            sortable: false,
            render: (value, row) => {
                const application = row as unknown as CustomerApplication;

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
            key: 'created_at',
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
                        const application = row as unknown as CustomerApplication;

                        // Check if there's an approval flow that is pending (not approved)
                        const hasApprovalFlow =
                            application.has_approval_flow || (application.approval_state && application.approval_state.status === 'pending');
                        const isApprovalApproved = application.approval_state && application.approval_state.status === 'approved';
                        const hasPayable = application.payables && application.payables.length > 0;

                        // Disable actions if approval flow is pending (but not if approved) or if payable exists
                        const shouldDisableActions = (hasApprovalFlow && !isApprovalApproved) || hasPayable;

                        return (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => handleView(application)}
                                    title="View Details"
                                >
                                    <Eye className="h-3 w-3" />
                                    <span className="hidden sm:inline">View</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => handleUpload(application)}
                                    disabled={shouldDisableActions}
                                    title={
                                        shouldDisableActions
                                            ? hasApprovalFlow
                                                ? 'Cannot upload - approval flow active'
                                                : 'Cannot upload - payable already created'
                                            : 'Upload Documents'
                                    }
                                >
                                    <Upload className="h-3 w-3" />
                                    <span className="hidden sm:inline">Upload</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => handleApprove(application)}
                                    disabled={
                                        approvingApplicationId === application.id || application.status !== 'isnap_pending' || shouldDisableActions
                                    }
                                    title={
                                        approvingApplicationId === application.id
                                            ? 'Processing...'
                                            : shouldDisableActions
                                              ? hasApprovalFlow
                                                  ? 'Cannot approve - approval flow active'
                                                  : 'Cannot approve - payable already created'
                                              : application.status !== 'isnap_pending'
                                                ? 'Already processed'
                                                : 'Approve Member'
                                    }
                                >
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="hidden sm:inline">
                                        {approvingApplicationId === application.id ? 'Processing...' : 'Approve'}
                                    </span>
                                </Button>
                            </div>
                        );
                    }}
                    emptyMessage="No ISNAP members found"
                />
            </div>

            {/* Upload Documents Modal */}
            {selectedApplication && (
                <UploadDocumentsDialog open={uploadModalOpen} onOpenChange={setUploadModalOpen} customerApplication={selectedApplication} />
            )}

            {/* Application Summary Dialog */}
            {selectedApplicationId && (
                <ApplicationSummaryDialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} applicationId={selectedApplicationId} />
            )}

            {/* Approval Status Dialog */}
            {selectedApplicationForSummary && (
                <ApprovalStatusDialog
                    open={approvalDialogOpen}
                    onOpenChange={handleApprovalDialogClose}
                    application={selectedApplicationForSummary as unknown as CustomerApplication}
                />
            )}

            {/* Toast Notifications */}
            <Toaster position="top-right" />
        </AppLayout>
    );
}

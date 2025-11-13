import ApplicationSummaryDialog from '@/components/application-summary-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColumnDefinition, PaginatedTable, PaginationData, SortConfig } from '@/components/ui/paginated-table';
import { useApprovalStatus } from '@/hooks/useApprovalStatus';
import AppLayout from '@/layouts/app-layout';
import { useStatusUtils } from '@/lib/status-utils';
import ApprovalStatusDialog from '@/pages/monitoring/inspections/approval-status-dialog';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, CheckCheck, CheckCircle, Eye, Search, Upload } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import UploadDocumentsDialog from './upload-documents-dialog';

const DEFAULT_STATUS = 'all';

interface IsnapIndexProps {
    isnapMembers: PaginationData;
    search: string | null;
    currentSort?: {
        field?: string;
        direction?: 'asc' | 'desc';
    };
    selectedStatus?: string;
    statusCounts?: {
        all: number;
        isnap_pending: number;
        isnap_for_collection: number;
    };
    defaultIsnapFee?: number;
}

export default function IsnapIndex({
    isnapMembers,
    search,
    currentSort: backendSort,
    selectedStatus,
    statusCounts,
    defaultIsnapFee,
}: IsnapIndexProps) {
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [status, setStatus] = useState(selectedStatus || DEFAULT_STATUS);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [confirmApprovalOpen, setConfirmApprovalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | null>(null);
    const [selectedApplicationForSummary, setSelectedApplicationForSummary] = useState<CustomerApplication | undefined>();
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);
    const [applicationToApprove, setApplicationToApprove] = useState<CustomerApplication | null>(null);
    const [isnapFeeAmount, setIsnapFeeAmount] = useState<string>(defaultIsnapFee?.toString() || '850.00');
    const [setAsDefault, setSetAsDefault] = useState<boolean>(false);
    const [currentSort, setCurrentSort] = useState<SortConfig>(backendSort || {});
    const [approvingApplicationId, setApprovingApplicationId] = useState<string | number | null>(null);
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const { getStatusLabel, getStatusColor, getApprovalStatusBadgeClass } = useStatusUtils();
    const { fetchApprovalStatus } = useApprovalStatus();

    const statusCards = [
        {
            key: 'all',
            label: 'All Applications',
            icon: Calendar,
            border: 'border-l-gray-400',
            bg: 'bg-gray-50',
            iconColor: 'text-gray-600 dark:text-gray-400',
        },
        {
            key: 'isnap_pending',
            label: 'ISNAP Pending',
            icon: Upload,
            border: 'border-l-yellow-500',
            bg: 'bg-yellow-50',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
        },
        {
            key: 'isnap_for_collection',
            label: 'ISNAP For Collection',
            icon: CheckCheck,
            border: 'border-l-green-500',
            bg: 'bg-green-50',
            iconColor: 'text-green-600 dark:text-green-400',
        },
    ];

    // Show flash messages
    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    const debouncedSearch = useCallback((searchValue: string, statusValue: string) => {
        const params: Record<string, string> = {};
        if (searchValue) params.search = searchValue;
        if (statusValue && statusValue !== 'all') params.status = statusValue;

        router.get(route('isnap.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(searchTerm, status);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, status, debouncedSearch]);

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

        // Check if documents are uploaded
        const hasDocuments = application.attachments && application.attachments.length > 0;

        if (!hasDocuments) {
            toast.error('Please upload documents before approving this application.');
            return;
        }

        // Open confirmation dialog and reset fee to default
        setApplicationToApprove(application);
        setIsnapFeeAmount(defaultIsnapFee?.toString() || '850.00');
        setSetAsDefault(false);
        setConfirmApprovalOpen(true);
    };

    const confirmApprove = () => {
        if (!applicationToApprove) return;

        const feeAmount = parseFloat(isnapFeeAmount);
        if (isNaN(feeAmount) || feeAmount < 0) {
            toast.error('Please enter a valid ISNAP fee amount.');
            return;
        }

        setApprovingApplicationId(applicationToApprove.id);
        setConfirmApprovalOpen(false);

        router.post(
            route('isnap.approve', applicationToApprove.id),
            {
                isnap_fee: feeAmount,
                set_as_default: setAsDefault,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setApprovingApplicationId(null);
                    setApplicationToApprove(null);
                },
            },
        );
    };

    // Handle sorting
    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (status && status !== 'all') params.status = status;
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
                        {moment(String(value)).format('MMM D, YYYY')}
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
                <Head title={'ISNAP Members'} />
                <div className="space-y-6 p-4 lg:p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {statusCards.map((card, idx) => (
                            <Card
                                key={idx}
                                className={`${card.border} cursor-pointer transition-all hover:shadow-md ${
                                    status === card.key ? 'ring-opacity-50 ring-2 ring-blue-500' : ''
                                }`}
                                onClick={() => setStatus(card.key)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {statusCounts?.[card.key as keyof typeof statusCounts] ?? 0}
                                            </p>
                                        </div>
                                        <div className={`rounded-lg ${card.bg} p-2 dark:bg-blue-900/20`}>
                                            <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
                        title="ISNAP Members"
                        data={isnapMembers}
                        columns={columns}
                        currentSort={currentSort}
                        onSort={handleSort}
                        actions={(row) => {
                            const application = row as unknown as CustomerApplication;

                            const hasApprovalFlowPending = application.approval_state && application.approval_state.status === 'pending';
                            const hasPayable = application.payables && application.payables.length > 0;
                            const hasDocuments = application.attachments && application.attachments.length > 0;

                            const shouldDisableUpload = hasApprovalFlowPending || hasPayable;

                            // Disable approve if: processing, not pending, no documents, approval flow pending, or payable exists
                            const shouldDisableApprove =
                                approvingApplicationId === application.id ||
                                application.status !== 'isnap_pending' ||
                                !hasDocuments ||
                                hasApprovalFlowPending ||
                                hasPayable;

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
                                        disabled={shouldDisableUpload}
                                        title={
                                            shouldDisableUpload
                                                ? hasApprovalFlowPending
                                                    ? 'Cannot upload - approval flow pending'
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
                                        disabled={shouldDisableApprove}
                                        title={
                                            approvingApplicationId === application.id
                                                ? 'Processing...'
                                                : !hasDocuments
                                                  ? 'Cannot approve - no documents uploaded'
                                                  : hasApprovalFlowPending
                                                    ? 'Cannot approve - approval flow pending'
                                                    : hasPayable
                                                      ? 'Cannot approve - payable already created'
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

            {/* Confirmation Dialog for Approval */}
            <AlertDialog open={confirmApprovalOpen} onOpenChange={setConfirmApprovalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve ISNAP Member</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are approving <strong>{applicationToApprove?.full_name}</strong> (Account: {applicationToApprove?.account_number}).
                            Set the ISNAP fee amount below:
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="isnap_fee">ISNAP Fee Amount (₱)</Label>
                            <Input
                                id="isnap_fee"
                                type="number"
                                step="0.01"
                                min="0"
                                value={isnapFeeAmount}
                                onChange={(e) => setIsnapFeeAmount(e.target.value)}
                                placeholder="500.00"
                                className="w-full"
                            />
                            <p className="text-sm text-muted-foreground">This fee will be charged to the ISNAP member upon approval.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="set_as_default" checked={setAsDefault} onCheckedChange={(checked) => setSetAsDefault(checked === true)} />
                            <Label
                                htmlFor="set_as_default"
                                className="text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Set as default ISNAP fee amount
                            </Label>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setApplicationToApprove(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmApprove} className="bg-green-900 hover:bg-green-700">
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Toast Notifications */}
            <Toaster position="top-right" />
        </AppLayout>
    );
}

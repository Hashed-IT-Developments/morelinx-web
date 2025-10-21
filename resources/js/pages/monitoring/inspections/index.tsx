import ApplicationSummaryDialog from '@/components/application-summary-dialog';
import { useStatusUtils } from '@/components/composables/status-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PaginatedTable, { ColumnDefinition, SortConfig } from '@/components/ui/paginated-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApprovalStatus } from '@/hooks/useApprovalStatus';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Building2, Calendar, CheckCheck, Eye, Search, TableIcon, User, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import ApprovalStatusDialog from './approval-status-dialog';
import AssignInspectorDialog from './assign-inspector-dialog';
import ScheduleCalendar, { ScheduleCalendarRef } from './schedule-calendar';

// --- Interfaces ---
interface Inspector {
    id: number;
    name: string;
}

interface Auth {
    user: object;
    permissions: Array<string>;
}

interface PageProps {
    auth: Auth;
    inspections: PaginatedInspections;
    search?: string;
    inspectors: Inspector[];
    statuses: string[];
    selectedStatus: string;
    statusCounts: Record<string, number>;
    currentSort?: {
        field?: string;
        direction?: 'asc' | 'desc';
    };
    [key: string]: unknown;
}

const DEFAULT_STATUS = 'all';

export default function InspectionIndex() {
    const {
        inspections,
        search: initialSearch,
        inspectors,
        statuses,
        selectedStatus,
        statusCounts,
        auth,
        currentSort: backendSort,
    } = usePage<PageProps>().props;
    const { getStatusLabel, getStatusColor, getApprovalStatusBadgeClass } = useStatusUtils();
    const { fetchApprovalStatus } = useApprovalStatus();

    const [search, setSearch] = useState(initialSearch || '');
    const [status, setStatus] = useState(selectedStatus || DEFAULT_STATUS);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | undefined>();
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [currentSort, setCurrentSort] = useState<SortConfig>(backendSort || {});
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);
    const calendarRef = useRef<ScheduleCalendarRef>(null);

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
            key: 'for_inspection',
            label: 'For Inspection',
            icon: Eye,
            border: 'border-l-blue-500',
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            key: 'for_inspection_approval',
            label: 'For Inspection Approval',
            icon: CheckCheck,
            border: 'border-l-yellow-500',
            bg: 'bg-yellow-50',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
        },
        {
            key: 'approved',
            label: 'Approved',
            icon: CheckCheck,
            border: 'border-l-green-500',
            bg: 'bg-green-50',
            iconColor: 'text-green-600 dark:text-green-400',
        },
        {
            key: 'disapproved',
            label: 'Disapproved',
            icon: X,
            border: 'border-l-red-500',
            bg: 'bg-red-50',
            iconColor: 'text-red-600 dark:text-red-400',
        },
    ];

    // Debounced search and filter
    const debouncedSearch = useCallback((searchTerm: string, stat: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (stat) params.status = stat;

        router.get(route('inspections.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(search, status);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, status, debouncedSearch]);

    const handleDialogOpenChange = (open: boolean) => {
        setAssignDialogOpen(open);
        if (!open) setHighlightedId(null);
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

    // Handle view application summary
    const handleViewSummary = (inspection: Inspection) => {
        if (inspection.customer_application) {
            setSelectedApplicationId(inspection.customer_application.id);
            setSummaryDialogOpen(true);
        }
    };

    // Handle sorting
    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;
        params.sort = field;
        params.direction = direction;

        router.get(route('inspections.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'customer_application.account_number',
            header: 'Account Number',
            hiddenOnMobile: true,
            sortable: true,
            render: (value) => <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'customer_application.full_name',
            header: 'Customer',
            sortable: true
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
                const inspection = row as unknown as Inspection;
                const application = inspection.customer_application;

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
            key: 'inspector.name',
            header: 'Inspector',
            render: (value) => (value ? String(value) : <span className="text-gray-400">—</span>),
        },
        {
            key: 'schedule_date',
            header: 'Scheduled Date',
            sortable: true,
            render: (value) => (value ? formatDate(value as string) : <span className="text-nowrap text-gray-400">—</span>),
        },
        {
            key: 'customer_application.created_at',
            header: 'Applied',
            sortable: true,
            render: (value) => (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(value as string)}
                </div>
            ),
        },
    ];

    const getFullName = (application?: CustomerApplication) => application?.full_name || 'N/A';

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

    const canAssignInspector = (inspection: Inspection) => {
        // Only allow assignment if status is 'for_inspection'
        if (inspection.status !== 'for_inspection') {
            return false;
        }

        // Check if approval status is still pending
        const application = inspection.customer_application;
        if (application) {
            const approvalStatus = getApprovalStatus(application);
            // Don't allow assignment if approval is still pending
            if (approvalStatus === 'pending') {
                return false;
            }
        }

        return true;
    };

    const formatDate = (dateString?: string) =>
        dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    const getDisplayStatus = (inspection: Inspection) => inspection.status;

    const renderActions = (row: Record<string, unknown>) => {
        const inspection = row as unknown as Inspection;
        return (
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleViewSummary(inspection)}
                >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">View</span>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => {
                        setAssignDialogOpen(true);
                        setHighlightedId(inspection.id);
                    }}
                    disabled={!canAssignInspector(inspection) || !auth.permissions.includes('assign inspector')}
                >
                    <User className="h-3 w-3" />
                    <span className="hidden sm:inline">Assign</span>
                </Button>
            </div>
        );
    };

    const renderMobileCard = (row: Record<string, unknown>) => {
        const inspection = row as unknown as Inspection;
        const application = inspection.customer_application;
        const displayStatus = getDisplayStatus(inspection);

        return (
            <>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-purple-600">
                                <span className="text-sm font-medium text-white">
                                    {(application?.first_name || '').charAt(0)}
                                    {(application?.last_name || '').charAt(0)}
                                </span>
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{getFullName(application)}</CardTitle>
                                <p className="font-mono text-sm text-gray-500 dark:text-gray-400">#{application?.account_number}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(displayStatus)} font-medium`}>
                            {getStatusLabel(displayStatus)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Building2 className="h-3 w-3" />
                                <span className="font-medium">Type:</span>
                            </div>
                            <p className="text-gray-900 dark:text-gray-100">{application?.customer_type?.name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Calendar className="h-3 w-3" />
                                <span className="font-medium">Applied:</span>
                            </div>
                            <p className="text-gray-900 dark:text-gray-100">{formatDate(application?.created_at || '')}</p>
                        </div>
                    </div>
                    {/* Approval Status Section */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <CheckCheck className="h-3 w-3" />
                            <span className="text-sm font-medium">Approval Status:</span>
                        </div>
                        <div>
                            {application?.id ? (
                                (() => {
                                    const status = getApprovalStatus(application);
                                    const badgeClass = getApprovalStatusBadgeClass(status);

                                    return (
                                        <Badge
                                            variant="outline"
                                            className={`cursor-pointer text-xs transition-colors ${badgeClass}`}
                                            onClick={() => handleApprovalDialogOpen(application)}
                                        >
                                            {status.replace('_', ' ')}
                                        </Badge>
                                    );
                                })()
                            ) : (
                                <span className="text-xs text-gray-400">—</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <User className="h-3 w-3" />
                            <span className="text-sm font-medium">Contact:</span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {application?.email_address && <p>{application.email_address}</p>}
                            {application?.mobile_1 && <p>{application.mobile_1}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Inspector:</span>
                            </div>
                            <p className="text-gray-900 dark:text-gray-100">
                                {inspection.inspector?.name || <span className="text-gray-400">—</span>}
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Scheduled:</span>
                            </div>
                            <p className="text-gray-900 dark:text-gray-100">
                                {inspection.schedule_date ? formatDate(inspection.schedule_date) : <span className="text-gray-400">—</span>}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => handleViewSummary(inspection)}
                        >
                            <Eye className="h-4 w-4" />
                            View Summary
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => {
                                setAssignDialogOpen(true);
                                setHighlightedId(inspection.id);
                            }}
                            disabled={!canAssignInspector(inspection) || !auth.permissions.includes('assign inspector')}
                        >
                            <User className="h-4 w-4" />
                            Assign Inspector
                        </Button>
                    </div>
                </CardContent>
            </>
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Inspections', href: route('inspections.index') },
            ]}
        >
            <Head title={'Inspections'} />
            <div className="space-y-6 p-4 lg:p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusCounts[card.key] ?? 0}</p>
                                    </div>
                                    <div className={`rounded-lg ${card.bg} p-2 dark:bg-blue-900/20`}>
                                        <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Tabs defaultValue="table" className="flex w-full items-center justify-center">
                    <TabsList className="mb-4 grid w-full max-w-sm grid-cols-2">
                        <TabsTrigger value="table" className="flex items-center gap-1 sm:gap-2">
                            <TableIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Table View</span>
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Calendar View</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="table" className="space-y-6 w-full">
                        {/* Filters Section */}
                        <Card className="w-full">
                            <CardContent className="w-full">
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
                                    <div className="flex gap-2">
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map((stat) => (
                                                    <SelectItem key={stat} value={stat}>
                                                        {getStatusLabel(stat)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <PaginatedTable
                            data={
                                inspections as unknown as {
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
                            title="Inspections"
                            onSort={handleSort}
                            currentSort={currentSort}
                            actions={renderActions}
                            rowClassName={(row) => {
                                const inspection = row as unknown as Inspection;
                                const isHighlighted = inspection.id === highlightedId;
                                return isHighlighted ? 'bg-blue-100 transition-colors dark:bg-blue-900/40' : '';
                            }}
                            mobileCardRender={renderMobileCard}
                            emptyMessage="No inspections found"
                        />
                    </TabsContent>
                    <TabsContent value="calendar" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold">Inspection Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScheduleCalendar ref={calendarRef} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <AssignInspectorDialog
                    open={assignDialogOpen}
                    onOpenChange={handleDialogOpenChange}
                    inspectionId={highlightedId}
                    inspectors={inspectors}
                    onSuccess={() => {
                        // Refresh the calendar when inspector is successfully assigned
                        calendarRef.current?.refresh();
                    }}
                />
                <ApprovalStatusDialog open={approvalDialogOpen} onOpenChange={handleApprovalDialogClose} application={selectedApplication} />

                {/* Application Summary Dialog */}
                <ApplicationSummaryDialog applicationId={selectedApplicationId} open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} />

                <Toaster />
            </div>
        </AppLayout>
    );
}

import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

import ApplicationSummaryDialog from '@/components/application-summary-dialog';
import Button from '@/components/composables/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn, useDebounce } from '@/lib/utils';
import { SharedData } from '@/types';
import { Calendar, CheckCircle, Clock, Eye, FileText, Filter, History, RotateCcw, Search, User, XCircle } from 'lucide-react';

interface ApprovalItem {
    id: number;
    model_type: string;
    model_id: number;
    model_data: Record<string, unknown>;
    flow_name: string;
    current_step: {
        order: number;
        assigned_to: string;
        assignment_type: 'user' | 'role';
        total_steps: number;
    };
    created_at: string;
    can_approve: boolean;
}

interface DashboardData {
    pending_count: number;
    pending_by_type: Record<string, number>;
    recent_pending: Array<{
        id: number;
        type: string;
        flow_name: string;
        created_at: string;
        model_data: Record<string, unknown>;
    }>;
}

interface Props {
    approvals: ApprovalItem[];
    dashboardData?: DashboardData;
    modelTypes: string[];
}

export default function ApprovalsIndex({ approvals: initialApprovals, dashboardData: initialDashboardData, modelTypes }: Props) {
    const page = usePage<SharedData>();
    const [approvals, setApprovals] = useState<ApprovalItem[]>(Array.isArray(initialApprovals) ? initialApprovals : []);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        pending_count: initialDashboardData?.pending_count || 0,
        pending_by_type: initialDashboardData?.pending_by_type || {},
        recent_pending: Array.isArray(initialDashboardData?.recent_pending) ? initialDashboardData.recent_pending : [],
    });
    const [searchInput, setSearchInput] = useState('');
    const [modelTypeFilter, setModelTypeFilter] = useState<string>('all');
    const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);

    const debouncedSearchInput = useDebounce(searchInput, 400);

    const breadcrumbs = [{ title: 'Approvals', href: '/approvals' }];

    // Filter approvals based on search and type
    const filteredApprovals = approvals.filter((approval) => {
        const matchesSearch =
            !debouncedSearchInput ||
            getApprovalItemTitle(approval).toLowerCase().includes(debouncedSearchInput.toLowerCase()) ||
            getApprovalItemDescription(approval).toLowerCase().includes(debouncedSearchInput.toLowerCase());

        const matchesType = !modelTypeFilter || modelTypeFilter === 'all' || approval.model_type === modelTypeFilter;

        return matchesSearch && matchesType;
    });

    const handleApprovalAction = () => {
        if (!selectedApproval || !actionType) return;

        setIsSubmitting(true);

        const routeName = actionType === 'approve' ? 'approvals.approve' : 'approvals.reject';

        router.post(
            route(routeName),
            {
                model_type: selectedApproval.model_type,
                model_id: selectedApproval.model_id,
                remarks: remarks,
            },
            {
                onSuccess: () => {
                    // Optimistically remove the approved/rejected card
                    setApprovals((prev) => prev.filter((approval) => approval.id !== selectedApproval.id));

                    // Update dashboard data
                    setDashboardData((prev) => ({
                        ...prev,
                        pending_count: prev.pending_count - 1,
                        pending_by_type: {
                            ...prev.pending_by_type,
                            [selectedApproval.model_type]: (prev.pending_by_type[selectedApproval.model_type] || 1) - 1,
                        },
                        recent_pending: Array.isArray(prev.recent_pending)
                            ? prev.recent_pending.filter((item) => item.id !== selectedApproval.id)
                            : [],
                    }));

                    toast.success('Item processed successfully.');

                    // Always reset the form state
                    setIsSubmitting(false);
                    setSelectedApproval(null);
                    setActionType(null);
                    setRemarks('');
                },
                onError: (errors) => {
                    // Handle validation errors
                    let errorMessage = 'An error occurred while processing the request.';

                    if (typeof errors === 'object' && errors) {
                        // Handle validation errors (object with field names as keys)
                        if (typeof errors === 'object' && !Array.isArray(errors)) {
                            errorMessage = Object.values(errors).flat().join(', ');
                        }
                    } else if (typeof errors === 'string') {
                        errorMessage = errors;
                    }

                    toast.error(errorMessage);

                    // Reset form state on error too
                    setIsSubmitting(false);
                    setSelectedApproval(null);
                    setActionType(null);
                    setRemarks('');
                },
            },
        );
    };

    const handleResetApproval = (approval: ApprovalItem) => {
        router.post(
            route('approvals.reset'),
            {
                model_type: approval.model_type,
                model_id: approval.model_id,
            },
            {
                onFinish: () => {
                    // Check for flash messages after the request is complete
                    const flash = page.props.flash;

                    if (flash.error) {
                        toast.error(flash.error);
                    } else if (flash.success) {
                        toast.success(flash.success);
                        // For reset, we typically want to refresh since the item might reappear in pending state
                        router.reload();
                    }
                },
                onError: (errors) => {
                    let errorMessage = 'Failed to reset approval flow.';

                    if (typeof errors === 'object' && errors) {
                        // Handle validation errors (object with field names as keys)
                        if (typeof errors === 'object' && !Array.isArray(errors)) {
                            errorMessage = Object.values(errors).flat().join(', ');
                        }
                    } else if (typeof errors === 'string') {
                        errorMessage = errors;
                    }

                    toast.error(errorMessage);
                },
            },
        );
    };

    const openActionDialog = (approval: ApprovalItem, action: 'approve' | 'reject') => {
        setSelectedApproval(approval);
        setActionType(action);
        setRemarks('');
    };

    const openHistoryPage = (approval: ApprovalItem) => {
        // Determine the source based on model type
        const source = approval.model_type === 'CustomerApplication' ? 'applications.approvals' : 'inspections.approvals';

        router.get(route('approvals.history'), {
            model_type: approval.model_type,
            model_id: approval.model_id,
            source: source,
        });
    };

    // Handle view application summary
    const handleViewSummary = (approval: ApprovalItem) => {
        if (approval.model_type === 'CustomerApplication') {
            setSelectedApplicationId(approval.model_id);
            setSummaryDialogOpen(true);
        } else if (approval.model_type === 'CustApplnInspection') {
            // For inspection, get the customer_application_id from model_data
            const customerApplicationId = (approval.model_data.customer_application_id as number) || null;
            if (customerApplicationId) {
                setSelectedApplicationId(customerApplicationId);
                setSummaryDialogOpen(true);
            }
        }
    };

    const getApprovalItemTitle = (approval: ApprovalItem) => {
        const data = approval.model_data;
        if (approval.model_type === 'CustomerApplication') {
            const firstName = (data.first_name as string) || '';
            const lastName = (data.last_name as string) || '';
            const accountNumber = (data.account_number as string) || 'N/A';
            return `${firstName} ${lastName} - ${accountNumber}`;
        } else if (approval.model_type === 'CustApplnInspection') {
            // Get customer application details from the inspection
            const customerApp = data.customer_application as Record<string, unknown>;
            if (customerApp) {
                const firstName = (customerApp.first_name as string) || '';
                const lastName = (customerApp.last_name as string) || '';
                const accountNumber = (customerApp.account_number as string) || 'N/A';
                return `Inspection - ${firstName} ${lastName} - ${accountNumber}`;
            }
            return `Inspection #${approval.model_id}`;
        }
        return `${approval.model_type} #${approval.model_id}`;
    };

    const getApprovalItemDescription = (approval: ApprovalItem) => {
        const data = approval.model_data;
        if (approval.model_type === 'CustomerApplication') {
            return (data.email_address as string) || 'No email provided';
        } else if (approval.model_type === 'CustApplnInspection') {
            const status = (data.status as string) || 'Unknown status';
            const scheduleDate = data.schedule_date ? new Date(data.schedule_date as string).toLocaleDateString() : 'Not scheduled';
            return `Status: ${status} | Scheduled: ${scheduleDate}`;
        }
        return `ID: ${approval.model_id}`;
    };

    const getProgressPercentage = (current: number, total: number) => {
        return Math.round((current / total) * 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approvals" />

            {/* Dashboard Cards */}
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.pending_count || 0}</div>
                        <p className="text-xs text-muted-foreground">Items awaiting your approval</p>
                    </CardContent>
                </Card>

                {Object.entries(dashboardData?.pending_by_type || {}).map(([type, count]) => (
                    <Card key={type}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{type}</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{count}</div>
                            <p className="text-xs text-muted-foreground">Pending {type.toLowerCase()}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="space-y-4 p-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search approvals..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <Select value={modelTypeFilter} onValueChange={setModelTypeFilter}>
                        <SelectTrigger className="w-48">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {Array.isArray(modelTypes) &&
                                modelTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Approvals List */}
            <section className="px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                        <CardDescription>Items that require your approval or rejection</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredApprovals.length === 0 ? (
                            <div className="py-12 text-center">
                                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">All caught up!</h3>
                                <p className="text-muted-foreground">No pending approvals at the moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredApprovals.map((approval) => (
                                    <div key={approval.id} className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>{getApprovalItemTitle(approval).charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{getApprovalItemTitle(approval)}</h3>
                                                        <p className="text-sm text-muted-foreground">{getApprovalItemDescription(approval)}</p>
                                                    </div>
                                                    <Badge variant="outline">{approval.model_type}</Badge>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-medium">Flow:</span>
                                                        <span>{approval.flow_name}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-medium">Progress:</span>
                                                        <div className="max-w-xs flex-1">
                                                            <Progress
                                                                value={getProgressPercentage(
                                                                    approval.current_step.order,
                                                                    approval.current_step.total_steps,
                                                                )}
                                                                className="h-2"
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            Step {approval.current_step.order} of {approval.current_step.total_steps}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4" />
                                                        <span>Assigned to: {approval.current_step.assigned_to}</span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {approval.current_step.assignment_type}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Created: {new Date(approval.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {(approval.model_type === 'CustomerApplication' || approval.model_type === 'CustApplnInspection') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewSummary(approval)}
                                                        className="border-blue-200 bg-white text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800"
                                                    >
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        View Details
                                                    </Button>
                                                )}

                                                <Button variant="outline" size="sm" onClick={() => openHistoryPage(approval)}>
                                                    <History className="mr-1 h-4 w-4" />
                                                    History
                                                </Button>

                                                {approval.can_approve && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openActionDialog(approval, 'reject')}
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <XCircle className="mr-1 h-4 w-4" />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openActionDialog(approval, 'approve')}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="mr-1 h-4 w-4" />
                                                            Approve
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResetApproval(approval)}
                                                    className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                                >
                                                    <RotateCcw className="mr-1 h-4 w-4" />
                                                    Reset
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Approval/Rejection Dialog */}
            <Dialog
                open={!!actionType}
                onOpenChange={() => {
                    setActionType(null);
                    setSelectedApproval(null);
                    setRemarks('');
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType === 'approve' ? 'Approve Item' : 'Reject Item'}</DialogTitle>
                        <DialogDescription>
                            {selectedApproval && (
                                <>
                                    {actionType === 'approve' ? 'Approve' : 'Reject'} "{getApprovalItemTitle(selectedApproval)}"
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="remarks">Remarks {actionType === 'reject' && <span className="text-red-500">*</span>}</Label>
                            <textarea
                                id="remarks"
                                placeholder={`Enter ${actionType === 'approve' ? 'approval' : 'rejection'} remarks...`}
                                value={remarks}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemarks(e.target.value)}
                                rows={3}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setActionType(null);
                                setSelectedApproval(null);
                                setRemarks('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprovalAction}
                            disabled={isSubmitting || (actionType === 'reject' && !remarks.trim())}
                            className={cn(actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')}
                        >
                            {isSubmitting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
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

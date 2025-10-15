import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, CheckCircle, Clock, User, XCircle } from 'lucide-react';

interface ApprovalStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    application?: CustomerApplication;
}

export default function ApprovalStatusDialog({ open, onOpenChange, application }: ApprovalStatusDialogProps) {
    console.log('ApprovalStatusDialog application:', application); 
    if (!application?.has_approval_flow || !application?.approval_state) {
        return null;
    }

    const { approval_state } = application;
    const steps = approval_state.flow.steps || [];
    const approvals = application.approvals || [];

    const getStepStatusIcon = (step: ApprovalFlowStep, currentOrder: number) => {
        const approval = approvals.find((a) => a.approval_flow_step_id === step.id);

        if (approval?.status === 'approved') {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        } else if (approval?.status === 'rejected') {
            return <XCircle className="h-5 w-5 text-red-500" />;
        } else if (step.order === currentOrder && approval_state.status === 'pending') {
            return <Clock className="h-5 w-5 text-yellow-500" />;
        } else {
            return <Clock className="h-5 w-5 text-gray-300" />;
        }
    };

    const getStepStatusBadge = (step: ApprovalFlowStep, currentOrder: number) => {
        const approval = approvals.find((a) => a.approval_flow_step_id === step.id);

        if (approval?.status === 'approved') {
            return (
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                    Approved
                </Badge>
            );
        } else if (approval?.status === 'rejected') {
            return (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                    Rejected
                </Badge>
            );
        } else if (step.order === currentOrder && approval_state.status === 'pending') {
            return (
                <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                    Pending
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-500">
                    Waiting
                </Badge>
            );
        }
    };

    const formatDate = (dateString?: string) =>
        dateString
            ? new Date(dateString).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        Approval Flow Status
                    </DialogTitle>
                    <DialogDescription>
                        Application #{application.account_number} - {application.full_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Overall Status */}
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">Overall Status</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{approval_state.flow.name}</p>
                        </div>
                        <div className="text-right">
                            {approval_state.status === 'approved' && (
                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                    Fully Approved
                                </Badge>
                            )}
                            {approval_state.status === 'pending' && (
                                <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                                    In Progress
                                </Badge>
                            )}
                            {approval_state.status === 'rejected' && (
                                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                                    Rejected
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Approval Steps */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Approval Steps</h3>

                        {steps.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No approval steps found</p>
                        ) : (
                            <div className="space-y-3">
                                {steps.map((step, index) => {
                                    const approval = approvals.find((a) => a.approval_flow_step_id === step.id);

                                    return (
                                        <div
                                            key={step.id || index}
                                            className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                        >
                                            <div className="mt-1 flex-shrink-0">{getStepStatusIcon(step, approval_state.current_order)}</div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">Step {step.order}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {step.user ? step.user.name : step.role?.name || 'Unknown'}
                                                        </p>
                                                    </div>
                                                    {getStepStatusBadge(step, approval_state.current_order)}
                                                </div>

                                                {approval?.approver && (
                                                    <div className="mt-2 space-y-1">
                                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                            <User className="h-3 w-3" />
                                                            <span>Approved by: {approval.approver.name}</span>
                                                        </div>
                                                        {approval.approved_at && (
                                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>Date: {formatDate(approval.approved_at)}</span>
                                                            </div>
                                                        )}
                                                        {approval.remarks && (
                                                            <div className="mt-1">
                                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                    <span className="font-medium">Remarks:</span> {approval.remarks}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

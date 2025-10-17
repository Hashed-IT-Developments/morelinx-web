import { Badge } from '@/components/ui/badge';
import { useApprovalStatus } from '@/hooks/useApprovalStatus';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ApprovalStatusResponse {
    approval_state?: {
        id: number;
        status: 'pending' | 'approved' | 'rejected';
        current_order: number;
        flow: {
            id: number;
            module: string;
            name: string;
            steps?: ApprovalFlowStep[];
        };
    } | null;
    approvals?: ApprovalRecord[];
    has_approval_flow?: boolean;
    is_approval_complete?: boolean;
    is_approval_pending?: boolean;
    is_approval_rejected?: boolean;
}

interface ApprovalStatusBadgeProps {
    applicationId: string;
    onStatusClick?: (application: CustomerApplication) => void;
    className?: string;
}

export default function ApprovalStatusBadge({ applicationId, onStatusClick, className = '' }: ApprovalStatusBadgeProps) {
    const { fetchApprovalStatus, loading, error } = useApprovalStatus();
    const [approvalData, setApprovalData] = useState<ApprovalStatusResponse | null>(null);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (!hasChecked) {
            setHasChecked(true);
            fetchApprovalStatus(applicationId).then((data) => {
                setApprovalData(data);
            });
        }
    }, [applicationId, fetchApprovalStatus, hasChecked]);

    // Show loading state
    if (loading[applicationId]) {
        return (
            <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Loading...</span>
            </div>
        );
    }

    // Show error state
    if (error[applicationId]) {
        return <span className={`text-xs text-gray-400 ${className}`}>Error</span>;
    }

    // No approval flow or no data yet
    if (!approvalData?.has_approval_flow) {
        return <span className={`text-gray-400 ${className}`}>—</span>;
    }

    // Has approval flow but no approval state (shouldn't happen normally)
    if (!approvalData.approval_state) {
        return <span className={`text-gray-400 ${className}`}>—</span>;
    }

    const handleClick = () => {
        if (onStatusClick && approvalData) {
            // Create a mock application object with approval data
            const mockApplication: CustomerApplication = {
                id: applicationId,
                account_number: '',
                full_name: '',
                approval_state: approvalData.approval_state,
                approvals: approvalData.approvals,
                has_approval_flow: approvalData.has_approval_flow,
                is_approval_complete: approvalData.is_approval_complete,
                is_approval_pending: approvalData.is_approval_pending,
                is_approval_rejected: approvalData.is_approval_rejected,
            } as CustomerApplication;

            onStatusClick(mockApplication);
        }
    };

    const { approval_state } = approvalData;

    // Check if this is for Customer Application module
    if (approval_state.flow?.module === 'customer_application') {
        const baseClasses = 'font-medium cursor-pointer transition-colors';

        if (approval_state.status === 'approved') {
            return (
                <Badge
                    variant="outline"
                    className={`border-green-200 bg-green-50 text-green-700 hover:bg-green-100 ${baseClasses} ${className}`}
                    onClick={handleClick}
                >
                    Approved
                </Badge>
            );
        } else if (approval_state.status === 'pending') {
            return (
                <Badge
                    variant="outline"
                    className={`border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 ${baseClasses} ${className}`}
                    onClick={handleClick}
                >
                    Needs Approval
                </Badge>
            );
        } else if (approval_state.status === 'rejected') {
            return (
                <Badge
                    variant="outline"
                    className={`border-red-200 bg-red-50 text-red-700 hover:bg-red-100 ${baseClasses} ${className}`}
                    onClick={handleClick}
                >
                    Rejected
                </Badge>
            );
        }
    }

    // Fallback
    return <span className={`text-gray-400 ${className}`}>—</span>;
}

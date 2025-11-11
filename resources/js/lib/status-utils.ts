export const getStatusLabel = (status: string): string => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown';
};

export const getStatusColor = (status: string): string => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';

    const s = status.toLowerCase();

    // Pending statuses - Yellow
    if (s.includes('pending') || s.includes('medium') || s === 'open' || s === 'new') {
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
    }

    // In Progress/Active Work statuses - Blue
    if (s.includes('in_progress') || s.includes('in-progress') || s.includes('assigned') || s.includes('working')) {
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }

    // Completed/Resolved statuses - Green
    if (
        s.includes('completed') ||
        s.includes('completed') ||
        s.includes('low') ||
        s.includes('resolved') ||
        s.includes('done') ||
        s.includes('finished') ||
        s.includes('closed')
    ) {
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
    }

    // Cancelled/Rejected statuses - Red
    if (
        s.includes('cancelled') ||
        s.includes('high') ||
        s.includes('not_executed') ||
        s.includes('reject') ||
        s.includes('disapprove') ||
        s.includes('denied') ||
        s.includes('failed')
    ) {
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
    }

    // On Hold/Paused statuses - Orange
    if (s.includes('hold') || s.includes('paused') || s.includes('suspended') || s.includes('waiting')) {
        return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
    }

    // General approval statuses - Blue
    if (s.includes('for_approval') || s.includes('awaiting_approval')) {
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }

    // Inspector approval statuses - Blue
    if (s.includes('for_inspector_approval')) {
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }

    // Inspection statuses - Yellow for general applications, Blue for monitoring
    if (s.includes('for_inspection') || s.includes('inspecting')) {
        // Use yellow for application workflow, blue for monitoring workflow
        return s.includes('inspector')
            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
    }

    // Verification statuses - Emerald for verified, Purple for pending verification
    if (s.includes('verified') || s.includes('validated')) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    }

    if (s.includes('verification') || s.includes('for_verification') || s.includes('validating')) {
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
    }

    // Processing statuses - Indigo
    if (s.includes('process') || s.includes('for_processing') || s.includes('in_process') || s.includes('processing')) {
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
    }

    // Review statuses - Cyan
    if (s.includes('review') || s.includes('for_review') || s.includes('reviewing') || s.includes('under_review')) {
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100';
    }

    // Active/Approved statuses - Emerald
    if (s.includes('active') || s.includes('approved')) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    }

    // Draft/Temporary statuses - Gray
    if (s.includes('draft') || s.includes('temporary') || s.includes('temp')) {
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }

    // Escalated/Priority statuses - Pink
    if (s.includes('escalated') || s.includes('priority') || s.includes('urgent') || s.includes('high_priority')) {
        return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100';
    }

    // Overdue/Late statuses - Red with different shade
    if (s.includes('overdue') || s.includes('late') || s.includes('expired')) {
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
    }

    // Scheduled/Future statuses - Violet
    if (s.includes('scheduled') || s.includes('planned') || s.includes('future')) {
        return 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100';
    }

    // Default - Gray
    return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
};

export const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    if (!status) return 'outline';

    const s = status.toLowerCase();

    // Destructive states
    if (
        s.includes('reject') ||
        s.includes('disapprove') ||
        s.includes('cancelled') ||
        s.includes('canceled') ||
        s.includes('denied') ||
        s.includes('failed') ||
        s.includes('overdue') ||
        s.includes('expired')
    ) {
        return 'destructive';
    }

    // Success states
    if (
        s.includes('active') ||
        s.includes('low') ||
        s.includes('approved') ||
        s.includes('completed') ||
        s.includes('resolved') ||
        s.includes('done') ||
        s.includes('finished') ||
        s.includes('verified') ||
        s.includes('validated')
    ) {
        return 'default';
    }

    // Secondary states (in-progress, processing)
    if (
        s.includes('in-progress') ||
        s.includes('executed') ||
        s.includes('processing') ||
        s.includes('in_progress') ||
        s.includes('reviewing') ||
        s.includes('assigned') ||
        s.includes('working')
    ) {
        return 'secondary';
    }

    return 'outline';
};

export const isActiveStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return (
        s.includes('active') ||
        s.includes('approved') ||
        s.includes('completed') ||
        s.includes('resolved') ||
        s.includes('done') ||
        s.includes('finished') ||
        s.includes('verified') ||
        s.includes('validated') ||
        s.includes('closed')
    );
};

export const isPendingStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return (
        s.includes('pending') ||
        s.includes('for_') ||
        s.includes('in_process') ||
        s.includes('process') ||
        s.includes('waiting') ||
        s.includes('hold') ||
        s.includes('paused') ||
        s.includes('suspended') ||
        s.includes('review') ||
        s.includes('verification') ||
        s.includes('inspection') ||
        s.includes('approval') ||
        s === 'open' ||
        s === 'new' ||
        s.includes('scheduled') ||
        s.includes('planned') ||
        s.includes('assigned') ||
        s.includes('in_progress') ||
        s.includes('in-progress')
    );
};

export const isRejectedStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return (
        s.includes('reject') ||
        s.includes('disapprove') ||
        s.includes('cancelled') ||
        s.includes('canceled') ||
        s.includes('denied') ||
        s.includes('failed') ||
        s.includes('overdue') ||
        s.includes('expired')
    );
};

export const isInProgressStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return (
        s.includes('in_progress') ||
        s.includes('in-progress') ||
        s.includes('assigned') ||
        s.includes('working') ||
        s.includes('processing') ||
        s.includes('reviewing')
    );
};

export const isOnHoldStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes('hold') || s.includes('paused') || s.includes('suspended') || s.includes('waiting');
};

export const isPriorityStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes('escalated') || s.includes('priority') || s.includes('urgent') || s.includes('high_priority');
};

export const isOverdueStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes('overdue') || s.includes('late') || s.includes('expired');
};

export const getApprovalStatusBadgeClass = (status: string): string => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';

    const s = status.toLowerCase();

    switch (s) {
        case 'approved':
            return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
        case 'no approval required':
            return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
};

export const useStatusUtils = () => {
    return {
        getStatusLabel,
        getStatusColor,
        getStatusVariant,
        isActiveStatus,
        isPendingStatus,
        isRejectedStatus,
        isInProgressStatus,
        isOnHoldStatus,
        isPriorityStatus,
        isOverdueStatus,
        getApprovalStatusBadgeClass,
    };
};

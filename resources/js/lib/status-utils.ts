type StatusColorType = 'class' | 'hex';

export const getStatusLabel = (status: string): string => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown';
};

export const getStatusColor = (status: string | undefined, type: StatusColorType = 'class'): string => {
    if (!status) {
        return type === 'hex' ? '#E5E7EB' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }

    const s = status.toLowerCase();

    const pick = (className: string, hex: string) => (type === 'hex' ? hex : className);

    if (s.includes('pending') || s.includes('for_installation_approval') || s.includes('medium') || s === 'open' || s === 'new') {
        return pick('bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100', '#FACC15');
    }

    if (s.includes('in_progress') || s.includes('in-progress') || s.includes('assigned') || s.includes('working')) {
        return pick('bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', '#3B82F6');
    }

    if (
        s.includes('cancelled') ||
        s.includes('high') ||
        s.includes('not_executed') ||
        s.includes('reject') ||
        s.includes('disapprove') ||
        s.includes('denied') ||
        s.includes('failed')
    ) {
        return pick('bg-red-50 text-red-700 border-red-200 hover:bg-red-100', '#EF4444');
    }

    if (
        s.includes('hold') ||
        s.includes('paused') ||
        s.includes('suspended') ||
        s.includes('unresolved') ||
        s.includes('un_resolved') ||
        s.includes('waiting')
    ) {
        return pick('bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100', '#F97316');
    }

    if (
        s.includes('completed') ||
        s.includes('low') ||
        s.includes('resolved') ||
        s.includes('done') ||
        s.includes('finished') ||
        s.includes('closed')
    ) {
        return pick('bg-green-50 text-green-700 border-green-200 hover:bg-green-100', '#22C55E');
    }

    if (s.includes('for_approval') || s.includes('awaiting_approval')) {
        return pick('bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', '#3B82F6');
    }

    if (s.includes('for_inspector_approval')) {
        return pick('bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', '#3B82F6');
    }

    if (s.includes('for_inspection') || s.includes('inspecting')) {
        return s.includes('inspector')
            ? pick('bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', '#3B82F6')
            : pick('bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100', '#FACC15');
    }

    if (s.includes('verified') || s.includes('validated')) {
        return pick('bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', '#10B981');
    }

    if (s.includes('verification') || s.includes('for_verification') || s.includes('validating')) {
        return pick('bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100', '#F97316');
    }

    if (s.includes('process') || s.includes('for_processing') || s.includes('in_process') || s.includes('processing')) {
        return pick('bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100', '#6366F1');
    }

    if (s.includes('review') || s.includes('for_review') || s.includes('reviewing') || s.includes('under_review')) {
        return pick('bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100', '#06B6D4');
    }

    if (s.includes('active') || s.includes('approved')) {
        return pick('bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', '#10B981');
    }

    if (s.includes('draft') || s.includes('temporary') || s.includes('temp')) {
        return pick('bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100', '#9CA3AF');
    }

    if (s.includes('escalated') || s.includes('priority') || s.includes('urgent') || s.includes('high_priority')) {
        return pick('bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100', '#EC4899');
    }

    if (s.includes('overdue') || s.includes('late') || s.includes('expired')) {
        return pick('bg-red-100 text-red-800 border-red-300 hover:bg-red-200', '#DC2626');
    }

    if (s.includes('scheduled') || s.includes('planned') || s.includes('future')) {
        return pick('bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100', '#8B5CF6');
    }

    return pick('bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100', '#9CA3AF');
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

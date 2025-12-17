type StatusColorType = 'class' | 'hex';

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

import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface UseCsfLogReportFiltersProps {
    initialFromDate: string;
    initialToDate: string;
    initialSubmissionType: string;
    initialStatus: string;
    initialUserId: string;
    routeName: string;
}

export function useCsfLogReportFilters({
    initialFromDate,
    initialToDate,
    initialSubmissionType,
    initialStatus,
    initialUserId,
    routeName,
}: UseCsfLogReportFiltersProps) {
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [selectedSubmissionType, setSelectedSubmissionType] = useState(initialSubmissionType);
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);
    const [selectedUserId, setSelectedUserId] = useState(initialUserId);

    const navigateWithFilters = useCallback(
        (additionalParams: Record<string, string> = {}) => {
            const params: Record<string, string> = {
                from_date: fromDate,
                to_date: toDate,
                ...additionalParams,
            };

            if (selectedSubmissionType && selectedSubmissionType !== 'all') {
                params.submission_type = selectedSubmissionType;
            }

            if (selectedStatus && selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            if (selectedUserId && selectedUserId !== 'all') {
                params.user_id = selectedUserId;
            }

            router.post(route(routeName), params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [fromDate, toDate, selectedSubmissionType, selectedStatus, selectedUserId, routeName],
    );

    const handleFilter = useCallback(() => {
        navigateWithFilters({ page: '1' });
    }, [navigateWithFilters]);

    const handlePageChange = useCallback(
        (page: number) => {
            navigateWithFilters({ page: String(page) });
        },
        [navigateWithFilters],
    );

    return {
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        selectedSubmissionType,
        setSelectedSubmissionType,
        selectedStatus,
        setSelectedStatus,
        selectedUserId,
        setSelectedUserId,
        handleFilter,
        handlePageChange,
    };
}

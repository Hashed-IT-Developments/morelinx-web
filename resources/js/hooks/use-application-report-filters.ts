import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface UseApplicationReportFiltersProps {
    initialFromDate: string;
    initialToDate: string;
    initialStatus: string;
    initialTownId: string;
    initialRateClass: string;
    routeName: string;
}

export function useApplicationReportFilters({
    initialFromDate,
    initialToDate,
    initialStatus,
    initialTownId,
    initialRateClass,
    routeName,
}: UseApplicationReportFiltersProps) {
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);
    const [selectedTownId, setSelectedTownId] = useState(initialTownId);
    const [selectedRateClass, setSelectedRateClass] = useState(initialRateClass);

    const navigateWithFilters = useCallback(
        (additionalParams: Record<string, string> = {}) => {
            const params: Record<string, string> = {
                from_date: fromDate,
                to_date: toDate,
                ...additionalParams,
            };

            if (selectedStatus && selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            if (selectedTownId && selectedTownId !== 'all') {
                params.town_id = selectedTownId;
            }

            if (selectedRateClass && selectedRateClass !== 'all') {
                params.rate_class = selectedRateClass;
            }

            router.post(route(routeName), params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [fromDate, toDate, selectedStatus, selectedTownId, selectedRateClass, routeName],
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
        selectedStatus,
        setSelectedStatus,
        selectedTownId,
        setSelectedTownId,
        selectedRateClass,
        setSelectedRateClass,
        handleFilter,
        handlePageChange,
    };
}

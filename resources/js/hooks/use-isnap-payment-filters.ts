import { router } from '@inertiajs/react';
import { useState } from 'react';

interface UseIsnapPaymentFiltersProps {
    initialFromDate: string;
    initialToDate: string;
    initialTownId: string;
}

export function useIsnapPaymentFilters({ initialFromDate, initialToDate, initialTownId }: UseIsnapPaymentFiltersProps) {
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [selectedTownId, setSelectedTownId] = useState(initialTownId);

    const handleFilter = () => {
        const filterData: Record<string, string> = {
            from_date: fromDate,
            to_date: toDate,
        };

        if (selectedTownId && selectedTownId !== 'all') {
            filterData.town_id = selectedTownId;
        }

        router.post(route('isnap-payment-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        const filterData: Record<string, string> = {
            from_date: fromDate,
            to_date: toDate,
            page: String(page),
        };

        if (selectedTownId && selectedTownId !== 'all') {
            filterData.town_id = selectedTownId;
        }

        router.post(route('isnap-payment-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return {
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        selectedTownId,
        setSelectedTownId,
        handleFilter,
        handlePageChange,
    };
}

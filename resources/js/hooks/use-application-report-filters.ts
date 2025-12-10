import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

interface UseApplicationReportFiltersProps {
    initialFromDate: string;
    initialToDate: string;
    initialStatus: string;
    initialTownId: string;
    initialBarangayId?: string;
    initialRateClass: string;
    initialDeliveryMode: string;
    routeName: string;
}

export function useApplicationReportFilters({
    initialFromDate,
    initialToDate,
    initialStatus,
    initialTownId,
    initialBarangayId = 'all',
    initialRateClass,
    initialDeliveryMode,
    routeName,
}: UseApplicationReportFiltersProps) {
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);
    const [selectedTownId, setSelectedTownId] = useState(initialTownId);
    const [selectedBarangayId, setSelectedBarangayId] = useState(initialBarangayId);
    const [selectedRateClass, setSelectedRateClass] = useState(initialRateClass);
    const [selectedDeliveryMode, setSelectedDeliveryMode] = useState(initialDeliveryMode);
    const [barangays, setBarangays] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        const fetchBarangays = async () => {
            if (selectedTownId && selectedTownId !== 'all') {
                try {
                    const response = await fetch(`/api/towns/${selectedTownId}/barangays`);
                    const data = await response.json();

                    setBarangays([{ id: 'all', name: 'All Barangays' }, ...data]);
                } catch (error) {
                    console.error('Failed to fetch barangays:', error);
                    setBarangays([]);
                }
            } else {
                setBarangays([]);
                setSelectedBarangayId('all');
            }
        };

        fetchBarangays();
    }, [selectedTownId]);

    const navigateWithFilters = useCallback(
        (additionalParams: Record<string, string> = {}) => {
            const params: Record<string, string> = {
                from_date: fromDate,
                to_date: toDate,
                ...additionalParams,
            };

            if (selectedStatus !== 'all') params.status = selectedStatus;
            if (selectedTownId !== 'all') params.town_id = selectedTownId;
            if (selectedBarangayId !== 'all') params.barangay_id = selectedBarangayId;
            if (selectedRateClass !== 'all') params.rate_class = selectedRateClass;
            if (selectedDeliveryMode !== 'all') params.delivery_mode = selectedDeliveryMode; // Added

            router.post(route(routeName), params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [fromDate, toDate, selectedStatus, selectedTownId, selectedBarangayId, selectedRateClass, selectedDeliveryMode, routeName],
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

        selectedBarangayId,
        setSelectedBarangayId,

        barangays,

        selectedRateClass,
        setSelectedRateClass,

        selectedDeliveryMode,
        setSelectedDeliveryMode,

        handleFilter,
        handlePageChange,
    };
}

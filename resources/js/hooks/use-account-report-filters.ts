import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BarangayApi {
    id: number;
    name: string;
}

interface BarangayOption {
    id: string;
    name: string;
}

interface UseAccountReportFiltersProps {
    initialFromDate: string;
    initialToDate: string;
    initialStatus: string;
    initialTownId: string;
    initialBarangayId?: string;
    initialRateClass: string;
    routeName: string;
    initialBarangays?: Array<{ id: number; name: string }>;
}

export function useAccountReportFilters({
    initialFromDate,
    initialToDate,
    initialStatus,
    initialTownId,
    initialBarangayId = 'all',
    initialRateClass,
    routeName,
    initialBarangays = [],
}: UseAccountReportFiltersProps) {
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);
    const [selectedTownId, setSelectedTownId] = useState(initialTownId);
    const [selectedBarangayId, setSelectedBarangayId] = useState(initialBarangayId);
    const [selectedRateClass, setSelectedRateClass] = useState(initialRateClass);
    const [barangays, setBarangays] = useState<BarangayOption[]>([
        { id: 'all', name: 'All Barangays' },
        ...initialBarangays.map((b) => ({ id: String(b.id), name: b.name })),
    ]);
    const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

    // Fetch barangays when town changes
    useEffect(() => {
        const fetchBarangays = async () => {
            if (selectedTownId && selectedTownId !== 'all') {
                setIsLoadingBarangays(true);
                try {
                    const response = await fetch(route('web-api.towns.barangays', { town: selectedTownId }));
                    if (!response.ok) throw new Error('Failed to fetch');

                    const data = (await response.json()) as BarangayApi[];

                    const options: BarangayOption[] = [
                        { id: 'all', name: 'All Barangays' },
                        ...data.map((b) => ({ id: String(b.id), name: b.name })),
                    ];

                    setBarangays(options);
                } catch (error) {
                    console.error('Failed to fetch barangays:', error);
                    toast.error('Failed to load barangays');
                    setBarangays([{ id: 'all', name: 'All Barangays' }]);
                } finally {
                    setIsLoadingBarangays(false);
                }
            } else {
                setBarangays([{ id: 'all', name: 'All Barangays' }]);
                setSelectedBarangayId('all');
            }
        };

        fetchBarangays();
    }, [selectedTownId]);

    const handleFilter = () => {
        const filterData: Record<string, string> = {
            from_date: fromDate,
            to_date: toDate,
        };

        if (selectedStatus && selectedStatus !== 'all') filterData.status = selectedStatus;
        if (selectedTownId && selectedTownId !== 'all') filterData.town_id = selectedTownId;
        if (selectedBarangayId && selectedBarangayId !== 'all') {
            filterData.barangay_id = selectedBarangayId;
        }
        if (selectedRateClass && selectedRateClass !== 'all') {
            filterData.rate_class = selectedRateClass;
        }

        router.post(route(routeName), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
        isLoadingBarangays,
        selectedRateClass,
        setSelectedRateClass,
        handleFilter,
    };
}

import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface UseFiltersParams {
    initialInspectionsFromDate: string;
    initialInspectionsToDate: string;
    initialApplicationsFromDate: string;
    initialApplicationsToDate: string;
    initialInspectionsStatus: string;
    initialInspectorId: string;
}

export function useFilters(params: UseFiltersParams) {
    const [inspectionsFromDate, setInspectionsFromDate] = useState(params.initialInspectionsFromDate);
    const [inspectionsToDate, setInspectionsToDate] = useState(params.initialInspectionsToDate);
    const [applicationsFromDate, setApplicationsFromDate] = useState(params.initialApplicationsFromDate);
    const [applicationsToDate, setApplicationsToDate] = useState(params.initialApplicationsToDate);
    const [selectedInspectionsStatus, setSelectedInspectionsStatus] = useState(params.initialInspectionsStatus);
    const [selectedInspectorId, setSelectedInspectorId] = useState(params.initialInspectorId);

    const navigateWithFilters = useCallback(
        (additionalParams: Record<string, string> = {}) => {
            const params: Record<string, string> = {
                inspections_from_date: inspectionsFromDate,
                inspections_to_date: inspectionsToDate,
                applications_from_date: applicationsFromDate,
                applications_to_date: applicationsToDate,
                ...additionalParams,
            };

            if (selectedInspectionsStatus !== 'all') {
                params.inspections_status = selectedInspectionsStatus;
            }
            if (selectedInspectorId !== 'all') {
                params.inspector_id = selectedInspectorId;
            }

            router.post(route('inspections-daily-monitoring.index'), params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [inspectionsFromDate, inspectionsToDate, applicationsFromDate, applicationsToDate, selectedInspectionsStatus, selectedInspectorId],
    );

    const handleInspectionsFilter = useCallback(() => {
        navigateWithFilters({ inspections_page: '1' });
    }, [navigateWithFilters]);

    const handleApplicationsFilter = useCallback(() => {
        navigateWithFilters({ applications_page: '1' });
    }, [navigateWithFilters]);

    const handleInspectionsPageChange = useCallback(
        (page: number) => {
            navigateWithFilters({ inspections_page: String(page) });
        },
        [navigateWithFilters],
    );

    const handleApplicationsPageChange = useCallback(
        (page: number) => {
            navigateWithFilters({ applications_page: String(page) });
        },
        [navigateWithFilters],
    );

    return {
        inspectionsFromDate,
        setInspectionsFromDate,
        inspectionsToDate,
        setInspectionsToDate,
        applicationsFromDate,
        setApplicationsFromDate,
        applicationsToDate,
        setApplicationsToDate,
        selectedInspectionsStatus,
        setSelectedInspectionsStatus,
        selectedInspectorId,
        setSelectedInspectorId,
        handleInspectionsFilter,
        handleApplicationsFilter,
        handleInspectionsPageChange,
        handleApplicationsPageChange,
    };
}

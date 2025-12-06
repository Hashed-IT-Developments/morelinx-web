import { ApplicationSummary } from './types';

export const formatDate = (dateString?: string | null) =>
    dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

export const formatBillAddress = (billInfo: ApplicationSummary['bill_info']) => {
    if (!billInfo) return 'N/A';

    const parts = [
        billInfo.unit_no,
        billInfo.building,
        billInfo.street,
        billInfo.subdivision,
        billInfo.barangay?.name,
        billInfo.barangay?.town?.name,
    ];

    return parts.filter(Boolean).join(', ') || 'N/A';
};

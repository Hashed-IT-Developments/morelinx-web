import { router } from '@inertiajs/react';
import axios from 'axios';

export function useCustomerApplicationMethod() {
    const updateStatus = async (id?: string, status?: string) => {
        try {
            await router.patch(route('applications.status-update'), {
                application_id: id,
                status: status,
            });
        } catch (error) {
            console.error('Error updating customer application status:', error);
        }
    };

    const getStatuses = async () => {
        try {
            const response = await axios.get(route('customer-applications.statuses'));
            const statuses = response.data;
            return statuses;
        } catch (error) {
            console.error('Error fetching application statuses:', error);
            return [];
        }
    };

    return { updateStatus, getStatuses };
}

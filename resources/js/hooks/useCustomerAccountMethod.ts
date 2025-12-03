import { router } from '@inertiajs/react';
import axios from 'axios';

export function useCustomerAccountMethod() {
    const updateStatus = async (id?: string, status?: string) => {
        try {
            await router.patch(route('account.status-update'), {
                account_id: id,
                status: status,
            });
        } catch (error) {
            console.error('Error updating customer account status:', error);
        }
    };

    const getStatuses = async () => {
        try {
            const response = await axios.get(route('account.statuses'));
            return response.data;
        } catch (error) {
            console.error('Error fetching account statuses:', error);
        }
    };
    return { updateStatus, getStatuses };
}

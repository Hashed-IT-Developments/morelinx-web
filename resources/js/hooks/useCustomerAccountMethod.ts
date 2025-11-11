import { router } from '@inertiajs/react';

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

    return { updateStatus };
}

import { router } from '@inertiajs/react';

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

    return { updateStatus };
}

import axios from 'axios';

export default function useNotificationMethod() {
    const getNotifications = async (userId: string | number) => {
        try {
            const response = await axios.get(route('notifications.fetch', { user_id: userId }));
            return response;
        } catch (err) {
            console.error('Failed to fetch notification method:', err);
            return null;
        }
    };

    return {
        getNotifications,
    };
}

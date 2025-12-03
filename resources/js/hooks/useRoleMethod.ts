import axios from 'axios';

type Params = {
    search?: string;
};

export const useRoleMethod = () => {
    const getRoles = async (params: Params) => {
        try {
            const response = await axios.get(route('roles.search'), { params: { ...params } });
            return response;
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    };
    return {
        getRoles,
    };
};

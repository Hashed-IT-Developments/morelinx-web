import axios from 'axios';

type Params = {
    limit?: number;
    search?: string;
    roles?: string[];
};

export const useUserMethod = () => {
    const getUsers = async (params: Params) => {
        try {
            const response = await axios.get(route('users.search'), { params: { ...params } });
            return response;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    };
    return {
        getUsers,
    };
};

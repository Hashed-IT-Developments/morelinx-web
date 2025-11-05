import axios from 'axios';

type Params = {
    type?: string;
};

export const useTicketTypeMethod = () => {
    const getTicketTypes = async (params: Params) => {
        try {
            const response = await axios.get(route('tickets-types.fetch'), { params: { ...params } });
            return response;
        } catch (error) {
            console.error('Error fetching ticket types:', error);
            throw error;
        }
    };
    return {
        getTicketTypes,
    };
};

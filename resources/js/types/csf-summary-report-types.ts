export interface CsfTicket {
    id: number;
    ticket_no: string;
    account_number: string;
    customer_name: string;
    ticket_type: string;
    concern_type: string;
    status: string;
    town: string;
    barangay: string;
    created_at: string;
    user: string;
}

export interface TicketType {
    id: number;
    name: string;
    type?: string;
}

export interface User {
    id: number;
    name: string;
}

export interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface CsfSummaryReportPageProps {
    tickets: CsfTicket[];
    allTickets: CsfTicket[];
    pagination: PaginationData;
    ticket_types: TicketType[];
    concern_types: TicketType[];
    users: User[];
    filters: {
        from_date: string;
        to_date: string;
        ticket_type_id: number | null;
        concern_type_id: number | null;
        status: string | null;
        user_id: number | null;
        sort_field?: string;
        sort_direction?: string;
    };
    [key: string]: unknown;
}

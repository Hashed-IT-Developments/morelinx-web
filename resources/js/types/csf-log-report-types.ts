export interface CsfTicket {
    id: number;
    ticket_no: string;
    submission_type: string;
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

export interface CsfLogReportPageProps {
    tickets: CsfTicket[];
    allTickets: CsfTicket[];
    pagination: PaginationData;
    users: User[];
    filters: {
        from_date: string;
        to_date: string;
        submission_type: string | null;
        status: string | null;
        user_id: number | null;
        sort_field?: string;
        sort_direction?: string;
    };
    [key: string]: unknown;
}

export interface Application {
    id: number;
    account_number: string;
    customer_name: string;
    rate_class: string;
    status: string;
    town: string;
    barangay: string;
    load: number;
    date_applied: string;
    date_installed: string;
}

export interface Town {
    id: number;
    name: string;
}

export interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface ApplicationReportPageProps {
    applications: Application[];
    allApplications: Application[];
    pagination: PaginationData;
    towns: Town[];
    filters: {
        from_date: string;
        to_date: string;
        status: string | null;
        town_id: number | null;
        rate_class: string | null;
        sort_field?: string;
        sort_direction?: string;
    };
    [key: string]: unknown;
}

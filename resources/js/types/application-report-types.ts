export interface CustomerApplication {
    id: number;
    account_number: string;
    customer_name: string;
    identity: string;
    rate_class: string;
    status: string;
    town: string;
    barangay: string;
    load: number;
    date_applied: string;
    date_installed: string;
    delivery_mode?: string[];
}

// Backwards-compatible alias
export type Application = CustomerApplication;

export interface Town {
    id: number;
    name: string;
}

export interface Barangay {
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
    applications: CustomerApplication[];
    allApplications: CustomerApplication[];
    pagination: PaginationData;
    towns: Town[];
    barangays: Barangay[];
    delivery_modes: string[];
    filters: {
        from_date: string;
        to_date: string;
        status: string | null;
        town_id: number | null;
        barangay_id: number | null;
        rate_class: string | null;
        delivery_mode: string | null;
        sort_field?: string;
        sort_direction?: string;
    };
    [key: string]: unknown;
}

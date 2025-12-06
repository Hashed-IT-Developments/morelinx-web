import type { PageProps } from '@inertiajs/core';

export interface StatusCounts {
    pending: number;
    active: number;
    suspended: number;
    disconnected: number;
    total: number;
}

export interface AccountReportPageProps extends PageProps {
    accounts: CustomerAccount[];
    allAccounts: CustomerAccount[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    towns: Array<{ id: number; name: string }>;
    barangays: Array<{ id: number; name: string }>;
    filters: {
        from_date: string;
        to_date: string;
        status: string | null;
        town_id: number | null;
        barangay_id: number | null;
        rate_class: string | null;
        sort_field: string;
        sort_direction: string;
    };
    statusCounts: StatusCounts;
}

export interface CustomerAccount {
    id: number;
    account_number: string;
    account_name: string;
    customer_type: string;
    rate_class: string;
    account_status: string;
    town: string;
    barangay: string;
    connection_date: string;
}

export interface IsnapPayment {
    id: number;
    account_number: string;
    customer_name: string;
    identity: string;
    rate_class: string;
    status: string;
    town: string;
    barangay: string;
    paid_amount: number;
    date_applied: string;
    date_installed: string;
    date_paid: string;
}

export interface Town {
    id: number;
    name: string;
}

export interface IsnapPaymentPageProps extends Record<string, unknown> {
    payments: IsnapPayment[];
    allPayments: IsnapPayment[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    towns: Town[];
    filters: {
        from_date: string;
        to_date: string;
        town_id: number | null;
        sort_field?: string;
        sort_direction?: string;
    };
}

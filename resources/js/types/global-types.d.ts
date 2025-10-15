declare global {
    type PaginatedData = {
        current_page: number;
        data: [] | null;
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: Array<{ url?: string; label: string; active: boolean }>;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };

    interface Inspection {
        id: number;
        application_id?: string;
        status: string;
        house_loc?: string;
        meter_loc?: string;
        bill_deposit?: number;
        remarks?: string;
        created_at: string;
        updated_at: string;
        schedule_date?: string;
        inspector_id?: number | null;
        inspector?: {
            id: number;
            name: string;
        } | null;
        customer_application?: CustomerApplication;
    }
    interface CustomerApplication {
        id: string;
        account_number: string;
        first_name: string;
        middle_name?: string;
        last_name: string;
        suffix?: string;
        birth_date?: string;
        gender?: string;
        marital_status?: string;
        nationality?: string;
        email_address?: string;
        contact_numbers?: string;
        telephone_numbers?: string;
        house_number?: string;
        block?: string;
        building?: string;
        street?: string | null;
        subdivision?: string;
        sitio?: string | null;
        route?: string | null;
        barangay_id?: number;
        barangay?: {
            id: number;
            name: string;
            town_id?: number;
            full_text?: string;
            town?: unknown;
        };
        district?: number;
        customer_type_id?: number;
        customer_type?: {
            id: number;
            rate_class?: string;
            customer_type?: string;
            name?: string;
            full_text?: string;
        };
        connected_load?: number;
        status: string;
        created_at: string;
        updated_at?: string;
        inspections?: Inspection[];
        full_address?: string;
        full_name?: string;
        mobile_1?: string;
        mobile_2?: string | null;
        telephone_1?: string | null;
        telephone_2?: string | null;
    }

    type PaginatedApplications = PaginatedData<CustomerApplication>;
    type PaginatedInspections = PaginatedData<Inspection>;
}

export {};

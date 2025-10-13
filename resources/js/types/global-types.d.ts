
declare global {
    interface PaginationMeta {
        current_page: number;
        data: [] | null;
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: [] | null;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    }
    interface Inspection {
        id: number;
        application_id: string;
        status: string;
        house_loc: string;
        meter_loc: string;
        bill_deposit: number;
        remarks: string;
        created_at: string;
        updated_at: string;
        schedule_date: string;
        inspector: {
            id: number;
            name: string;
        } | null;
    }
    interface CustomerApplication {
        id: string;
        account_number: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        suffix: string;
        birth_date: string;
        gender: string;
        marital_status: string;
        nationality: string;
        email_address: string;
        contact_numbers: string;
        telephone_numbers: string;
        house_number: string;
        block: string;
        building: string;
        street: string | null;
        subdivision: string;
        sitio: string | null;
        route: string | null;
        barangay_id: number;
        barangay: {
            id: number;
            name: string;
            town_id: number;
            full_text: string;
            town: unknown;
        };
        district: number;
        customer_type_id: number;
        customer_type: {
            id: number;
            rate_class: string;
            customer_type: string;
            full_text: string;
        };
        connected_load: number;
        status: string;
        created_at: string;
        updated_at: string;
        inspections: Inspection[];
        full_address: string;
        mobile_1: string;
        mobile_2: string | null;
        telephone_1: string | null;
        telephone_2: string | null;
        landmark: string | null;
        unit_no: string | null;
        district_id: number | null;
        id_type_1: string | null;
        id_type_2: string | null;
        id_number_1: string | null;
        id_number_2: string | null;
        is_sc: boolean | null;
        sc_from: string | null;
        sc_number: string | null;
        cp_last_name: string,
        cp_first_name: string,
        cp_middle_name: string,
        cp_relation: string,
        tel_no_1: string | null,
        tel_no_2: string | null,
        mobile_1: string | null,
        mobile_2: string | null,
        sketch_lat_long: string | null,
    }

    interface CustomerInfo {
        customer_application_id: string,
        user_id: number,
        last_name: string,
        first_name: string,
        middle_name: string,
        suffix: string,
        birth_date: Date | null,
        nationality: string,
        gender: string,
        marital_status: string,
        barangay_id: number,
        landmark: string,
        sitio: string,
        unit_no: string,
        building: string,
        street: string,
        subdivision: string,
        district_id: number | null,
        block: string,
        route: string,
        id_type_1: string,
        id_number_1: number | null,
        id_type_2: string | null,
        id_number_2: number | null,
        is_sc: boolean,
        sc_from: Date | null,
        sc_number: string,
        cp_last_name: string,
        cp_first_name: string,
        cp_middle_name: string,
        cp_relation: string,
        email_address: string,
        tel_no_1: string | null,
        tel_no_2: string | null,
        mobile_1: string | null,
        mobile_2: string | null,
        sketch_lat_long: string | null
    }

    interface User {
        email: string,
        id: number,
        name: string,
        roles: Array,
        permissions: Array
    }

    interface Auth {
        api_token: string,
        permissions: Array<string>,
        user: User
    }
}

export {};

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
        approval_state?: {
            id: number;
            status: 'pending' | 'approved' | 'rejected';
            current_order: number;
            flow: {
                id: number;
                module: string;
                name: string;
                steps?: ApprovalFlowStep[];
            };
        } | null;
        approvals?: ApprovalRecord[];
        has_approval_flow?: boolean;
        is_approval_complete?: boolean;
        is_approval_pending?: boolean;
        is_approval_rejected?: boolean;
    }
    interface CustomerApplication {
        id: string;
        identity: string;
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
        district_id: number;
        district: {
            id: number;
            name: string;
        };
        customer_type_id: number;
        customer_type: {
            id: number;
            rate_class?: string;
            customer_type?: string;
            name?: string;
            full_text?: string;
        };
        connected_load?: number;
        status: string;
        created_at: string;
        updated_at: string;
        inspections: Inspection[];
        full_address: string;
        full_name: string;
        mobile_1: string;
        mobile_2: string | null;
        telephone_1: string | null;
        telephone_2: string | null;
        landmark: string | null;
        approval_state?: {
            id: number;
            status: 'pending' | 'approved' | 'rejected';
            current_order: number;
            flow: {
                id: number;
                module: string;
                name: string;
                steps?: ApprovalFlowStep[];
            };
        } | null;
        approvals?: ApprovalRecord[];
        has_approval_flow?: boolean;
        is_approval_complete?: boolean;
        is_approval_pending?: boolean;
        is_approval_rejected?: boolean;
        payables?: Payable[];
        unit_no: string | null;
        district_id: number | null;
        id_type_1: string | null;
        id_type_2: string | null;
        id_number_1: string | null;
        id_number_2: string | null;
        is_sc: boolean | null;
        sc_from: string | null;
        sc_number: string | null;
        property_ownership: string | null;
        cp_last_name: string;
        cp_first_name: string;
        cp_middle_name: string;
        cp_relation: string;
        tel_no_1: string | null;
        tel_no_2: string | null;
        mobile_1: string | null;
        mobile_2: string | null;
        sketch_lat_long: string | null;
        account_name: string | null;
        trade_name: string | null;
        c_peza_registered_activity: string | null;
        cor_number: string | null;
        tin_number: string | null;
        cg_vat_zero_tag: boolean | null;
        bill_info: {
            barangay_id: number;
            barangay: Barangay;
            subdivision: string;
            street: string;
            unit_no: string;
            building: string;
            delivery_mode: string;
        };
        attachments?: CaAttachment[];
        credit_balance?: {
            id: number;
            credit_balance: number;
        };
        is_isnap?: boolean;
        isnap_amount?: number;
        logs?: Logs[];
    }

    interface CustomerInfo {
        customer_application_id: string;
        user_id: number;
        last_name: string;
        first_name: string;
        middle_name: string;
        suffix: string;
        birth_date: Date | null;
        nationality: string;
        gender: string;
        marital_status: string;
        barangay_id: number;
        landmark: string;
        sitio: string;
        unit_no: string;
        building: string;
        street: string;
        subdivision: string;
        district_id: number | null;
        block: string;
        route: string;
        id_type_1: string;
        id_number_1: number | null;
        id_type_2: string | null;
        id_number_2: number | null;
        is_sc: boolean;
        sc_from: Date | null;
        sc_number: string;
        cp_last_name: string;
        cp_first_name: string;
        cp_middle_name: string;
        cp_relation: string;
        email_address: string;
        tel_no_1: string | null;
        tel_no_2: string | null;
        mobile_1: string | null;
        mobile_2: string | null;
        sketch_lat_long: string | null;
    }

    interface AmendmentRequest {
        id: number;
        customer_application: CustomerApplication;
        customer_application_id: number;
        customer_type: { rate_class: string; customer_type: string };
        customer_type_id: number;
        fields_count: number;
        status: string;
        user: User;
        amendment_request_items: Array<AmendmentRequestItem>;
        created_at: Date;
    }

    interface AmendmentRequestItem {
        id: number;
        amendment_request_id: number;
        field: string;
        current_data: string;
        new_date: string;
        new_data_ref: string;
    }

    interface User {
        email: string;
        id: number;
        name: string;
        roles: Role[];
        permissions: Array;
    }

    interface Auth {
        api_token: string;
        permissions: Array<string>;
        user: User;
    }

    type PaginatedApplications = PaginatedData<CustomerApplication>;
    type PaginatedInspections = PaginatedData<Inspection>;

    interface ApprovalFlowStep {
        id: number;
        order: number;
        role_id?: number | null;
        user_id?: number | null;
        role?: {
            id: number;
            name: string;
        } | null;
        user?: {
            id: number;
            name: string;
        } | null;
        created_at: string;
        updated_at: string;
    }

    interface ApprovalRecord {
        id: number;
        approval_flow_step_id: number;
        approved_by?: number | null;
        status: 'pending' | 'approved' | 'rejected';
        remarks?: string | null;
        approved_at?: string | null;
        approver?: {
            id: number;
            name: string;
        } | null;
        approval_flow_step?: ApprovalFlowStep;
        created_at: string;
        updated_at: string;
    }

    interface CaAttachment {
        id: number;
        customer_application_id: number;
        type: string;
        path: string;
        created_at: string;
        updated_at: string;
        deleted_at?: string | null;
    }

    interface Payable {
        id: number;
        customer_application_id: number;
        customer_payable?: string | null;
        type: string;
        bill_month?: string | null;
        total_amount_due: number;
        status: string;
        amount_paid?: number | null;
        balance: number;
        created_at: string;
        updated_at: string;
        deleted_at?: string | null;
    }

    type Ticket = {
        id: string;
        ticket_no: string;
        ticket_type_id: number;
        title: string;
        description: string;
        status: string;
        created_at: string;
        updated_at: string;
        severity: string;
        actual_findings_id: string;
        executed_by_id: string;
        actual_findings?: string | null;
        logs: Logs[];
        details: {
            id: number;
            ticket_id: number;
            reason: string;
            concern: string;
            ticket_type_id: number;
            ticket_type?: {
                id: number;
                name: string;
            };
            concern_type_id: number;
            concern_type: {
                id: number;
                name: string;
            };
            action_plan: string;
            actual_findings_id: string;
            remarks: string;
            created_at: string;
            updated_at: string;
        };
        cust_information: {
            id: number;
            account_id: string;
            ticket_id: number;
            consumer_name: string;
            phone: string;
            email_address: string;
            landmark: string;
            barangay_id: number;
            barangay: {
                id: number;
                name: string;
                full_text: string;
            };
            town: {
                id: number;
                name: string;
                district: number;
                feeder: string;
                du_tag: string;
            };
            sitio: string;
            address: string;
            created_at: string;
            updated_at: string;
        };

        assigned_users: {
            id: number;
            user: User;
            created_at: string;
            updated_at: string;
        }[];
    };

    type TicketType = {
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
    };

    type Role = {
        id: number;
        name: string;
        guard_name: string;
        created_at: string;
        updated_at: string;
    };

    type PageProps = {
        auth: {
            user: User;
        };
    };

    type Account = {
        id: number;
        account_name: string;
        account_number: string;
        account_status: string;
        acct_pmt_type: string | null;
        application: CustomerApplication;
        barangay_id: number;
        block: string | null;
        compute_type: string | null;
        connection_date: string | null;
        contact_number: string;
        contestable: string | null;
        core_loss: string | null;
        created_at: string;
        customer_application_id: number;
        customer_id: number | null;
        customer_type_id: number;
        date_disconnected: string | null;
        date_transfered: string | null;
        district_id: number;
        email_address: string;
        evat_2_pct: string | null;
        evat_5_pct: string | null;
        feeder: string | null;
        group_code: string | null;
        house_number: string;
        is_isnap: boolean;
        is_sc: boolean;
        latest_reading_date: string | null;
        'life-liner': string | null;
        life_liner_date_applied: string | null;
        life_liner_date_expire: string | null;
        meter_loc: string | null;
        migrated: string | null;
        multiplier: string | null;
        net_metered: string | null;
        notes: string | null;
        old_account_no: string | null;
        org_parent_account: string | null;
        organization: string | null;
        pole_number: string | null;
        route_id: number | null;
        sc_date_applied: string | null;
        sc_date_expired: string | null;
        sequence_code: string | null;
        updated_at: string;
        user_id: number | null;
    };

    type Logs = {
        id: number;
        title: string;
        description: string;
        type: string;
        user: {
            id: number;
            name: string;
        };
        created_at: string;
    };
}

export {};

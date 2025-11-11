export interface Inspector {
    id: number;
    name: string;
}

export interface CustomerApplication {
    id: number;
    account_number?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    full_name?: string;
    birth_date?: string;
    nationality?: string;
    gender?: string;
    marital_status?: string;
    email_address?: string;
    mobile_1?: string;
    mobile_2?: string;
    tel_no_1?: string;
    tel_no_2?: string;
    barangay?: string;
    town?: string;
    district?: string;
    customer_type?: string;
    connected_load?: number;
    property_ownership?: string;
    is_sc?: boolean;
    is_isnap?: boolean;
    sitio?: string;
    unit_no?: string;
    building?: string;
    street?: string;
    subdivision?: string;
    landmark?: string;
    full_address?: string;
    sketch_lat_long?: string;
}

export interface Inspection {
    id: number;
    inspection_id: number;
    customer: string;
    status: string;
    customer_type: string;
    address: string;
    schedule_date: string;
    inspector?: string;
    inspector_email?: string;
    customer_application?: CustomerApplication;
}

export interface Filters {
    from_date: string;
    to_date: string;
    inspections_from_date: string;
    inspections_to_date: string;
    applications_from_date: string;
    applications_to_date: string;
    inspector_id?: number | null;
    inspections_status?: string;
}

export interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface PageProps {
    customerInspections: Inspection[];
    allCustomerInspections: Inspection[];
    customerInspectionsPagination: PaginationData;
    inspectorApplications: Inspection[];
    allInspectorApplications: Inspection[];
    inspectorApplicationsPagination: PaginationData | null;
    inspectors: Inspector[];
    filters: Filters;
    [key: string]: unknown;
}

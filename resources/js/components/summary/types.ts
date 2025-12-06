// --- Types for Attachments ---
export interface CaAttachment {
    id: number;
    customer_application_id: number;
    type: string;
    path: string;
    file_path: string;
    file_name: string;
    file_type: string;
    created_at: string;
    updated_at: string;
}

// --- Application Summary Types ---
export interface ApplicationSummary {
    id: string;
    account_number: string;
    first_name: string | null;
    last_name: string | null;
    middle_name: string | null;
    suffix: string | null;
    full_name: string;
    identity: string;
    email_address: string;
    mobile_1: string;
    mobile_2: string | null;
    tel_no_1: string | null;
    tel_no_2: string | null;
    full_address: string;
    status: string;
    connected_load: number | null;
    property_ownership: string | null;
    birth_date: string | null;
    nationality: string | null;
    gender: string | null;
    marital_status: string | null;
    is_sc: boolean | null;
    sc_from: string | null;
    sc_number: string | null;
    id_type_1: string | null;
    id_number_1: string | null;
    id_type_2: string | null;
    id_number_2: string | null;
    landmark: string | null;
    sitio: string | null;
    unit_no: string | null;
    building: string | null;
    street: string | null;
    subdivision: string | null;
    block: string | null;
    route: string | null;
    sketch_lat_long: string | null;
    cp_last_name: string | null;
    cp_first_name: string | null;
    cp_middle_name: string | null;
    cp_relation: string | null;
    created_at: string;
    created_at_formatted: string;
    created_at_human: string;
    updated_at: string;
    account_name: string | null;
    trade_name: string | null;
    c_peza_registered_activity: string | null;
    cor_number: string | null;
    tin_number: string | null;
    cg_vat_zero_tag: boolean | null;
    is_isnap: boolean | null;
    date_installed: string | null;
    remarks: string | null;
    attachments_count: number;
    attachments: CaAttachment[];
    inspections_count: number;
    customer_type: {
        id: number;
        name: string;
        rate_class: string;
        customer_type: string;
    } | null;
    barangay: {
        id: number;
        name: string;
        town: {
            id: number;
            name: string;
        } | null;
    } | null;
    district: {
        id: number;
        name: string;
    } | null;
    bill_info: {
        subdivision?: string;
        unit_no?: string;
        street?: string;
        building?: string;
        delivery_mode?: string;
        barangay?: {
            id: number;
            name: string;
            town?: {
                id: number;
                name: string;
            };
        };
    } | null;
}

// --- Inspection Detail Types ---
export interface InspectionDetail {
    id: number;
    customer_application_id: number;
    inspector_id: number | null;
    status: string;
    house_loc: string | null;
    meter_loc: string | null;
    schedule_date: string | null;
    sketch_loc: string | null;
    near_meter_serial_1: string | null;
    near_meter_serial_2: string | null;
    user_id: number | null;
    inspection_time: string | null;
    bill_deposit: number | null;
    material_deposit: number | null;
    total_labor_costs: number | null;
    labor_cost: number | null;
    feeder: string | null;
    meter_type: string | null;
    service_drop_size: string | null;
    protection: string | null;
    meter_class: string | null;
    connected_load: string | null;
    transformer_size: string | null;
    signature: string | null;
    remarks: string | null;
    created_at: string;
    updated_at: string;
    inspector: {
        id: number;
        name: string;
        email: string;
    } | null;
    materials_used: Array<{
        id: number;
        material_name: string;
        unit: string;
        quantity: number;
        amount: number;
        total_amount: number;
    }>;
}

// --- Energization Detail Types ---
export interface EnergizationDetail {
    id: number;
    customer_application_id: number;
    team_assigned_id: number | null;
    status: string;
    service_connection: string | null;
    action_taken: string | null;
    remarks: string | null;
    time_of_arrival: string | null;
    date_installed: string | null;
    transformer_owned: string | null;
    transformer_rating: string | null;
    ct_serial_number: string | null;
    ct_brand_name: string | null;
    ct_ratio: string | null;
    pt_serial_number: string | null;
    pt_brand_name: string | null;
    pt_ratio: string | null;
    team_executed: string | null;
    archive: boolean;
    attachments: string[] | null;
    created_at: string;
    updated_at: string;
    assigned_team: {
        id: number;
        name: string;
        email: string;
    } | null;
}

// --- Comprehensive Data Type ---
export interface ComprehensiveData {
    application: ApplicationSummary | null;
    inspection: InspectionDetail | null;
    energization: EnergizationDetail | null;
}

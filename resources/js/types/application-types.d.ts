export type ApplicationFormValues = {
    // ID for existing applications (optional for new ones)
    id?: number;

    // Account Info - Type Section
    rate_class: string;
    customer_type: string;

    // Account Info - House Information
    connected_load: number;
    property_ownership: string;

    // Account Info - Personal Information
    last_name: string;
    first_name: string;
    middle_name: string;
    suffix: string;
    birthdate: Date | null;
    nationality: string;
    sex: string;
    marital_status: string;

    // Address Info
    landmark: string;
    unit_no: string;
    building_floor: string;
    street: string;
    subdivision: string;
    district: string;
    barangay: string;
    sketch_lat_long: string; // Changed from FileList to string for coordinates

    // Establishment Info (if applicable)
    account_name: string;
    trade_name: string;
    c_peza_registered_activity: string;

    // Contact Info - Contact Person
    cp_lastname: string;
    cp_firstname: string;
    cp_middlename: string;
    cp_suffix: string;
    relationship: string;

    // Contact Info - Contact Details
    cp_email: string;
    cp_tel_no: string;
    cp_tel_no_2: string;
    cp_mobile_no: string;
    cp_mobile_no_2: string;

    // Requirements - Government ID (New Structure)
    id_category: 'primary' | 'secondary';
    primary_id_type: string;
    primary_id_number: string;
    primary_id_file: File | null;
    secondary_id_1_type: string;
    secondary_id_1_number: string;
    secondary_id_1_file: File | null;
    secondary_id_2_type: string;
    secondary_id_2_number: string;
    secondary_id_2_file: File | null;

    // Government Info - CGAF

    cor_number: string;
    tin_number: string;
    issued_date: Date | null;
    cg_vat_zero_tag: boolean;
    cg_ewt_tag: File | null;
    cg_ft_tag: File | null;

    // Requirements - Senior Citizen
    is_senior_citizen: boolean;
    sc_from: Date | null;
    sc_number: string;

    // ISNAP Member
    is_isnap: boolean;

    // Requirements - Attachments
    attachments: {
        [key: string]: File | null;
    };

    // Requirements - Other Attachments
    other_attachments: Array<{
        id: string;
        name: string;
        file: File | null;
    }>;

    // Bill Info - Bill Address
    bill_district: string;
    bill_barangay: string;
    bill_landmark: string;
    bill_subdivision: string;
    bill_street: string;
    bill_building_floor: string;
    bill_house_no: string;

    // Facility Info - Delivery / Facility Address (for non-residential customers)
    facility_district: string;
    facility_barangay: string;
    facility_landmark: string;
    facility_subdivision: string;
    facility_street: string;
    facility_building_floor: string;
    facility_house_no: string;

    // Bill Info - Bill Delivery (array of delivery methods)
    bill_delivery: string[];

    // Applicant Photo
    applicant_photo: File | null;

    // Legacy fields (can be removed if not needed)
    name: string;
    address: string;
    city: string;
    zip: string;
};

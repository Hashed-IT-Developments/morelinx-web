export type ApplicationFormValues = {
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
    sketch: FileList | null;

    // Contact Info - Contact Person
    lastname: string;
    firstname: string;
    middlename: string;
    relationship: string;

    // Contact Info - Contact Details
    email: string;
    tel_no: string;
    tel_no_2: string;
    mobile_no: string;
    mobile_no_2: string;

    // Requirements - Government ID
    id_type: string;
    id_number: string;
    id_number_2: string;

    // Requirements - Senior Citizen
    is_senior_citizen: boolean;
    sc_from: Date | null;
    sc_number: string;

    // Requirements - Attachments
    attachments: {
        [key: string]: File | null;
    };

    // Bill Info - Bill Address
    bill_district: string;
    bill_barangay: string;
    bill_subdivision: string;
    bill_street: string;
    bill_building_floor: string;
    bill_house_no: string;

    // Bill Info - Bill Delivery
    bill_delivery: string;

    // Legacy fields (can be removed if not needed)
    name: string;
    address: string;
    city: string;
    zip: string;
};

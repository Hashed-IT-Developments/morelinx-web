import { ApplicationFormValues } from '@/types/application-types';
import {
    ConfirmationTab,
    StepAccountInfo,
    StepAddressInfo,
    StepAttachmentInfo,
    StepBillInfo,
    StepContactInfo,
    StepGovernmentInfo,
    StepRequirements,
} from './steps';

// Step configuration interface - simplified approach
export interface StepConfig {
    id: string;
    label: string;
    fields: readonly (keyof ApplicationFormValues)[];
    component: React.ComponentType;
}

// Rate class constants for better maintainability
export const RATE_CLASSES = {
    RESIDENTIAL: 'residential',
    COMMERCIAL: 'commercial',
    INDUSTRIAL: 'industrial',
    POWER: 'power',
    CITY_OFFICES: 'city_offices',
    CITY_STREETLIGHTS: 'city_streetlights',
    OTHER_GOVERNMENT: 'other_government',
    TEMP: 'temp', // Add other rate classes as needed
} as const;

// Customer type constants
export const CUSTOMER_TYPES = {
    INDIVIDUAL: 'individual',
    CORPORATION: 'corporation',
    GOVERNMENT: 'government',
    COOPERATIVE: 'cooperative',
    NON_PROFIT: 'non-profit',
    TEMPORARY_COMMERCIAL: 'temporary_commercial',
    TEMPORARY_RESIDENTIAL: 'temporary_residential',
    // Add more customer types as needed
} as const;

// Direct step visibility mapping - much simpler!
// Note: 'account-info' is automatically included as the first step for all configurations
export const STEP_VISIBILITY_MAP = {
    // Rate class only mappings
    [RATE_CLASSES.TEMP]: ['account-info', 'address-info', 'contact-info', 'requirements', 'bill-info', 'review'],
    [RATE_CLASSES.RESIDENTIAL]: ['account-info', 'address-info', 'contact-info', 'requirements', 'bill-info', 'review'],
    [RATE_CLASSES.POWER]: ['account-info', 'address-info', 'contact-info', 'government-info', 'review'],
    [RATE_CLASSES.COMMERCIAL]: ['account-info', 'address-info', 'contact-info', 'government-info', 'review'],
    [RATE_CLASSES.CITY_OFFICES]: ['account-info', 'address-info', 'contact-info', 'bill-info', 'attachment-info', 'review'],
    [RATE_CLASSES.CITY_STREETLIGHTS]: ['account-info', 'address-info', 'contact-info', 'bill-info', 'attachment-info', 'review'],
    [RATE_CLASSES.OTHER_GOVERNMENT]: ['account-info', 'address-info', 'contact-info', 'bill-info', 'attachment-info', 'review'],

    // Specific rate_class + customer_type combinations (these override the rate class defaults)
    [`${RATE_CLASSES.POWER}:${CUSTOMER_TYPES.TEMPORARY_COMMERCIAL}`]: ['account-info', 'address-info', 'contact-info', 'government-info', 'review'],
    [`${RATE_CLASSES.POWER}:${CUSTOMER_TYPES.TEMPORARY_RESIDENTIAL}`]: [
        'account-info',
        'address-info',
        'contact-info',
        'requirements',
        'bill-info',
        'review',
    ],
};

// All available step definitions (order matters for display)
export const ALL_STEPS: StepConfig[] = [
    {
        id: 'account-info',
        label: 'Account Info',
        fields: [
            'rate_class',
            'customer_type',
            'is_isnap',
            'connected_load',
            'property_ownership',
            'last_name',
            'first_name',
            'middle_name',
            'suffix',
            'birthdate',
            'nationality',
            'sex',
            'marital_status',
            'account_name',
            'trade_name',
            'c_peza_registered_activity',
            'bill_delivery',
        ],
        component: StepAccountInfo,
    },
    {
        id: 'address-info',
        label: 'Address Info',
        fields: ['landmark', 'unit_no', 'building_floor', 'street', 'subdivision', 'district', 'barangay', 'sketch_lat_long'],
        component: StepAddressInfo,
    },
    {
        id: 'contact-info',
        label: 'Contact Info',
        fields: [
            'cp_lastname',
            'cp_firstname',
            'cp_middlename',
            'cp_suffix',
            'relationship',
            'cp_email',
            'cp_tel_no',
            'cp_tel_no_2',
            'cp_mobile_no',
            'cp_mobile_no_2',
        ],
        component: StepContactInfo,
    },
    {
        id: 'requirements',
        label: 'Requirements',
        fields: [
            'id_category',
            'primary_id_type',
            'primary_id_number',
            'primary_id_file',
            'secondary_id_1_type',
            'secondary_id_1_number',
            'secondary_id_1_file',
            'secondary_id_2_type',
            'secondary_id_2_number',
            'secondary_id_2_file',
            'is_senior_citizen',
            'sc_from',
            'sc_number',
            'attachments',
        ],
        component: StepRequirements,
    },
    {
        id: 'government-info',
        label: 'Government Info',
        fields: [
            'id_category',
            'primary_id_type',
            'primary_id_number',
            'primary_id_file',
            'secondary_id_1_type',
            'secondary_id_1_number',
            'secondary_id_1_file',
            'secondary_id_2_type',
            'secondary_id_2_number',
            'secondary_id_2_file',
            'cor_number',
            'tin_number',
            'issued_date',
            'cg_vat_zero_tag',
            'cg_ewt_tag',
            'cg_ft_tag',
            'attachments',
        ],
        component: StepGovernmentInfo,
    },
    {
        id: 'attachment-info',
        label: 'Attachment Info',
        fields: [], // Add relevant fields when you define them
        component: StepAttachmentInfo,
    },
    {
        id: 'bill-info',
        label: 'Bill Info',
        fields: ['bill_district', 'bill_barangay', 'bill_subdivision', 'bill_street', 'bill_building_floor', 'bill_house_no', 'bill_delivery'],
        component: StepBillInfo,
    },
    {
        id: 'review',
        label: 'Review',
        fields: [],
        component: ConfirmationTab,
    },
];

// Simple and intuitive function to get visible steps
export const getVisibleSteps = (rateClass: string, customerType?: string): StepConfig[] => {
    // First, try to find a specific combination match
    const combinationKey = customerType ? `${rateClass}:${customerType}` : '';
    const visibleStepIds = STEP_VISIBILITY_MAP[combinationKey] || STEP_VISIBILITY_MAP[rateClass] || [];

    // Ensure account-info is always included as the first step
    const ensuredStepIds = visibleStepIds.includes('account-info') ? visibleStepIds : ['account-info', ...visibleStepIds];

    // Filter and return steps in the correct order
    return ALL_STEPS.filter((step) => ensuredStepIds.includes(step.id));
};

// Backwards compatibility - get visible steps based on rate class only
export const getVisibleStepsByRateClass = (rateClass: string): StepConfig[] => {
    return getVisibleSteps(rateClass);
};

// Get step configuration by ID
export const getStepConfigById = (id: string): StepConfig | undefined => {
    return ALL_STEPS.find((step) => step.id === id);
};

// Get step index by ID (useful for navigation)
export const getStepIndexById = (id: string, visibleSteps: StepConfig[]): number => {
    return visibleSteps.findIndex((step) => step.id === id);
};

// Helper function to add new rate class visibility (for easy extension)
export const addStepVisibility = (rateClass: string, stepIds: string[], customerType?: string) => {
    const key = customerType ? `${rateClass}:${customerType}` : rateClass;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (STEP_VISIBILITY_MAP as any)[key] = stepIds;
};

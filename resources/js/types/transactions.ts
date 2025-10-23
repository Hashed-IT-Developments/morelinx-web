export interface TransactionDetail {
    id: number;
    bill_month: string; // For compatibility, represents billing period
    transaction_code?: string;
    transaction_name?: string; // Added for payables
    total_amount?: string | number;
    quantity?: string | number;
    amount?: string | number;
    unit?: string; // Added for payables
    amount_paid?: string | number; // Added for payables
    balance?: string | number; // Added for payables
    status?: string; // Added for payables
    definitions_count?: number; // Added for payables
}

export interface PayableDefinition {
    id: number;
    transaction_name: string;
    transaction_code: string;
    billing_month: string;
    quantity: number;
    unit?: string;
    amount: number;
    total_amount: number;
}

export interface TransactionRow {
    id: number;
    account_number: string;
    account_name: string;
    address: string;
    meter_number: string;
    meter_status: string;
    status?: string;
    total_amount?: string | number;
    or_date?: string;
    or_number?: string;
    cashier?: string;
    payment_mode?: string;
    payment_area?: string;
    transactionable_type?: string;
    ft?: string | number;
    ewt?: string | number;
    credit_balance?: string | number;
}

export interface PageProps {
    search?: string;
    accounts?: TransactionRow[];
    latestTransaction?: TransactionRow;
    transactionDetails?: TransactionDetail[];
    subtotal?: number;
    qty?: number;
    bir2306?: number;
    bir2307?: number;
    philippineBanks?: Array<{ value: string; label: string }>;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    transaction?: {
        id: number;
        or_number: string;
        total_amount: number;
        status: string;
    };
    [key: string]: unknown;
}

export interface PaymentRow {
    amount: string;
    mode: 'cash' | 'check' | 'credit_card';
    bank?: string;
    check_number?: string;
    check_issue_date?: string;
    check_expiration_date?: string;
    bank_transaction_number?: string;
}

export interface PaymentMethod {
    type: 'cash' | 'check' | 'credit_card';
    amount: number;
    bank?: string;
    check_number?: string;
    check_issue_date?: string;
    check_expiration_date?: string;
    bank_transaction_number?: string;
    [key: string]: string | number | undefined; // Add index signature for Inertia compatibility
}

export interface PaymentRequest {
    payment_methods: PaymentMethod[];
}

export interface PhilippineBank {
    code: string;
    name: string;
}

export interface TransactionDetail {
    id: number;
    bill_month: string;
    transaction_code?: string;
    total_amount?: string | number;
    quantity?: string | number;
    amount?: string | number;
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
    [key: string]: unknown;
}

export interface PaymentRow {
    amount: string;
    mode: string;
}

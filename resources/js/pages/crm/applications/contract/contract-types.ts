import * as z from 'zod';

// Zod Schema for Contract form validation
export const contractSchema = z.object({
    deposit_receipt: z.string().min(1, 'Deposit receipt is required').max(255, 'Deposit receipt is too long'),
    type: z.string().min(1, 'Contract type is required').max(100, 'Type is too long'),
    entered_date: z.string().min(1, 'Entered date is required'),
    done_at: z.string().min(1, 'Place of execution is required').max(255, 'Place is too long'),
    by_personnel: z.string().min(1, 'Personnel name is required').max(255, 'Personnel name is too long'),
    by_personnel_position: z.string().min(1, 'Personnel position is required').max(255, 'Position is too long'),
    id_no_1: z.string().min(1, 'Customer ID number is required').max(100, 'ID number is too long'),
    issued_by_1: z.string().min(1, 'Issuing authority is required').max(255, 'Issuing authority is too long'),
    valid_until_1: z.string().min(1, 'Valid until date is required'),
    building_owner: z.string().min(1, 'Building owner is required').max(255, 'Building owner name is too long'),
    id_no_2: z.string().min(1, 'Owner ID number is required').max(100, 'ID number is too long'),
    issued_by_2: z.string().min(1, 'Issuing authority is required').max(255, 'Issuing authority is too long'),
    valid_until_2: z.string().min(1, 'Valid until date is required'),
});

// Zod-inferred type
export type ContractForm = z.infer<typeof contractSchema>;

// Data Interface
export interface ApplicationContract {
    id: number;
    customer_application_id: number;
    deposit_receipt: string;
    type: string;
    entered_date: string;
    done_at: string;
    by_personnel: string;
    by_personnel_position: string;
    id_no_1: string;
    issued_by_1: string;
    valid_until_1: string;
    building_owner: string;
    id_no_2: string;
    issued_by_2: string;
    valid_until_2: string;
    du_tag?: string;
    created_at?: string;
    updated_at?: string;
}

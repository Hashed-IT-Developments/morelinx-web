import * as z from 'zod';

// Zod Schema for Town form validation
export const townSchema = z.object({
    name: z.string().min(1, 'Town name is required').max(255, 'Town name is too long'),
    feeder: z.string().min(1, 'Feeder is required').max(255, 'Feeder is too long'),
});

// Zod Schema for Barangay form validation
export const barangaySchema = z.object({
    name: z.string().min(1, 'Barangay name is required').max(255, 'Barangay name is too long'),
    town_id: z.number().min(1, 'Please select a town'),
});

// Zod-inferred types
export type TownForm = z.infer<typeof townSchema>;
export type BarangayForm = z.infer<typeof barangaySchema>;

// Data Interfaces
export interface Barangay {
    id: number;
    name: string;
}

export interface Town {
    id: number;
    name: string;
    feeder?: string;
    du_tag?: string;
    barangays?: Barangay[];
}

export type BarangayWithTown = Barangay & { townName: string; townId: number };

export interface PaginatedData<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
        active: boolean;
        label: string;
        url: string | null;
    }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    path: string;
    per_page: number;
}

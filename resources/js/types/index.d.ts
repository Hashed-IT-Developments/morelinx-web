import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface PaginationMeta {
    current_page: number;
    data: [] | null;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: [] | null;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface CustomerApplication {
    id: string;
    account_number: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    birth_date: string;
    gender: string;
    marital_status: string;
    nationality: string;
    email_address: string;
    contact_numbers: string;
    telephone_numbers: string;
    house_number: string;
    block: string;
    building: string;
    street: string | null;
    subdivision: string;
    sitio: string | null;
    route: string | null;
    barangay_id: number;
    barangay: {
        id: number;
        name: string;
        town_id: number;
        full_text: string;
        town: unknown;
    };
    district: number;
    customer_type_id: number;
    customer_type: {
        id: number;
        rate_class: string;
        customer_type: string;
        full_text: string;
    };
    connected_load: number;
    status: string;
    created_at: string;
    updated_at: string;
}

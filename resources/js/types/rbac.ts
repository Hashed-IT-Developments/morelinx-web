import { PaginationData } from '@/components/ui/paginated-table';

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions: Permission[];
}

export interface RbacProps {
    roles: Role[];
    permissions: Permission[];
    users?: PaginationData;
}

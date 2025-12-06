import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem } from '@/types';
import { ReactNode } from 'react';

interface AppLayoutProps {
    title?: string;
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
    loading?: boolean;
}

export default ({ children, breadcrumbs, title, className, loading, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} title={title} className={className} loading={loading} {...props}>
        {children}
    </AppLayoutTemplate>
);

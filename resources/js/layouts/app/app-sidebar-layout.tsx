import { AppContent } from '@/components/app-content';
import { AppContentHeader } from '@/components/app-content-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    title = '',
    className = '',
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; title?: string; className?: string }>) {
    return (
        <AppShell variant="sidebar">
            <Head title={title ? `${title}` : 'Morelinx'} />
            <AppSidebar />
            <AppContent variant="sidebar" className="h-[90vh] overflow-x-hidden overflow-y-hidden">
                <AppContentHeader breadcrumbs={breadcrumbs} />
                <section className={cn('h-[calc(100vh-5rem)] overflow-x-hidden overflow-y-auto', className)}>{children}</section>
            </AppContent>
        </AppShell>
    );
}

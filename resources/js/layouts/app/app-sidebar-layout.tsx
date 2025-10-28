import { AppContent } from '@/components/app-content';
import { AppContentHeader } from '@/components/app-content-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="h-[90vh] overflow-x-hidden overflow-y-hidden">
                <AppContentHeader breadcrumbs={breadcrumbs} />
                <section className="h-[calc(100vh-5rem)] overflow-x-hidden overflow-y-auto">{children}</section>
            </AppContent>
        </AppShell>
    );
}

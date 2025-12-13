import { AppContent } from '@/components/app-content';
import { AppContentHeader } from '@/components/app-content-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import Image from '@/components/composables/image';
import FullPageLoader from '@/components/composables/loaders/full-page-loader';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

interface AppSidebarLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
    className?: string;
    loading?: boolean;
}

export default function AppSidebarLayout({ children, breadcrumbs = [], title, className, loading }: AppSidebarLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <Head title={title ? `${title}` : 'Morelinx'} />
            <AppSidebar />
            <AppContent variant="sidebar" className="relative h-[80vh] overflow-x-hidden overflow-y-hidden">
                {loading && <FullPageLoader />}
                <AppContentHeader breadcrumbs={breadcrumbs} />
                <section className={cn('h-[calc(100vh-5rem)] overflow-x-hidden overflow-y-auto', className)}>{children}</section>
                <footer className="hidden items-center justify-center drop-shadow sm:flex">
                    <div className="w-30">
                        <Image width={500} alt="Prime Electric Logo" src="/assets/images/logo/primelectric_logo.png" />
                    </div>
                </footer>
            </AppContent>
        </AppShell>
    );
}

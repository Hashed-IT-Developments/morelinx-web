import Input from '@/components/composables/input';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import {
    CircleGauge,
    ClipboardPlus,
    Clock,
    Cog,
    CreditCardIcon,
    DollarSign,
    FilePen,
    FilePlus,
    FileSignature,
    FileUp,
    FolderOpen,
    Gauge,
    Hash,
    LayoutGrid,
    Map,
    Settings,
    Shield,
    Stamp,
    StepForward,
    TicketPlus,
    Tickets,
    UsersIcon,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

const mainNavItems = [
    {
        name: 'CRM',
        roles: ['superadmin', 'admin'],
        items: [
            {
                title: 'Dashboard',
                href: route('dashboard'),
                routeName: 'dashboard',
                icon: LayoutGrid,
                roles: ['superadmin'],
            },
            {
                title: 'New Application',
                href: route('applications.create'),
                routeName: 'applications.create',
                icon: FilePlus,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'All Applications',
                href: route('applications.index'),
                routeName: 'applications.index',
                icon: FolderOpen,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'Amendments',
                href: route('amendment-requests.index'),
                routeName: 'amendment-requests.index',
                icon: FilePen,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'Monitoring',
                href: '#',
                icon: CircleGauge,
                roles: ['admin', 'superadmin'],
                items: [
                    {
                        title: 'Daily Monitoring',
                        href: '/campaigns/active',
                        routeName: 'campaigns.active',
                        icon: Gauge,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Inspections',
                        href: route('inspections.index'),
                        routeName: 'inspections.index',
                        icon: ClipboardPlus,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Application Verification',
                        href: route('verify-applications.index'),
                        routeName: 'verify-applications.index',
                        icon: ClipboardPlus,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Cancelled Applications',
                        href: route('cancelled-applications.index'),
                        routeName: 'cancelled-applications.index',
                        icon: ClipboardPlus,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'ISNAP',
                        href: route('isnap.index'),
                        routeName: 'isnap.index',
                        icon: UsersIcon,
                        roles: ['admin', 'superadmin'],
                    },
                ],
            },
            {
                title: 'Contract Signing',
                href: route('applications.contract-signing'),
                routeName: 'applications.contract-signing',
                icon: FileSignature,
                roles: ['admin', 'superadmin'],
            },
        ],
    },

    {
        name: 'CSF',
        roles: ['superadmin', 'admin'],
        items: [
            {
                title: 'Dashboard',
                href: route('tickets.dashboard'),
                routeName: 'tickets.dashboard',
                icon: Gauge,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'All CSF',
                href: route('tickets.index'),
                routeName: 'tickets.index',
                icon: Tickets,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'Create CSF',
                href: route('tickets.create', { type: 'walk-in' }),
                routeName: 'tickets.create',
                icon: TicketPlus,
                roles: ['admin', 'superadmin'],
            },

            {
                title: 'Settings',
                href: route('tickets.settings'),
                routeName: 'tickets.settings',
                icon: Cog,
                roles: ['admin', 'superadmin'],
            },

            {
                title: 'Monitoring',
                href: '#',
                icon: CircleGauge,
                roles: ['admin', 'superadmin'],
                items: [
                    {
                        title: 'My CSF',
                        href: route('tickets.my-tickets'),
                        routeName: 'tickets.my-tickets',
                        icon: Tickets,
                        roles: ['admin', 'superadmin'],
                    },
                ],
            },
        ],
    },
    {
        name: 'CESRA',
        roles: ['admin', 'superadmin'],
        items: [
            {
                title: 'All Rates',
                href: route('rates.index'),
                routeName: 'rates.index',
                icon: DollarSign,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'Upload Rates',
                href: route('rates.upload'),
                routeName: 'rates.upload',
                icon: FileUp,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'Rates Approval',
                href: route('rates.approvals'),
                routeName: 'rates.approvals',
                icon: Stamp,
                roles: ['admin', 'superadmin'],
            },
        ],
    },
    {
        name: 'Approvals',
        roles: ['admin', 'superadmin'],
        items: [
            {
                title: 'Pending Approvals',
                href: route('approvals.index'),
                routeName: 'approvals.index',
                icon: Clock,
                roles: ['admin', 'superadmin'],
            },
        ],
    },
    {
        name: 'Transactions',
        roles: ['superadmin', 'admin'],
        items: [
            {
                title: 'Point of Payments',
                href: route('transactions.index'),
                routeName: 'transactions.index',
                icon: CreditCardIcon,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'Transaction Series',
                href: route('transaction-series.index'),
                routeName: 'transaction-series.index',
                icon: Hash,
                roles: ['admin', 'superadmin'],
            },
        ],
    },
    {
        name: 'Configurations',
        roles: ['superadmin', 'admin'],
        items: [
            {
                title: 'Approval Flow System',
                href: '#',
                icon: Settings,
                roles: ['admin', 'superadmin'],
                items: [
                    {
                        title: 'Approval Flows',
                        href: route('approval-flows.index'),
                        routeName: 'approval-flows.index',
                        icon: StepForward,
                        roles: ['admin', 'superadmin'],
                    },
                ],
            },
        ],
    },
    {
        name: 'RBAC Management',
        roles: ['superadmin', 'admin'],
        items: [
            {
                title: 'Manage Roles & Permissions',
                href: route('rbac.index'),
                routeName: 'rbac.index',
                icon: Shield,
                roles: ['admin', 'superadmin'],
            },
        ],
    },
    {
        name: 'Miscellaneous',
        roles: ['superadmin', 'admin'],
        items: [
            {
                title: 'Addresses',
                href: route('addresses.index'),
                routeName: 'addresses.index',
                icon: Map,
                roles: ['admin', 'superadmin'],
            },
        ],
    },
];

export function AppSidebar() {
    const [search, setSearch] = useState<string>('');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                                <ThemeToggle />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="scrollbar-thin">
                <div className="sticky top-0 z-50 bg-[#387140] px-2">
                    <Input
                        className="px-2 py-0 text-white shadow-md placeholder:text-white"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

import Input from '@/components/composables/input';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import {
    BadgeCheck,
    Cable,
    CircleGauge,
    Clipboard,
    Clock,
    Cog,
    Columns2,
    CreditCardIcon,
    DollarSign,
    File,
    FileSignature,
    FileText,
    FileUp,
    Gauge,
    Hash,
    IdCard,
    List,
    Map,
    MapPin,
    Maximize2,
    PanelBottom,
    Settings,
    Shield,
    SquarePen,
    Stamp,
    Star,
    StepForward,
    TabletSmartphone,
    Tag,
    Tickets,
    TrendingUp,
    UserPlus,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

const mainNavItems = [
    {
        name: 'CRM',
        roles: ['superadmin', 'admin'],
        items: [
            {
                title: 'Applications',
                href: '#',
                icon: Clipboard,
                roles: ['admin', 'superadmin'],
                items: [
                    {
                        title: 'Dashboard',
                        href: route('dashboard'),
                        routeName: 'dashboard',
                        icon: TrendingUp,
                        roles: ['superadmin'],
                    },
                    {
                        title: 'New Application',
                        href: route('applications.create'),
                        routeName: 'applications.create',
                        icon: UserPlus,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'All Applications',
                        href: route('applications.index'),
                        routeName: 'applications.index',
                        icon: List,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Pending Approvals',
                        href: route('applications.approvals'),
                        routeName: 'applications.approvals',
                        icon: Clock,
                        roles: ['admin', 'superadmin'],
                    },
                ],
            },
            {
                title: 'Amendments',
                href: route('amendment-requests.index'),
                routeName: 'amendment-requests.index',
                icon: SquarePen,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'Inspections',
                href: '#',
                icon: TabletSmartphone,
                roles: ['admin', 'superadmin'],
                items: [
                    {
                        title: 'Monitoring',
                        href: route('daily-monitoring.index'),
                        routeName: 'daily-monitoring.index',
                        icon: Gauge,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Inspections Management',
                        href: route('inspections.index'),
                        routeName: 'inspections.index',
                        icon: Maximize2,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Pending Approvals',
                        href: route('inspections.approvals'),
                        routeName: 'inspections.approvals',
                        icon: Clock,
                        roles: ['admin', 'superadmin'],
                    },
                ],
            },
            {
                title: 'Monitoring',
                href: '#',
                icon: PanelBottom,
                roles: ['admin', 'superadmin'],
                items: [
                    {
                        title: 'ISNAP Applications',
                        href: route('isnap.index'),
                        routeName: 'isnap.index',
                        icon: Columns2,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Payment Verification',
                        href: route('verify-applications.index'),
                        routeName: 'verify-applications.index',
                        icon: Tag,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Cancelled Applications',
                        href: route('cancelled-applications.index'),
                        routeName: 'cancelled-applications.index',
                        icon: UserX,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Contract Signing',
                        href: route('applications.contract-signing'),
                        routeName: 'applications.contract-signing',
                        icon: FileSignature,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Installations',
                        href: route('applications.get-installation-by-status', { status: 'for_installation_approval' }),
                        routeName: 'applications.get-installation-by-status',
                        icon: Cable,
                        roles: ['admin', 'superadmin', 'ndog'],
                    },
                    {
                        title: 'Activations',
                        href: route('accounts.for-approval'),
                        routeName: 'accounts.for-approval',
                        icon: BadgeCheck,
                        roles: ['admin', 'superadmin'],
                    },
                ],
            },
            {
                title: 'Reports',
                href: '#',
                icon: File,
                roles: ['admin', 'superadmin'],
                items: [
                    {
                        title: 'Application Reports',
                        href: route('application-reports.index'),
                        routeName: 'application-reports.index',
                        icon: FileText,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'ISNAP Applications',
                        href: route('isnap-application-reports.index'),
                        routeName: 'isnap-application-reports.index',
                        icon: FileText,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'ISNAP Payments',
                        href: route('isnap-payment-reports.index'),
                        routeName: 'isnap-payment-reports.index',
                        icon: FileText,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Ageing Timeline',
                        href: route('ageing-timeline.index'),
                        routeName: 'ageing-timeline.index',
                        icon: FileText,
                        roles: ['admin', 'superadmin'],
                    },
                ],
            },
        ],
    },

    {
        name: 'CSF',
        roles: ['superadmin', 'admin'],
        items: [
            {
                title: 'Create CSF',
                href: route('tickets.create', { type: 'walk-in' }),
                routeName: 'tickets.create',
                icon: Star,
                roles: ['admin', 'superadmin'],
            },
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
        name: 'Transactions',
        roles: ['admin', 'superadmin'],
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
        name: 'Account Management',
        roles: ['superadmin', 'admin'],
        items: [
            {
                title: 'Accounts',
                href: route('accounts.index'),
                routeName: 'accounts.index',
                icon: IdCard,
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
                href: '#',
                icon: Map,
                roles: ['admin', 'superadmin'],
                items: [
                    {
                        title: 'Towns',
                        href: route('addresses.towns.index'),
                        routeName: 'addresses.towns.index',
                        icon: MapPin,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'Barangays',
                        href: route('addresses.barangays.index'),
                        routeName: 'addresses.barangays.indes',
                        icon: MapPin,
                        roles: ['admin', 'superadmin'],
                    },
                ],
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
                <div className="sticky top-0 z-50 bg-sidebar px-2">
                    <Input
                        className="bg-white px-2 py-0 shadow-md"
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

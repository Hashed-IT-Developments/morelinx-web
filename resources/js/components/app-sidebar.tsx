import Input from '@/components/composables/input';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import {
    BadgeCheck,
    Cable,
    CalendarCheck,
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
    Send,
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
    Users,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

const SUPERADMIN = 'superadmin';
const ADMIN = 'admin';
const CCD_STAFF = 'ccd staff';
const CCD_SUPERVISOR = 'ccd supervisor';
const NDOG = 'ndog supervisor';

const mainNavItems = [
    {
        name: 'CRM',
        roles: [SUPERADMIN, ADMIN, CCD_STAFF, CCD_SUPERVISOR, NDOG],
        items: [
            {
                title: 'Applications',
                href: '#',
                icon: Clipboard,
                roles: [ADMIN, SUPERADMIN, CCD_STAFF, CCD_SUPERVISOR],
                items: [
                    {
                        title: 'Dashboard',
                        href: route('dashboard'),
                        routeName: 'dashboard',
                        icon: TrendingUp,
                        roles: [SUPERADMIN],
                    },
                    {
                        title: 'New Application',
                        href: route('applications.create'),
                        routeName: 'applications.create',
                        icon: UserPlus,
                        roles: [ADMIN, SUPERADMIN, CCD_STAFF, CCD_SUPERVISOR],
                    },
                    {
                        title: 'All Applications',
                        href: route('applications.index'),
                        routeName: 'applications.index',
                        icon: List,
                        roles: [ADMIN, SUPERADMIN, CCD_STAFF, CCD_SUPERVISOR],
                    },
                    {
                        title: 'Pending Approvals',
                        href: route('applications.approvals'),
                        routeName: 'applications.approvals',
                        icon: Clock,
                        roles: [ADMIN, SUPERADMIN, CCD_SUPERVISOR],
                    },
                ],
            },
            {
                title: 'Amendments',
                href: route('amendment-requests.index'),
                routeName: 'amendment-requests.index',
                icon: SquarePen,
                roles: [ADMIN, SUPERADMIN],
            },
            {
                title: 'Inspections',
                href: '#',
                icon: TabletSmartphone,
                roles: [ADMIN, SUPERADMIN, NDOG],
                items: [
                    {
                        title: 'Monitoring',
                        href: route('daily-monitoring.index'),
                        routeName: 'daily-monitoring.index',
                        icon: Gauge,
                        roles: [ADMIN, SUPERADMIN, NDOG],
                    },
                    {
                        title: 'Inspections Management',
                        href: route('inspections.index'),
                        routeName: 'inspections.index',
                        icon: Maximize2,
                        roles: [ADMIN, SUPERADMIN, NDOG],
                    },
                    {
                        title: 'Pending Approvals',
                        href: route('inspections.approvals'),
                        routeName: 'inspections.approvals',
                        icon: Clock,
                        roles: [ADMIN, SUPERADMIN, NDOG],
                    },
                ],
            },
            {
                title: 'Monitoring',
                href: '#',
                icon: PanelBottom,
                roles: [ADMIN, SUPERADMIN],
                items: [
                    {
                        title: 'ISNAP Applications',
                        href: route('isnap.index'),
                        routeName: 'isnap.index',
                        icon: Columns2,
                        roles: [ADMIN, SUPERADMIN],
                    },
                    {
                        title: 'Payment Verification',
                        href: route('verify-applications.index'),
                        routeName: 'verify-applications.index',
                        icon: Tag,
                        roles: [ADMIN, SUPERADMIN],
                    },
                    {
                        title: 'Cancelled Applications',
                        href: route('cancelled-applications.index'),
                        routeName: 'cancelled-applications.index',
                        icon: UserX,
                        roles: [ADMIN, SUPERADMIN],
                    },
                    {
                        title: 'Contract Signing',
                        href: route('applications.contract-signing'),
                        routeName: 'applications.contract-signing',
                        icon: FileSignature,
                        roles: [ADMIN, SUPERADMIN],
                    },
                    {
                        title: 'Installations',
                        href: route('applications.get-installation-by-status', { status: 'for_installation_approval' }),
                        routeName: 'applications.get-installation-by-status',
                        icon: Cable,
                        roles: [ADMIN, SUPERADMIN, NDOG],
                    },
                    {
                        title: 'Activations',
                        href: route('accounts.for-approval'),
                        routeName: 'accounts.for-approval',
                        icon: BadgeCheck,
                        roles: [ADMIN, SUPERADMIN],
                    },
                ],
            },
            {
                title: 'Reports',
                href: '#',
                icon: File,
                roles: [ADMIN, SUPERADMIN],
                items: [
                    {
                        title: 'Application Reports',
                        href: route('application-reports.index'),
                        routeName: 'application-reports.index',
                        icon: FileText,
                        roles: [ADMIN, SUPERADMIN],
                    },
                    {
                        title: 'ISNAP Applications',
                        href: route('isnap-application-reports.index'),
                        routeName: 'isnap-application-reports.index',
                        icon: FileText,
                        roles: [ADMIN, SUPERADMIN],
                    },
                    {
                        title: 'ISNAP Payments',
                        href: route('isnap-payment-reports.index'),
                        routeName: 'isnap-payment-reports.index',
                        icon: FileText,
                        roles: [ADMIN, SUPERADMIN],
                    },
                    {
                        title: 'Aging Timeline',
                        href: route('ageing-timeline.index'),
                        routeName: 'ageing-timeline.index',
                        icon: FileText,
                        roles: [ADMIN, SUPERADMIN],
                    },
                ],
            },
        ],
    },

    {
        name: 'CSF',
        roles: [SUPERADMIN, ADMIN],
        items: [
            {
                title: 'Create CSF',
                href: route('tickets.create', { type: 'walk-in' }),
                routeName: 'tickets.create',
                icon: Star,
                roles: [ADMIN, SUPERADMIN],
            },
            {
                title: 'Dashboard',
                href: route('tickets.dashboard'),
                routeName: 'tickets.dashboard',
                icon: Gauge,
                roles: [ADMIN, SUPERADMIN],
            },
            {
                title: 'All CSF',
                href: route('tickets.index'),
                routeName: 'tickets.index',
                icon: Tickets,
                roles: [ADMIN, SUPERADMIN],
            },

            {
                title: 'Settings',
                href: route('tickets.settings'),
                routeName: 'tickets.settings',
                icon: Cog,
                roles: [ADMIN, SUPERADMIN],
            },

            {
                title: 'Monitoring',
                href: '#',
                icon: CircleGauge,
                roles: [ADMIN, SUPERADMIN],
                items: [
                    {
                        title: 'My CSF',
                        href: route('tickets.my-tickets'),
                        routeName: 'tickets.my-tickets',
                        icon: Tickets,
                        roles: [ADMIN, SUPERADMIN],
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
                        title: 'CSF Summary Report',
                        href: route('csf-summary-reports.index'),
                        routeName: 'csf-summary-reports.index',
                        icon: FileText,
                        roles: ['admin', 'superadmin'],
                    },
                    {
                        title: 'CSF Log Report',
                        href: route('csf-log-reports.index'),
                        routeName: 'csf-log-reports.index',
                        icon: FileText,
                        roles: ['admin', 'superadmin'],
                    },
                ],
            },
        ],
    },
    {
        name: 'CESRA',
        roles: [ADMIN, SUPERADMIN],
        items: [
            {
                title: 'All Rates',
                href: route('rates.index'),
                routeName: 'rates.index',
                icon: DollarSign,
                roles: [ADMIN, SUPERADMIN],
            },
            {
                title: 'Upload Rates',
                href: route('rates.upload'),
                routeName: 'rates.upload',
                icon: FileUp,
                roles: [ADMIN, SUPERADMIN],
            },
            {
                title: 'Rates Approval',
                href: route('rates.approvals'),
                routeName: 'rates.approvals',
                icon: Stamp,
                roles: [ADMIN, SUPERADMIN],
            },
        ],
    },
    {
        name: 'METER READING',
        roles: [ADMIN, SUPERADMIN],
        items: [
            {
                title: 'Reading Scheduler',
                href: route('mrb.reading.schedule'),
                routeName: 'mrb.reading.scheduler',
                icon: CalendarCheck,
                roles: [ADMIN, SUPERADMIN],
            },
            {
                title: 'Reading Monitoring',
                href: route('mrb.reading-monitoring'),
                routeName: 'mrb.reading-monitoring',
                icon: TrendingUp,
                roles: [ADMIN, SUPERADMIN],
            },
            {
                title: 'Routes',
                href: route('mrb.routes'),
                routeName: 'mrb.routes',
                icon: Send,
                roles: [ADMIN, SUPERADMIN],
            },
            {
                title: 'Meter Readers',
                href: route('mrb.meter-readers'),
                routeName: 'mrb.meter-readers',
                icon: Users,
                roles: [ADMIN, SUPERADMIN],
            },
        ],
    },
    {
        name: 'Transactions',
        roles: [ADMIN, SUPERADMIN],
        items: [
            {
                title: 'Point of Payments',
                href: route('transactions.index'),
                routeName: 'transactions.index',
                icon: CreditCardIcon,
                roles: [ADMIN, SUPERADMIN],
            },
            {
                title: 'Transaction Series',
                href: route('transaction-series.index'),
                routeName: 'transaction-series.index',
                icon: Hash,
                roles: [ADMIN, SUPERADMIN],
            },
        ],
    },
    {
        name: 'Account Management',
        roles: [SUPERADMIN, ADMIN],
        items: [
            {
                title: 'Accounts',
                href: route('accounts.index'),
                routeName: 'accounts.index',
                icon: IdCard,
                roles: [ADMIN, SUPERADMIN],
            },
        ],
    },
    {
        name: 'Configurations',
        roles: [SUPERADMIN, ADMIN],
        items: [
            {
                title: 'Approval Flow System',
                href: '#',
                icon: Settings,
                roles: [ADMIN, SUPERADMIN],
                items: [
                    {
                        title: 'Approval Flows',
                        href: route('approval-flows.index'),
                        routeName: 'approval-flows.index',
                        icon: StepForward,
                        roles: [ADMIN, SUPERADMIN],
                    },
                ],
            },
        ],
    },
    {
        name: 'RBAC Management',
        roles: [SUPERADMIN, ADMIN],
        items: [
            {
                title: 'Manage Roles & Permissions',
                href: route('rbac.index'),
                routeName: 'rbac.index',
                icon: Shield,
                roles: [ADMIN, SUPERADMIN],
            },
        ],
    },
    {
        name: 'Miscellaneous',
        roles: [SUPERADMIN, ADMIN],
        items: [
            {
                title: 'Addresses',
                href: '#',
                icon: Map,
                roles: [ADMIN, SUPERADMIN],
                items: [
                    {
                        title: 'Towns',
                        href: route('addresses.towns.index'),
                        routeName: 'addresses.towns.index',
                        icon: MapPin,
                        roles: [ADMIN, SUPERADMIN],
                    },
                    {
                        title: 'Barangays',
                        href: route('addresses.barangays.index'),
                        routeName: 'addresses.barangays.indes',
                        icon: MapPin,
                        roles: [ADMIN, SUPERADMIN],
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
                <div className="sticky top-0 z-50 block bg-sidebar px-2 group-data-[collapsible=icon]:hidden">
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

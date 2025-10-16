// import { NavFooter } from '@/components/nav-footer';
import { NavMain, NavSubItem } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import {
    CircleGauge,
    ClipboardPlus,
    Clock,
    CreditCardIcon,
    FilePen,
    FilePlus,
    FolderOpen,
    Gauge,
    LayoutGrid,
    Settings,
    Shield,
    StepForward,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

const mainNavItems = {
    CRM: [
        {
            title: 'Dashboard',
            href: route('dashboard'),
            routeName: 'dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'New Application',
            href: route('applications.create'),
            routeName: 'applications.create',
            icon: FilePlus,
        },
        {
            title: 'All Applications',
            href: route('applications.index'),
            routeName: 'applications.index',
            icon: FolderOpen,
        },
        {
            title: 'Amendments',
            href: route('amendment-requests.index'),
            routeName: 'amendment-requests.index',
            icon: FilePen,
        },
        {
            title: 'Monitoring',
            href: '#',
            icon: CircleGauge,
            items: [
                {
                    title: 'Daily Monitoring',
                    href: '/campaigns/active',
                    routeName: 'campaigns.active', // Add route name if it exists
                    icon: Gauge,
                },
                {
                    title: 'Inspections',
                    href: route('inspections.index'),
                    routeName: 'inspections.index',
                    icon: ClipboardPlus,
                },
                {
                    title: 'Application Verification',
                    href: route('verify-applications.index'),
                    routeName: 'verify-applications.index',
                    icon: ClipboardPlus,
                },
            ],
        },
    ],
    Approvals: [
        {
            title: 'Pending Approvals',
            href: route('approvals.index'),
            routeName: 'approvals.index',
            icon: Clock,
        },
    ],
    Transactions: [
        {
            title: 'Point of Payments',
            href: route('transactions.index'),
            routeName: 'transactions.index',
            icon: CreditCardIcon,
        },
    ],
    Configurations: [
        {
            title: 'Approval Flow System',
            href: '#',
            icon: Settings, // Changed from Ellipsis to CircleGauge for a more relevant monitoring icon
            items: [
                {
                    title: 'Approval Flows',
                    href: route('approval-flows.index'),
                    routeName: 'approval-flows.index',
                    icon: StepForward, // Use Gauge for monitoring
                },
            ],
        },
    ],
    'RBAC Management': [
        {
            title: 'Manage Roles & Permissions',
            href: route('rbac.index'),
            routeName: 'rbac.index',
            icon: Shield,
        },
    ],
};

export function AppSidebar() {
    const [search, setSearch] = useState<string>('');

    type NavGroups = Record<string, NavSubItem[]>;

    const filterNavItems = (groups: NavGroups, query: string): NavGroups => {
        if (!query) return groups;

        const lowerQuery = query.toLowerCase();
        const filtered: NavGroups = {};

        Object.entries(groups).forEach(([groupName, items]) => {
            const filteredItems = items
                .map((item) => {
                    // Match self
                    const isMatch = item.title.toLowerCase().includes(lowerQuery);

                    // Match children (recursive filter)
                    const filteredChildren = item.items ? item.items.filter((sub) => sub.title.toLowerCase().includes(lowerQuery)) : [];

                    if (isMatch || filteredChildren.length > 0) {
                        return {
                            ...item,
                            items: filteredChildren.length > 0 ? filteredChildren : item.items,
                        };
                    }
                    return null;
                })
                .filter(Boolean) as NavSubItem[];

            if (filteredItems.length > 0) {
                filtered[groupName] = filteredItems;
            }
        });

        return filtered;
    };

    const filteredNavItems = filterNavItems(mainNavItems, search);

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

            <SidebarContent>
                <div className="px-2">
                    <Input
                        className="px-2 py-0 text-sidebar-foreground placeholder:text-sidebar-foreground"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

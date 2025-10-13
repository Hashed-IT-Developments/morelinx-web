// import { NavFooter } from '@/components/nav-footer';
import { NavMain, NavSubItem } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { BanknoteIcon, CircleGauge, ClipboardPlus, FilePlus, FolderOpen, Gauge, LayoutGrid, Ticket, Tickets } from 'lucide-react';
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
            title: 'Monitoring',
            href: '#',
            icon: CircleGauge,
            items: [
                {
                    title: 'Daily Monitoring',
                    href: '/campaigns/active',
                    icon: Gauge,
                },
                {
                    title: 'Inspections',
                    href: route('inspections.index'),
                    icon: ClipboardPlus,
                },
            ],
        },
    ],
    Tickets: [
        {
            title: 'KPI/Dashboard',
            href: '/x',
            icon: LayoutGrid,
        },
        {
            title: 'New Ticket',
            href: '/new-application',
            icon: Ticket,
        },
        {
            title: 'All Tickets',
            href: '/tickets',
            icon: Tickets,
        },
    ],
    'Reading and Billing': [
        {
            title: 'Dashboard',
            href: '/x',
            icon: LayoutGrid,
        },
        {
            title: 'Meter Reading',
            href: '/campaigns/more-menus',
            icon: CircleGauge,
            items: [
                {
                    title: 'Active',
                    href: '/campaigns/active',
                    icon: FolderOpen,
                },
                {
                    title: 'Drafts',
                    href: '/campaigns/drafts',
                    icon: FolderOpen,
                },
                {
                    title: 'Archived',
                    href: '/campaigns/archived',
                    icon: FolderOpen,
                },
            ],
        },
        {
            title: 'Billing',
            href: '/campaigns/more-menus',
            icon: BanknoteIcon,
            items: [
                {
                    title: 'Active',
                    href: '/campaigns/active',
                    icon: FolderOpen,
                },
                {
                    title: 'Drafts',
                    href: '/campaigns/drafts',
                    icon: FolderOpen,
                },
                {
                    title: 'Archived',
                    href: '/campaigns/archived',
                    icon: FolderOpen,
                },
            ],
        },
    ],
    'Collection Dashboard': [
        {
            title: 'Dashboard',
            href: '/x',
            icon: LayoutGrid,
        },
        {
            title: 'Cashiering Portal',
            href: '/new-application',
            icon: BanknoteIcon,
        },
        {
            title: 'Daily Collection Report',
            href: '/collections',
            icon: ClipboardPlus,
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
                            <Link href="/dashboard" prefetch>
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

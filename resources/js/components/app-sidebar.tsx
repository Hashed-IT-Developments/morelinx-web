// import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { FilePlus, FolderOpen, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'New Application',
        href: '/new-application',
        icon: FilePlus,
    },
    {
        title: 'All Applications',
        href: '/applications',
        icon: FolderOpen,
    },
];

export function AppSidebar() {
    const [search, setSearch] = useState<string>('');

    const filterNavItems = (items: NavItem[], query: string) => {
        if (!query) return items;
        return items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
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
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <Input
                    className="px-2 py-0 text-sidebar-foreground placeholder:text-sidebar-foreground"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <ThemeToggle />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

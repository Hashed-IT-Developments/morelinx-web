import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useRouteActive } from '@/composables/useRouteActive';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { NavCollapsibleGroup } from './nav-collapsible';
import { Separator } from './ui/separator';

export type NavSubItem = {
    title: string;
    href: string;
    routeName?: string; // Add support for Ziggy route names
    icon?: React.ComponentType<{ className?: string }>;
    items?: NavItem[];
};

export type NavGroups = {
    [groupName: string]: NavSubItem[];
};

export type NavMainProps = {
    items: NavGroups;
};

export function NavMain({ items = {} }: NavMainProps) {
    const page = usePage();
    const { isRouteActive } = useRouteActive();

    return (
        <>
            {Object.entries(items).map(([groupName, groupItems], index, array) => (
                <div key={groupName}>
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel className="mb-2 text-sm">{groupName}</SidebarGroupLabel>
                        <SidebarMenu>
                            {groupItems.map((subItem) =>
                                subItem.items ? (
                                    <NavCollapsibleGroup key={subItem.title} label={subItem.title} items={subItem.items} icon={subItem.icon} />
                                ) : (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isRouteActive(page.url, subItem.href, subItem.routeName)}
                                            tooltip={{ children: subItem.title }}
                                        >
                                            <Link href={subItem.href} prefetch>
                                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ),
                            )}
                        </SidebarMenu>
                    </SidebarGroup>

                    {index < array.length - 1 && <Separator className="my-2" />}
                </div>
            ))}
        </>
    );
}

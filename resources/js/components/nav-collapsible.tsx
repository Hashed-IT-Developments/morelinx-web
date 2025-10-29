import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useRouteActive } from '@/composables/useRouteActive';
import { NavItem, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import * as React from 'react';

interface NavCollapsibleGroupProps {
    label: string;
    items: NavItem[];
    icon?: React.ComponentType<{ className?: string }>;
    defaultOpen?: boolean;
}

export function NavCollapsibleGroup({ label, items, icon: Icon, defaultOpen = false }: NavCollapsibleGroupProps) {
    const page = usePage();
    const { isRouteActive, hasActiveChild } = useRouteActive();

    const hasActiveChildItem = hasActiveChild(items, page.url);

    const shouldOpen = defaultOpen || hasActiveChildItem;

    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            isActive={hasActiveChildItem}
                            tooltip={{ children: label }}
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            <span className="sr-only">{label}</span>
                            <ChevronRight className="ml-auto h-3 w-3" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="right"
                        align="start"
                        className="min-w-48"
                        onClick={(e) => e.stopPropagation()}
                        onCloseAutoFocus={(e) => e.preventDefault()}
                        sideOffset={8}
                    >
                        {items.map((item) => {
                            const itemWithRoute = item as NavItem & { routeName?: string };
                            const isItemActive = isRouteActive(page.url, item.href, itemWithRoute.routeName);

                            return (
                                auth.user.roles.some((role) => item.roles.includes(role.name)) && (
                                    <DropdownMenuItem
                                        key={item.title}
                                        asChild
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            router.visit(item.href);
                                        }}
                                    >
                                        <div
                                            className={`flex cursor-pointer items-center gap-2 ${isItemActive ? 'bg-accent text-accent-foreground' : ''}`}
                                        >
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </div>
                                    </DropdownMenuItem>
                                )
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>

            <div className="block group-data-[collapsible=icon]:hidden">
                <Collapsible defaultOpen={shouldOpen} className="group/collapsible">
                    <SidebarGroup>
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger
                                className={`flex w-full cursor-pointer items-center rounded-md p-2 transition-colors group-data-[state=open]/collapsible:bg-sidebar-accent group-data-[state=open]/collapsible:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                                    hasActiveChildItem
                                        ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground [&>*]:text-sidebar-accent-foreground'
                                        : ''
                                }`}
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                                <span className="ml-2 text-sm">{label}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>

                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu className="mt-2 pl-2">
                                    {items.map((item) => {
                                        return (
                                            auth.user.roles.some((role) => item.roles.includes(role.name)) && (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={isRouteActive(page.url, item.href)}
                                                        tooltip={{ children: item.title }}
                                                    >
                                                        <Link href={item.href} prefetch className="flex items-center gap-2">
                                                            {item.icon && <item.icon className="h-4 w-4" />}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            </div>
        </>
    );
}

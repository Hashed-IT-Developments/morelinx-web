import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
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

    return (
        <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
            <SidebarGroup>
                <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="flex w-full cursor-pointer items-center rounded-md p-2 transition-colors group-data-[state=open]/collapsible:bg-sidebar-accent group-data-[state=open]/collapsible:text-accent-foreground hover:bg-sidebar-accent hover:text-accent-foreground">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="ml-2 text-sm">{label}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent>
                    <SidebarGroupContent>
                        <SidebarMenu className="mt-2 pl-2">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                        <Link href={item.href} prefetch className="flex items-center gap-2">
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
}

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useRouteActive } from '@/composables/useRouteActive';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { NavCollapsibleGroup } from './nav-collapsible';
import { Separator } from './ui/separator';

export type NavSubItem = {
    title: string;
    href: string;
    routeName?: string;
    icon?: React.ComponentType<{ className?: string }>;
    items?: NavItem[];
    roles: string[];
};

export type NavGroups = {
    name: string;
    items: NavSubItem[];
    roles: string[];
};

export type NavMainProps = {
    items: NavGroups[];
};

export function NavMain({ items = [] }: NavMainProps) {
    const page = usePage();
    const { isRouteActive, hasActiveChild } = useRouteActive();
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            {items.map((item, index) => {
                return auth.user.roles.some((role: { name: string }) => item.roles.includes(role.name)) ? (
                    <div key={item.name}>
                        <SidebarGroup className="px-2 py-0">
                            <SidebarGroupLabel className="mb-2 text-sm">{item.name}</SidebarGroupLabel>
                            <SidebarMenu>
                                {item.items.map((subItem) =>
                                    subItem.items
                                        ? auth.user.roles.some((role: { name: string }) => subItem.roles.includes(role.name)) && (
                                              <NavCollapsibleGroup
                                                  key={subItem.title}
                                                  label={subItem.title}
                                                  items={subItem.items}
                                                  icon={subItem.icon}
                                                  defaultOpen={hasActiveChild(subItem.items, page.url)}
                                              />
                                          )
                                        : auth.user.roles.some((role: { name: string }) => subItem.roles.includes(role.name)) && (
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
                        {index < items.length - 1 && <Separator className="my-2" />}
                    </div>
                ) : null;
            })}
        </>
    );
}

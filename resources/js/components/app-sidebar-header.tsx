import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Button from './composables/button';

type Notification = {
    id: number;
    title: string;
    description: string;
    link: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
};
type AppSidebarHeaderProps = {
    breadcrumbs?: BreadcrumbItemType[];
};

type NotificationPageProps = {
    notifications: Notification[];
};

export function AppSidebarHeader({ breadcrumbs = [] }: AppSidebarHeaderProps) {
    const props = usePage<NotificationPageProps>().props;

    const [notifications, setNotifications] = useState<Notification[]>(props.notifications);

    const handleOpenNotifications = (link: string) => {
        router.get(link);
    };

    useEffect(() => {
        setNotifications(props.notifications);
    }, [props.notifications]);
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="cursor-pointer">
                        <Bell />
                    </Button>
                </SheetTrigger>
                <SheetContent className="gap-0">
                    <SheetHeader className="border-b border-gray-300">
                        <SheetTitle>Notifications</SheetTitle>
                        <SheetDescription></SheetDescription>
                    </SheetHeader>

                    <ul className="borders mt-0 divide-y divide-gray-200">
                        {notifications?.length > 0 ? (
                            notifications.map((notification: Notification) => (
                                <li key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleOpenNotifications(notification.link);
                                        }}
                                        className="block"
                                    >
                                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                        <p className="mt-1 text-sm text-gray-500">{notification.description}</p>
                                        <p className="mt-1 text-xs text-gray-400">{moment(notification.created_at).format('LLL')}</p>
                                    </a>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-3 text-center text-sm text-gray-500">No notifications found.</li>
                        )}
                    </ul>
                </SheetContent>
            </Sheet>
        </header>
    );
}

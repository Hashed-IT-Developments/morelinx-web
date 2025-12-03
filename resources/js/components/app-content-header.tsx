import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SharedData, type BreadcrumbItem as BreadcrumbItemType } from '@/types';

import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Button from './composables/button';

import useNotificationMethod from '@/hooks/useNotificationMethod';

import { cn } from '@/lib/utils';

const echo = window.Echo;

type AppSidebarHeaderProps = {
    breadcrumbs: BreadcrumbItemType[];
};

type Notification = {
    id: number;
    title: string;
    description: string;
    link: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
};

export function AppContentHeader({ breadcrumbs }: AppSidebarHeaderProps) {
    const { getNotifications } = useNotificationMethod();
    const { props } = usePage<SharedData>();
    const [notificationCount, setNotificationCount] = useState<number>(props.notification_count ?? 0);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleOpenNotifications = (link: string, id: number) => {
        const route = link + '&&notification_id=' + id;
        router.visit(route);
        setIsSheetOpen(false);
    };

    const fetchNotifications = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const userId = props.auth.user.id;
            const response = await getNotifications(userId);

            if (response && response.data) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getNotifications, props.auth.user.id, isLoading]);

    const handleSheetOpenChange = useCallback(
        (open: boolean) => {
            setIsSheetOpen(open);
            if (open && !isLoading) fetchNotifications();
        },
        [isLoading, fetchNotifications],
    );

    const userId = props.auth.user.id;

    useEffect(() => {
        const privateChannel = echo.private(`App.Models.User.${userId}`);
        privateChannel.listen('.CreatedNotification', (notification: Notification) => {
            setNotifications((prevNotifications) => [notification, ...prevNotifications]);
            setNotificationCount((prevCount) => (prevCount ? prevCount + 1 : 1));
        });

        return () => {
            privateChannel.stopListening('.CreatedNotification');
        };
    }, [userId]);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="relative cursor-pointer">
                        <Bell />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {notificationCount}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent className="m-2 h-[97%] gap-0 rounded-lg p-0">
                    <SheetHeader className="border-b border-gray-300">
                        <SheetTitle>Notifications</SheetTitle>
                        <SheetDescription></SheetDescription>
                    </SheetHeader>
                    <section className="max-h-[80vh] overflow-y-auto p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-sm text-gray-500">Loading notifications...</p>
                            </div>
                        ) : (
                            <ul className="p-0">
                                {notifications?.length > 0 ? (
                                    notifications.map((notification: Notification) => (
                                        <li
                                            onClick={() => {
                                                handleOpenNotifications(notification.link, notification.id);
                                            }}
                                            key={notification.id}
                                            className={cn(
                                                'py- cursor-pointer px-4 py-3 shadow-xs hover:bg-gray-50',
                                                !notification?.is_read && 'border-l-4 border-blue-500',
                                            )}
                                        >
                                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                            <p className="mt-1 text-sm text-gray-500">{notification.description}</p>
                                            <p className="mt-1 text-xs text-gray-400">{moment(notification.created_at).format('LLL')}</p>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-3 text-center text-sm text-gray-500">No notifications found.</li>
                                )}
                            </ul>
                        )}
                    </section>
                    <SheetFooter className="flex-row justify-end">
                        <Button variant="outline">Delete All</Button>
                        <Button> Mark as All Read</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </header>
    );
}

import AppLayout from '@/layouts/app-layout';

import { useState } from 'react';
import AssignTicketDepartment from './components/assign-ticket-department';
import AssignTicketUser from './components/assign-ticket-user';
import ViewTicketHistory from './components/view-ticket-history';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import UpdateTicket from './components/update-ticket';

interface MyTicketsProps {
    tickets: PaginatedData & { data: Ticket[] };
    status?: string;
}

import { router } from '@inertiajs/react';
import MyTicketTab from './components/my-ticket-tab';

export default function MyTickets({ tickets, status }: MyTicketsProps) {
    const breadcrumbs = [{ title: 'Tickets', href: '/tickets' }];

    const [isOpenViewTicketHistory, setIsOpenViewTicketHistory] = useState(false);

    const [isOpenAssignTicketDepartment, setIsOpenAssignTicketDepartment] = useState(false);
    const [isOpenAssignTicketUser, setIsOpenAssignTicketUser] = useState(false);

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isOpenUpdateTicket, setIsOpenUpdateTicket] = useState(false);

    const handleToggleIsOpenUpdateTicket = (open: boolean) => {
        setIsOpenUpdateTicket(open);
    };

    const handleSelectTicket = (ticketId: number) => {
        router.visit(route('tickets.view', { ticket_id: ticketId }));
    };

    const handleTabChange = (value: string) => {
        router.visit(route('tickets.my-tickets'), {
            data: { status: value },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AssignTicketDepartment ticket={selectedTicket} isOpen={isOpenAssignTicketDepartment} setIsOpen={setIsOpenAssignTicketDepartment} />
            <AssignTicketUser ticket={selectedTicket} isOpen={isOpenAssignTicketUser} setIsOpen={setIsOpenAssignTicketUser} />
            <ViewTicketHistory isOpen={isOpenViewTicketHistory} setIsOpen={setIsOpenViewTicketHistory} />
            <UpdateTicket ticket={selectedTicket} isOpen={isOpenUpdateTicket} setIsOpen={handleToggleIsOpenUpdateTicket} />

            <Tabs
                defaultValue={status ? status : 'pending'}
                className="mt-4 w-full px-4"
                onValueChange={(value) => {
                    handleTabChange(value);
                }}
            >
                <TabsList>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="executed">Executed</TabsTrigger>
                    <TabsTrigger value="not_executed">Not Executed</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    <MyTicketTab
                        tickets={tickets}
                        status={status}
                        setSelectedTicket={setSelectedTicket}
                        handleSelectTicket={handleSelectTicket}
                        setIsOpenAssignTicketDepartment={setIsOpenAssignTicketDepartment}
                        setIsOpenAssignTicketUser={setIsOpenAssignTicketUser}
                        setIsOpenUpdateTicket={setIsOpenUpdateTicket}
                    />
                </TabsContent>
                <TabsContent value="executed">
                    <MyTicketTab
                        tickets={tickets}
                        status={status}
                        setSelectedTicket={setSelectedTicket}
                        handleSelectTicket={handleSelectTicket}
                        setIsOpenAssignTicketDepartment={setIsOpenAssignTicketDepartment}
                        setIsOpenAssignTicketUser={setIsOpenAssignTicketUser}
                        setIsOpenUpdateTicket={setIsOpenUpdateTicket}
                    />
                </TabsContent>
                <TabsContent value="not_executed">
                    <MyTicketTab
                        tickets={tickets}
                        status={status}
                        setSelectedTicket={setSelectedTicket}
                        handleSelectTicket={handleSelectTicket}
                        setIsOpenAssignTicketDepartment={setIsOpenAssignTicketDepartment}
                        setIsOpenAssignTicketUser={setIsOpenAssignTicketUser}
                        setIsOpenUpdateTicket={setIsOpenUpdateTicket}
                    />
                </TabsContent>
                <TabsContent value="completed">
                    <MyTicketTab
                        tickets={tickets}
                        status={status}
                        setSelectedTicket={setSelectedTicket}
                        handleSelectTicket={handleSelectTicket}
                        setIsOpenAssignTicketDepartment={setIsOpenAssignTicketDepartment}
                        setIsOpenAssignTicketUser={setIsOpenAssignTicketUser}
                        setIsOpenUpdateTicket={setIsOpenUpdateTicket}
                    />
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}

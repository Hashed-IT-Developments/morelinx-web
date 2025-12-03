import Button from '@/components/composables/button';
import Options from '@/components/composables/options';
import AppLayout from '@/layouts/app-layout';
import { router, WhenVisible } from '@inertiajs/react';
import { EllipsisVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddTicketType from './components/add-ticket-type';
import EditTicketType from './components/edit-ticket-type';

interface TicketSettingsProps {
    ticket_types: TicketType[];
    concern_types: TicketType[];
    actual_findings_types: TicketType[];
    channels: TicketType[];
}

export default function TicketSettings({ ticket_types, concern_types, actual_findings_types, channels }: TicketSettingsProps) {
    const [isOpenEditTicketType, setIsOpenEditTicketType] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [selectedTicketType, setSelectedTicketType] = useState<string>('');
    const handleEdit = (ticket: TicketType, type: string) => {
        setSelectedTicket(ticket);
        setSelectedTicketType(type);
        setIsOpenEditTicketType(true);
    };

    useEffect(() => {
        if (!isOpenEditTicketType) {
            setSelectedTicket(null);
            setSelectedTicketType('');
        }
    }, [isOpenEditTicketType]);

    const handleDeleteTicketType = (ticket: TicketType, type: string) => {
        router.delete(`/tickets/settings/ticket/${type}/delete`, {
            data: { id: ticket.id },
            onSuccess: () => {
                toast.success('Ticket type deleted successfully');
            },
            onError: (error: { message?: string }) => {
                toast.error('Failed to delete ticket type' + (error?.message ? `: ${error.message}` : ''));
            },
        });
    };

    const breadcrumbs = [{ title: 'Settings', href: '/tickets/settings' }];

    return (
        <main>
            <AppLayout breadcrumbs={breadcrumbs}>
                {selectedTicket && (
                    <EditTicketType
                        isOpenEditTicketType={isOpenEditTicketType}
                        setIsOpenEditTicketType={setIsOpenEditTicketType}
                        ticket={selectedTicket}
                        type={selectedTicketType}
                    />
                )}

                <section className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                            <h1 className="text-base font-semibold text-gray-800">Ticket Types</h1>
                            <AddTicketType type="ticket_type" />
                        </div>
                        <div>
                            <div>
                                <WhenVisible
                                    data="ticket_types"
                                    fallback={
                                        <div className="flex items-center justify-center py-8 text-center text-sm font-medium text-gray-500">
                                            <span>Loading...</span>
                                        </div>
                                    }
                                >
                                    {ticket_types?.length > 0 ? (
                                        ticket_types.map((type) => (
                                            <div
                                                key={type.id}
                                                className="flex items-center justify-between border-b px-4 py-2 text-xs transition last:border-b-0 hover:bg-gray-50"
                                            >
                                                <div className="flex-1 text-gray-700">{type.name}</div>
                                                <div className="w-40 space-x-2 text-right text-xs text-gray-400">
                                                    <Options
                                                        onEdit={() => {
                                                            handleEdit(type, 'ticket_type');
                                                        }}
                                                        onDelete={() => {
                                                            handleDeleteTicketType(type, 'ticket_type');
                                                        }}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <EllipsisVertical />
                                                        </Button>
                                                    </Options>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <small>No Ticket Types Found</small>
                                        </div>
                                    )}
                                </WhenVisible>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                            <h1 className="text-base font-semibold text-gray-800">Nature of Concerns </h1>
                            <AddTicketType type="concern_type" />
                        </div>
                        <div>
                            <div>
                                <WhenVisible
                                    data="concern_types"
                                    fallback={
                                        <div className="flex items-center justify-center py-8 text-center text-sm font-medium text-gray-500">
                                            <span>Loading...</span>
                                        </div>
                                    }
                                >
                                    {concern_types?.length > 0 ? (
                                        concern_types.map((type) => (
                                            <div
                                                key={type.id}
                                                className="flex items-center justify-between border-b px-4 py-2 text-xs transition last:border-b-0 hover:bg-gray-50"
                                            >
                                                <div className="flex-1 text-gray-700">{type.name}</div>
                                                <div className="w-40 space-x-2 text-right text-xs text-gray-400">
                                                    <Options
                                                        onEdit={() => {
                                                            handleEdit(type, 'concern_type');
                                                        }}
                                                        onDelete={() => {
                                                            handleDeleteTicketType(type, 'concern_type');
                                                        }}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <EllipsisVertical />
                                                        </Button>
                                                    </Options>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <small>No Nature of Concerns Found</small>
                                        </div>
                                    )}
                                </WhenVisible>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                            <h1 className="text-base font-semibold text-gray-800">Actual Findings</h1>
                            <AddTicketType type="actual_findings_type" />
                        </div>
                        <div>
                            <div>
                                <WhenVisible
                                    data="actual_findings_types"
                                    fallback={
                                        <div className="flex items-center justify-center py-8 text-center text-sm font-medium text-gray-500">
                                            <span>Loading...</span>
                                        </div>
                                    }
                                >
                                    {actual_findings_types?.length > 0 ? (
                                        actual_findings_types.map((type) => (
                                            <div
                                                key={type.id}
                                                className="flex items-center justify-between border-b px-4 py-2 text-xs transition last:border-b-0 hover:bg-gray-50"
                                            >
                                                <div className="flex-1 text-gray-700">{type.name}</div>
                                                <div className="w-40 space-x-2 text-right text-xs text-gray-400">
                                                    <Options
                                                        onEdit={() => {
                                                            handleEdit(type, 'actual_findings_type');
                                                        }}
                                                        onDelete={() => {
                                                            handleDeleteTicketType(type, 'actual_findings_type');
                                                        }}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <EllipsisVertical />
                                                        </Button>
                                                    </Options>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <small>No Actual Findings Found</small>
                                        </div>
                                    )}
                                </WhenVisible>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                            <h1 className="text-base font-semibold text-gray-800">Channels</h1>
                            <AddTicketType type="channel" />
                        </div>
                        <div>
                            <div>
                                <WhenVisible
                                    data="channels"
                                    fallback={
                                        <div className="flex items-center justify-center py-8 text-center text-sm font-medium text-gray-500">
                                            <span>Loading...</span>
                                        </div>
                                    }
                                >
                                    {channels?.length > 0 ? (
                                        channels.map((type) => (
                                            <div
                                                key={type.id}
                                                className="flex items-center justify-between border-b px-4 py-2 text-xs transition last:border-b-0 hover:bg-gray-50"
                                            >
                                                <div className="flex-1 text-gray-700">{type.name}</div>
                                                <div className="w-40 space-x-2 text-right text-xs text-gray-400">
                                                    <Options
                                                        onEdit={() => {
                                                            handleEdit(type, 'channel');
                                                        }}
                                                        onDelete={() => {
                                                            handleDeleteTicketType(type, 'channel');
                                                        }}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <EllipsisVertical />
                                                        </Button>
                                                    </Options>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <small>No Channels Found</small>
                                        </div>
                                    )}
                                </WhenVisible>
                            </div>
                        </div>
                    </div>
                </section>
            </AppLayout>
        </main>
    );
}

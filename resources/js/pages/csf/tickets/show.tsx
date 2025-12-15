import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { getStatusColor } from '@/lib/status-utils';
import { router, WhenVisible } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, EllipsisVertical, FileText, MapPin, Timer, User, Users, Verified } from 'lucide-react';
import moment from 'moment';

interface ViewTicketProps {
    ticket: Ticket;
}

import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatSplitWords, formatUpperCaseWords } from '@/lib/utils';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import AssignTicketUser from './components/assign-ticket-user';

export default function ViewTicket({ ticket }: ViewTicketProps) {
    const [isOpenAssignTicket, setIsOpenAssignTicket] = useState(false);
    const [isOpenAlertCompletedDialog, setIsOpenAlertCompletedDialog] = useState(false);
    const [isOpenAlertNotExecutedDialog, setIsOpenAlertNotExecutedDialog] = useState(false);
    const breadcrumbs = [
        { title: 'My CSF', href: '/tickets/my-tickets' },
        {
            title: ticket ? ticket.ticket_no : 'Loading...',
            href: ticket ? `/tickets/${ticket.id}` : '#',
        },
    ];

    const handleTicketStatusUpdate = (status: string) => {
        router.patch(
            route('tickets.status-update'),
            {
                ticket_id: ticket.id,
                status,
            },
            {
                onSuccess: () => {
                    toast.success('Ticket status updated successfully');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AssignTicketUser ticket={ticket} isOpen={isOpenAssignTicket} setIsOpen={setIsOpenAssignTicket} />

            <AlertDialog
                isOpen={isOpenAlertCompletedDialog}
                setIsOpen={setIsOpenAlertCompletedDialog}
                title="Mark Ticket as Completed"
                description="Are you sure you want to mark this ticket as completed?"
                onConfirm={() => {
                    handleTicketStatusUpdate('completed');
                }}
            />

            <AlertDialog
                isOpen={isOpenAlertNotExecutedDialog}
                setIsOpen={setIsOpenAlertNotExecutedDialog}
                title="Mark Ticket as Ubnresolved"
                description="Are you sure you want to mark this ticket as unresolved?"
                onConfirm={() => {
                    handleTicketStatusUpdate('unresolved');
                }}
            />

            <WhenVisible
                data="ticket"
                fallback={() => (
                    <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                        <span className="text-sm font-medium text-gray-500">Loading...</span>
                    </div>
                )}
            >
                {ticket ? (
                    <div className="space-y-6 px-4 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="mb-2 flex items-center gap-3">
                                    <FileText className="h-5 w-5" />
                                    <h1 className="text-2xl font-bold">{ticket.ticket_no}</h1>
                                </div>
                                <span>{moment(ticket.created_at).format('MMM DD, YYYY - hh:mm A')}</span>
                                <Badge className={getStatusColor(ticket.status)}>{formatUpperCaseWords(formatSplitWords(ticket.status))}</Badge>
                            </div>

                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <EllipsisVertical />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setIsOpenAssignTicket(true);
                                        }}
                                    >
                                        Forward
                                    </DropdownMenuItem>

                                    {ticket.status !== 'completed' && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setIsOpenAlertCompletedDialog(true);
                                            }}
                                        >
                                            Mark as Completed
                                        </DropdownMenuItem>
                                    )}

                                    {ticket.status === 'completed' && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setIsOpenAlertNotExecutedDialog(true);
                                            }}
                                        >
                                            Mark as Not Executed
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Timer className="h-5 w-5" />
                                Timeline
                            </h3>

                            <section className="flex flex-wrap items-center gap-4">
                                {ticket?.logs.map((log, index) => {
                                    const currentTime = moment(log.created_at);
                                    const nextLog = ticket.logs[index + 1];

                                    let gapText = null;

                                    if (nextLog) {
                                        const nextTime = moment(nextLog.created_at);
                                        const duration = moment.duration(nextTime.diff(currentTime));

                                        const days = Math.floor(duration.asDays());
                                        const hours = duration.hours();
                                        const minutes = duration.minutes();

                                        if (days > 0) {
                                            gapText = `${days}d ${hours}h`;
                                        } else if (hours > 0) {
                                            gapText = `${hours}h ${minutes}m`;
                                        } else {
                                            gapText = `${minutes}m`;
                                        }
                                    }

                                    return (
                                        <Fragment key={log.id}>
                                            <div className="rounded-lg border bg-gray-50 p-3">
                                                <p className="text-sm font-medium">{log.title}</p>
                                                <p className="text-xs text-gray-500">{currentTime.format('MMM DD, YYYY - hh:mm A')}</p>
                                            </div>

                                            {gapText && (
                                                <div className="flex flex-col items-center text-xs text-gray-400">
                                                    <ArrowRight />
                                                    <span>{gapText}</span>
                                                </div>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </section>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <User className="h-5 w-5" />
                                Customer Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Consumer Name</label>
                                    <p className="text-sm font-medium">{ticket.cust_information.consumer_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Caller Name</label>
                                    <p className="text-sm font-medium">{ticket.cust_information.caller_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Account ID</label>
                                    <p className="text-sm">{ticket.cust_information.account_id || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <MapPin className="h-5 w-5" />
                                Location Details
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Full Address</label>
                                    <p className="text-sm">{ticket.cust_information.barangay.full_text}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Sitio</label>
                                    <p className="text-sm">{ticket.cust_information.sitio}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Landmark</label>
                                    <p className="text-sm">{ticket.cust_information.landmark}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">District & Feeder</label>
                                    <p className="text-sm">
                                        District {ticket.cust_information.town.district} - {ticket.cust_information.town.feeder}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <AlertTriangle className="h-5 w-5" />
                                Issue Details
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Channel</label>
                                    <p className="rounded border bg-gray-50 p-3 text-sm">{ticket.details.channel.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Concern Type</label>
                                    <p className="rounded border bg-gray-50 p-3 text-sm">{ticket.details.concern_type.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Concern</label>
                                    <p className="rounded border bg-gray-50 p-3 text-sm">{ticket.details.concern}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Reason</label>
                                    <p className="rounded border bg-gray-50 p-3 text-sm">{ticket.details.reason}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Remarks</label>
                                    <p className="rounded border bg-gray-50 p-3 text-sm">{ticket.details.remarks}</p>
                                </div>
                            </div>
                        </div>
                        <Separator />

                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Verified className="h-5 w-5" />
                                Findings
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Actual Findings</label>
                                    <p className="rounded border bg-gray-50 p-3 text-sm">{ticket.details?.actual_finding?.name}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Users className="h-5 w-5" />
                                Assigned Users ({ticket.assigned_users.length})
                            </h3>
                            <div className="space-y-3">
                                {ticket.assigned_users.map((assignedUser) => (
                                    <div key={assignedUser.id} className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                {assignedUser.user.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{assignedUser.user.name}</p>
                                            <p className="text-xs text-gray-600">{assignedUser.user.email}</p>
                                            <p className="text-xs text-gray-500">
                                                Assigned: {moment(assignedUser.created_at).format('MMM DD, YYYY - hh:mm A')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <FileText className="h-5 w-5" />
                                Logs
                            </h3>
                            <div className="space-y-3">
                                {ticket?.logs.length > 0 ? (
                                    ticket?.logs.map((log) => (
                                        <div key={log.id} className="rounded-lg border bg-gray-50 p-3">
                                            <p className="text-sm font-medium">{log.description}</p>
                                            <p className="text-xs text-gray-500">{moment(log.created_at).format('MMM DD, YYYY - hh:mm A')}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No logs available for this ticket.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                        <span className="text-sm font-medium text-gray-500">Ticket not found.</span>
                    </div>
                )}
            </WhenVisible>
        </AppLayout>
    );
}

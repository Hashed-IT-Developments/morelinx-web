import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Building2, Calendar, Mail, MapPin, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Inspection {
    id: number;
    status: string;
    house_loc?: string;
    meter_loc?: string;
    bill_deposit: number;
    material_deposit: number;
    remarks?: string;
    created_at: string;
    updated_at: string;
}

interface CustomerApplication {
    id: number;
    account_number: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    email_address?: string;
    mobile_1?: string;
    created_at: string;
    barangay?: {
        id: number;
        name: string;
        town?: {
            id: number;
            name: string;
        };
    };
    customer_type?: {
        id: number;
        name: string;
    };
    inspections: Inspection[];
}

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
        inspection: {
            id: number;
            status: string;
            house_loc?: string;
            meter_loc?: string;
            bill_deposit: number;
            material_deposit: number;
            remarks?: string;
        };
        customerApplication: CustomerApplication;
    };
}

interface ScheduleCalendarProps {
    applications: {
        data: CustomerApplication[];
    };
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'scheduled':
            return {
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                textColor: 'white',
            };
        case 'approved':
            return {
                backgroundColor: '#10b981',
                borderColor: '#059669',
                textColor: 'white',
            };
        case 'pending':
            return {
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                textColor: 'white',
            };
        case 'rejected':
            return {
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                textColor: 'white',
            };
        default:
            return {
                backgroundColor: '#6b7280',
                borderColor: '#4b5563',
                textColor: 'white',
            };
    }
};

export default function ScheduleCalendar({ applications }: ScheduleCalendarProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<{
        inspection: Inspection;
        customerApplication: CustomerApplication;
    } | null>(null);

    // Close any FullCalendar popovers when dialog opens
    useEffect(() => {
        if (isDialogOpen) {
            const popovers = document.querySelectorAll('.fc-popover');
            popovers.forEach((popover) => {
                if (popover.parentNode) {
                    popover.parentNode.removeChild(popover);
                }
            });
        }
    }, [isDialogOpen]);

    const events: CalendarEvent[] = applications.data.flatMap(
        (app) =>
            app.inspections?.map((inspection: Inspection) => {
                const colors = getStatusColor(inspection.status);
                return {
                    id: `${app.id}-${inspection.id}`,
                    title: `${app.first_name} ${app.last_name} - ${inspection.status}`,
                    date: inspection.created_at.split(' ')[0], // Extract date part
                    backgroundColor: colors.backgroundColor,
                    borderColor: colors.borderColor,
                    textColor: colors.textColor,
                    extendedProps: {
                        inspection,
                        customerApplication: app,
                    },
                };
            }) || [],
    );

    const handleEventClick = (info: EventClickArg) => {
        const { inspection, customerApplication } = info.event.extendedProps;
        setSelectedEvent({ inspection, customerApplication });
        setIsDialogOpen(true);
    };

    const getBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'scheduled':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getFullName = (customer: CustomerApplication) => {
        const parts = [customer.first_name, customer.middle_name, customer.last_name, customer.suffix].filter(Boolean);
        return parts.join(' ');
    };

    const getFullAddress = (customer: CustomerApplication) => {
        const parts = [customer.barangay?.name, customer.barangay?.town?.name].filter(Boolean);
        return parts.join(', ') || 'Address not specified';
    };

    return (
        <>
            <div className="w-full">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    events={events}
                    eventClick={handleEventClick}
                    height="auto"
                    dayMaxEvents={3}
                    moreLinkClick="popover"
                    eventDisplay="block"
                    displayEventTime={false}
                    eventMouseEnter={(info) => {
                        info.el.style.cursor = 'pointer';
                    }}
                    eventDidMount={(info) => {
                        // Add hover effect
                        info.el.addEventListener('mouseenter', () => {
                            info.el.style.opacity = '0.8';
                        });
                        info.el.addEventListener('mouseleave', () => {
                            info.el.style.opacity = '1';
                        });
                    }}
                />
            </div>

            {/* Dialog for event details */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="z-[9999] max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Inspection Details
                        </DialogTitle>
                        <DialogDescription>View detailed information about this inspection appointment.</DialogDescription>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-4">
                            {/* Customer Information */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">{getFullName(selectedEvent.customerApplication)}</h3>
                                            <Badge className={getBadgeColor(selectedEvent.inspection.status)}>
                                                {selectedEvent.inspection.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-gray-500" />
                                                <span className="text-gray-600">Account:</span>
                                                <span className="font-mono font-medium">{selectedEvent.customerApplication.account_number}</span>
                                            </div>

                                            {selectedEvent.customerApplication.email_address && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-600">Email:</span>
                                                    <span>{selectedEvent.customerApplication.email_address}</span>
                                                </div>
                                            )}

                                            {selectedEvent.customerApplication.mobile_1 && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-600">Mobile:</span>
                                                    <span>{selectedEvent.customerApplication.mobile_1}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <span className="text-gray-600">Address:</span>
                                                <span>{getFullAddress(selectedEvent.customerApplication)}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <span className="text-gray-600">Applied:</span>
                                                <span>{formatDate(selectedEvent.customerApplication.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Inspection Information */}
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="mb-3 font-medium">Inspection Details</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">House Location:</span>
                                            <p className="font-medium">{selectedEvent.inspection.house_loc || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Meter Location:</span>
                                            <p className="font-medium">{selectedEvent.inspection.meter_loc || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Bill Deposit:</span>
                                            <p className="font-medium">₱{selectedEvent.inspection.bill_deposit.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Material Deposit:</span>
                                            <p className="font-medium">₱{selectedEvent.inspection.material_deposit.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {selectedEvent.inspection.remarks && (
                                        <div className="mt-3">
                                            <span className="text-gray-600">Remarks:</span>
                                            <p className="mt-1 rounded bg-gray-50 p-2 text-sm">{selectedEvent.inspection.remarks}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

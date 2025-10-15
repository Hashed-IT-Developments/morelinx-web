import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from 'axios';
import { Building2, Calendar, Mail, MapPin, Phone, User } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

interface CalendarInspection {
    id: number;
    status: string;
    schedule_date: string;
    house_loc?: string;
    meter_loc?: string;
    bill_deposit?: number;
    remarks?: string;
    inspector?: {
        id: number;
        name: string;
    };
    customer_application: {
        id: string;
        first_name: string;
        middle_name?: string;
        last_name: string;
        suffix?: string;
        full_address: string;
        account_number: string;
        email_address?: string;
        mobile_1?: string;
        created_at: string;
    };
}

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
        inspection: CalendarInspection;
        customerApplication: CalendarInspection['customer_application'];
    };
}

export interface ScheduleCalendarRef {
    refresh: () => void;
}

const getStatusColor = (status: string, scheduleDate?: string) => {
    switch (status.toLowerCase()) {
        case 'for_inspection':
            return {
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                textColor: 'white',
            };
        case 'for_inspection_approval':
            if (scheduleDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const scheduledDate = new Date(scheduleDate);
                scheduledDate.setHours(0, 0, 0, 0);

                if (scheduledDate < today) {
                    // Past date - red
                    return {
                        backgroundColor: '#ef4444',
                        borderColor: '#dc2626',
                        textColor: 'white',
                    };
                } else if (scheduledDate.getTime() === today.getTime()) {
                    // Today - blue
                    return {
                        backgroundColor: '#3b82f6',
                        borderColor: '#2563eb',
                        textColor: 'white',
                    };
                } else {
                    // Future date - green
                    return {
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        textColor: 'white',
                    };
                }
            }
            // Fallback if no schedule date
            return {
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                textColor: 'white',
            };
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

const ScheduleCalendar = forwardRef<ScheduleCalendarRef>((props, ref) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<{
        inspection: CalendarInspection;
        customerApplication: CalendarInspection['customer_application'];
    } | null>(null);
    const [inspections, setInspections] = useState<CalendarInspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fetch calendar data
    const fetchCalendarData = useCallback(async (date: Date) => {
        setLoading(true);
        try {
            const response = await axios.get('/inspections/calendar', {
                params: {
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                },
            });
            setInspections(response.data.data);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            setInspections([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Expose refresh method via ref
    useImperativeHandle(
        ref,
        () => ({
            refresh: () => {
                fetchCalendarData(currentDate);
            },
        }),
        [fetchCalendarData, currentDate],
    );

    // Fetch data when component mounts or date changes
    useEffect(() => {
        fetchCalendarData(currentDate);
    }, [fetchCalendarData, currentDate]);

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

    const events: CalendarEvent[] = inspections.map((inspection) => {
        const colors = getStatusColor(inspection.status, inspection.schedule_date);
        return {
            id: `${inspection.customer_application.id}-${inspection.id}`,
            title: `${inspection.customer_application.first_name} ${inspection.customer_application.last_name} - ${inspection.status}`,
            date: inspection.schedule_date ? inspection.schedule_date.split('T')[0] : '',
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            textColor: colors.textColor,
            extendedProps: {
                inspection,
                customerApplication: inspection.customer_application,
            },
        };
    });

    const handleEventClick = (info: EventClickArg) => {
        const { inspection, customerApplication } = info.event.extendedProps;
        setSelectedEvent({ inspection, customerApplication });
        setIsDialogOpen(true);
    };

    const getBadgeColor = (status: string, scheduleDate?: string) => {
        switch (status.toLowerCase()) {
            case 'for_inspection':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'for_inspection_approval':
                if (scheduleDate) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const scheduledDate = new Date(scheduleDate);
                    scheduledDate.setHours(0, 0, 0, 0);

                    if (scheduledDate < today) {
                        // Past date - red
                        return 'bg-red-100 text-red-800 border-red-200';
                    } else if (scheduledDate.getTime() === today.getTime()) {
                        // Today - blue
                        return 'bg-blue-100 text-blue-800 border-blue-200';
                    } else {
                        // Future date - green
                        return 'bg-green-100 text-green-800 border-green-200';
                    }
                }
                // Fallback if no schedule date
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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

    const getFullName = (customer: CalendarInspection['customer_application']) => {
        const parts = [customer.first_name, customer.middle_name, customer.last_name, customer.suffix].filter(Boolean);
        return parts.join(' ');
    };

    const getFullAddress = (customer: CalendarInspection['customer_application']) => {
        return customer.full_address;
    };

    return (
        <>
            <div className="w-full">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="text-gray-500">Loading calendar...</div>
                    </div>
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next',
                            center: 'title',
                            right: 'today',
                        }}
                        footerToolbar={{
                            center: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        events={events}
                        eventClick={handleEventClick}
                        datesSet={(dateInfo) => {
                            const newDate = new Date(dateInfo.view.currentStart);
                            newDate.setDate(15); // Set to middle of month to avoid timezone issues
                            if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
                                setCurrentDate(newDate);
                            }
                        }}
                        height="auto"
                        dayMaxEvents={2}
                        moreLinkClick="popover"
                        eventDisplay="block"
                        displayEventTime={false}
                        aspectRatio={1.2}
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
                        // Mobile-specific customizations
                        buttonText={{
                            today: 'Today',
                            month: 'Month',
                            week: 'Week',
                            day: 'Day',
                        }}
                    />
                )}
            </div>

            {/* Dialog for event details */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="z-[9999] mx-4 max-h-[90vh] max-w-lg overflow-y-auto sm:mx-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <User className="h-4 w-4 sm:h-5 sm:w-5" />
                            Inspection Details
                        </DialogTitle>
                        <DialogDescription className="text-sm">View detailed information about this inspection appointment.</DialogDescription>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-3 sm:space-y-4">
                            {/* Customer Information */}
                            <Card>
                                <CardContent className="p-3 sm:p-4">
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <h3 className="text-base font-semibold break-words sm:text-lg">
                                                {getFullName(selectedEvent.customerApplication)}
                                            </h3>
                                            <Badge
                                                className={`${getBadgeColor(selectedEvent.inspection.status, selectedEvent.inspection.schedule_date)} self-start`}
                                            >
                                                {selectedEvent.inspection.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            <div className="flex items-start gap-2">
                                                <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                                <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                                    <span className="font-medium text-gray-600">Account:</span>
                                                    <span className="font-mono font-medium break-all">
                                                        {selectedEvent.customerApplication.account_number}
                                                    </span>
                                                </div>
                                            </div>

                                            {selectedEvent.customerApplication.email_address && (
                                                <div className="flex items-start gap-2">
                                                    <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                                    <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                                        <span className="font-medium text-gray-600">Email:</span>
                                                        <span className="break-all">{selectedEvent.customerApplication.email_address}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedEvent.customerApplication.mobile_1 && (
                                                <div className="flex items-start gap-2">
                                                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                                    <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                                        <span className="font-medium text-gray-600">Mobile:</span>
                                                        <span>{selectedEvent.customerApplication.mobile_1}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-2">
                                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                                <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                                    <span className="font-medium text-gray-600">Address:</span>
                                                    <span className="break-words">{getFullAddress(selectedEvent.customerApplication)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                                <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                                    <span className="font-medium text-gray-600">Applied:</span>
                                                    <span className="text-xs sm:text-sm">
                                                        {formatDate(selectedEvent.customerApplication.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Inspection Information */}
                            <Card>
                                <CardContent className="p-3 sm:p-4">
                                    <h4 className="mb-3 text-sm font-medium sm:text-base">Inspection Details</h4>
                                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <span className="font-medium text-gray-600">Inspector:</span>
                                            <p className="font-medium">
                                                {'inspector' in selectedEvent.inspection && selectedEvent.inspection.inspector?.name
                                                    ? selectedEvent.inspection.inspector.name
                                                    : 'Not assigned'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-medium text-gray-600">Bill Deposit:</span>
                                            <p className="font-medium">₱{(selectedEvent.inspection.bill_deposit || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-medium text-gray-600">House Location:</span>
                                            <p className="font-medium break-words">{selectedEvent.inspection.house_loc || 'Not specified'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-medium text-gray-600">Meter Location:</span>
                                            <p className="font-medium break-words">{selectedEvent.inspection.meter_loc || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    {selectedEvent.inspection.remarks && (
                                        <div className="mt-3 space-y-1">
                                            <span className="font-medium text-gray-600">Remarks:</span>
                                            <p className="mt-1 rounded bg-gray-50 p-2 text-sm break-words dark:bg-gray-800">
                                                {selectedEvent.inspection.remarks}
                                            </p>
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
});

ScheduleCalendar.displayName = 'ScheduleCalendar';

export default ScheduleCalendar;

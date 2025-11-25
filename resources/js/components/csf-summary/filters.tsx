import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TicketType, User } from '@/types/csf-summary-report-types';
import { useState } from 'react';
import { DatePicker } from '../daily-monitoring/date-picker';

interface CsfSummaryFiltersProps {
    fromDate: string;
    toDate: string;
    ticketTypeId: string;
    concernTypeId: string;
    status: string;
    userId: string;
    ticketTypes: TicketType[]; // only ticket_type records
    concernTypes: TicketType[];
    users: User[];
    onFromDateChange: (date: string) => void;
    onToDateChange: (date: string) => void;
    onTicketTypeChange: (ticketTypeId: string) => void;
    onConcernTypeChange: (concernTypeId: string) => void;
    onStatusChange: (status: string) => void;
    onUserChange: (userId: string) => void;
    onFilter: () => void;
    onDownload: () => void;
}

export function CsfSummaryFilters({
    fromDate,
    toDate,
    ticketTypeId,
    concernTypeId,
    status,
    userId,
    ticketTypes,
    concernTypes,
    users,
    onFromDateChange,
    onToDateChange,
    onTicketTypeChange,
    onConcernTypeChange,
    onStatusChange,
    onUserChange,
    onFilter,
    onDownload,
}: CsfSummaryFiltersProps) {
    const [ticketTypeSearch, setTicketTypeSearch] = useState('');
    const [concernTypeSearch, setConcernTypeSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');

    const filteredTicketTypes = ticketTypes.filter((t) => t.name.toLowerCase().includes(ticketTypeSearch.toLowerCase()));

    const filteredConcernTypes = concernTypes.filter((t) => t.name.toLowerCase().includes(concernTypeSearch.toLowerCase()));
    const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()));

    return (
        <div className="flex flex-wrap items-end gap-2">
            <DatePicker id="from-date" label="From" value={fromDate} onChange={onFromDateChange} />
            <DatePicker id="to-date" label="To" value={toDate} onChange={onToDateChange} />

            <div className="space-y-1">
                <Label htmlFor="ticket-type" className="text-xs">
                    Ticket Type
                </Label>
                <Select value={ticketTypeId} onValueChange={onTicketTypeChange}>
                    <SelectTrigger id="ticket-type" className="h-9 w-[200px] text-xs">
                        <SelectValue placeholder="Select Ticket Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                            <Input
                                placeholder="Search ticket type..."
                                value={ticketTypeSearch}
                                onChange={(e) => setTicketTypeSearch(e.target.value)}
                                className="h-8 text-xs"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>
                        <SelectItem value="all">All</SelectItem>
                        {filteredTicketTypes.map((type) => (
                            <SelectItem key={type.id} value={String(type.id)} className="text-xs">
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="concern-type" className="text-xs">
                    Concern Type
                </Label>
                <Select value={concernTypeId} onValueChange={onConcernTypeChange}>
                    <SelectTrigger id="concern-type" className="h-9 w-[200px] text-xs">
                        <SelectValue placeholder="Select Concern Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                            <Input
                                placeholder="Search concern type..."
                                value={concernTypeSearch}
                                onChange={(e) => setConcernTypeSearch(e.target.value)}
                                className="h-8 text-xs"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>
                        <SelectItem value="all">All</SelectItem>
                        {filteredConcernTypes.map((type) => (
                            <SelectItem key={type.id} value={String(type.id)} className="text-xs">
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="status" className="text-xs">
                    Status
                </Label>
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger id="status" className="h-9 w-[160px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_process">In Process</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="not_executed">Not Executed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="user" className="text-xs">
                    User
                </Label>
                <Select value={userId} onValueChange={onUserChange}>
                    <SelectTrigger id="user" className="h-9 w-[200px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                            <Input
                                placeholder="Search user..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="h-8 text-xs"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>
                        <SelectItem value="all">All</SelectItem>
                        {filteredUsers.map((user) => (
                            <SelectItem key={String(user.id)} value={String(user.id)} className="text-xs">
                                {user.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button size="sm" onClick={onFilter} className="h-9 bg-green-900 px-4 text-xs hover:bg-green-700">
                Filter
            </Button>
            <Button size="sm" variant="outline" onClick={onDownload} className="h-9 px-4 text-xs">
                Download
            </Button>
        </div>
    );
}

export default CsfSummaryFilters;

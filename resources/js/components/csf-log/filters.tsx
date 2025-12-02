import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@/types/csf-log-report-types';
import { useState } from 'react';
import { DatePicker } from '../daily-monitoring/date-picker';

interface CsfLogFiltersProps {
    fromDate: string;
    toDate: string;
    submissionType: string;
    status: string;
    userId: string;
    users: User[];
    onFromDateChange: (date: string) => void;
    onToDateChange: (date: string) => void;
    onSubmissionTypeChange: (submissionType: string) => void;
    onStatusChange: (status: string) => void;
    onUserChange: (userId: string) => void;
    onFilter: () => void;
    onDownload: () => void;
}

export function CsfLogFilters({
    fromDate,
    toDate,
    submissionType,
    status,
    userId,
    users,
    onFromDateChange,
    onToDateChange,
    onSubmissionTypeChange,
    onStatusChange,
    onUserChange,
    onFilter,
    onDownload,
}: CsfLogFiltersProps) {
    const [userSearch, setUserSearch] = useState('');

    const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()));

    return (
        <div className="flex flex-wrap items-end gap-2">
            <DatePicker id="from-date" label="From" value={fromDate} onChange={onFromDateChange} />
            <DatePicker id="to-date" label="To" value={toDate} onChange={onToDateChange} />

            <div className="space-y-1">
                <Label htmlFor="submission-type" className="text-xs">
                    Submission Type
                </Label>
                <Select value={submissionType} onValueChange={onSubmissionTypeChange}>
                    <SelectTrigger id="submission-type" className="h-9 w-[160px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="log">Log</SelectItem>
                        <SelectItem value="ticket">Ticket</SelectItem>
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
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="executed">Executed</SelectItem>
                        <SelectItem value="not_executed">Not Executed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
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

export default CsfLogFilters;

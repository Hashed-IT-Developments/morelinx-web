import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Town } from '../../types/application-report-types';
import { DatePicker } from '../daily-monitoring/date-picker';

interface ApplicationReportFiltersProps {
    fromDate: string;
    toDate: string;
    status: string;
    townId: string;
    rateClass: string;
    towns: Town[];
    onFromDateChange: (date: string) => void;
    onToDateChange: (date: string) => void;
    onStatusChange: (status: string) => void;
    onTownChange: (townId: string) => void;
    onRateClassChange: (rateClass: string) => void;
    onFilter: () => void;
    onDownload: () => void;
}

export function ApplicationReportFilters({
    fromDate,
    toDate,
    status,
    townId,
    rateClass,
    towns,
    onFromDateChange,
    onToDateChange,
    onStatusChange,
    onTownChange,
    onRateClassChange,
    onFilter,
    onDownload,
}: ApplicationReportFiltersProps) {
    return (
        <div className="flex flex-wrap items-end gap-2">
            <DatePicker id="from-date" label="From" value={fromDate} onChange={onFromDateChange} />
            <DatePicker id="to-date" label="To" value={toDate} onChange={onToDateChange} />

            <div className="space-y-1">
                <Label htmlFor="status" className="text-xs">
                    Status
                </Label>
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger id="status" className="h-9 w-[140px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="for_inspection">For Inspection</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="isnap_pending">ISNAP Pending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="town" className="text-xs">
                    Town
                </Label>
                <Select value={townId} onValueChange={onTownChange}>
                    <SelectTrigger id="town" className="h-9 w-[160px] text-xs">
                        <SelectValue placeholder="Select Town" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="text-xs">
                            All Towns
                        </SelectItem>
                        {towns.map((town) => (
                            <SelectItem key={town.id} value={String(town.id)} className="text-xs">
                                {town.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="rate-class" className="text-xs">
                    Rate Class
                </Label>
                <Select value={rateClass} onValueChange={onRateClassChange}>
                    <SelectTrigger id="rate-class" className="h-9 w-[140px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
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

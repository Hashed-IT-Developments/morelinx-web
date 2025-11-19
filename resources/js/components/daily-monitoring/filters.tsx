import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Inspector } from '../../types/monitoring-types';
import { DatePicker } from './date-picker';

interface InspectionsFiltersProps {
    fromDate: string;
    toDate: string;
    status: string;
    onFromDateChange: (date: string) => void;
    onToDateChange: (date: string) => void;
    onStatusChange: (status: string) => void;
    onFilter: () => void;
    onDownload: () => void;
}

export function InspectionsFilters({
    fromDate,
    toDate,
    status,
    onFromDateChange,
    onToDateChange,
    onStatusChange,
    onFilter,
    onDownload,
}: InspectionsFiltersProps) {
    return (
        <div className="flex flex-wrap items-end gap-2">
            <DatePicker id="inspections-from" label="From" value={fromDate} onChange={onFromDateChange} />
            <DatePicker id="inspections-to" label="To" value={toDate} onChange={onToDateChange} />
            <div className="space-y-1">
                <Label htmlFor="inspections-status" className="text-xs">
                    Status
                </Label>
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger id="inspections-status" className="h-9 w-[120px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="for_inspection">For Inspection</SelectItem>
                        <SelectItem value="for_inspection_approval">For Approval</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="disapproved">Disapproved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="reassigned">Reassigned</SelectItem>
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

interface ApplicationsFiltersProps {
    fromDate: string;
    toDate: string;
    inspectorId: string;
    inspectors: Inspector[];
    onFromDateChange: (date: string) => void;
    onToDateChange: (date: string) => void;
    onInspectorChange: (inspectorId: string) => void;
    onFilter: () => void;
    onDownload: () => void;
}

export function ApplicationsFilters({
    fromDate,
    toDate,
    inspectorId,
    inspectors,
    onFromDateChange,
    onToDateChange,
    onInspectorChange,
    onFilter,
    onDownload,
}: ApplicationsFiltersProps) {
    return (
        <div className="flex flex-wrap items-end gap-2">
            <DatePicker id="applications-from" label="From" value={fromDate} onChange={onFromDateChange} width="w-[140px]" />
            <DatePicker id="applications-to" label="To" value={toDate} onChange={onToDateChange} width="w-[140px]" />
            <div className="space-y-1">
                <Label htmlFor="applications-inspector" className="text-xs">
                    Inspector
                </Label>
                <Select value={inspectorId} onValueChange={onInspectorChange}>
                    <SelectTrigger id="applications-inspector" className="h-9 w-[140px] text-xs">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="text-xs">
                            Select Inspector
                        </SelectItem>
                        {inspectors.map((inspector) => (
                            <SelectItem key={inspector.id} value={String(inspector.id)} className="text-xs">
                                {inspector.name}
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

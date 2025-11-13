import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Town } from '../../types/isnap-payment-types';
import { DatePicker } from '../daily-monitoring/date-picker';

interface IsnapPaymentFiltersProps {
    fromDate: string;
    toDate: string;
    townId: string;
    towns: Town[];
    onFromDateChange: (date: string) => void;
    onToDateChange: (date: string) => void;
    onTownChange: (townId: string) => void;
    onFilter: () => void;
    onDownload: () => void;
}

export function IsnapPaymentFilters({
    fromDate,
    toDate,
    townId,
    towns,
    onFromDateChange,
    onToDateChange,
    onTownChange,
    onFilter,
    onDownload,
}: IsnapPaymentFiltersProps) {
    return (
        <div className="flex flex-wrap items-end gap-2">
            <DatePicker id="from-date" label="From" value={fromDate} onChange={onFromDateChange} />
            <DatePicker id="to-date" label="To" value={toDate} onChange={onToDateChange} />

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

            <Button size="sm" onClick={onFilter} className="h-9 bg-green-900 px-4 text-xs hover:bg-green-700">
                Filter
            </Button>
            <Button size="sm" variant="outline" onClick={onDownload} className="h-9 px-4 text-xs">
                Download
            </Button>
        </div>
    );
}

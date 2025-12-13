import Input from '@/components/composables/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface AccountReportFiltersProps {
    fromDate: string;
    toDate: string;
    status: string;
    townId: string;
    barangayId: string;
    rateClass: string;
    towns: Array<{ id: number; name: string }>;
    barangays: Array<{ id: string; name: string }>;
    onFromDateChange: (value: string) => void;
    onToDateChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onTownChange: (value: string) => void;
    onBarangayChange: (value: string) => void;
    onRateClassChange: (value: string) => void;
    onFilter: () => void;
    onDownload: () => void;
}

export default function AccountReportFilters({
    fromDate,
    toDate,
    status,
    townId,
    barangayId,
    rateClass,
    towns,
    barangays,
    onFromDateChange,
    onToDateChange,
    onStatusChange,
    onTownChange,
    onBarangayChange,
    onRateClassChange,
    onFilter,
    onDownload,
}: AccountReportFiltersProps) {
    const [townSearch, setTownSearch] = useState('');

    const filteredTowns = towns.filter((town) => town.name.toLowerCase().includes(townSearch.toLowerCase()));

    return (
        <div className="flex flex-wrap items-end gap-2">
            <Input
                id="from-date"
                label="From"
                type="date"
                value={fromDate}
                onChange={(e) => {
                    onFromDateChange(e.target.value.toString());
                }}
            />
            <Input
                id="to-date"
                label="To"
                type="date"
                value={toDate}
                onChange={(e) => {
                    onToDateChange(e.target.value.toString());
                }}
            />

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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Suspended</SelectItem>
                        <SelectItem value="disconnected">Disconnected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="town" className="text-xs">
                    Town
                </Label>
                <Select value={townId} onValueChange={onTownChange}>
                    <SelectTrigger id="town" className="h-9 w-40 text-xs">
                        <SelectValue placeholder="Select Town" />
                    </SelectTrigger>
                    <SelectContent>
                        <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                            <Input
                                placeholder="Search town..."
                                value={townSearch}
                                onChange={(e) => setTownSearch(e.target.value.toString())}
                                className="h-8 text-xs"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>
                        <SelectItem value="all" className="text-xs">
                            All Towns
                        </SelectItem>
                        {filteredTowns.map((town) => (
                            <SelectItem key={town.id} value={String(town.id)} className="text-xs">
                                {town.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="barangay" className="text-xs">
                    Barangay
                </Label>
                <Select value={barangayId} onValueChange={onBarangayChange} disabled={!barangays || barangays.length === 0}>
                    <SelectTrigger id="barangay" className="h-9 w-40 text-xs">
                        <SelectValue placeholder="Select Barangay" />
                    </SelectTrigger>
                    <SelectContent>
                        {barangays && barangays.length > 0 ? (
                            barangays.map((barangay) => (
                                <SelectItem key={barangay.id} value={barangay.id.toString()} className="text-xs">
                                    {barangay.name}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="all" className="text-xs">
                                All Barangays
                            </SelectItem>
                        )}
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
                        <SelectItem value="power">Power</SelectItem>
                        <SelectItem value="city_offices">City Offices</SelectItem>
                        <SelectItem value="city_streetlights">City Streetlights</SelectItem>
                        <SelectItem value="other_government">Other Government</SelectItem>
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

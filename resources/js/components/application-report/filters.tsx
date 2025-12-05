import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Town } from '../../types/application-report-types';
import { DatePicker } from '../daily-monitoring/date-picker';

interface ApplicationReportFiltersProps {
    fromDate: string;
    toDate: string;
    status: string;
    townId: string;
    barangayId: string;
    rateClass: string;
    towns: Town[];
    barangays: Array<{ id: string; name: string }>;
    onFromDateChange: (date: string) => void;
    onToDateChange: (date: string) => void;
    onStatusChange: (status: string) => void;
    onTownChange: (townId: string) => void;
    onBarangayChange: (barangayId: string) => void;
    onRateClassChange: (rateClass: string) => void;
    onFilter: () => void;
    onDownload: () => void;
}

export function ApplicationReportFilters({
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
}: ApplicationReportFiltersProps) {
    const [townSearch, setTownSearch] = useState('');

    const filteredTowns = towns.filter((town) => town.name.toLowerCase().includes(townSearch.toLowerCase()));

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
                        <SelectItem value="in_process">In Process</SelectItem>
                        <SelectItem value="for_ccd_approval">For CCD Approval</SelectItem>
                        <SelectItem value="for_inspection">For Inspection</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="for_collection">For Collection</SelectItem>
                        <SelectItem value="for_signing">For Signing</SelectItem>
                        <SelectItem value="for_installation_approval">For Installation Approval</SelectItem>
                        <SelectItem value="for_installation">For Installation</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="isnap_pending">ISNAP Pending</SelectItem>
                        <SelectItem value="isnap_for_collection">ISNAP For Collection</SelectItem>
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
                        <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                            <Input
                                placeholder="Search town..."
                                value={townSearch}
                                onChange={(e) => setTownSearch(e.target.value)}
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
                    <SelectTrigger id="barangay" className="h-9 w-[160px] text-xs">
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

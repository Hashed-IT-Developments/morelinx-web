import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
                <Label htmlFor="from-date">From Date</Label>
                <Input id="from-date" type="date" value={fromDate} onChange={(e) => onFromDateChange(e.target.value)} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="to-date">To Date</Label>
                <Input id="to-date" type="date" value={toDate} onChange={(e) => onToDateChange(e.target.value)} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Suspended</SelectItem>
                        <SelectItem value="disconnected">Disconnected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="town">Town</Label>
                <Select value={townId} onValueChange={onTownChange}>
                    <SelectTrigger id="town">
                        <SelectValue placeholder="Select town" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Towns</SelectItem>
                        {towns.map((town) => (
                            <SelectItem key={town.id} value={String(town.id)}>
                                {town.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="barangay">Barangay</Label>
                <Select value={barangayId} onValueChange={onBarangayChange} disabled={!barangays || barangays.length === 0 || townId === 'all'}>
                    <SelectTrigger id="barangay">
                        <SelectValue placeholder="Select barangay" />
                    </SelectTrigger>
                    <SelectContent>
                        {barangays.length > 0 ? (
                            barangays.map((barangay) => (
                                <SelectItem key={barangay.id} value={String(barangay.id)}>
                                    {barangay.name}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="all">All Barangays</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="rate-class">Rate Class</Label>
                <Select value={rateClass} onValueChange={onRateClassChange}>
                    <SelectTrigger id="rate-class">
                        <SelectValue placeholder="Select rate class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="power">Power</SelectItem>
                        <SelectItem value="city_offices">City Offices</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="streetlight">City Streetlights</SelectItem>
                        <SelectItem value="other_government">Other Government</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex gap-2 md:col-span-2 lg:col-span-6">
                <Button onClick={onFilter} className="flex-1">
                    Apply Filters
                </Button>
                <Button onClick={onDownload} variant="outline" className="flex-1">
                    Download Excel
                </Button>
            </div>
        </div>
    );
}

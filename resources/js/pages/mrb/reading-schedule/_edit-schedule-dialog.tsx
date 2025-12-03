import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Schedule {
    id: string | null;
    route_id: string | null;
    route_name: string | null;
    reading_date: number;
    meter_reader_id: string | null;
    billing_month: string | null;
}

interface Props {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    schedule: Schedule | null;
    meterReaders: Array<MeterReader>;
    onUpdate?: (schedule: Schedule) => void;
}

interface MeterReader {
    id: string;
    name: string;
    email: string;
}

export default function EditScheduleDialog({ openModal, setOpenModal, schedule, meterReaders, onUpdate }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [readingDate, setReadingDate] = useState<number | ''>('');
    const [meterReaderId, setMeterReaderId] = useState<string>('');

    useEffect(() => {
        if (schedule) {
            setReadingDate(schedule.reading_date);
            setMeterReaderId(schedule.meter_reader_id || '');
        }
    }, [schedule]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await axios.patch(route('mrb.reading.schedule.update-reading-schedule-api', { readingSchedule: schedule?.id }), {
            reading_date: readingDate,
            meter_reader_id: meterReaderId || null,
        });

        if (response.data.message) {
            toast.success(response.data.message);
        }

        setIsLoading(false);
        setOpenModal(false);

        if (onUpdate && schedule) {
            onUpdate(response.data.reading_schedule);
        }
    };

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogContent className="max-w-xl">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <DialogTitle className="text-xl">Edit Schedule</DialogTitle>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Edit Reading Schedule</p>
                    </div>
                    <DialogClose />
                </DialogHeader>

                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="route">Route</Label>
                                <Input id="route" value={schedule?.route_id + ' - ' + schedule?.route_name || 'N/A'} disabled className="bg-muted" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="billing-month">Billing Month</Label>
                                <Input id="billing-month" value={schedule?.billing_month || 'N/A'} disabled className="bg-muted" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reading-date">
                                    Reading Date <span className="text-destructive">*</span>
                                </Label>
                                <Select onValueChange={(value) => setReadingDate(parseInt(value, 10))} value={readingDate.toString()} required>
                                    <SelectTrigger id="reading-date" className="w-full">
                                        <SelectValue placeholder="Select day of month (1-31)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                            <SelectItem key={day} value={day.toString()}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meter-reader">Meter Reader</Label>
                                <Select onValueChange={(value) => setMeterReaderId(value)} defaultValue={String(meterReaderId)}>
                                    <SelectTrigger id="meter-reader" className="w-full">
                                        <SelectValue placeholder="Select a Meter Reader" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {meterReaders.map((reader) => (
                                            <SelectItem key={reader.id} value={String(reader.id)}>
                                                {reader.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenModal(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

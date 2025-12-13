import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface DatePickerProps {
    id: string;
    label: string;
    value: string;
    onChange: (date: string) => void;
    width?: string;
}

export function DatePicker({ id, label, value, onChange, width = 'w-[150px]' }: DatePickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (date: Date | undefined) => {
        if (date) {
            const pad = (n: number) => n.toString().padStart(2, '0');
            const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
            onChange(formatted);
        }
        setOpen(false);
    };

    return (
        <div className="space-y-1">
            <Label htmlFor={id} className="text-xs">
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={`h-9 ${width} justify-start gap-2 text-xs font-normal`}>
                        <CalendarIcon className="h-4 w-4" />
                        {value ? new Date(value).toLocaleDateString() : 'Select date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar mode="single" selected={value ? new Date(value) : undefined} captionLayout="dropdown" onSelect={handleSelect} />
                </PopoverContent>
            </Popover>
        </div>
    );
}

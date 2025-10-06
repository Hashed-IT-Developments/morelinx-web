import AttachmentUpload from '@/components/attachment-upload';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePage } from '@inertiajs/react';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function StepRequirements() {
    const form = useFormContext();
    const [open, setOpen] = React.useState(false);

    const idTypes = (usePage().props.idTypes ?? []) as { [key: string]: string };
    const attachmentsList = (usePage().props.attachmentsList ?? []) as { [key: string]: string };
    return (
        <div className="w-full space-y-8">
            <div>
                <h2 className="mb-4 text-lg font-semibold">Government ID</h2>
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* ID Type */}
                    <FormField
                        control={form.control}
                        name="id_type"
                        rules={{ required: 'ID Type is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>ID Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ID Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(idTypes).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* ID No. */}
                    <FormField
                        control={form.control}
                        name="id_number"
                        rules={{ required: 'ID No. is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>ID No.</FormLabel>
                                <FormControl>
                                    <Input placeholder="ID No." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* ID Type */}
                    <FormField
                        control={form.control}
                        name="id_type"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ID Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(idTypes).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ID No. 2 */}
                    <FormField
                        control={form.control}
                        name="id_number_2"
                        rules={{ required: 'ID No. 2 is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID No. 2</FormLabel>
                                <FormControl>
                                    <Input placeholder="ID No. 2" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="w-full md:w-1/2">
                    {/* Section: Senior Citizen */}
                    <div className="pt-6">
                        <div className="mb-4 flex flex-col items-start gap-2 md:flex-row md:items-center">
                            <h2 className="text-lg font-semibold">Senior Citizen</h2>
                            <FormField
                                control={form.control}
                                name="is_senior_citizen"
                                rules={{ required: false }}
                                render={({ field }) => (
                                    <FormItem className="flex items-center">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                className="shadcn-checkbox"
                                                checked={field.value || false}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className={`grid grid-rows-2 gap-4 p-2 ${form.watch('is_senior_citizen') ? '' : 'bg-gray-100'}`}>
                            {/* SC Date From */}
                            <FormField
                                control={form.control}
                                name="sc_from"
                                rules={{ required: false }}
                                render={({ field }) => {
                                    const disabled = !form.watch('is_senior_citizen');
                                    return (
                                        <FormItem>
                                            <FormLabel>SC Date From</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col gap-3">
                                                    <Popover open={open} onOpenChange={setOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                id="date"
                                                                className={`w-full justify-between font-normal md:w-48 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                                                                disabled={disabled}
                                                            >
                                                                {field.value ? new Date(field.value).toLocaleDateString() : 'Select date'}
                                                                <ChevronDownIcon />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value ? new Date(field.value) : undefined}
                                                                captionLayout="dropdown"
                                                                onSelect={(date) => {
                                                                    field.onChange(date);
                                                                    setOpen(false);
                                                                }}
                                                                disabled={disabled}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            {/* OSCA ID No. */}
                            <FormField
                                control={form.control}
                                name="sc_number"
                                rules={{ required: false }}
                                render={({ field }) => {
                                    const disabled = !form.watch('is_senior_citizen');
                                    return (
                                        <FormItem>
                                            <FormLabel>OSCA ID No.</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="OSCA ID No."
                                                    {...field}
                                                    disabled={disabled}
                                                    className={disabled ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                    {/* Section: Checklist of attachment */}
                    <div className="pt-6">
                        <h2 className="text-lg font-semibold">Checklist of attachment</h2>
                        <div className="mt-4">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {Object.entries(attachmentsList)
                                    .reduce<[string, string][][]>((rows, [key, label], idx) => {
                                        if (idx % 10 === 0) rows.push([]);
                                        rows[rows.length - 1].push([key, label]);
                                        return rows;
                                    }, [])
                                    .map((row, rowIdx) => (
                                        <div key={rowIdx} className="space-y-3 rounded-lg bg-muted/50 p-4">
                                            {row.map(([key, label]) => (
                                                <AttachmentUpload key={key} name={`attachments.${key}`} label={label} />
                                            ))}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

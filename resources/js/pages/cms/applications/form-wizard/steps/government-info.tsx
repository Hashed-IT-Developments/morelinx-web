import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePage } from '@inertiajs/react';
import { useFormContext } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import AttachmentUpload from '@/components/attachment-upload';

export default function StepGovernmentInfo() {
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
                        name="id_type_2"
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
                        rules={{ required: false }}
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

            <div>
                <h2 className="mb-4 text-lg font-semibold">Government Info</h2>
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* COR No. */}
                    <FormField
                        control={form.control}
                        name="cor_number"
                        rules={{ required: 'Certificate No. is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Certificate No.</FormLabel>
                                <FormControl>
                                    <Input placeholder="Certificate No." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* TIN No. */}
                    <FormField
                        control={form.control}
                        name="tin_number"
                        rules={{ required: 'T.I.N. No. is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>T.I.N. No.</FormLabel>
                                <FormControl>
                                    <Input placeholder="T.I.N. No." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Issued Date */}
                    <FormField
                        control={form.control}
                        name="issued_date"
                        rules={{ required: 'Issued Date is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Issued Date</FormLabel>
                                <FormControl>
                                    <div className="flex flex-col gap-3">
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" id="date" className="w-48 justify-between font-normal">
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
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="cg_vat_zero_tag"
                    rules={{ required: false }}
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-2 mt-2">
                            <FormControl>
                                <input
                                    type="checkbox"
                                    checked={!!field.value}
                                    onChange={e => field.onChange(e.target.checked)}
                                    id="is_non_vat"
                                    className="accent-primary h-4 w-4"
                                />
                            </FormControl>
                            <FormLabel htmlFor="is_non_vat">Check if this customer is qualified for NON-VAT</FormLabel>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3 mt-6">
                    <div className="col-span-3 flex">
                        <div className="rounded-l-md bg-red-600 px-3 py-2 flex items-center">
                            <span className="text-white font-bold">Note:</span>
                        </div>
                        <div className="rounded-r-md bg-red-100 px-3 py-2 flex-1 flex items-center">
                            <span className="text-sm text-red-700">
                                EWT/FT Tagging requires attached documents
                            </span>
                        </div>
                    </div>
                    <AttachmentUpload key='cg_ewt_tag' name={`cg_ewt_tag`} label='Expanded Withholding Tax' />
                    <AttachmentUpload key='cg_ft_tag' name={`cg_ft_tag`} label='Final Tax' />
                </div>

                <div className="w-full">
                    {/* Section: Checklist of attachment */}
                    <div className="pt-6">
                        <h2 className="text-lg font-semibold">Checklist of attachment <span className="text-gray-400">(optional)</span></h2>
                        <div className="mt-4">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 rounded-lg bg-muted/50 p-4">
                                {Object.entries(attachmentsList)
                                    .slice(0, 30) // max 30 items (3 rows x 10 columns)
                                    .reduce<[string, string][][]>((cols, [key, label], idx) => {
                                        const colIdx = Math.floor(idx / 10);
                                        if (!cols[colIdx]) cols[colIdx] = [];
                                        cols[colIdx].push([key, label]);
                                        return cols;
                                    }, [])
                                    .map((col, colIdx) => (
                                        <div key={colIdx} className="space-y-3">
                                            {col.map(([key, label]) => (
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

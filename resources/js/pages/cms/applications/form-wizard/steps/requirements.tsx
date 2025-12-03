import IDSubmissionForm from '@/components/form-wizard/id-submission-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePage } from '@inertiajs/react';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function StepRequirements() {
    const form = useFormContext();
    const [open, setOpen] = React.useState(false);
    const page = usePage();
    const primaryIdTypes = (page.props.primaryIdTypes ?? {}) as Record<string, string>;
    const secondaryIdTypes = (page.props.secondaryIdTypes ?? {}) as Record<string, string>;

    const showSeniorCitizenTab = ['residential'].includes(form.watch('rate_class'));
    const isSeniorCitizen = form.watch('is_senior_citizen');
    const primaryIdType = form.watch('primary_id_type');

    // Check if senior citizen ID is selected
    const isSeniorCitizenIdSelected = primaryIdType === 'senior-citizen-id';

    return (
        <div className="w-full space-y-8">
            <IDSubmissionForm primaryIdTypes={primaryIdTypes} secondaryIdTypes={secondaryIdTypes} />

            {/* Senior Citizen ID Notice */}
            {isSeniorCitizenIdSelected && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-amber-900">Senior Citizen ID Selected</h3>
                            <p className="mt-1 text-sm text-amber-800">
                                You've selected Senior Citizen ID as your primary identification. Please note:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800">
                                <li>The "Senior Citizen" checkbox has been automatically enabled</li>
                                <li>
                                    You must provide the <strong>SC Date From</strong>
                                </li>
                                <li>
                                    You must provide the <strong>OSCA ID No.</strong>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                {showSeniorCitizenTab && (
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
                                                <Checkbox
                                                    checked={field.value ?? false}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(checked === true);
                                                    }}
                                                    disabled={isSeniorCitizenIdSelected}
                                                />
                                            </FormControl>
                                            {isSeniorCitizenIdSelected && <span className="ml-2 text-xs text-gray-500">(Auto-enabled)</span>}
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className={`grid grid-rows-2 gap-4 p-2 ${form.watch('is_senior_citizen') ? '' : 'bg-gray-100'}`}>
                                {/* SC Date From */}
                                <FormField
                                    control={form.control}
                                    name="sc_from"
                                    rules={{
                                        required: isSeniorCitizen ? 'SC Date From is required when Senior Citizen is checked' : false,
                                    }}
                                    render={({ field }) => {
                                        const disabled = !form.watch('is_senior_citizen');
                                        return (
                                            <FormItem>
                                                <FormLabel required={isSeniorCitizen}>SC Date From</FormLabel>
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
                                                                        if (date) {
                                                                            // Format as 'YYYY-MM-DD HH:mm'
                                                                            const pad = (n: number) => n.toString().padStart(2, '0');
                                                                            const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
                                                                            field.onChange(formatted);
                                                                        } else {
                                                                            field.onChange('');
                                                                        }
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
                                    rules={{
                                        required: isSeniorCitizen ? 'OSCA ID No. is required when Senior Citizen is checked' : false,
                                    }}
                                    render={({ field }) => {
                                        const disabled = !form.watch('is_senior_citizen');
                                        return (
                                            <FormItem>
                                                <FormLabel required={isSeniorCitizen}>OSCA ID No.</FormLabel>
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
                )}
            </div>
        </div>
    );
}

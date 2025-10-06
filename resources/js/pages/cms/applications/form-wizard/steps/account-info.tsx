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

export default function StepAccountInfo() {
    const form = useFormContext();
    const [open, setOpen] = React.useState(false);
    const rateClasses = (usePage().props.rateClasses ?? []) as string[];
    const customerTypes = (usePage().props.rateClassesWithCustomerTypes ?? {}) as { [key: string]: { [id: string]: { customer_type: string } } };
    const selectedRateClass = form.watch('rate_class');
    const filteredCustomerTypes = selectedRateClass ? Object.entries(customerTypes[selectedRateClass] ?? {}) : [];

    return (
        <div className="w-full space-y-8">
            {/* Section: Type */}
            <div>
                <h2 className="mb-4 text-lg font-semibold">Type</h2>
                <div className="grid grid-cols-2 gap-6">
                    {/* Rate Class */}
                    <FormField
                        control={form.control}
                        name="rate_class"
                        rules={{ required: 'Rate Class is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Rate Class</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || 'temp'}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="temp" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="temp" disabled>
                                            Select Rate Class
                                        </SelectItem>
                                        {rateClasses?.map((rateClass: string) => {
                                            const display = rateClass ? rateClass.charAt(0).toUpperCase() + rateClass.slice(1) : 'Residential';
                                            return (
                                                <SelectItem key={rateClass} value={rateClass}>
                                                    {display}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Customer Type */}
                    <FormField
                        control={form.control}
                        name="customer_type"
                        rules={{ required: 'Customer Type is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Customer Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Customer Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {filteredCustomerTypes.map(([id, customerType]: [string, { customer_type: string }]) => {
                                            const display = customerType.customer_type.charAt(0).toUpperCase() + customerType.customer_type.slice(1);

                                            return (
                                                <SelectItem key={id} value={id}>
                                                    {display}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Section: House Information */}
            <div>
                <h2 className="mb-4 text-lg font-semibold">House Information</h2>
                <div className="grid grid-cols-2 gap-6">
                    {/* Connected Load */}
                    <FormField
                        control={form.control}
                        name="connected_load"
                        rules={{
                            required: 'Connected Load is required',
                            validate: (value) => !isNaN(Number(value)) || 'Connected Load must be a number',
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Connected Load</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Connected Load"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Property Ownership */}
                    <FormField
                        control={form.control}
                        name="property_ownership"
                        rules={{ required: 'Property Ownership is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Property Ownership</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Property Ownership" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="owned">Owned</SelectItem>
                                        <SelectItem value="rented">Rented</SelectItem>
                                        <SelectItem value="others">Others</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Section: Personal Information */}
            <div>
                <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
                <div className="grid grid-cols-2 gap-6">
                    {/* Last Name */}
                    <FormField
                        control={form.control}
                        name="last_name"
                        rules={{ required: 'Last Name is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Last Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* First Name */}
                    <FormField
                        control={form.control}
                        name="first_name"
                        rules={{ required: 'First Name is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="First Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Middle Name */}
                    <FormField
                        control={form.control}
                        name="middle_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Middle Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Middle Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Suffix */}
                    <FormField
                        control={form.control}
                        name="suffix"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Suffix</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Jr., III, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Birthdate */}
                    <FormField
                        control={form.control}
                        name="birthdate"
                        rules={{ required: 'Birthdate is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Birthdate</FormLabel>
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

                    {/* Nationality */}
                    <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nationality</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nationality" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Sex */}
                    <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sex</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Sex" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Marital Status */}
                    <FormField
                        control={form.control}
                        name="marital_status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Marital Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Marital Status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="married">Married</SelectItem>
                                        <SelectItem value="widowed">Widowed</SelectItem>
                                        <SelectItem value="separated">Separated</SelectItem>
                                        <SelectItem value="annulled">Annulled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

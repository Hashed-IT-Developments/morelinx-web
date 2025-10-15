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

    const showHouseInfo = ['residential'].includes(form.watch('rate_class')) || ['temporary_residential'].includes(form.watch('customer_type'));
    const showEstablishment =
        ['power', 'commercial', 'city_offices', 'city_streetlights', 'other_government'].includes(form.watch('rate_class')) &&
        form.watch('customer_type') !== 'temporary_residential';

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
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="temp" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="#" disabled>
                                            Select Rate Class
                                        </SelectItem>
                                        {rateClasses?.map((rateClass: string) => {
                                            const display = rateClass
                                                ? rateClass
                                                      .split('_')
                                                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                      .join(' ')
                                                : 'Residential';
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
                                            const display = customerType.customer_type
                                                ? customerType.customer_type
                                                      .split('_')
                                                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                      .join(' ')
                                                : 'Residential';
                                            return (
                                                <SelectItem key={id} value={customerType.customer_type}>
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
            {showHouseInfo && (
                <>
                    <div>
                        <h2 className="mb-4 text-lg font-semibold">House Information</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Connected Load */}
                            <FormField
                                control={form.control}
                                name="connected_load"
                                rules={{
                                    required: 'Connected Load is required',
                                    validate: (value) => {
                                        if (isNaN(Number(value))) return 'Connected Load must be a number';
                                        if (Number(value) <= 0) return 'Connected Load must be greater than 0';
                                        return true;
                                    },
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
                                rules={{
                                    required: 'Lastname is required',
                                    minLength: { value: 3, message: 'Lastname must be at least 3 characters' },
                                    maxLength: { value: 50, message: 'Lastname must be at most 50 characters' },
                                    validate: (value) => typeof value === 'string' || 'Lastname must be a string',
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Lastname</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Lastname" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* First Name */}
                            <FormField
                                control={form.control}
                                name="first_name"
                                rules={{
                                    required: 'Firstname is required',
                                    minLength: { value: 3, message: 'Firstname must be at least 3 characters' },
                                    maxLength: { value: 50, message: 'Firstname must be at most 50 characters' },
                                    validate: (value) => typeof value === 'string' || 'Firstname must be a string',
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Firstname</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Firstname" {...field} />
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
                                rules={{
                                    required: 'Birthdate is required',
                                    validate: (value) => {
                                        if (!value) return 'Birthdate is required';
                                        const birthdate = new Date(value);
                                        const today = new Date();
                                        const age = today.getFullYear() - birthdate.getFullYear();
                                        const m = today.getMonth() - birthdate.getMonth();
                                        if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
                                            return age - 1 >= 10 || 'Age must be at least 10 years ago';
                                        }
                                        return age >= 10 || 'Age must be at least 10 years ago';
                                    },
                                }}
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
                                rules={{
                                    required: 'Nationality is required',
                                    minLength: { value: 3, message: 'Nationality must be at least 3 characters' },
                                    maxLength: { value: 50, message: 'Nationality must be at most 50 characters' },
                                    validate: (value) => {
                                        if (typeof value !== 'string') return 'Nationality must be a string';
                                        if (/\d/.test(value)) return 'Nationality must not contain numbers';
                                        return true;
                                    },
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Nationality</FormLabel>
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
                                rules={{ required: 'Sex is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Sex</FormLabel>
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
                                rules={{ required: 'Marital Status is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Marital Status</FormLabel>
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
                </>
            )}

            {/* Section: Establishment Information */}
            {showEstablishment && (
                <>
                    <div className="w-1/2">
                        <h2 className="mb-4 text-lg font-semibold">Establishment</h2>
                        <div className="grid grid-cols-1 gap-6">
                            <FormField
                                control={form.control}
                                name="account_name"
                                rules={{
                                    required: 'Account Name is required',
                                    minLength: { value: 3, message: 'Account Name must be at least 3 characters' },
                                    maxLength: { value: 50, message: 'Account Name must be at most 50 characters' },
                                    validate: (value) => typeof value === 'string' || 'Account Name must be a string',
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Account Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Account Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="trade_name"
                                rules={{
                                    required: 'Trade Name is required',
                                    minLength: { value: 3, message: 'Trade Name must be at least 3 characters' },
                                    maxLength: { value: 50, message: 'Trade Name must be at most 50 characters' },
                                    validate: (value) => typeof value === 'string' || 'Trade Name must be a string',
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Trade Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Trade Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="c_peza_registered_activity"
                                rules={{
                                    required: 'Business Style is required',
                                    minLength: { value: 3, message: 'Business Style must be at least 3 characters' },
                                    maxLength: { value: 100, message: 'Business Style must be at most 100 characters' },
                                    validate: (value) => typeof value === 'string' || 'Business Style must be a string',
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Business Style</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Business Style" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Connected Load */}
                            <FormField
                                control={form.control}
                                name="connected_load"
                                rules={{
                                    required: 'Connected Load is required',
                                    validate: (value) => {
                                        if (isNaN(Number(value))) return 'Connected Load must be a number';
                                        if (Number(value) <= 0) return 'Connected Load must be greater than 0';
                                        return true;
                                    },
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
                            <FormField
                                control={form.control}
                                name="bill_delivery"
                                rules={{ required: 'Bill Delivery is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Bill Delivery</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Bill Delivery Option" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="spot_billing">Spot Billing</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="sms">SMS</SelectItem>
                                                <SelectItem value="pickup">Pickup at Office</SelectItem>
                                                <SelectItem value="courier">Courier Delivery</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

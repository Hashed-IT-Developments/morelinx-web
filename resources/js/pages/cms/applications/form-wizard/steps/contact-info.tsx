import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';

export default function StepContactInfo() {
    const form = useFormContext();

    return (
        <div className="flex w-full flex-col items-start justify-between space-y-8 md:flex-row md:space-y-0 md:space-x-8">
            <div className="mb-8 w-full px-0 md:mb-0 md:w-1/2 md:px-4">
                <h2 className="mb-4 text-lg font-semibold">
                    {['residential'].includes(form.watch('rate_class')) || form.watch('customer_type') === 'temporary_residential'
                        ? 'Contact Person'
                        : 'Authorized Representative'}
                </h2>
                <div className="grid grid-cols-1 gap-6">
                    {/* Lastname */}
                    <FormField
                        control={form.control}
                        name="cp_lastname"
                        rules={{
                            required: 'Last Name is required',
                            minLength: { value: 3, message: 'Last Name must be at least 3 characters' },
                            maxLength: { value: 50, message: 'Last Name must be at most 50 characters' },
                            validate: (value) => typeof value === 'string' || 'Last Name must be a string',
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Last Name</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Last Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Firstname */}
                    <FormField
                        control={form.control}
                        name="cp_firstname"
                        rules={{
                            required: 'First Name is required',
                            minLength: { value: 3, message: 'First Name must be at least 3 characters' },
                            maxLength: { value: 50, message: 'First Name must be at most 50 characters' },
                            validate: (value) => typeof value === 'string' || 'First Name must be a string',
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>First Name</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="First Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Middlename */}
                    <FormField
                        control={form.control}
                        name="cp_middlename"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Middle Name</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Middle Name" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Suffix */}
                    <FormField
                        control={form.control}
                        name="cp_suffix"
                        rules={{
                            maxLength: { value: 10, message: 'Suffix must be at most 10 characters' },
                            validate: (value) => {
                                if (!value) return true; // Optional field
                                if (typeof value !== 'string') return 'Suffix must be a string';
                                if (value.length > 10) return 'Suffix must be at most 10 characters';
                                // Allow letters, dots, commas, and spaces (e.g., "Jr.", "Sr.", "III", "IV")
                                if (!/^[a-zA-Z\s.,]+$/.test(value)) return 'Suffix must contain only letters, dots, commas, and spaces';
                                return true;
                            },
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Suffix</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="e.g. Jr., III, etc." {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Relationship */}
                    <FormField
                        control={form.control}
                        name="relationship"
                        rules={{ required: 'Relationship is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Relationship</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Relationship" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="parent">Parent</SelectItem>
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="sibling">Sibling</SelectItem>
                                        <SelectItem value="child">Child</SelectItem>
                                        <SelectItem value="relative">Relative</SelectItem>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="guardian">Guardian</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            <div className="w-full px-0 md:w-1/2 md:px-4">
                <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
                <div className="grid grid-cols-1 gap-6">
                    {/* Email Address */}
                    <FormField
                        control={form.control}
                        name="cp_email"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="Email Address" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Tel No. */}
                    <FormField
                        control={form.control}
                        name="cp_tel_no"
                        rules={{
                            validate: (value) => {
                                if (!value) return true; // Optional field
                                if (typeof value !== 'string') return 'Tel No. must be a string';
                                // Remove spaces and hyphens for validation
                                const cleaned = value.replace(/[\s-]/g, '');
                                // Philippine landline format: 7-11 digits
                                if (!/^\d{7,11}$/.test(cleaned)) return 'Tel No. must be a valid Philippine telephone number (7-11 digits)';
                                return true;
                            },
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tel No.</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="(02) 8XXX-XXXX" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Tel No. 2 */}
                    <FormField
                        control={form.control}
                        name="cp_tel_no_2"
                        rules={{
                            validate: (value) => {
                                if (!value) return true; // Optional field
                                if (typeof value !== 'string') return 'Tel No. must be a string';
                                // Remove spaces and hyphens for validation
                                const cleaned = value.replace(/[\s-]/g, '');
                                // Philippine landline format: 7-11 digits
                                if (!/^\d{7,11}$/.test(cleaned)) return 'Tel No. must be a valid Philippine telephone number (7-11 digits)';
                                return true;
                            },
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tel No. 2</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="(02) 8XXX-XXXX" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Mobile No. */}
                    <FormField
                        control={form.control}
                        name="cp_mobile_no"
                        rules={{
                            required: 'Mobile No. is required',
                            validate: (value) => {
                                if (!value) return 'Mobile No. is required';
                                if (typeof value !== 'string') return 'Mobile No. must be a string';
                                // Remove spaces and hyphens for validation
                                const cleaned = value.replace(/[\s-]/g, '');
                                // Check for Philippine mobile format: 09XXXXXXXXX (11 digits) or +639XXXXXXXXX (13 chars)
                                if (!/^(09|\+639)\d{9}$/.test(cleaned)) {
                                    return 'Mobile No. must be a valid Philippine mobile number (e.g., 09XX-XXX-XXXX or +639XX-XXX-XXXX)';
                                }
                                return true;
                            },
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Mobile No.</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="09XX-XXX-XXXX" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Mobile No. 2 */}
                    <FormField
                        control={form.control}
                        name="cp_mobile_no_2"
                        rules={{
                            validate: (value) => {
                                if (!value) return true; // Optional field
                                if (typeof value !== 'string') return 'Mobile No. must be a string';
                                // Remove spaces and hyphens for validation
                                const cleaned = value.replace(/[\s-]/g, '');
                                // Check for Philippine mobile format: 09XXXXXXXXX (11 digits) or +639XXXXXXXXX (13 chars)
                                if (!/^(09|\+639)\d{9}$/.test(cleaned)) {
                                    return 'Mobile No. must be a valid Philippine mobile number (e.g., 09XX-XXX-XXXX or +639XX-XXX-XXXX)';
                                }
                                return true;
                            },
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mobile No. 2</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="09XX-XXX-XXXX" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

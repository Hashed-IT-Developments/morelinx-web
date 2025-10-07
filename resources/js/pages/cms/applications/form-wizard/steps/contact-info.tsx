import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';

export default function StepContactInfo() {
    const form = useFormContext();

    return (
        <div className="flex w-full items-start justify-between space-y-8">
            <div className="w-1/2 px-4">
                <h2 className="mb-4 text-lg font-semibold">Contact Person</h2>
                <div className="grid grid-rows-2 gap-6">
                    {/* Lastname */}
                    <FormField
                        control={form.control}
                        name="cp_lastname"
                        rules={{ required: 'Lastname is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Lastname</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Lastname" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Firstname. */}
                    <FormField
                        control={form.control}
                        name="cp_firstname"
                        rules={{ required: 'Firstname is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Firstname</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Firstname" {...field} />
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
                                <FormLabel required>Middlename</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Middlename" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Suffix */}
                    <FormField
                        control={form.control}
                        name="cp_suffix"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Suffix</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Suffix" {...field} />
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
            <div className="w-1/2 px-4">
                <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
                <div className="grid grid-rows-2 gap-6">
                    {/* Email Address */}
                    <FormField
                        control={form.control}
                        name="cp_email"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="Email Address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Tel No. */}
                    <FormField
                        control={form.control}
                        name="cp_tel_no"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tel No.</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Tel No." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Tel No. 2 */}
                    <FormField
                        control={form.control}
                        name="cp_tel_no_2"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tel No. 2</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Tel No. 2" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Mobile No. */}
                    <FormField
                        control={form.control}
                        name="cp_mobile_no"
                        rules={{ required: 'Mobile No. is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Mobile No.</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Mobile No." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Mobile No. 2 */}
                    <FormField
                        control={form.control}
                        name="cp_mobile_no_2"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mobile No. 2</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Mobile No. 2" {...field} />
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

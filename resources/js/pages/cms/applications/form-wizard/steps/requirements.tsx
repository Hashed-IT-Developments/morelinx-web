import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function StepRequirements() {
    const form = useFormContext();
    const [open, setOpen] = React.useState(false);
    const [date] = React.useState<Date | undefined>(undefined);
    return (
        <div className="w-full space-y-8">
            <div>
                <h2 className="mb-4 text-lg font-semibold">Government ID</h2>
                <div className="mb-4 grid grid-cols-2 gap-4">
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
                                        <SelectItem value="passport">Passport</SelectItem>
                                        <SelectItem value="national_id">National ID</SelectItem>
                                        <SelectItem value="driver_license">Driver License</SelectItem>
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
                <div className="grid grid-cols-2 gap-4">
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
                                        <SelectItem value="passport">Passport</SelectItem>
                                        <SelectItem value="national_id">National ID</SelectItem>
                                        <SelectItem value="driver_license">Driver License</SelectItem>
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
            <div className="flex space-x-4">
                <div className="w-1/2">
                    {/* Section: Senior Citizen */}
                    <div className="pt-6">
                        <div className="mb-4 flex items-center gap-2">
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
                        <div className="grid grid-rows-2 gap-4">
                            {/* SC Date From */}
                            <FormField
                                control={form.control}
                                name="sc_from"
                                rules={{ required: false }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SC Date From</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-3">
                                                <Popover open={open} onOpenChange={setOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" id="date" className="w-48 justify-between font-normal">
                                                            {date ? date.toLocaleDateString() : 'Select date'}
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

                            {/* OSCA ID No. */}
                            <FormField
                                control={form.control}
                                name="sc_number"
                                rules={{ required: false }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OSCA ID No.</FormLabel>
                                        <FormControl>
                                            <Input placeholder="OSCA ID No." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="w-1/2">
                    {/* Section: Checklist of attachment */}
                    <div className="pt-6">
                        <h2 className="text-lg font-semibold">Checklist of attachment</h2>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <div className="space-y-2">
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.passport')} /> <span>Passport</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.national_id')} />{' '}
                                        <span>Philippine National ID (PhilSys)</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.driver_license')} /> <span>Driver's License</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.sss_id')} /> <span>SSS ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.umid')} /> <span>UMID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.philhealth_id')} /> <span>PhilHealth ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.tin_id')} /> <span>TIN ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.voter_id')} /> <span>Voter's ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.prc_id')} /> <span>PRC ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.pagibig_id')} /> <span>PAG-IBIG ID</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="space-y-2">
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.postal_id')} /> <span>Postal ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.senior_citizen_id')} /> <span>Senior Citizen ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.ofw_id')} /> <span>OFW ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.student_id')} /> <span>Student ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.pwd_id')} /> <span>PWD ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.gsis_id')} /> <span>GSIS ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.firearms_license')} /> <span>Firearms License</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.marina_id')} /> <span>MARINA ID</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.philippine_passport_card')} />{' '}
                                        <span>Philippine Passport Card</span>
                                    </div>
                                    <div>
                                        <input type="checkbox" {...form.register('attachments.company_id')} /> <span>Company ID</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 mt-4">
                                <FormField
                                    control={form.control}
                                    name="attachments.file"
                                    rules={{ required: false }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Attach File</FormLabel>
                                            <FormControl>
                                                <Input type="file" accept="*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

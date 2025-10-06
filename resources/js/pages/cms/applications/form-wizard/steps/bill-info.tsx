import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import { useFormContext } from 'react-hook-form';

export default function StepBillInfo() {
    const form = useFormContext();

    const selectedTown = form.watch('bill_district');
    const { towns, barangays } = useTownsAndBarangays(selectedTown);

    return (
        <div className="flex w-full items-start justify-between space-y-8">
            <div className="w-1/2 px-4">
                <h2 className="mb-4 text-lg font-semibold">Bill Address</h2>
                <div className="grid grid-rows-2 gap-6">
                    {/* District */}
                    <FormField
                        control={form.control}
                        name="bill_district"
                        rules={{ required: 'District is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>District</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {towns?.map((town) => (
                                            <SelectItem key={town.id} value={town.id.toString()}>
                                                {town.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Barangay */}
                    <FormField
                        control={form.control}
                        name="bill_barangay"
                        rules={{ required: 'Barangay is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Barangay</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Barangay" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {barangays?.map((barangay) => (
                                            <SelectItem key={barangay.id} value={barangay.name}>
                                                {barangay.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Landmark */}
                    <FormField
                        control={form.control}
                        name="landmark"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Landmark</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Landmark" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Subdivision/Condo */}
                    <FormField
                        control={form.control}
                        name="bill_subdivision"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subdivision/Condo</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Subdivision/Condo" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Street */}
                    <FormField
                        control={form.control}
                        name="bill_street"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Street</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Street" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Bdlg Floor */}
                    <FormField
                        control={form.control}
                        name="bill_building_floor"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Building Floor</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Building Floor" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* House/Lot/Unit No. */}
                    <FormField
                        control={form.control}
                        name="bill_house_no"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>House/Lot/Unit No.</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="House/Lot/Unit No." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            <div className="w-1/2 px-4">
                <h2 className="mb-4 text-lg font-semibold">Bill Delivery Option</h2>
                <div className="grid grid-rows-2 gap-6">
                    {/* Bill Delivery */}
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
        </div>
    );
}

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';

export default function StepBillInfo() {
    const form = useFormContext();

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
                                        <SelectItem value="tagbilaran">Tagbilaran City</SelectItem>
                                        <SelectItem value="alburquerque">Alburquerque</SelectItem>
                                        <SelectItem value="antequera">Antequera</SelectItem>
                                        <SelectItem value="baclayon">Baclayon</SelectItem>
                                        <SelectItem value="balilihan">Balilihan</SelectItem>
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
                                        <SelectItem value="booy">Booy</SelectItem>
                                        <SelectItem value="cabawan">Cabawan</SelectItem>
                                        <SelectItem value="cogon">Cogon</SelectItem>
                                        <SelectItem value="dao">Dao</SelectItem>
                                        <SelectItem value="dampas">Dampas</SelectItem>
                                        <SelectItem value="manga">Manga</SelectItem>
                                        <SelectItem value="poblacion1">Poblacion I</SelectItem>
                                        <SelectItem value="poblacion2">Poblacion II</SelectItem>
                                        <SelectItem value="poblacion3">Poblacion III</SelectItem>
                                        <SelectItem value="sanisidro">San Isidro</SelectItem>
                                        <SelectItem value="taloto">Taloto</SelectItem>
                                        <SelectItem value="tiptip">Tiptip</SelectItem>
                                        <SelectItem value="ubujan">Ubujan</SelectItem>
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
                                            <SelectValue placeholder="Select District" />
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

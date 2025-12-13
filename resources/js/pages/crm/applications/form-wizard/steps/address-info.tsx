import { LocationPicker } from '@/components/location-picker';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import { useFormContext } from 'react-hook-form';

export default function StepAddressInfo() {
    const form = useFormContext();
    const selectedTown = form.watch('district');
    const { towns, barangays } = useTownsAndBarangays(selectedTown);

    return (
        <div className="flex w-full flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="w-full px-0 md:w-1/2 md:px-4">
                <h2 className="mb-4 text-lg font-semibold">Address Information</h2>
                <div className="grid grid-cols-1 gap-6">
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
                    {/* House/Lot/Unit No. */}
                    <FormField
                        control={form.control}
                        name="unit_no"
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

                    {/* Building Floor */}
                    <FormField
                        control={form.control}
                        name="building_floor"
                        rules={{ required: false }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Building Floor</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Building floor" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Street */}
                    <FormField
                        control={form.control}
                        name="street"
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

                    {/* Subdivision/Condo */}
                    <FormField
                        control={form.control}
                        name="subdivision"
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

                    {/* District */}
                    <FormField
                        control={form.control}
                        name="district"
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
                        name="barangay"
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
                                            <SelectItem key={barangay.id} value={barangay.id.toString()}>
                                                {barangay.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            <div className="w-full px-0 md:w-1/2 md:px-4">
                <h2 className="mb-4 text-lg font-semibold">Location on Map</h2>
                <FormField
                    control={form.control}
                    name="sketch_lat_long"
                    rules={{
                        required: 'Location is required',
                        validate: (value: string) => {
                            if (!value || !value.includes(',')) return 'Please select a valid location';
                            const [lat, lng] = value.split(',').map(Number);
                            if (isNaN(lat) || isNaN(lng)) return 'Invalid coordinates';
                            return true;
                        },
                    }}
                    render={({ field }) => <LocationPicker {...field} label="Select Location" required />}
                />
            </div>
        </div>
    );
}

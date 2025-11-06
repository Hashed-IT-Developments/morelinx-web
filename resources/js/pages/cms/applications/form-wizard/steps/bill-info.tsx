import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export default function StepBillInfo() {
    const form = useFormContext();
    const [sameAsPermanent, setSameAsPermanent] = useState(false);

    const selectedTown = form.watch('bill_district');
    const { towns, barangays } = useTownsAndBarangays(selectedTown);

    // Watch for permanent address fields
    const permanentDistrict = form.watch('district');
    const permanentBarangay = form.watch('barangay');
    const permanentLandmark = form.watch('landmark');
    const permanentSubdivision = form.watch('subdivision');
    const permanentStreet = form.watch('street');
    const permanentBuildingFloor = form.watch('building_floor');
    const permanentUnitNo = form.watch('unit_no');

    // Create a stable reference to permanent address data
    const permanentAddress = useMemo(
        () => ({
            district: permanentDistrict,
            barangay: permanentBarangay,
            landmark: permanentLandmark,
            subdivision: permanentSubdivision,
            street: permanentStreet,
            buildingFloor: permanentBuildingFloor,
            unitNo: permanentUnitNo,
        }),
        [permanentDistrict, permanentBarangay, permanentLandmark, permanentSubdivision, permanentStreet, permanentBuildingFloor, permanentUnitNo],
    );

    // Track previous values to prevent unnecessary updates
    const prevSameAsPermanent = useRef(sameAsPermanent);
    const prevPermanentAddress = useRef(permanentAddress);

    useEffect(() => {
        const checkboxChanged = prevSameAsPermanent.current !== sameAsPermanent;
        const addressChanged = JSON.stringify(prevPermanentAddress.current) !== JSON.stringify(permanentAddress);

        // Only proceed if something actually changed
        if (!checkboxChanged && !addressChanged) {
            return;
        }

        if (sameAsPermanent) {
            // Copy permanent address to bill address
            form.setValue('bill_district', permanentAddress.district, { shouldValidate: true, shouldDirty: true });
            form.setValue('bill_landmark', permanentAddress.landmark, { shouldValidate: true, shouldDirty: true });
            form.setValue('bill_subdivision', permanentAddress.subdivision, { shouldValidate: true, shouldDirty: true });
            form.setValue('bill_street', permanentAddress.street, { shouldValidate: true, shouldDirty: true });
            form.setValue('bill_building_floor', permanentAddress.buildingFloor, { shouldValidate: true, shouldDirty: true });
            form.setValue('bill_house_no', permanentAddress.unitNo, { shouldValidate: true, shouldDirty: true });

            // Use setTimeout to ensure district is updated and barangays list is loaded
            setTimeout(() => {
                form.setValue('bill_barangay', permanentAddress.barangay, { shouldValidate: true, shouldDirty: true });
            }, 100);
        } else if (checkboxChanged) {
            // Only clear when checkbox is explicitly unchecked (not on every render)
            form.setValue('bill_district', '', { shouldValidate: false });
            form.setValue('bill_barangay', '', { shouldValidate: false });
            form.setValue('bill_landmark', '', { shouldValidate: false });
            form.setValue('bill_subdivision', '', { shouldValidate: false });
            form.setValue('bill_street', '', { shouldValidate: false });
            form.setValue('bill_building_floor', '', { shouldValidate: false });
            form.setValue('bill_house_no', '', { shouldValidate: false });
        }

        // Update refs
        prevSameAsPermanent.current = sameAsPermanent;
        prevPermanentAddress.current = permanentAddress;
    }, [sameAsPermanent, permanentAddress, form]);

    return (
        <div className="flex w-full items-start justify-between space-y-8">
            <div className="w-1/2 px-4">
                <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Bill Address</h2>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="sameAsPermanent"
                            checked={sameAsPermanent}
                            onCheckedChange={(checked) => setSameAsPermanent(checked as boolean)}
                        />
                        <label
                            htmlFor="sameAsPermanent"
                            className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Same as Permanent Address
                        </label>
                    </div>
                </div>
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

                    {/* Landmark */}
                    <FormField
                        control={form.control}
                        name="bill_landmark"
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
                <h2 className="mb-4 text-lg font-semibold">Bill Delivery Options</h2>
                <FormField
                    control={form.control}
                    name="bill_delivery"
                    rules={{
                        required: 'Please select at least one bill delivery option',
                        validate: (value) => {
                            if (Array.isArray(value) && value.length > 0) return true;
                            return 'Please select at least one bill delivery option';
                        },
                    }}
                    render={({ field }) => {
                        const deliveryOptions = [
                            { id: 'spot_billing', label: 'Spot Billing' },
                            { id: 'email', label: 'Email' },
                            { id: 'sms', label: 'SMS' },
                            { id: 'pickup', label: 'Pickup at Office' },
                            { id: 'courier', label: 'Courier Delivery' },
                        ];

                        const selectedValues = Array.isArray(field.value) ? field.value : [];

                        return (
                            <FormItem>
                                <FormLabel required>Select Bill Delivery Methods</FormLabel>
                                <div className="space-y-3">
                                    {deliveryOptions.map((option) => (
                                        <div key={option.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={option.id}
                                                checked={selectedValues.includes(option.id)}
                                                onCheckedChange={(checked) => {
                                                    const newValue = checked
                                                        ? [...selectedValues, option.id]
                                                        : selectedValues.filter((value) => value !== option.id);
                                                    field.onChange(newValue);
                                                }}
                                            />
                                            <label
                                                htmlFor={option.id}
                                                className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {option.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
            </div>
        </div>
    );
}

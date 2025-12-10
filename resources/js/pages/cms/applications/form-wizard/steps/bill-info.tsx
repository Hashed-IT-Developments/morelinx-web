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
    const [pendingBarangay, setPendingBarangay] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [sameAsFacility, setSameAsFacility] = useState(false);
    const [pendingFacilityBarangay, setPendingFacilityBarangay] = useState<string | null>(null);
    const [isFacilityInitialized, setIsFacilityInitialized] = useState(false);

    const selectedTown = form.watch('bill_district');
    const { towns, barangays } = useTownsAndBarangays(selectedTown);
    const { towns: facilityTowns, barangays: facilityBarangays } = useTownsAndBarangays(form.watch('facility_district'));

    // Watch for permanent address fields
    const permanentDistrict = form.watch('district');
    const permanentBarangay = form.watch('barangay');
    const permanentLandmark = form.watch('landmark');
    const permanentSubdivision = form.watch('subdivision');
    const permanentStreet = form.watch('street');
    const permanentBuildingFloor = form.watch('building_floor');
    const permanentUnitNo = form.watch('unit_no');

    // Watch for bill address fields
    const billDistrict = form.watch('bill_district');
    const billBarangay = form.watch('bill_barangay');
    const billLandmark = form.watch('bill_landmark');
    const billSubdivision = form.watch('bill_subdivision');
    const billStreet = form.watch('bill_street');
    const billBuildingFloor = form.watch('bill_building_floor');
    const billHouseNo = form.watch('bill_house_no');
    const facilityDistrict = form.watch('facility_district');
    const facilityBarangay = form.watch('facility_barangay');
    const facilityLandmark = form.watch('facility_landmark');
    const facilitySubdivision = form.watch('facility_subdivision');
    const facilityStreet = form.watch('facility_street');
    const facilityBuildingFloor = form.watch('facility_building_floor');
    const facilityHouseNo = form.watch('facility_house_no');

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

    // Initialize checkbox state based on whether addresses match
    useEffect(() => {
        if (!isInitialized && billDistrict && permanentDistrict) {
            const addressesMatch =
                billDistrict === permanentDistrict &&
                billBarangay === permanentBarangay &&
                billLandmark === permanentLandmark &&
                billSubdivision === permanentSubdivision &&
                billStreet === permanentStreet &&
                billBuildingFloor === permanentBuildingFloor &&
                billHouseNo === permanentUnitNo;

            if (addressesMatch) {
                setSameAsPermanent(true);
            }
            setIsInitialized(true);
        }
    }, [
        billDistrict,
        billBarangay,
        billLandmark,
        billSubdivision,
        billStreet,
        billBuildingFloor,
        billHouseNo,
        permanentDistrict,
        permanentBarangay,
        permanentLandmark,
        permanentSubdivision,
        permanentStreet,
        permanentBuildingFloor,
        permanentUnitNo,
        isInitialized,
    ]);

    // Set barangay when barangays list is loaded and there's a pending barangay
    useEffect(() => {
        if (pendingBarangay && barangays && barangays.length > 0) {
            const barangayExists = barangays.some((b) => b.id.toString() === pendingBarangay);
            if (barangayExists) {
                form.setValue('bill_barangay', pendingBarangay, { shouldValidate: true, shouldDirty: true });
                setPendingBarangay(null);
            }
        }
    }, [barangays, pendingBarangay, form]);

    // Set facility barangay when facility barangays list is loaded and there's a pending barangay
    useEffect(() => {
        if (pendingFacilityBarangay && facilityBarangays && facilityBarangays.length > 0) {
            const barangayExists = facilityBarangays.some((b) => b.id.toString() === pendingFacilityBarangay);
            if (barangayExists) {
                form.setValue('facility_barangay', pendingFacilityBarangay, { shouldValidate: true, shouldDirty: true });
                setPendingFacilityBarangay(null);
            }
        }
    }, [facilityBarangays, pendingFacilityBarangay, form]);

    // Initialize facility checkbox state based on whether facility address matches permanent
    useEffect(() => {
        if (!isFacilityInitialized && facilityDistrict && form.watch('district')) {
            const addressesMatch =
                facilityDistrict === form.watch('district') &&
                facilityBarangay === form.watch('barangay') &&
                facilityLandmark === form.watch('landmark') &&
                facilitySubdivision === form.watch('subdivision') &&
                facilityStreet === form.watch('street') &&
                facilityBuildingFloor === form.watch('building_floor') &&
                facilityHouseNo === form.watch('unit_no');

            if (addressesMatch) {
                setSameAsFacility(true);
            }
            setIsFacilityInitialized(true);
        }
    }, [
        facilityDistrict,
        facilityBarangay,
        facilityLandmark,
        facilitySubdivision,
        facilityStreet,
        facilityBuildingFloor,
        facilityHouseNo,
        isFacilityInitialized,
        form,
    ]);

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

            // Set pending barangay to be applied when the barangays list loads
            if (permanentAddress.barangay) {
                setPendingBarangay(permanentAddress.barangay);
            }
        } else if (checkboxChanged) {
            // Only clear when checkbox is explicitly unchecked (not on every render)
            form.setValue('bill_district', '', { shouldValidate: false });
            form.setValue('bill_barangay', '', { shouldValidate: false });
            form.setValue('bill_landmark', '', { shouldValidate: false });
            form.setValue('bill_subdivision', '', { shouldValidate: false });
            form.setValue('bill_street', '', { shouldValidate: false });
            form.setValue('bill_building_floor', '', { shouldValidate: false });
            form.setValue('bill_house_no', '', { shouldValidate: false });
            setPendingBarangay(null);
        }

        // Update refs
        prevSameAsPermanent.current = sameAsPermanent;
        prevPermanentAddress.current = permanentAddress;
    }, [sameAsPermanent, permanentAddress, form]);

    // Sync permanent -> facility when checkbox enabled or permanent changed
    const prevSameAsFacility = useRef(sameAsFacility);
    const prevPermanentAddressForFacility = useRef(permanentAddress);
    useEffect(() => {
        const checkboxChanged = prevSameAsFacility.current !== sameAsFacility;
        const addressChanged = JSON.stringify(prevPermanentAddressForFacility.current) !== JSON.stringify(permanentAddress);

        if (!checkboxChanged && !addressChanged) {
            return;
        }

        if (sameAsFacility) {
            form.setValue('facility_district', permanentAddress.district, { shouldValidate: true, shouldDirty: true });
            form.setValue('facility_landmark', permanentAddress.landmark, { shouldValidate: true, shouldDirty: true });
            form.setValue('facility_subdivision', permanentAddress.subdivision, { shouldValidate: true, shouldDirty: true });
            form.setValue('facility_street', permanentAddress.street, { shouldValidate: true, shouldDirty: true });
            form.setValue('facility_building_floor', permanentAddress.buildingFloor, { shouldValidate: true, shouldDirty: true });
            form.setValue('facility_house_no', permanentAddress.unitNo, { shouldValidate: true, shouldDirty: true });

            if (permanentAddress.barangay) {
                setPendingFacilityBarangay(permanentAddress.barangay);
            }
        } else if (checkboxChanged) {
            form.setValue('facility_district', '', { shouldValidate: false });
            form.setValue('facility_barangay', '', { shouldValidate: false });
            form.setValue('facility_landmark', '', { shouldValidate: false });
            form.setValue('facility_subdivision', '', { shouldValidate: false });
            form.setValue('facility_street', '', { shouldValidate: false });
            form.setValue('facility_building_floor', '', { shouldValidate: false });
            form.setValue('facility_house_no', '', { shouldValidate: false });
            setPendingFacilityBarangay(null);
        }

        prevSameAsFacility.current = sameAsFacility;
        prevPermanentAddressForFacility.current = permanentAddress;
    }, [sameAsFacility, permanentAddress, form]);

    return (
        <div className="w-full space-y-8">
            {/* Residential Layout: Bill Address and Delivery Side-by-Side */}
            {(['residential'].includes(form.watch('rate_class')) || form.watch('customer_type') === 'temporary_residential') && (
                <div className="flex w-full gap-8">
                    {/* Bill Address */}
                    <div className="flex-1">
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
                                    Same as Permanent
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
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
                            {/* Building Floor */}
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

                    {/* Bill Delivery Options (beside Bill Address for residential) */}
                    <div className="flex-1">
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
            )}

            {/* Non-Residential Layout: Bill and Facility Addresses Side-by-Side, Delivery Below */}
            {(!['residential'].includes(form.watch('rate_class')) && form.watch('customer_type') !== 'temporary_residential') && (
                <div className="w-full space-y-8">
                    {/* Bill and Facility Addresses */}
                    <div className="flex w-full gap-8">
                        {/* Bill Address */}
                        <div className="flex-1">
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
                                        Same as Permanent
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
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
                        {/* Building Floor */}
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

                    {/* Facility Address (for non-residential customers) */}
                    <div className="flex-1">
                        <div className="mb-4 flex items-center gap-3">
                            <h2 className="text-lg font-semibold">Facility Address</h2>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="sameAsFacility"
                                    checked={sameAsFacility}
                                    onCheckedChange={(checked) => setSameAsFacility(checked as boolean)}
                                />
                                <label htmlFor="sameAsFacility" className="cursor-pointer text-sm leading-none font-medium">
                                    Same as Permanent
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {/* District */}
                            <FormField
                                control={form.control}
                                name="facility_district"
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
                                                {facilityTowns?.map((town) => (
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
                                name="facility_barangay"
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
                                                {facilityBarangays?.map((barangay) => (
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
                                name="facility_landmark"
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
                                name="facility_subdivision"
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
                                name="facility_street"
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
                            {/* Building Floor */}
                            <FormField
                                control={form.control}
                                name="facility_building_floor"
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
                                name="facility_house_no"
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
                </div>

                    {/* Bill Delivery Options (full width below for non-residential) */}
                    <div>
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
                                                        id={`non-res-${option.id}`}
                                                        checked={selectedValues.includes(option.id)}
                                                        onCheckedChange={(checked) => {
                                                            const newValue = checked
                                                                ? [...selectedValues, option.id]
                                                                : selectedValues.filter((value) => value !== option.id);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`non-res-${option.id}`}
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
            )}
        </div>
    );
}

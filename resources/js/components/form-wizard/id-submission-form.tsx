import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import AttachmentUpload from '../attachment-upload';

interface IDSubmissionFormProps {
    primaryIdTypes: { [key: string]: string };
    secondaryIdTypes: { [key: string]: string };
}

type IDCategory = 'primary' | 'secondary';

export default function IDSubmissionForm({ primaryIdTypes, secondaryIdTypes }: IDSubmissionFormProps) {
    const form = useFormContext();
    const idCategory: IDCategory = (form.watch('id_category') as IDCategory) || 'primary';
    const primaryIdType = form.watch('primary_id_type');
    const secondaryId1Type = form.watch('secondary_id_1_type');
    const secondaryId2Type = form.watch('secondary_id_2_type');
    const isSeniorCitizen = form.watch('is_senior_citizen');

    // State for confirmation dialog
    const [showCategoryChangeDialog, setShowCategoryChangeDialog] = useState(false);
    const [pendingCategory, setPendingCategory] = useState<IDCategory | null>(null);

    // Use ref to track previous category and prevent infinite loops
    const previousCategory = useRef<IDCategory | null>(null);

    // Auto-enable senior citizen checkbox if senior citizen ID is selected
    useEffect(() => {
        if (primaryIdType === 'senior-citizen-id' && !isSeniorCitizen) {
            form.setValue('is_senior_citizen', true, { shouldValidate: false });
        }
    }, [primaryIdType, isSeniorCitizen, form]);

    // Clear opposite category fields when switching between primary and secondary
    useEffect(() => {
        // Only run if category actually changed
        if (previousCategory.current !== null && previousCategory.current !== idCategory) {
            if (idCategory === 'primary') {
                // Clear all secondary ID fields when switching to primary
                const hasSecondaryData =
                    form.getValues('secondary_id_1_type') || form.getValues('secondary_id_1_number') || form.getValues('secondary_id_1_file');

                if (hasSecondaryData) {
                    form.setValue('secondary_id_1_type', '', { shouldValidate: false });
                    form.setValue('secondary_id_1_number', '', { shouldValidate: false });
                    form.setValue('secondary_id_1_file', null, { shouldValidate: false });
                    form.setValue('secondary_id_2_type', '', { shouldValidate: false });
                    form.setValue('secondary_id_2_number', '', { shouldValidate: false });
                    form.setValue('secondary_id_2_file', null, { shouldValidate: false });

                    // Show toast notification
                    toast.info('Secondary ID fields have been cleared', {
                        description: 'You switched to Primary ID selection',
                    });
                }
            } else if (idCategory === 'secondary') {
                // Clear all primary ID fields when switching to secondary
                const hasPrimaryData = form.getValues('primary_id_type') || form.getValues('primary_id_number') || form.getValues('primary_id_file');

                if (hasPrimaryData) {
                    form.setValue('primary_id_type', '', { shouldValidate: false });
                    form.setValue('primary_id_number', '', { shouldValidate: false });
                    form.setValue('primary_id_file', null, { shouldValidate: false });

                    // Show toast notification
                    toast.info('Primary ID fields have been cleared', {
                        description: 'You switched to Secondary ID selection',
                    });
                }
            }
        }

        // Update previous category
        previousCategory.current = idCategory;
    }, [idCategory, form]);

    // Reset Secondary ID 2 if it matches the newly selected Secondary ID 1
    useEffect(() => {
        if (secondaryId1Type && secondaryId2Type && secondaryId1Type === secondaryId2Type) {
            form.setValue('secondary_id_2_type', '', { shouldValidate: false });
            form.setValue('secondary_id_2_number', '', { shouldValidate: false });
            form.setValue('secondary_id_2_file', null, { shouldValidate: false });

            // Show toast notification
            toast.warning('Secondary ID 2 has been cleared', {
                description: 'You cannot select the same ID type twice',
            });
        }
    }, [secondaryId1Type, secondaryId2Type, form]);

    // Filter out already selected secondary ID from the second dropdown
    const availableSecondaryIdsForId2 = useMemo(() => {
        if (!secondaryId1Type) return secondaryIdTypes;

        const filtered = Object.entries(secondaryIdTypes).filter(([key]) => key !== secondaryId1Type);
        return Object.fromEntries(filtered);
    }, [secondaryId1Type, secondaryIdTypes]);

    /**
     * Handle category change with confirmation if data exists
     */
    const handleCategoryChange = (newCategory: IDCategory) => {
        const currentCategory = idCategory;

        // If switching categories, check if there's data to lose
        if (currentCategory !== newCategory) {
            let hasData = false;

            if (newCategory === 'primary' && currentCategory === 'secondary') {
                // Switching to primary from secondary - check secondary data
                hasData = !!(
                    form.getValues('secondary_id_1_type') ||
                    form.getValues('secondary_id_1_number') ||
                    form.getValues('secondary_id_1_file') ||
                    form.getValues('secondary_id_2_type') ||
                    form.getValues('secondary_id_2_number') ||
                    form.getValues('secondary_id_2_file')
                );
            } else if (newCategory === 'secondary' && currentCategory === 'primary') {
                // Switching to secondary from primary - check primary data
                hasData = !!(form.getValues('primary_id_type') || form.getValues('primary_id_number') || form.getValues('primary_id_file'));
            }

            // If there's data, show confirmation dialog
            if (hasData) {
                setPendingCategory(newCategory);
                setShowCategoryChangeDialog(true);
                return; // Don't change yet
            }
        }

        // No data to lose, change directly
        form.setValue('id_category', newCategory, { shouldValidate: false });
    };

    /**
     * Confirm category change and clear old data
     */
    const confirmCategoryChange = () => {
        if (pendingCategory) {
            form.setValue('id_category', pendingCategory, { shouldValidate: false });
            setPendingCategory(null);
        }
        setShowCategoryChangeDialog(false);
    };

    /**
     * Cancel category change
     */
    const cancelCategoryChange = () => {
        setPendingCategory(null);
        setShowCategoryChangeDialog(false);
    };

    return (
        <div>
            <h2 className="mb-4 text-lg font-semibold">Government ID Requirements</h2>

            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                    <strong>Note:</strong> You must submit at least <strong>1 Primary ID</strong> OR <strong>2 Secondary IDs</strong>.
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
                    <li>Primary IDs: {Object.values(primaryIdTypes).join(', ')}</li>
                    <li>Secondary IDs: {Object.values(secondaryIdTypes).join(', ')}</li>
                </ul>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
                <FormField
                    control={form.control}
                    name="id_category"
                    rules={{ required: 'Please select an ID category' }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel required>ID Category</FormLabel>
                            <FormControl>
                                <Select value={field.value || 'primary'} onValueChange={(value) => handleCategoryChange(value as IDCategory)}>
                                    <SelectTrigger className="mt-3 w-fit min-w-60">
                                        <SelectValue placeholder="Select ID Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="primary">Primary ID</SelectItem>
                                        <SelectItem value="secondary">Secondary ID</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showCategoryChangeDialog} onOpenChange={setShowCategoryChangeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Category Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have entered data in the {idCategory === 'primary' ? 'Primary ID' : 'Secondary IDs'} fields. Switching to{' '}
                            {pendingCategory === 'primary' ? 'Primary ID' : 'Secondary IDs'} will clear this data.
                            <br />
                            <br />
                            <strong>Are you sure you want to continue?</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelCategoryChange}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmCategoryChange}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Primary ID Form */}
            {idCategory === 'primary' && (
                <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-semibold">Primary ID</h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* ID Type Selection */}
                        <FormField
                            control={form.control}
                            name="primary_id_type"
                            rules={{ required: 'ID type is required' }}
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel required>ID Type</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select ID Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(primaryIdTypes).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ID Number */}
                        <FormField
                            control={form.control}
                            name="primary_id_number"
                            rules={{ required: 'ID number is required' }}
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel required>ID Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter ID Number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Upload Section */}
                        <AttachmentUpload name="primary_id_file" label="ID" required />
                    </div>
                </div>
            )}

            {/* Secondary IDs Form */}
            {idCategory === 'secondary' && (
                <div className="space-y-6">
                    {/* Secondary ID 1 */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-4 font-semibold">Secondary ID 1</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* ID Type Selection */}
                            <FormField
                                control={form.control}
                                name="secondary_id_1_type"
                                rules={{ required: 'ID type is required' }}
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormLabel required>ID Type</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ID Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(secondaryIdTypes).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ID Number */}
                            <FormField
                                control={form.control}
                                name="secondary_id_1_number"
                                rules={{ required: 'ID number is required' }}
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormLabel required>ID Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter ID Number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Upload Section */}
                            <AttachmentUpload name="secondary_id_1_file" label="ID" required />
                        </div>
                    </div>

                    {/* Secondary ID 2 */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-4 font-semibold">Secondary ID 2</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* ID Type Selection */}
                            <FormField
                                control={form.control}
                                name="secondary_id_2_type"
                                rules={{ required: 'ID type is required' }}
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormLabel required>ID Type</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ID Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(availableSecondaryIdsForId2).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ID Number */}
                            <FormField
                                control={form.control}
                                name="secondary_id_2_number"
                                rules={{ required: 'ID number is required' }}
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormLabel required>ID Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter ID Number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Upload Section */}
                            <AttachmentUpload name="secondary_id_2_file" label="ID" required />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

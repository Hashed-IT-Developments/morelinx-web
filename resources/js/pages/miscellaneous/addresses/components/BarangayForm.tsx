import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { BarangayForm, BarangayWithTown, Town } from '../types';

interface BarangayFormProps {
    form: UseFormReturn<BarangayForm>;
    onSubmit: (data: BarangayForm) => void;
    isSubmitting: boolean;
    editingBarangay: BarangayWithTown | null;
    onCancelEdit: () => void;
    towns: Town[];
    selectedTownId: number | null;
}

export default function BarangayFormComponent({
    form,
    onSubmit,
    isSubmitting,
    editingBarangay,
    onCancelEdit,
    towns,
    selectedTownId,
}: BarangayFormProps) {
    const selectedTownName = towns.find(t => t.id === selectedTownId)?.name || 'No town selected';

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <FormField
                        control={form.control}
                        name="town_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Town</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    value={field.value ? field.value.toString() : ''}
                                    disabled={true}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Click 'Add Barangay' in the town table">
                                                {selectedTownId ? selectedTownName : 'Click \'Add Barangay\' in the town table'}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {towns.map((town) => (
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

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Barangay Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter barangay name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    {editingBarangay ? (
                        <Button type="button" variant="outline" onClick={onCancelEdit}>
                            Cancel Editing
                        </Button>
                    ) : (
                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                            Reset
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting || !selectedTownId}>
                        {isSubmitting
                            ? editingBarangay
                                ? 'Updating...'
                                : 'Creating...'
                            : editingBarangay
                              ? 'Update Barangay'
                              : 'Create Barangay'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

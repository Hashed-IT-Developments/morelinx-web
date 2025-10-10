'use client';

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
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { ChevronDownIcon, Loader2 } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface Inspector {
    id: number;
    name: string;
}

interface AssignInspectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    applicationId: number | null;
    inspectors: Inspector[];
}

export default function AssignInspectorDialog({ open, onOpenChange, applicationId, inspectors }: AssignInspectorDialogProps) {
    const [calendarOpen, setCalendarOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    const form = useForm({
        defaultValues: {
            inspector_id: '',
            schedule_date: '',
        },
    });

    // Handler for the actual assignment after confirmation
    const handleAssign = async (data: any) => {
        if (!applicationId) return;
        setLoading(true);

        try {
            await router.post(
                route('inspections.assign'),
                {
                    customer_application_id: applicationId,
                    inspector_id: data.inspector_id,
                    schedule_date: data.schedule_date,
                },
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        toast.success('Inspector assigned successfully.');
                        onOpenChange(false);
                        form.reset();
                    },
                    onError: (errors) => {
                        if (errors && typeof errors === 'object') {
                            const firstError = Object.values(errors)[0];
                            toast.error(Array.isArray(firstError) ? firstError[0] : firstError || 'Failed to assign inspector.');
                        } else {
                            toast.error('Failed to assign inspector.');
                        }
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            toast.error('An unexpected error occurred.');
            setLoading(false);
        }
    };

    // Handler for form submit (shows confirmation dialog)
    const onSubmit = (data: any) => {
        setConfirmOpen(true);
    };

    // Handler for confirming in the alert dialog
    const onConfirm = () => {
        setConfirmOpen(false);
        handleAssign(form.getValues());
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Inspector</DialogTitle>
                        <DialogDescription>Assign an inspector and select a schedule date.</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {/* Inspector Name */}
                            <FormField
                                control={form.control}
                                name="inspector_id"
                                rules={{ required: 'Inspector is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Inspector Name</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select inspector" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {inspectors.map((inspector) => (
                                                        <SelectItem key={inspector.id} value={inspector.id.toString()}>
                                                            {inspector.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Schedule Date */}
                            <FormField
                                control={form.control}
                                name="schedule_date"
                                rules={{
                                    required: 'Schedule date is required',
                                    validate: (value) => {
                                        if (!value) return 'Schedule date is required';
                                        const selected = new Date(value);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        if (selected < today) return 'Cannot select past dates';
                                        return true;
                                    },
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Schedule Date</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-3">
                                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" id="date" className="w-48 justify-between font-normal">
                                                            {field.value ? new Date(field.value).toLocaleDateString() : 'Select date'}
                                                            <ChevronDownIcon />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => {
                                                                if (date && date >= new Date(new Date().setHours(0, 0, 0, 0))) {
                                                                    const yyyy = date.getFullYear();
                                                                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                                                                    const dd = String(date.getDate()).padStart(2, '0');
                                                                    field.onChange(`${yyyy}-${mm}-${dd}`);
                                                                    setCalendarOpen(false);
                                                                }
                                                            }}
                                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                            captionLayout="dropdown"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Assign
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog for Confirmation */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will assign the selected inspector and schedule date. You can’t undo this action.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                                Cancel
                            </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button onClick={onConfirm} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Yes, Assign
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

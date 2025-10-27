import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

type Field = { name: string };

interface AddTicketTypeProps {
    type: string;
}

export default function AddTicketType({ type }: AddTicketTypeProps) {
    const [open, setOpen] = useState(false);
    const formattedFieldType = type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const form = useForm<{ fields: Field[] }>({
        fields: [{ name: '' }],
    });

    const handleAddField = useCallback(() => {
        form.setData('fields', [...form.data.fields, { name: '' }]);
    }, [form]);

    const handleRemoveField = useCallback(
        (index: number) => {
            form.setData(
                'fields',
                form.data.fields.filter((_, i) => i !== index),
            );
        },
        [form],
    );

    const submitForm = () => {
        form.post(`/tickets/settings/ticket/${type}/save`, {
            onSuccess: () => {
                form.reset();
                toast.success(`${formattedFieldType} types added successfully`);
            },
            onError: (errors) => {
                toast.error('Failed to add ticket types' + (errors.message ? `: ${errors.message}` : ''));
            },
            onFinish: () => {
                setOpen(false);
            },
        });
    };

    useEffect(() => {
        if (form.data.fields.length === 0) {
            handleAddField();
        }
    }, [form, handleAddField]);

    return (
        <main>
            <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
                <DialogTrigger asChild>
                    <Button size="sm">
                        Add New <Plus />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add {formattedFieldType} </DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <div className="flex max-h-90 w-full flex-wrap gap-4 overflow-y-auto">
                        {form.data.fields.map((fld, idx) => (
                            <section key={idx} className="flex w-full items-end gap-2">
                                <Input
                                    label={`${formattedFieldType} ${idx + 1}`}
                                    placeholder={`Enter ${formattedFieldType}`}
                                    value={fld.name}
                                    onChange={(e) =>
                                        form.setData(
                                            'fields',
                                            form.data.fields.map((tt, i) => (i === idx ? { ...tt, name: e.target.value } : tt)),
                                        )
                                    }
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        handleRemoveField(idx);
                                    }}
                                >
                                    <X className="text-red-500" />
                                </Button>
                            </section>
                        ))}
                    </div>

                    <Button variant="outline" size="sm" className="mt-2" onClick={handleAddField}>
                        Insert Field
                        <Plus />
                    </Button>

                    <DialogFooter>
                        <AlertDialog
                            title="Confirm Submission"
                            description={`Are you sure you want to add the new ${formattedFieldType}(s)? This action cannot be undone.`}
                            onConfirm={() => submitForm()}
                        >
                            <Button>Submit</Button>
                        </AlertDialog>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}

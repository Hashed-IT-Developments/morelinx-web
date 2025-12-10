import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import AttachmentUpload from '../attachment-upload';

interface OtherAttachment {
    id: string;
    name: string;
    file: File | null;
}

/**
 * Generate a unique ID (fallback for browsers without crypto.randomUUID)
 */
const generateUniqueId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export default function OtherAttachmentsForm() {
    const form = useFormContext();

    const [otherAttachments, setOtherAttachments] = useState<OtherAttachment[]>([{ id: generateUniqueId(), name: '', file: null }]);

    useEffect(() => {
        const existingAttachments = form.getValues('other_attachments');
        if (!existingAttachments || existingAttachments.length === 0) {
            const initialAttachments = [{ id: generateUniqueId(), name: '', file: null }];
            setOtherAttachments(initialAttachments);
            form.setValue('other_attachments', initialAttachments, { shouldValidate: false });
        } else {
            setOtherAttachments(existingAttachments);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Add a new other attachment field
     */
    const addOtherAttachment = () => {
        const newAttachment: OtherAttachment = {
            id: generateUniqueId(),
            name: '',
            file: null,
        };
        const updated = [...otherAttachments, newAttachment];
        setOtherAttachments(updated);

        // Update form value
        form.setValue('other_attachments', updated, { shouldValidate: false });
    };

    /**
     * Remove an other attachment field
     */
    const removeOtherAttachment = (id: string) => {
        if (otherAttachments.length === 1) {
            toast.error('Cannot remove the last attachment', {
                description: 'At least one attachment field is required',
            });
            return;
        }
        const updated = otherAttachments.filter((att) => att.id !== id);
        setOtherAttachments(updated);

        // Update form value for validation
        form.setValue('other_attachments', updated, { shouldValidate: true });
    };

    /**
     * Update other attachment name
     */
    const updateAttachmentName = (id: string, name: string) => {
        setOtherAttachments((prev) => {
            const updated = prev.map((att) => (att.id === id ? { ...att, name } : att));

            // Update form value immediately for validation
            form.setValue('other_attachments', updated, { shouldValidate: false });

            return updated;
        });
    };

    /**
     * Watch for file changes in the form and sync to state
     */
    useEffect(() => {
        const subscription = form.watch((value, { name: fieldName }) => {
            if (fieldName?.startsWith('other_attachment_file_')) {
                const attachmentId = fieldName.replace('other_attachment_file_', '');
                const file = value[fieldName];

                setOtherAttachments((prev) => {
                    const updated = prev.map((att) => (att.id === attachmentId ? { ...att, file: file || null } : att));

                    // Update form value for validation immediately
                    setTimeout(() => {
                        form.setValue('other_attachments', updated, { shouldValidate: true });
                    }, 0);

                    return updated;
                });
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    /**
     * Sync file uploads from individual form fields to other_attachments array before validation
     * This ensures files are included when validating
     */
    useEffect(() => {
        const interval = setInterval(() => {
            const formValues = form.getValues();
            const updated = otherAttachments.map((att) => {
                const fileFieldName = `other_attachment_file_${att.id}`;
                const fileFromForm = formValues[fileFieldName];
                if (fileFromForm instanceof File && fileFromForm !== att.file) {
                    // Keep the name from current state, only update file
                    return { id: att.id, name: att.name, file: fileFromForm };
                }
                return att;
            });

            // Update if there are changes
            const hasChanges = updated.some((att, index) => att.file !== otherAttachments[index].file);
            if (hasChanges) {
                setOtherAttachments(updated);
                form.setValue('other_attachments', updated, { shouldValidate: false });
            }
        }, 500);

        return () => clearInterval(interval);
    }, [form, otherAttachments]);

    return (
        <div className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">Other Attachments</h3>
                    <p className="text-sm text-muted-foreground">
                        Upload supporting documents (e.g., electrical plan, permit, title, business permit, DTI, SEC, SPA, etc.)
                    </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addOtherAttachment}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Attachment
                </Button>
            </div>

            <FormField
                control={form.control}
                name="other_attachments"
                rules={{
                    validate: (value: OtherAttachment[]) => {
                        // At least one attachment is required
                        if (!value || value.length === 0) {
                            return 'At least one attachment is required';
                        }

                        // Check if at least one attachment has both name and file
                        const hasValidAttachment = value.some((att) => att.name.trim() !== '' && att.file !== null);
                        if (!hasValidAttachment) {
                            return 'At least one attachment with name and file is required';
                        }

                        // Check each attachment individually
                        for (let i = 0; i < value.length; i++) {
                            const att = value[i];
                            const hasName = att.name.trim() !== '';
                            const hasFile = att.file !== null;

                            // If either name or file is filled, both must be filled
                            if ((hasName || hasFile) && (!hasName || !hasFile)) {
                                return `Attachment ${i + 1}: Both name and file are required`;
                            }
                        }

                        return true;
                    },
                }}
                render={() => (
                    <FormItem>
                        <FormControl>
                            <div className="space-y-4">
                                {otherAttachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-start gap-4 rounded-lg border p-4">
                                        <div className="flex-1 space-y-4">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {/* Attachment Name */}
                                                <div>
                                                    <FormLabel required>Attachment Name</FormLabel>
                                                    <Input
                                                        placeholder="e.g., Electrical Plan, Business Permit"
                                                        value={attachment.name}
                                                        onChange={(e) => updateAttachmentName(attachment.id, e.target.value)}
                                                        className="mt-4"
                                                    />
                                                </div>

                                                {/* Attachment File */}
                                                <div>
                                                    <AttachmentUpload name={`other_attachment_file_${attachment.id}`} label="File" required />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        {otherAttachments.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOtherAttachment(attachment.id)}
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

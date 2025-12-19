import axios from 'axios';

export function useFormSubmit() {
    /**
     * Automatically handles form submission:
     * - Sends as JSON if no File exists
     * - Sends as multipart/form-data if any File or FileList is found
     */
    const submitForm = async (url: string, values: Record<string, unknown>) => {
        // Check recursively for files in nested objects
        const hasFile = (obj: unknown): boolean => {
            if (obj instanceof File || obj instanceof FileList) return true;
            if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
                return Object.values(obj).some(hasFile);
            }
            return false;
        };

        if (hasFile(values)) {
            const formData = new FormData();

            // Collect all other_attachment_file_* fields for later processing
            const otherAttachmentFiles: Record<string, File> = {};
            Object.entries(values).forEach(([key, val]) => {
                if (key.startsWith('other_attachment_file_') && val instanceof File) {
                    const attachmentId = key.replace('other_attachment_file_', '');
                    otherAttachmentFiles[attachmentId] = val;
                }
            });

            Object.entries(values).forEach(([key, val]) => {
                if (val instanceof FileList) {
                    Array.from(val).forEach((file) => formData.append(`${key}[]`, file));
                } else if (val instanceof File) {
                    // Handle File uploads (including other_attachment_file_* fields for validation)
                    formData.append(key, val);
                } else if (key === 'other_attachments' && Array.isArray(val)) {
                    // Special handling for other_attachments
                    val.forEach((item, index) => {
                        if (item && typeof item === 'object') {
                            const attachmentId = (item as { id?: string }).id;
                            const name = (item as { name?: string }).name;

                            // Append id for reference
                            if (attachmentId) {
                                formData.append(`other_attachments[${index}][id]`, attachmentId);
                            }

                            // Append the name
                            if (name !== undefined && name !== null) {
                                formData.append(`other_attachments[${index}][name]`, String(name));
                            }

                            // Get the file from collected files or from the item itself
                            let fileToAppend: File | null = null;
                            if (attachmentId && otherAttachmentFiles[attachmentId]) {
                                fileToAppend = otherAttachmentFiles[attachmentId];
                            } else {
                                const itemFile = (item as { file?: unknown }).file;
                                if (itemFile instanceof File) {
                                    fileToAppend = itemFile;
                                }
                            }

                            // Append the file if found
                            if (fileToAppend) {
                                formData.append(`other_attachments[${index}][file]`, fileToAppend);
                            }
                        }
                    });
                } else if (Array.isArray(val)) {
                    // Handle other arrays
                    if (val.length === 0) {
                        // Send empty array indicator for Laravel validation
                        formData.append(`${key}`, '');
                    } else {
                        val.forEach((item, index) => {
                            if (item && typeof item === 'object' && !(item instanceof File)) {
                                // Handle array of objects
                                Object.entries(item).forEach(([nestedKey, nestedVal]) => {
                                    if (nestedVal instanceof File) {
                                        formData.append(`${key}[${index}][${nestedKey}]`, nestedVal);
                                    } else if (nestedVal !== undefined && nestedVal !== null) {
                                        formData.append(`${key}[${index}][${nestedKey}]`, String(nestedVal));
                                    }
                                });
                            } else {
                                // Handle simple arrays (like bill_delivery)
                                formData.append(`${key}[]`, String(item));
                            }
                        });
                    }
                } else if (val && typeof val === 'object' && !(val instanceof Date)) {
                    // Handle nested objects (like attachments)
                    Object.entries(val).forEach(([nestedKey, nestedVal]) => {
                        if (nestedVal instanceof File) {
                            formData.append(`${key}[${nestedKey}]`, nestedVal);
                        }
                    });
                } else if (val !== undefined && val !== null) {
                    formData.append(key, String(val));
                }
            });

            // Let Axios set headers automatically
            return await axios.post(url, formData);
        }

        // Default: send as JSON
        return await axios.post(url, values);
    };

    return { submitForm };
}

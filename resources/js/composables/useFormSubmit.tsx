import axios from 'axios';

export function useFormSubmit() {
    /**
     * Automatically handles form submission:
     * - Sends as JSON if no File exists
     * - Sends as multipart/form-data if any File or FileList is found
     */
    const submitForm = async (url: string, values: Record<string, unknown>) => {
        // Check recursively for files in nested objects
        const hasFile = (obj: any): boolean => {
            if (obj instanceof File || obj instanceof FileList) return true;
            if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
                return Object.values(obj).some(hasFile);
            }
            return false;
        };

        if (hasFile(values)) {
            const formData = new FormData();

            Object.entries(values).forEach(([key, val]) => {
                if (val instanceof FileList) {
                    Array.from(val).forEach((file) => formData.append(`${key}[]`, file));
                } else if (val instanceof File) {
                    formData.append(key, val);
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

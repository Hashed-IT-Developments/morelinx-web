import axios from 'axios';

export function useFormSubmit() {
    /**
     * Automatically handles form submission:
     * - Sends as JSON if no File exists
     * - Sends as multipart/form-data if any File or FileList is found
     */
    const submitForm = async (url: string, values: Record<string, unknown>) => {
        const hasFile = Object.values(values).some((val) => val instanceof File || val instanceof FileList);

        if (hasFile) {
            const formData = new FormData();

            Object.entries(values).forEach(([key, val]) => {
                if (val instanceof FileList) {
                    Array.from(val).forEach((file) => formData.append(`${key}[]`, file));
                } else if (val instanceof File) {
                    formData.append(key, val);
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

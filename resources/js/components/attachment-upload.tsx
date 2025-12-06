import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Alert, AlertDescription } from './ui/alert';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

interface AttachmentUploadProps {
    name: string; // e.g., "attachments.sss_id"
    label: string; // e.g., "SSS ID"
    required?: boolean;
    accept?: string;
    maxSizeMB?: number;
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({ name, label, required = false, accept = 'image/*,.pdf,.doc,.docx', maxSizeMB = 5 }) => {
    const form = useFormContext();
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Validate file before accepting it
     */
    const validateFile = (file: File): string | null => {
        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
        }

        // Check file type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedTypes.includes(file.type)) {
            return `Invalid file type. Only images (JPG, PNG , JPEG, WebP), PDF files, and documents (DOC, DOCX) are allowed.`;
        }

        // Additional check for file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'];
        if (!extension || !allowedExtensions.includes(extension)) {
            return `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`;
        }

        return null;
    };

    return (
        <FormField
            control={form.control}
            name={name}
            rules={{
                required: required ? `${label} is required` : false,
                validate: (value) => {
                    if (!required && !value) return true;
                    if (required && !value) return `${label} is required`;

                    // If value is a File object, validate it
                    if (value instanceof File) {
                        const error = validateFile(value);
                        if (error) return error;
                    }

                    return true;
                },
            }}
            render={({ field: { onChange, value, ...field } }) => {
                const inputId = `upload-${name}`;
                const fileName = value instanceof File ? value.name : value || '';
                const fileSize = value instanceof File ? `(${(value.size / 1024).toFixed(2)} KB)` : '';

                return (
                    <FormItem className="space-y-2">
                        <FormLabel required={required}>{label}</FormLabel>
                        <FormControl>
                            <div>
                                <input
                                    {...field}
                                    type="file"
                                    id={inputId}
                                    className="hidden"
                                    accept={accept}
                                    disabled={isUploading}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setIsUploading(true);

                                            // Validate file before setting
                                            const error = validateFile(file);
                                            if (error) {
                                                setValidationError(error);
                                                setIsUploading(false);
                                                // Clear the file input
                                                e.target.value = '';
                                                return;
                                            }

                                            // Simulate async upload (you can replace with actual upload logic)
                                            setValidationError(null);

                                            // For file reading/preview, you might want to add delay
                                            setTimeout(() => {
                                                onChange(file);
                                                setIsUploading(false);
                                            }, 300);
                                        }
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => document.getElementById(inputId)?.click()}
                                    disabled={isUploading}
                                    className={`flex w-fit items-center gap-2 ${fileName ? 'border-green-600 text-green-600' : 'text-gray-600'}`}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-2 w-4" />
                                            {fileName ? (
                                                <span className="flex max-w-[200px] items-center gap-1">
                                                    <span className="block truncate" title={fileName}>
                                                        {fileName}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{fileSize}</span>
                                                </span>
                                            ) : (
                                                `Upload ${label}`
                                            )}
                                        </>
                                    )}
                                </Button>

                                {validationError && (
                                    <Alert variant="destructive" className="mt-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{validationError}</AlertDescription>
                                    </Alert>
                                )}

                                <p className="mt-1 text-xs text-gray-500">Max file size: {maxSizeMB}MB | Allowed: images, pdf, and doc files.</p>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
};

export default AttachmentUpload;

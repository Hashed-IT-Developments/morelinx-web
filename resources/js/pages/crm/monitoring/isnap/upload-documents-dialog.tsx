import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AttachmentFiles from '@/pages/crm/applications/components/attachment-files';
import { router } from '@inertiajs/react';
import { FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface UploadDocumentsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerApplication: CustomerApplication;
}

export default function UploadDocumentsDialog({ open, onOpenChange, customerApplication }: UploadDocumentsDialogProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        if (files.length === 0) {
            toast.error('Please select at least one file to upload');
            return;
        }

        // Validate file sizes
        const maxSize = 5 * 1024 * 1024; // 5MB
        const invalidFiles = files.filter((file) => file.size > maxSize);
        if (invalidFiles.length > 0) {
            toast.error(`Some files exceed the 5MB limit: ${invalidFiles.map((f) => f.name).join(', ')}`);
            return;
        }

        // Validate file types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
        ];
        const invalidTypes = files.filter((file) => !allowedTypes.includes(file.type));
        if (invalidTypes.length > 0) {
            toast.error(`Some files have invalid types: ${invalidTypes.map((f) => f.name).join(', ')}`);
            return;
        }

        setUploading(true);

        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`documents[${index}]`, file);
        });

        router.post(route('isnap.store-documents', customerApplication.id), formData, {
            onSuccess: (page) => {
                setFiles([]);
                onOpenChange(false);
                const successMessage = (page.props as Record<string, unknown>).flash as { success?: string };
                if (successMessage?.success) {
                    toast.success(successMessage.success);
                }
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
                const errorMessages = Object.values(errors).flat();
                const errorText = errorMessages.length > 0 ? errorMessages.join(' ') : 'Failed to upload documents. Please try again.';
                toast.error(errorText);
            },
            onFinish: () => {
                setUploading(false);
            },
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl overflow-x-hidden overflow-y-auto sm:w-full">
                <DialogHeader>
                    <DialogTitle>Upload Documents for ISNAP Member</DialogTitle>
                    <div className="mt-2 text-sm text-muted-foreground">
                        <p>
                            <strong>Account:</strong> {customerApplication.account_number}
                        </p>
                        <p>
                            <strong>Name:</strong> {customerApplication.full_name || customerApplication.identity}
                        </p>
                    </div>
                </DialogHeader>

                <div className="space-y-4 overflow-x-hidden">
                    {/* Upload Section */}
                    <div className="space-y-2">
                        <Label htmlFor="documents">Upload Documents</Label>
                        <input
                            ref={fileInputRef}
                            id="documents"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="sr-only"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                <Upload className="mr-2 h-4 w-4" />
                                Browse Files
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                {files.length > 0
                                    ? `${files.length} file${files.length !== 1 ? 's' : ''} selected`
                                    : 'Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB per file)'}
                            </span>
                        </div>
                    </div>

                    {/* Files List */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            <Label>Selected Files ({files.length})</Label>
                            <div className="max-h-[200px] overflow-y-auto rounded-md border p-4">
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 overflow-hidden rounded-md border p-3">
                                            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1 overflow-hidden">
                                                <p className="truncate text-sm font-medium whitespace-nowrap" title={file.name}>
                                                    {file.name}
                                                </p>
                                                <p className="text-xs whitespace-nowrap text-muted-foreground">{formatFileSize(file.size)}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0"
                                                onClick={() => removeFile(index)}
                                                title="Remove file"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Existing Documents Section */}
                    <div className="space-y-2">
                        <AttachmentFiles
                            attachments={(customerApplication as unknown as { attachments?: CaAttachment[] }).attachments || []}
                            title="Existing Documents"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleUpload} disabled={files.length === 0 || uploading}>
                        {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

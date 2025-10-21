import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFileAttachments } from '@/hooks/use-file-attachments';
import { downloadFile, FILE_TYPES, generateFileUrl, getAttachmentTypeLabel, getFileIconColor, getFileName, getFileType } from '@/lib/file-utils';
import { formatDate } from '@/lib/utils';
import { Download, Eye, File, FileText, Paperclip } from 'lucide-react';
import { useCallback, useMemo } from 'react';

interface FilesProps {
    attachments?: CaAttachment[];
}

// File icon component with dynamic color based on file type
const FileIcon = ({ path }: { path: string }) => {
    const colorClass = getFileIconColor(path);
    return <FileText className={`h-5 w-5 ${colorClass}`} />;
};

// File preview renderer component
const FilePreviewRenderer = ({ file }: { file: CaAttachment }) => {
    const fileType = useMemo(() => getFileType(file.path), [file.path]);
    const fileName = useMemo(() => getFileName(file.path), [file.path]);
    const fileUrl = useMemo(() => generateFileUrl(file.path), [file.path]);

    const handleDownload = useCallback(() => {
        downloadFile(file.path, fileName);
    }, [file.path, fileName]);

    // Render image preview
    if (fileType === FILE_TYPES.IMAGE) {
        return <img src={fileUrl} alt={fileName} className="max-h-full max-w-full object-contain" />;
    }

    // Render PDF preview
    if (fileType === FILE_TYPES.PDF) {
        return <iframe src={fileUrl} className="h-[600px] w-full border-0" title={fileName} />;
    }

    // Fallback for unsupported file types
    return (
        <div className="text-center text-gray-500 dark:text-gray-400">
            <File className="mx-auto mb-4 h-16 w-16" />
            <p className="mb-2">Preview not available for this file type</p>
            <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download File
            </Button>
        </div>
    );
};

// Empty state component
const EmptyState = () => (
    <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Paperclip className="h-5 w-5" />
            Attachments
        </h3>
        <div className="py-8 text-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Paperclip className="h-10 w-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">No Files Attached</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">No files have been uploaded for this application yet.</p>
                </div>
            </div>
        </div>
    </div>
);

// File item component
const FileItem = ({
    file,
    onPreview,
    onDownload,
}: {
    file: CaAttachment;
    onPreview: (file: CaAttachment) => void;
    onDownload: (file: CaAttachment) => void;
}) => {
    const fileName = useMemo(() => getFileName(file.path), [file.path]);
    const typeLabel = useMemo(() => getAttachmentTypeLabel(file.type), [file.type]);

    return (
        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex-shrink-0">
                    <FileIcon path={file.path} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{fileName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{typeLabel}</p>
                </div>
            </div>
            <div className="flex gap-1">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0 p-0"
                    onClick={() => onPreview(file)}
                    title="Preview attachment"
                >
                    <Eye className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0 p-0"
                    onClick={() => onDownload(file)}
                    title="Download attachment"
                >
                    <Download className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default function AttachmentFiles({ attachments = [] }: FilesProps) {
    const { selectedFile, previewOpen, handlePreview, handleDownload, handleDialogClose } = useFileAttachments();

    // Early return for empty attachments
    if (!attachments || attachments.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Paperclip className="h-5 w-5" />
                Attachments ({attachments.length})
            </h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {attachments.map((file) => (
                    <FileItem key={file.id} file={file} onPreview={handlePreview} onDownload={handleDownload} />
                ))}
            </div>

            {/* File Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedFile && (
                                <>
                                    {(() => {
                                        const fileType = getFileType(selectedFile.path);
                                        const IconComponent = fileType.icon;
                                        return <IconComponent className={fileType.iconClass} />;
                                    })()}
                                    {getFileName(selectedFile.path)}
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedFile && (
                                <span className="flex items-center gap-4 text-sm">
                                    <span>Type: {getAttachmentTypeLabel(selectedFile.type)}</span>
                                    <span>•</span>
                                    <span>Uploaded: {formatDate(selectedFile.created_at)}</span>
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto">
                        {selectedFile && (
                            <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                                <FilePreviewRenderer file={selectedFile} />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

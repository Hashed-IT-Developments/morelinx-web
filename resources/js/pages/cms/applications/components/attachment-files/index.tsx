import { useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { 
    Download, 
    Eye, 
    File, 
    Paperclip,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { 
    getFileType, 
    getFileName, 
    getFileExtension, 
    generateFileUrl, 
    downloadFile,
    FILE_TYPES
} from '@/lib/file-utils';
import { useFileAttachments } from '@/hooks/use-file-attachments';

interface FilesProps {
    attachments?: CaAttachment[];
}

interface FileCardProps {
    file: CaAttachment;
    onPreview: (file: CaAttachment) => void;
    onDownload: (file: CaAttachment) => void;
}

const FileCard = ({ file, onPreview, onDownload }: FileCardProps) => {
    const fileType = useMemo(() => getFileType(file.path), [file.path]);
    const fileName = useMemo(() => getFileName(file.path), [file.path]);
    const fileExtension = useMemo(() => getFileExtension(file.path), [file.path]);
    
    const IconComponent = fileType.icon;

    return (
        <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-800 dark:to-gray-700">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* File Header */}
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-2">
                            <IconComponent className={fileType.iconClass} />
                        </div>
                        <div className="w-full">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200 truncate text-sm">
                                {fileName}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {file.type}
                            </p>
                        </div>
                    </div>

                    {/* File Type Badge */}
                    <div className="flex justify-center">
                        <Badge 
                            variant="outline" 
                            className={`text-xs ${fileType.badgeClass}`}
                        >
                            {fileExtension.toUpperCase() || 'FILE'}
                        </Badge>
                    </div>

                    {/* File Metadata */}
                    <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(file.created_at)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        {fileType.canPreview ? (
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full gap-1 transition-colors hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                onClick={() => onPreview(file)}
                            >
                                <Eye className="h-3 w-3" />
                                Preview
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full gap-1 transition-colors hover:bg-gray-50 hover:text-gray-700"
                                disabled
                            >
                                <AlertCircle className="h-3 w-3" />
                                No Preview
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-1 transition-colors hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                            onClick={() => onDownload(file)}
                        >
                            <Download className="h-3 w-3" />
                            Download
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Empty state component
const EmptyState = () => (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-900">
        <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                    <Paperclip className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                        No Files Attached
                    </h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        No files have been uploaded for this application yet.
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
);

// File preview renderer component
const FilePreviewRenderer = ({ file }: { file: CaAttachment }) => {
    const fileType = useMemo(() => getFileType(file.path), [file.path]);
    const fileName = useMemo(() => getFileName(file.path), [file.path]);
    const fileUrl = useMemo(() => generateFileUrl(file.path), [file.path]);

    const handleDownload = useCallback(() => {
        downloadFile(file.path, fileName);
    }, [file.path, fileName]);

    if (fileType === FILE_TYPES.IMAGE) {
        return (
            <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
            />
        );
    }

    if (fileType === FILE_TYPES.PDF) {
        return (
            <iframe
                src={fileUrl}
                className="w-full h-[600px] border-0"
                title={fileName}
            />
        );
    }

    return (
        <div className="text-center text-gray-500">
            <File className="h-16 w-16 mx-auto mb-4" />
            <p>Preview not available for this file type</p>
            <Button className="mt-4" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download File
            </Button>
        </div>
    );
};

export default function AttachmentFiles({ attachments = [] }: FilesProps) {
    const {
        selectedFile,
        previewOpen,
        handlePreview,
        handleDownload,
        handleDialogClose
    } = useFileAttachments();

    // Early return for empty attachments
    if (!attachments || attachments.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-6">
            {/* Files Summary and Grid */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-700 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <Paperclip className="h-5 w-5 text-blue-600" />
                        Attached Files
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                            {attachments.length} file{attachments.length !== 1 ? 's' : ''}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {attachments.map((file) => (
                            <FileCard
                                key={file.id}
                                file={file}
                                onPreview={handlePreview}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* File Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedFile && (() => {
                                const fileType = getFileType(selectedFile.path);
                                const IconComponent = fileType.icon;
                                return <IconComponent className={fileType.iconClass} />;
                            })()}
                            {selectedFile && getFileName(selectedFile.path)}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedFile && (
                                <div className="flex items-center gap-4 text-sm">
                                    <span>Type: {selectedFile.type}</span>
                                    <span>•</span>
                                    <span>Uploaded: {formatDate(selectedFile.created_at)}</span>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-auto">
                        {selectedFile && (
                            <div className="w-full h-full min-h-[400px] bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <FilePreviewRenderer file={selectedFile} />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
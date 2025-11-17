import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DocumentPreviewDialogProps {
    isOpen: boolean;
    file: File | null;
    title: string;
    onClose: () => void;
}

export const DocumentPreviewDialog = ({ isOpen, file, title, onClose }: DocumentPreviewDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
                {file && (
                    <div className="flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt={title} className="h-auto max-w-full" />
                        ) : file.type === 'application/pdf' ? (
                            <iframe src={URL.createObjectURL(file)} className="h-[70vh] w-full" title={title} />
                        ) : (
                            <div className="py-8 text-center">
                                <p className="mb-4 text-gray-600">Preview not available for this file type</p>
                                <p className="text-sm text-gray-500">{file.name}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
);

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DocumentPreviewDialogProps {
    isOpen: boolean;
    file: File | null;
    title: string;
    onClose: () => void;
}

export const DocumentPreviewDialog = ({ isOpen, file, title, onClose }: DocumentPreviewDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
                {file && (
                    <div className="flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt={title} className="max-w-full h-auto" />
                        ) : file.type === 'application/pdf' ? (
                            <iframe src={URL.createObjectURL(file)} className="w-full h-[70vh]" title={title} />
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                                <p className="text-sm text-gray-500">{file.name}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
);

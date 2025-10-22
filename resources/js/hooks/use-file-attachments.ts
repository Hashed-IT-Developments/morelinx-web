import { downloadFile } from '@/lib/file-utils';
import { useCallback, useState } from 'react';

/**
 * Custom hook for managing file attachment operations
 */
export const useFileAttachments = () => {
    const [selectedFile, setSelectedFile] = useState<CaAttachment | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const handlePreview = useCallback((file: CaAttachment) => {
        setSelectedFile(file);
        setPreviewOpen(true);
    }, []);

    const handleDownload = useCallback((file: CaAttachment) => {
        downloadFile(file.path);
    }, []);

    const handleDialogClose = useCallback((open: boolean) => {
        setPreviewOpen(open);
        if (!open) {
            setSelectedFile(null);
        }
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedFile(null);
        setPreviewOpen(false);
    }, []);

    return {
        selectedFile,
        previewOpen,
        handlePreview,
        handleDownload,
        handleDialogClose,
        clearSelection,
        // Computed properties
        hasSelectedFile: selectedFile !== null,
    };
};

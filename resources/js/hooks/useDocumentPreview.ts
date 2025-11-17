import { useState, useCallback } from 'react';

interface PreviewDialogState {
    isOpen: boolean;
    file: File | null;
    title: string;
}

export const useDocumentPreview = () => {
    const [previewDialog, setPreviewDialog] = useState<PreviewDialogState>({
        isOpen: false,
        file: null,
        title: '',
    });

    const openPreview = useCallback((file: File, title: string) => {
        setPreviewDialog({ isOpen: true, file, title });
    }, []);

    const closePreview = useCallback(() => {
        setPreviewDialog({ isOpen: false, file: null, title: '' });
    }, []);

    return {
        previewDialog,
        openPreview,
        closePreview,
    };
};

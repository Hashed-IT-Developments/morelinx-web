import { Eye } from 'lucide-react';

interface DocumentPreviewButtonProps {
    label: string;
    file: File;
    onPreview: (file: File, label: string) => void;
}

export const DocumentPreviewButton = ({ label, file, onPreview }: DocumentPreviewButtonProps) => (
    <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{label}:</span>
        <button
            type="button"
            onClick={() => onPreview(file, label)}
            className="flex w-fit items-center gap-2 rounded-md border border-green-600 px-3 py-2 text-green-600 hover:bg-green-50"
        >
            <Eye className="h-4 w-4" />
            <span className="flex max-w-[200px] items-center gap-1">
                <span className="block truncate text-sm" title={file.name}>
                    {file.name}
                </span>
                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
            </span>
        </button>
    </div>
);

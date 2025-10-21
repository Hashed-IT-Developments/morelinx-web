import { File, FileImage, FileText } from 'lucide-react';

// Types for file configurations
export type FileTypeConfig = {
    extensions: string[];
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    badgeClass: string;
    canPreview: boolean;
};

// Constants for file type configurations
export const FILE_TYPES: Record<string, FileTypeConfig> = {
    IMAGE: {
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
        icon: FileImage,
        iconClass: 'h-6 w-6 text-blue-500',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        canPreview: true,
    },
    PDF: {
        extensions: ['pdf'],
        icon: FileText,
        iconClass: 'h-6 w-6 text-red-500',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        canPreview: true,
    },
    DOCUMENT: {
        extensions: ['doc', 'docx'],
        icon: FileText,
        iconClass: 'h-6 w-6 text-blue-600',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        canPreview: false,
    },
    SPREADSHEET: {
        extensions: ['xls', 'xlsx'],
        icon: FileText,
        iconClass: 'h-6 w-6 text-green-600',
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
        canPreview: false,
    },
    DEFAULT: {
        extensions: [],
        icon: File,
        iconClass: 'h-6 w-6 text-gray-500',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
        canPreview: false,
    },
};

// Utility functions for file operations
export const getFileExtension = (path: string): string => {
    return path.split('.').pop()?.toLowerCase() || '';
};

export const getFileName = (path: string): string => {
    return path.split('/').pop() || path;
};

export const getFileType = (path: string): FileTypeConfig => {
    const extension = getFileExtension(path);
    return Object.values(FILE_TYPES).find((type) => type.extensions.includes(extension)) || FILE_TYPES.DEFAULT;
};

export const generateFileUrl = (path: string): string => `/storage/${path}`;

export const downloadFile = (path: string, fileName?: string): void => {
    const link = document.createElement('a');
    link.href = generateFileUrl(path);
    link.download = fileName || getFileName(path);
    link.click();
};

export const isImageFile = (path: string): boolean => {
    return getFileType(path) === FILE_TYPES.IMAGE;
};

export const isPdfFile = (path: string): boolean => {
    return getFileType(path) === FILE_TYPES.PDF;
};

export const canPreviewFile = (path: string): boolean => {
    return getFileType(path).canPreview;
};

/**
 * Formats file size from bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validates if a file type is allowed based on extensions
 */
export const isAllowedFileType = (fileName: string, allowedExtensions?: string[]): boolean => {
    if (!allowedExtensions || allowedExtensions.length === 0) return true;

    const extension = getFileExtension(fileName);
    return allowedExtensions.includes(extension);
};

/**
 * Gets MIME type based on file extension
 */
export const getMimeType = (path: string): string => {
    const extension = getFileExtension(path);
    const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        bmp: 'image/bmp',
        webp: 'image/webp',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Gets the appropriate icon color class based on file extension
 */
export const getFileIconColor = (path: string): string => {
    const extension = getFileExtension(path);

    switch (extension) {
        case 'pdf':
            return 'text-red-500';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
            return 'text-green-500';
        case 'doc':
        case 'docx':
            return 'text-blue-500';
        default:
            return 'text-gray-500';
    }
};

/**
 * Converts attachment type codes to human-readable labels
 */
export const getAttachmentTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
        passport: 'Passport',
        'philippine-national-id-philsys': 'Philippine National ID (PhilSys)',
        'drivers-license': "Driver's License",
        'sss-id': 'SSS ID',
        umid: 'UMID',
        'philhealth-id': 'PhilHealth ID',
        'tin-id': 'TIN ID',
        'voters-id': "Voter's ID",
        'prc-id': 'PRC ID',
        'pag-ibig-id': 'Pag-Ibig ID',
        'postal-id': 'Postal ID',
        'senior-citizen-id': 'Senior Citizen ID',
        'ofw-id': 'OFW ID',
        'student-id': 'Student ID',
        'pwd-id': 'PWD ID',
        'gsis-id': 'GSIS ID',
        'firearms-license': 'Firearms License',
        'marina-id': 'MARINA ID',
        'philippine-passport-card': 'Philippine Passport Card',
        'company-id': 'Company ID',
        cg_ewt: 'EWT Certificate',
        sketch: 'Location Sketch',
        application: 'Application Form',
        'barangay-certificate': 'Barangay Certificate',
        cedula: 'Cedula',
        contract: 'Contract',
        others: 'Other Documents',
    };

    return (
        typeLabels[type] ||
        type
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    );
};

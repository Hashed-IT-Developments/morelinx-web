import { useStatusUtils } from '@/components/composables/status-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import { Building2, Calendar, Download, Eye, FileText, IdCard, MapPin, Paperclip, Phone, User, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// --- Types ---
interface ApplicationSummary {
    id: string;
    account_number: string;
    full_name: string;
    identity: string;
    email_address: string;
    mobile_1: string;
    mobile_2: string | null;
    tel_no_1: string | null;
    tel_no_2: string | null;
    full_address: string;
    status: string;
    connected_load: number | null;
    property_ownership: string | null;
    birth_date: string | null;
    nationality: string | null;
    gender: string | null;
    marital_status: string | null;
    is_sc: boolean | null;
    sc_number: string | null;
    id_type_1: string | null;
    id_number_1: string | null;
    id_type_2: string | null;
    id_number_2: string | null;
    created_at: string;
    created_at_formatted: string;
    created_at_human: string;
    updated_at: string;
    account_name: string | null;
    trade_name: string | null;
    cor_number: string | null;
    tin_number: string | null;

    attachments_count: number;
    attachments: Array<{
        id: number;
        type: string;
        path: string;
        url: string;
        filename: string;
        extension: string;
        is_image: boolean;
        mime_type: string;
        size: number | null;
        created_at: string;
    }>;
    inspections_count: number;

    customer_type: {
        id: number;
        name: string;
        rate_class: string;
        customer_type: string;
    } | null;

    barangay: {
        id: number;
        name: string;
        town: {
            id: number;
            name: string;
        } | null;
    } | null;

    district: {
        id: number;
        name: string;
    } | null;

    bill_info: {
        subdivision?: string;
        unit_no?: string;
        street?: string;
        building?: string;
        delivery_mode?: string;
        barangay?: {
            id: number;
            name: string;
            town?: {
                id: number;
                name: string;
            };
        };
    } | null;
}

interface ApplicationSummaryDialogProps {
    applicationId: string | number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ApplicationSummaryDialog({ applicationId, open, onOpenChange }: ApplicationSummaryDialogProps) {
    const [application, setApplication] = useState<ApplicationSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<ApplicationSummary['attachments'][0] | null>(null);
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const fetchApplicationSummary = useCallback(async () => {
        if (!applicationId) return;

        setLoading(true);
        try {
            const response = await axios.get(route('customer-applications.summary', { application: applicationId }) + '?v=' + Date.now());
            setApplication(response.data);
        } catch (error) {
            console.error('Error fetching application summary:', error);
            toast.error('Failed to load application details');
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        if (open && applicationId) {
            // Clear previous application data to force fresh fetch
            setApplication(null);
            fetchApplicationSummary();
        }
        // Reset application when dialog closes
        if (!open) {
            setApplication(null);
        }
    }, [open, applicationId, fetchApplicationSummary]);

    // Handle escape key for preview modal
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && previewOpen) {
                event.preventDefault();
                event.stopPropagation();
                setPreviewOpen(false);
            }
        };

        if (previewOpen) {
            document.addEventListener('keydown', handleEscape, true); // Use capture phase
            return () => document.removeEventListener('keydown', handleEscape, true);
        }
    }, [previewOpen]);

    const formatDate = (dateString?: string | null) =>
        dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    const formatBillAddress = (billInfo: ApplicationSummary['bill_info']) => {
        if (!billInfo) return 'N/A';

        const parts = [
            billInfo.unit_no,
            billInfo.building,
            billInfo.street,
            billInfo.subdivision,
            billInfo.barangay?.name,
            billInfo.barangay?.town?.name,
        ];

        return parts.filter(Boolean).join(', ') || 'N/A';
    };

    const getFileIcon = (filename: string) => {
        const extension = filename.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'pdf':
                return <FileText className="h-5 w-5 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return <FileText className="h-5 w-5 text-green-500" />;
            case 'doc':
            case 'docx':
                return <FileText className="h-5 w-5 text-blue-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return '';

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';

        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getAttachmentTypeLabel = (type: string) => {
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

    const handlePreviewAttachment = (attachment: ApplicationSummary['attachments'][0]) => {
        setSelectedAttachment(attachment);
        setPreviewOpen(true);
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(newOpen) => {
                    // Prevent closing main dialog when preview is open
                    if (!newOpen && previewOpen) {
                        setPreviewOpen(false);
                        return;
                    }
                    onOpenChange(newOpen);
                }}
            >
                <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <FileText className="h-5 w-5" />
                            Application Summary
                        </DialogTitle>
                        <DialogDescription>Detailed information about the customer application</DialogDescription>
                    </DialogHeader>

                    {loading ? (
                        <div className="space-y-6">
                            {/* Loading skeleton */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        </div>
                    ) : application ? (
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3 dark:bg-gray-900">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Application ID</p>
                                    <p className="text-lg font-semibold">#{application.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                                    <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                                        {application.account_number || 'Pending'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                    <Badge variant="outline" className={`${getStatusColor(application.status)} mt-1 font-medium`}>
                                        {getStatusLabel(application.status)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                                        <p className="font-medium">{application.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Identity</p>
                                        <p className="font-medium">{application.identity}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                        <p className="font-medium">{application.email_address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Customer Type</p>
                                        <p className="font-medium">{application.customer_type?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Birth Date</p>
                                        <p className="font-medium">{formatDate(application.birth_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                                        <p className="font-medium">{application.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Marital Status</p>
                                        <p className="font-medium">{application.marital_status || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Nationality</p>
                                        <p className="font-medium">{application.nationality || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <Phone className="h-5 w-5" />
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Primary Mobile</p>
                                        <p className="font-medium">{application.mobile_1 || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Secondary Mobile</p>
                                        <p className="font-medium">{application.mobile_2 || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Primary Telephone</p>
                                        <p className="font-medium">{application.tel_no_1 || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Secondary Telephone</p>
                                        <p className="font-medium">{application.tel_no_2 || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Address Information */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <MapPin className="h-5 w-5" />
                                    Address Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Service Address</p>
                                        <p className="font-medium">{application.full_address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Billing Address</p>
                                        <p className="font-medium">{formatBillAddress(application.bill_info)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Barangay</p>
                                        <p className="font-medium">{application.barangay?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Town/City</p>
                                        <p className="font-medium">{application.barangay?.town?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">District</p>
                                        <p className="font-medium">{application.district?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Property Ownership</p>
                                        <p className="font-medium">{application.property_ownership || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Technical Information */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <Building2 className="h-5 w-5" />
                                    Technical Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Connected Load</p>
                                        <p className="font-medium">{application.connected_load ? `${application.connected_load} kVA` : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Rate Class</p>
                                        <p className="font-medium">{application.customer_type?.rate_class || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Commercial/Government Fields */}
                            {(application.account_name || application.trade_name || application.cor_number || application.tin_number) && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                                            <Building2 className="h-5 w-5" />
                                            Business Information
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {application.account_name && (
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                                                    <p className="font-medium">{application.account_name}</p>
                                                </div>
                                            )}
                                            {application.trade_name && (
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Trade Name</p>
                                                    <p className="font-medium">{application.trade_name}</p>
                                                </div>
                                            )}
                                            {application.cor_number && (
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">COR Number</p>
                                                    <p className="font-medium">{application.cor_number}</p>
                                                </div>
                                            )}
                                            {application.tin_number && (
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">TIN Number</p>
                                                    <p className="font-medium">{application.tin_number}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator />

                            {/* ID Information */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <IdCard className="h-5 w-5" />
                                    Identification
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Primary ID Type</p>
                                        <p className="font-medium">{application.id_type_1 || 'N/A'}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Number: {application.id_number_1 || 'N/A'}</p>
                                    </div>
                                    {application.id_type_2 && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Secondary ID Type</p>
                                            <p className="font-medium">{application.id_type_2}</p>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                Number: {application.id_number_2 || 'N/A'}
                                            </p>
                                        </div>
                                    )}
                                    {application.is_sc && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Senior Citizen</p>
                                            <p className="font-medium">Yes</p>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                SC Number: {application.sc_number || 'N/A'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Application Stats */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <Calendar className="h-5 w-5" />
                                    Application Details
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Application Created</p>
                                        <p className="text-lg font-medium">
                                            {application.created_at_formatted || formatDate(application.created_at)}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{application.created_at_human || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Application Age</p>
                                        <p className="font-medium">{application.created_at_human || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-2 md:grid-cols-2 dark:border-gray-700">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Attachments</p>
                                        <p className="font-medium">{application.attachments_count} files</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Inspections</p>
                                        <p className="font-medium">{application.inspections_count} records</p>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            {application.attachments && application.attachments.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                                            <Paperclip className="h-5 w-5" />
                                            Attachments ({application.attachments.length})
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {application.attachments.map((attachment) => (
                                                <div
                                                    key={attachment.id}
                                                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                                        <div className="flex-shrink-0">{getFileIcon(attachment.filename)}</div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {attachment.filename}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                <span>{getAttachmentTypeLabel(attachment.type)}</span>
                                                                {attachment.size && <span className="ml-2">• {formatFileSize(attachment.size)}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 flex-shrink-0 p-0"
                                                            onClick={() => handlePreviewAttachment(attachment)}
                                                            title="Preview attachment"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 flex-shrink-0 p-0"
                                                            onClick={() => window.open(attachment.url, '_blank')}
                                                            title="Download attachment"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No application data found</p>
                        </div>
                    )}

                    <div className="flex justify-end border-t pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Attachment Preview Modal - Separate from main dialog */}
            {previewOpen && selectedAttachment && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewOpen(false);
                    }}
                >
                    <div
                        className="relative mx-4 max-h-[90vh] w-full max-w-4xl"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPreviewOpen(false);
                            }}
                            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Preview content */}
                        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900">
                            {/* Header */}
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-800">
                                <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">{selectedAttachment.filename}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {getAttachmentTypeLabel(selectedAttachment.type)}
                                    {selectedAttachment.size && <span className="ml-2">• {formatFileSize(selectedAttachment.size)}</span>}
                                </p>
                            </div>

                            {/* Preview body */}
                            <div className="p-4">
                                {selectedAttachment.is_image ? (
                                    <div className="flex justify-center">
                                        <img
                                            src={selectedAttachment.url}
                                            alt={selectedAttachment.filename}
                                            className="max-h-[60vh] max-w-full rounded object-contain"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        <div className="hidden py-8 text-center">
                                            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                            <p className="text-gray-500 dark:text-gray-400">Unable to preview this image</p>
                                        </div>
                                    </div>
                                ) : selectedAttachment.extension === 'pdf' ? (
                                    <div className="h-[60vh]">
                                        <iframe
                                            src={selectedAttachment.url}
                                            className="h-full w-full rounded border-0"
                                            title={selectedAttachment.filename}
                                        />
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                        <p className="mb-2 font-medium text-gray-900 dark:text-gray-100">{selectedAttachment.filename}</p>
                                        <p className="mb-4 text-gray-500 dark:text-gray-400">Preview not available for this file type</p>
                                        <Button onClick={() => window.open(selectedAttachment.url, '_blank')} className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Download File
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between border-t bg-gray-50 p-4 dark:bg-gray-800">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <div>Uploaded: {formatDate(selectedAttachment.created_at)}</div>
                                    {application && <div className="mt-1">Application created: {application.created_at_formatted}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => window.open(selectedAttachment.url, '_blank')}>
                                        <Download className="mr-1 h-4 w-4" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setPreviewOpen(false);
                                        }}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

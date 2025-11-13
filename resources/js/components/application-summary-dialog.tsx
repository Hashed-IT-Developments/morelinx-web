import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatusUtils } from '@/lib/status-utils';
import AttachmentFiles from '@/pages/cms/applications/components/attachment-files';
import axios from 'axios';
import { Building2, Calendar, FileText, IdCard, MapPin, Phone, User } from 'lucide-react';
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
    is_isnap: boolean | null;

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
            setApplication(null);
            fetchApplicationSummary();
        }

        if (!open) {
            setApplication(null);
        }
    }, [open, applicationId, fetchApplicationSummary]);

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

    return (
        <main>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl gap-0 p-0">
                    <DialogHeader className="border-b p-4">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <FileText className="h-5 w-5" />
                            Application Summary
                        </DialogTitle>
                        <DialogDescription>Detailed information about the customer application</DialogDescription>
                    </DialogHeader>

                    <section className="max-h-[calc(100vh-18rem)] overflow-y-auto p-4">
                        {loading ? (
                            <div className="space-y-6">
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
                                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2 dark:bg-gray-900">
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
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">ISNAP Member</p>
                                        <p className="font-medium">{application.is_isnap ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>

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
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                Number: {application.id_number_1 || 'N/A'}
                                            </p>
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
                                <Separator />
                                <AttachmentFiles attachments={application.attachments as unknown as CaAttachment[]} />
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">No application data found</p>
                            </div>
                        )}
                    </section>

                    <DialogFooter className="flex justify-end border-t p-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}

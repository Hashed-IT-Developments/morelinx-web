import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatusUtils } from '@/lib/status-utils';
import axios from 'axios';
import { Building2, Calendar, MapPin, Phone, User, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AccountSummaryDialogProps {
    accountId: string | number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AccountSummaryDialog({ accountId, open, onOpenChange }: AccountSummaryDialogProps) {
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(false);
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const fetchAccountSummary = useCallback(async () => {
        if (!accountId) return;

        setLoading(true);
        try {
            const response = await axios.get(route('accounts.summary', { account: accountId }) + '?v=' + Date.now());
            setAccount(response.data);
        } catch (error) {
            console.error('Error fetching account summary:', error);
            toast.error('Failed to load account details');
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    useEffect(() => {
        if (open && accountId) {
            setAccount(null);
            fetchAccountSummary();
        }

        if (!open) {
            setAccount(null);
        }
    }, [open, accountId, fetchAccountSummary]);

    const formatDate = (dateString?: string | null) =>
        dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    return (
        <main>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl gap-0 p-0">
                    <DialogHeader className="border-b p-4">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Zap className="h-5 w-5" />
                            Account Summary
                        </DialogTitle>
                        <DialogDescription>Detailed information about the customer account</DialogDescription>
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
                        ) : account ? (
                            <div className="space-y-6">
                                {/* Account Overview */}
                                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2 dark:bg-gray-900">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                                        <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">{account.account_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                                        <Badge variant="outline" className={`${getStatusColor(account.account_status)} mt-1 font-medium`}>
                                            {getStatusLabel(account.account_status)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                                        <p className="font-medium">{account.account_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Rate Class</p>
                                        <p className="font-medium">{account.customer_type?.rate_class || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Customer Type</p>
                                        <p className="font-medium">{account.customer_type?.customer_type || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Connection Date</p>
                                        <p className="font-medium">{formatDate(account.connection_date)}</p>
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
                                            <p className="font-medium">{account.customer_application?.identity || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                            <p className="font-medium">
                                                {account.customer_application?.email_address || account.email_address || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Birth Date</p>
                                            <p className="font-medium">{formatDate(account.customer_application?.birth_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                                            <p className="font-medium">{account.customer_application?.gender || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Marital Status</p>
                                            <p className="font-medium">{account.customer_application?.marital_status || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Nationality</p>
                                            <p className="font-medium">{account.customer_application?.nationality || 'N/A'}</p>
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
                                            <p className="font-medium">{account.customer_application?.mobile_1 || account.contact_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Secondary Mobile</p>
                                            <p className="font-medium">{account.customer_application?.mobile_2 || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Primary Telephone</p>
                                            <p className="font-medium">{account.customer_application?.tel_no_1 || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Secondary Telephone</p>
                                            <p className="font-medium">{account.customer_application?.tel_no_2 || 'N/A'}</p>
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
                                            <p className="font-medium">{account.customer_application?.full_address || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">House Number</p>
                                            <p className="font-medium">{account.house_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Barangay</p>
                                            <p className="font-medium">{account.barangay?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Town/City</p>
                                            <p className="font-medium">{account.barangay?.town?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">District</p>
                                            <p className="font-medium">{account.district?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Meter Location</p>
                                            <p className="font-medium">{account.meter_loc || 'N/A'}</p>
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
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Pole Number</p>
                                            <p className="font-medium">{account.pole_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Feeder</p>
                                            <p className="font-medium">{account.feeder || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Multiplier</p>
                                            <p className="font-medium">{account.multiplier || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Contestable</p>
                                            <p className="font-medium">{account.contestable ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Net Metered</p>
                                            <p className="font-medium">{account.net_metered ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Latest Reading Date</p>
                                            <p className="font-medium">{formatDate(account.latest_reading_date)}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Special Programs */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <Calendar className="h-5 w-5" />
                                        Special Programs
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Senior Citizen</p>
                                            <p className="font-medium">{account.is_sc ? 'Yes' : 'No'}</p>
                                            {account.is_sc && (
                                                <>
                                                    <p className="mt-1 text-sm text-gray-500">Applied: {formatDate(account.sc_date_applied)}</p>
                                                    <p className="text-sm text-gray-500">Expires: {formatDate(account.sc_date_expired)}</p>
                                                </>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">ISNAP Member</p>
                                            <p className="font-medium">{account.is_isnap ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Lifeline</p>
                                            <p className="font-medium">{account.life_liner ? 'Yes' : 'No'}</p>
                                            {account.life_liner && (
                                                <>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Applied: {formatDate(account.life_liner_date_applied)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Expires: {formatDate(account.life_liner_date_expire)}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {account.meters && account.meters.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                <Zap className="h-5 w-5" />
                                                Meter Information ({account.meters.length})
                                            </h3>
                                            <div className="space-y-4">
                                                {account.meters.map((meter, index) => (
                                                    <div key={meter.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                                        <h4 className="mb-3 font-semibold">Meter {index + 1}</h4>
                                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">Serial Number</p>
                                                                <p className="font-medium">{meter.meter_serial_number || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">Brand</p>
                                                                <p className="font-medium">{meter.meter_brand || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                                                                <p className="font-medium">{meter.type || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">Seal Number</p>
                                                                <p className="font-medium">{meter.seal_number || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">ERC Seal</p>
                                                                <p className="font-medium">{meter.erc_seal || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">MORE Seal</p>
                                                                <p className="font-medium">{meter.more_seal || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">Voltage</p>
                                                                <p className="font-medium">{meter.voltage ? `${meter.voltage}V` : 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">Multiplier</p>
                                                                <p className="font-medium">{meter.multiplier || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">Initial Reading</p>
                                                                <p className="font-medium">{meter.initial_reading || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Notes */}
                                {account.notes && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Notes</h3>
                                            <p className="text-gray-700 dark:text-gray-300">{account.notes}</p>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                {/* Account Metadata */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <Calendar className="h-5 w-5" />
                                        Account Details
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Account Created</p>
                                            <p className="font-medium">{formatDate(account.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                                            <p className="font-medium">{formatDate(account.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">No account data found</p>
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

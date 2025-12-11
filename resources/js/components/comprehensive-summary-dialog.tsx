import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStatusUtils } from '@/lib/status-utils';
import axios from 'axios';
import { ClipboardList, FileText, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AccountTab, { AccountSummary } from './summary/account-tab';
import ApplicationTab from './summary/application-tab';
import EnergizationTab from './summary/energization-tab';
import InspectionTab from './summary/inspection-tab';
import { EmptyState } from './summary/shared-components';
import { ComprehensiveData } from './summary/types';
import { formatDate } from './summary/utils';

interface ComprehensiveSummaryDialogProps {
    applicationId?: string | number | null;
    accountId?: string | number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ComprehensiveSummaryDialog({ applicationId, accountId, open, onOpenChange }: ComprehensiveSummaryDialogProps) {
    const [data, setData] = useState<ComprehensiveData | null>(null);
    const [account, setAccount] = useState<AccountSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const { getStatusLabel, getStatusColor } = useStatusUtils();
    const isAccountMode = useMemo(() => !!accountId && !applicationId, [accountId, applicationId]);

    const fetchComprehensiveData = useCallback(async () => {
        if (!applicationId && !accountId) return;

        setLoading(true);
        try {
            if (isAccountMode && accountId) {
                // Fetch account data
                console.log('Fetching account data for ID:', accountId);
                const accountResponse = await axios.get(route('account.summary', { account: accountId }));
                console.log('Account response:', accountResponse.data);
                setAccount(accountResponse.data);

                // Also fetch inspection and energization for the account's application
                if (accountResponse.data?.application?.id) {
                    const appId = accountResponse.data.application.id;
                    const [inspectionResponse, energizationResponse] = await Promise.allSettled([
                        axios.get(route('customer-applications.inspection.summary', { application: appId })),
                        axios.get(route('customer-applications.energization.summary', { application: appId })),
                    ]);

                    const inspection =
                        inspectionResponse.status === 'fulfilled' && inspectionResponse.value?.data ? inspectionResponse.value.data : null;
                    const energization =
                        energizationResponse.status === 'fulfilled' && energizationResponse.value?.data ? energizationResponse.value.data : null;

                    setData({
                        application: null,
                        inspection,
                        energization,
                    });
                }
            } else if (applicationId) {
                // Original application mode
                const [appResponse, inspectionResponse, energizationResponse] = await Promise.allSettled([
                    axios.get(route('customer-applications.summary', { application: applicationId })),
                    axios.get(route('customer-applications.inspection.summary', { application: applicationId })),
                    axios.get(route('customer-applications.energization.summary', { application: applicationId })),
                ]);

                const application = appResponse.status === 'fulfilled' ? appResponse.value.data : null;
                const inspection = inspectionResponse.status === 'fulfilled' && inspectionResponse.value?.data ? inspectionResponse.value.data : null;
                const energization =
                    energizationResponse.status === 'fulfilled' && energizationResponse.value?.data ? energizationResponse.value.data : null;

                if (!application) {
                    throw new Error('Failed to load application data');
                }

                setData({
                    application,
                    inspection,
                    energization,
                });
            }
        } catch (error) {
            console.error('Error fetching comprehensive data:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response status:', error.response?.status);
                console.error('Response data:', error.response?.data);
                toast.error(`Failed to load comprehensive details: ${error.response?.status || 'Network error'}`);
            } else {
                toast.error('Failed to load comprehensive details');
            }
        } finally {
            setLoading(false);
        }
    }, [applicationId, accountId, isAccountMode]);

    useEffect(() => {
        if (open && (applicationId || accountId)) {
            setData(null);
            setAccount(null);
            fetchComprehensiveData();
        }

        if (!open) {
            setData(null);
            setAccount(null);
        }
    }, [open, applicationId, accountId, fetchComprehensiveData]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open) {
                onOpenChange(false);
            }
        },
        [open, onOpenChange],
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, handleKeyDown]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[95vh] w-[95vw] !max-w-none flex-col p-0 sm:w-[85vw] lg:w-[70vw]">
                <DialogHeader className="shrink-0 border-b p-4">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-5 w-5" />
                        {isAccountMode ? 'Account Summary' : 'Application Summary'}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {isAccountMode
                            ? 'Complete overview of account, inspection, and energization details'
                            : 'Complete overview of application, inspection, and energization details'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="inline-flex items-center gap-3 rounded-lg bg-blue-50 px-6 py-3 dark:bg-blue-900/20">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                <p className="font-medium text-blue-700 dark:text-blue-300">Loading data...</p>
                            </div>
                        </div>
                    ) : (isAccountMode ? account : data?.application) ? (
                        <Tabs defaultValue={isAccountMode ? 'account' : 'application'} className="flex h-full flex-col">
                            <TabsList className={`grid w-full ${data?.energization ? 'grid-cols-3' : 'grid-cols-2'} mx-4 mt-3 mb-0 shrink-0`}>
                                <TabsTrigger
                                    value={isAccountMode ? 'account' : 'application'}
                                    className="flex items-center gap-2"
                                    aria-label={isAccountMode ? 'View account details' : 'View application details'}
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>{isAccountMode ? 'Account' : 'Application'}</span>
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" title="Active" />
                                </TabsTrigger>
                                <TabsTrigger value="inspection" className="flex items-center gap-2" aria-label="View inspection details">
                                    <ClipboardList className="h-4 w-4" />
                                    <span className="hidden sm:inline">Inspection</span>
                                    <span className="sm:hidden">Insp</span>
                                    {data?.inspection ? (
                                        <div
                                            className={`h-2 w-2 rounded-full ${
                                                data.inspection.status === 'completed'
                                                    ? 'bg-green-500'
                                                    : data.inspection.status === 'approved'
                                                      ? 'bg-emerald-500'
                                                      : data.inspection.status === 'rejected'
                                                        ? 'bg-red-500'
                                                        : 'bg-yellow-500'
                                            }`}
                                            title={data.inspection.status.replace('_', ' ')}
                                        />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-gray-300" title="Not started" />
                                    )}
                                </TabsTrigger>
                                {data?.energization && (
                                    <TabsTrigger value="energization" className="flex items-center gap-2" aria-label="View energization details">
                                        <Zap className="h-4 w-4" />
                                        <span className="hidden sm:inline">Energization</span>
                                        <span className="sm:hidden">Energy</span>
                                        <div
                                            className={`h-2 w-2 rounded-full ${
                                                data.energization.status === 'completed'
                                                    ? 'bg-green-500'
                                                    : data.energization.status === 'in_progress'
                                                      ? 'bg-yellow-500'
                                                      : data.energization.status === 'declined'
                                                        ? 'bg-red-500'
                                                        : 'bg-blue-500'
                                            }`}
                                            title={data.energization.status.replace('_', ' ')}
                                        />
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            <div className="flex-1 overflow-hidden">
                                {isAccountMode ? (
                                    <TabsContent value="account" className="mt-0 h-full space-y-4 overflow-y-auto p-4">
                                        {account && <AccountTab account={account} getStatusLabel={getStatusLabel} getStatusColor={getStatusColor} />}
                                    </TabsContent>
                                ) : (
                                    <TabsContent value="application" className="mt-0 h-full space-y-4 overflow-y-auto p-4">
                                        {data?.application && (
                                            <ApplicationTab
                                                application={data.application}
                                                getStatusLabel={getStatusLabel}
                                                getStatusColor={getStatusColor}
                                            />
                                        )}
                                    </TabsContent>
                                )}

                                <TabsContent value="inspection" className="mt-0 h-full space-y-4 overflow-y-auto p-4">
                                    <InspectionTab
                                        inspection={data?.inspection || null}
                                        getStatusLabel={getStatusLabel}
                                        getStatusColor={getStatusColor}
                                    />
                                </TabsContent>

                                {data?.energization && (
                                    <TabsContent value="energization" className="mt-0 h-full space-y-4 overflow-y-auto p-4">
                                        <EnergizationTab
                                            energization={data.energization}
                                            getStatusLabel={getStatusLabel}
                                            getStatusColor={getStatusColor}
                                        />
                                    </TabsContent>
                                )}
                            </div>
                        </Tabs>
                    ) : (
                        <div className="p-6">
                            <EmptyState
                                icon={FileText}
                                title={isAccountMode ? 'Account Not Found' : 'Application Not Found'}
                                description={
                                    isAccountMode
                                        ? 'The requested account data could not be loaded. This might be due to a network issue or the account may no longer exist.'
                                        : 'The requested application data could not be loaded. This might be due to a network issue or the application may no longer exist.'
                                }
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last updated:{' '}
                        {isAccountMode && account
                            ? formatDate(account.updated_at)
                            : data?.application
                              ? formatDate(data.application.updated_at)
                              : 'N/A'}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="min-w-24 font-medium"
                        aria-label="Close comprehensive summary dialog"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

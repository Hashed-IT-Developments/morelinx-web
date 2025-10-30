import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { AlertCircle, AlertTriangle, ChevronDown, Edit, Info, RefreshCw } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { toast } from 'sonner';

interface CashierInfoData {
    next_or_number: string | null;
    next_or_preview?: {
        or_number: string;
        warning?: string;
        is_estimate: boolean;
        proposed_number: number;
        actual_number: number;
    };
    series_name?: string;
    total_generated: number;
    last_generated_number: number | null;
    last_generated_or: string | null;
    last_generated_at?: string | null;
}

export interface CashierInfoCardProps {
    onOffsetChange?: (offset: number | null) => void; // Callback to pass offset to parent for transaction creation
}

export interface CashierInfoCardRef {
    refresh: () => void;
}

const CashierInfoCard = forwardRef<CashierInfoCardRef>((props, ref) => {
    const [cashierInfo, setCashierInfo] = useState<CashierInfoData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [offsetInput, setOffsetInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [isExpanded, setIsExpanded] = useState(false);

    // Confirmation dialog state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [conflictWarnings, setConflictWarnings] = useState<string[]>([]);
    const [pendingOffset, setPendingOffset] = useState<number | null>(null);

    // Expose refresh method to parent
    useImperativeHandle(ref, () => ({
        refresh: () => fetchCashierInfo(false),
    }));

    // Fetch cashier info
    const fetchCashierInfo = async (showToast = false) => {
        try {
            const { data } = await axios.get(route('transactions.my-counter-info'));

            setCashierInfo(data);
            setLastRefresh(new Date());
            if (showToast) {
                toast.success('Cashier info refreshed');
            }
        } catch (error) {
            console.error('Error fetching cashier info:', error);

            // Handle 404 - No active transaction series (set cashierInfo to null to show warning)
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setCashierInfo(null);
                if (showToast) {
                    toast.error('No Active Transaction Series', {
                        description: 'Please contact administrator to create and activate a transaction series.',
                        duration: 6000,
                    });
                }
            } else if (showToast) {
                const message = axios.isAxiosError(error)
                    ? error.response?.data?.message || error.response?.data?.error || 'Failed to load cashier info'
                    : 'Failed to load cashier info';
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchCashierInfo();
    }, []);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchCashierInfo();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Handle dialog open
    const handleOpenDialog = () => {
        setOffsetInput(cashierInfo?.offset?.toString() || '');
        setIsDialogOpen(true);
    };

    // Check offset for conflicts first
    const checkOffsetConflicts = async (offset: number): Promise<{ hasConflicts: boolean; warnings: string[]; info: string[] }> => {
        try {
            const { data } = await axios.post(route('transactions.check-offset'), { offset });
            console.log('Offset check response:', data);
            return {
                hasConflicts: data.has_conflicts || false,
                warnings: data.warnings || [],
                info: data.info_messages || [],
            };
        } catch (error) {
            console.error('Error checking offset:', error);
            if (axios.isAxiosError(error)) {
                console.error('Axios error details:', error.response?.data);
                // Show error toast
                toast.error('Failed to Check Offset', {
                    description: error.response?.data?.message || 'Unable to verify offset conflicts',
                    duration: 4000,
                });
            }
            // If check fails, throw error to prevent proceeding
            throw error;
        }
    };

    // Actually set the offset (after confirmation if needed)
    const setOffset = async (offset: number) => {
        setIsSaving(true);

        try {
            const { data } = await axios.post(route('transactions.set-my-offset'), { offset });

            // Show success message
            toast.success('Offset Updated', {
                description: data.message || `Your starting position has been set to ${offset}`,
                duration: 5000,
            });

            // Show additional info messages if present
            if (data.info_messages && Array.isArray(data.info_messages)) {
                data.info_messages.forEach((msg: string, index: number) => {
                    setTimeout(
                        () => {
                            toast.info(msg, { duration: 6000 });
                        },
                        (index + 1) * 600,
                    );
                });
            }

            // Refresh info
            await fetchCashierInfo();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error setting offset:', error);

            // Handle different error types
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    toast.error('Permission Denied', {
                        description: 'You do not have permission to set OR number offsets. Please contact your administrator.',
                        duration: 6000,
                    });
                } else if (error.response?.status === 419) {
                    toast.error('Session Expired', {
                        description: 'Your session has expired. Please refresh the page and try again.',
                        duration: 6000,
                    });
                } else {
                    const message = error.response?.data?.message || error.response?.data?.error || 'Network error occurred';
                    toast.error('Failed to Update Offset', {
                        description: message,
                        duration: 6000,
                    });
                }
            } else {
                toast.error('Failed to Update Offset', {
                    description: 'An unexpected error occurred',
                    duration: 6000,
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Handle confirmation of conflicting offset
    const handleConfirmOffset = async () => {
        if (pendingOffset === null) return;

        setIsConfirmOpen(false);
        await setOffset(pendingOffset);
        setPendingOffset(null);
        setConflictWarnings([]);
    };

    // Handle cancellation of conflicting offset
    const handleCancelOffset = () => {
        setIsConfirmOpen(false);
        setPendingOffset(null);
        setConflictWarnings([]);
        setIsSaving(false);
    };

    // Handle offset save with conflict check
    const handleSaveOffset = async () => {
        const offset = parseInt(offsetInput, 10);

        if (isNaN(offset) || offset < 1) {
            toast.error('Please enter a valid offset (minimum 1)');
            return;
        }

        setIsSaving(true);

        try {
            // First, check for conflicts
            const checkResult = await checkOffsetConflicts(offset);

            console.log('Check result:', checkResult);
            console.log('Has conflicts:', checkResult.hasConflicts);
            console.log('Warnings:', checkResult.warnings);

            if (checkResult.hasConflicts) {
                // Show confirmation dialog with warnings
                console.log('Setting pending offset:', offset);
                console.log('Setting conflict warnings:', checkResult.warnings);
                setPendingOffset(offset);
                setConflictWarnings(checkResult.warnings);
                console.log('Opening confirm dialog...');
                setIsConfirmOpen(true);
                setIsSaving(false); // Will be set again when confirmed
                return;
            }

            // No conflicts - proceed directly
            await setOffset(offset);
        } catch (error) {
            console.error('Error in handleSaveOffset:', error);
            // Error toast already shown in checkOffsetConflicts
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Loading Cashier Info...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    // Show warning if no transaction series is active
    if (!cashierInfo) {
        return (
            <Card className="w-full border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                <CardContent className="px-4 py-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-500" />
                        <div className="flex-1 space-y-2">
                            <div>
                                <h4 className="font-semibold text-red-900 dark:text-red-200">No Active Transaction Series Found</h4>
                                <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                                    Cannot generate OR numbers without an active transaction series. Payments cannot be processed.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-red-700 dark:text-red-400">
                                    Please contact your administrator to create and activate a transaction series.
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchCashierInfo(true)}
                                    className="h-7 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                                >
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    Retry
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="w-full">
                <CardContent className="px-4 py-3">
                    {/* Compact View - Always Visible */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Info Grid */}
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Next OR:</span>
                                <span className="font-semibold">
                                    {cashierInfo.next_or_number || <span className="text-muted-foreground">N/A</span>}
                                </span>
                                {cashierInfo.will_auto_jump && (
                                    <span title="Will auto-jump due to conflict">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    </span>
                                )}
                            </div>
                            <div className="h-4 w-px bg-border" />
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Offset:</span>
                                <span className="font-semibold">{cashierInfo.offset || <span className="text-muted-foreground">Not set</span>}</span>
                                {cashierInfo.is_outdated && (
                                    <span title="Offset is outdated">
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                    </span>
                                )}
                            </div>
                            <div className="h-4 w-px bg-border" />
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Generated:</span>
                                <span className="font-semibold">{cashierInfo.total_generated}</span>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 px-2">
                                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => fetchCashierInfo(true)} title="Refresh info" className="h-8 px-2">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Expanded View - Shows on Toggle */}
                    {isExpanded && (
                        <div className="mt-3 space-y-4 border-t pt-4">
                            {/* Warning Banner - Shows if outdated or will auto-jump */}
                            {(cashierInfo.is_outdated || cashierInfo.will_auto_jump) && cashierInfo.warning && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{cashierInfo.warning}</p>
                                            {cashierInfo.is_outdated && cashierInfo.highest_in_series && (
                                                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                                                    <span>Current series is at OR #{cashierInfo.highest_in_series}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setOffsetInput(String((cashierInfo.highest_in_series || 0) + 100));
                                                            handleOpenDialog();
                                                        }}
                                                        className="h-6 text-xs"
                                                    >
                                                        Update Offset
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preview Notice - Only if no warning */}
                            {!cashierInfo.warning && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        <AlertCircle className="mr-1 inline h-3 w-3" />
                                        <strong>Preview Notice:</strong> Actual OR may differ if other cashiers generate ORs before you.
                                    </p>
                                </div>
                            )}

                            {/* Starting Position with Edit */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">My Starting Position</Label>
                                    <Button variant="outline" size="sm" onClick={handleOpenDialog}>
                                        <Edit className="mr-2 h-3 w-3" />
                                        {cashierInfo.offset ? 'Change' : 'Set'} Position
                                    </Button>
                                </div>
                                <div className="rounded-lg border bg-card p-3">
                                    {cashierInfo.offset ? (
                                        <div className="space-y-1">
                                            <div className="text-lg font-semibold">Offset: {cashierInfo.offset}</div>
                                            {cashierInfo.is_auto_assigned && <p className="text-xs text-muted-foreground">(Auto-assigned)</p>}
                                            {cashierInfo.offset_changed_at && (
                                                <p className="text-xs text-muted-foreground">
                                                    Last changed: {new Date(cashierInfo.offset_changed_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Not set yet</div>
                                            <p className="text-xs text-muted-foreground">
                                                <Info className="mr-1 inline h-3 w-3" />
                                                You can set your position now, or it will be auto-assigned when you generate your first OR
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Statistics */}
                            <div className="space-y-3">
                                <div className="rounded-lg border bg-card p-3">
                                    <div className="mb-2 text-sm font-medium">Generation Statistics</div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">At current offset:</span>
                                            <span className="font-semibold">{cashierInfo.generated_at_current_offset}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Total (all time):</span>
                                            <span className="font-semibold">{cashierInfo.total_generated}</span>
                                        </div>
                                        {cashierInfo.total_generated > cashierInfo.generated_at_current_offset && (
                                            <div className="border-t pt-1">
                                                <div className="text-xs text-muted-foreground">
                                                    {cashierInfo.total_generated - cashierInfo.generated_at_current_offset} OR(s) from previous
                                                    offset(s)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-lg border bg-card p-3">
                                    <div className="text-xs text-muted-foreground">Last Generated OR</div>
                                    <div className="text-sm font-semibold">
                                        {cashierInfo.last_generated_or || <span className="text-muted-foreground">None</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Last Refresh */}
                            <div className="text-xs text-muted-foreground">
                                Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refreshes every 30s
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Set Offset Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{cashierInfo.offset ? 'Change' : 'Set'} Starting Position</DialogTitle>
                        <DialogDescription>
                            Set your preferred starting offset for OR numbers. This will be your position in the OR sequence.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="offset">Offset Number</Label>
                            <Input
                                id="offset"
                                type="number"
                                min="1"
                                value={offsetInput}
                                onChange={(e) => setOffsetInput(e.target.value)}
                                placeholder="Enter offset (e.g., 1, 100, 200)"
                                disabled={isSaving}
                            />
                            <p className="text-xs text-muted-foreground">Minimum value: 1</p>
                        </div>

                        {cashierInfo.offset && cashierInfo.total_generated > 0 && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                                <div className="flex items-start gap-2">
                                    <Info className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <div className="text-xs text-blue-700 dark:text-blue-300">
                                        <strong>Fresh Start:</strong> You've generated {cashierInfo.total_generated} OR
                                        {cashierInfo.total_generated === 1 ? '' : 's'} (last: {cashierInfo.last_generated_or}). Changing your offset
                                        will reset your sequence - your next OR will start from the new offset position.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveOffset} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Position'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Conflict Warning Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                            <AlertTriangle className="h-5 w-5" />
                            Offset Conflict Warning
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <p className="font-medium text-foreground">
                                The offset you've chosen ({pendingOffset}) may conflict with other cashiers:
                            </p>
                            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                                {conflictWarnings.map((warning, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>{warning}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm">
                                This may result in conflicting OR numbers during generation. The system will auto-jump if conflicts occur, but it's
                                recommended to choose a different offset with more spacing.
                            </p>
                            <p className="font-medium text-foreground">Do you want to continue with offset {pendingOffset}?</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelOffset}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmOffset} className="bg-amber-600 hover:bg-amber-700">
                            Yes, Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});

CashierInfoCard.displayName = 'CashierInfoCard';

export default CashierInfoCard;

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import axios from 'axios';
import { AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface StatelessOffsetInputProps {
    onOffsetChange: (offset: number | null) => void;
    disabled?: boolean;
    initialOffset?: number | null;
}

interface PreviewData {
    or_number: string;
    warning?: string;
    proposed_number: number;
    actual_number: number;
}

export default function StatelessOffsetInput({ onOffsetChange, disabled, initialOffset }: StatelessOffsetInputProps) {
    const [offsetInput, setOffsetInput] = useState('');
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [error, setError] = useState('');
    const [lastOrCreated, setLastOrCreated] = useState<{ or_number: string; numeric_or: number } | null>(null);

    const fetchPreview = useCallback(
        async (offset: number) => {
            setIsPreviewLoading(true);
            setError('');

            try {
                const { data } = await axios.post(route('transactions.check-offset'), { offset });

                setPreview({
                    or_number: data.preview_or_number || data.next_or_number || '',
                    warning: data.warnings?.[0],
                    proposed_number: offset,
                    actual_number: offset,
                });

                // Notify parent that offset is valid
                onOffsetChange(offset);
            } catch (err) {
                console.error('Error fetching preview:', err);
                if (axios.isAxiosError(err)) {
                    const message = err.response?.data?.message || 'Failed to preview OR number';
                    setError(message);
                    toast.error('Preview Failed', {
                        description: message,
                        duration: 3000,
                    });
                }
                setPreview(null);
                onOffsetChange(null);
            } finally {
                setIsPreviewLoading(false);
            }
        },
        [onOffsetChange],
    );

    // Initialize with initialOffset from URL query param
    useEffect(() => {
        if (initialOffset && initialOffset > 0) {
            setOffsetInput(String(initialOffset));
        }
    }, [initialOffset]);

    // Subscribe to real-time OR number updates (private channel, TREASURY only)
    useEffect(() => {
        const channel = window.Echo.private('or-numbers');

        channel.listen('.transaction-or-created', (data: { or_number: string; numeric_or: number; user_name: string }) => {
            // Update last OR created indicator
            setLastOrCreated({
                or_number: data.or_number,
                numeric_or: data.numeric_or,
            });

            const currentOffset = parseInt(offsetInput, 10);

            // Smart refresh logic:
            // 1. If no offset entered, just update the indicator (handled by state)
            // 2. If offset matches the OR that was just created, refresh to show conflict
            if (offsetInput && !isNaN(currentOffset) && currentOffset === data.numeric_or) {
                // The OR number the user wants to use was just taken
                toast.warning('OR Number Taken', {
                    description: `${data.or_number} was just created by ${data.user_name}`,
                    duration: 5000,
                });
                // Refresh preview to show the conflict
                fetchPreview(currentOffset);
            }
        });

        // Cleanup on unmount
        return () => {
            window.Echo.leave('or-numbers');
        };
    }, [offsetInput, fetchPreview]);

    // Fetch preview when offset changes
    useEffect(() => {
        const offset = parseInt(offsetInput, 10);

        // Clear preview if input is empty or invalid
        if (!offsetInput || isNaN(offset) || offset < 1) {
            setPreview(null);
            setError('');
            onOffsetChange(null);
            return;
        }

        // Debounce preview fetch
        const timer = setTimeout(() => {
            fetchPreview(offset);
        }, 500);

        return () => clearTimeout(timer);
    }, [offsetInput, fetchPreview, onOffsetChange]);

    const handleClear = () => {
        setOffsetInput('');
        setPreview(null);
        setError('');
        onOffsetChange(null);
    };

    return (
        <Card className="w-96 p-4">
            <div className="mb-2 flex items-center gap-2">
                <Label htmlFor="stateless-offset" className="text-sm font-medium">
                    OR Offset (Optional)
                </Label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-1 text-xs">
                                <p className="font-semibold">How it works:</p>
                                <ul className="ml-4 list-disc space-y-1">
                                    <li>Leave empty to continue from your last OR</li>
                                    <li>Enter a number to jump to that OR (one-time only)</li>
                                    <li>After this transaction, system auto-continues from that number</li>
                                </ul>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="relative">
                <Input
                    id="stateless-offset"
                    type="number"
                    min="1"
                    value={offsetInput}
                    onChange={(e) => setOffsetInput(e.target.value)}
                    placeholder="Enter OR number (e.g., 50, 100, 200)"
                    disabled={disabled || isPreviewLoading}
                    className={`h-12 pr-20 text-base ${error ? 'border-red-500' : ''}`}
                />
                {isPreviewLoading && (
                    <div className="absolute top-3 right-16">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                )}
                {offsetInput && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={disabled}
                        className="absolute top-2 right-2 h-8 text-xs"
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* Preview Section */}
            {preview && !error && (
                <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Next OR will be: <strong>{preview.or_number}</strong>
                        </span>
                    </div>
                    {preview.warning && (
                        <div className="flex items-start gap-2 text-xs text-green-700 dark:text-green-300">
                            <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                            <span>{preview.warning}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Error Section */}
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-500" />
                        <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
                    </div>
                </div>
            )}

            {/* Last OR Created Indicator */}
            {!offsetInput && lastOrCreated && (
                <div className="mt-2 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <div className="relative flex h-2 w-2 items-center justify-center">
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300">
                        Last OR created: <strong>{lastOrCreated.or_number}</strong>
                    </span>
                </div>
            )}
        </Card>
    );
}

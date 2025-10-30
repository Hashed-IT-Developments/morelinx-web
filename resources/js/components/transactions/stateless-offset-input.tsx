import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface StatelessOffsetInputProps {
    onOffsetChange: (offset: number | null) => void;
    disabled?: boolean;
}

interface PreviewData {
    or_number: string;
    warning?: string;
    proposed_number: number;
    actual_number: number;
}

export default function StatelessOffsetInput({ onOffsetChange, disabled }: StatelessOffsetInputProps) {
    const [offsetInput, setOffsetInput] = useState('');
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [error, setError] = useState('');

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
        <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="stateless-offset" className="text-sm font-medium">
                        One-Time OR Offset (Optional)
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">Jump to a specific OR number for this transaction only</p>
                </div>
                {offsetInput && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleClear} disabled={disabled} className="h-7 text-xs">
                        Clear
                    </Button>
                )}
            </div>

            <div className="flex items-start gap-2">
                <div className="flex-1">
                    <Input
                        id="stateless-offset"
                        type="number"
                        min="1"
                        value={offsetInput}
                        onChange={(e) => setOffsetInput(e.target.value)}
                        placeholder="Enter OR number (e.g., 50, 100, 200)"
                        disabled={disabled || isPreviewLoading}
                        className={error ? 'border-red-500' : ''}
                    />
                </div>
                {isPreviewLoading && (
                    <div className="flex h-10 items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
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

            {/* Info Section */}
            {!offsetInput && !disabled && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                    <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-500" />
                        <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <p>
                                <strong>How it works:</strong>
                            </p>
                            <ul className="ml-4 list-disc space-y-0.5">
                                <li>Leave empty to continue from your last OR</li>
                                <li>Enter a number to jump to that OR (one-time only)</li>
                                <li>After this transaction, system auto-continues from that number</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

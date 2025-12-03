import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface AddCauseOfDelayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    applicationId: string;
}

const DELAY_SOURCES = [
    { value: 'customer', label: 'Customer' },
    { value: 'du', label: 'DU' },
    { value: 'government agencies', label: 'Government Agencies' },
    { value: 'others', label: 'Others' },
];

const PROCESSES = [
    { value: 'application', label: 'Application' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'payment', label: 'Payment' },
    { value: 'installation', label: 'Installation' },
    { value: 'activation', label: 'Activation' },
];

export default function AddCauseOfDelayDialog({ open, onOpenChange, applicationId }: AddCauseOfDelayDialogProps) {
    const [delaySource, setDelaySource] = useState<string>('');
    const [process, setProcess] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!delaySource || !process) {
            return;
        }

        setIsSubmitting(true);

        try {
            router.post(
                `/applications/${applicationId}/cause-of-delays`,
                {
                    delay_source: delaySource,
                    process: process,
                    remarks: remarks,
                },
                {
                    onSuccess: () => {
                        // Reset form
                        setDelaySource('');
                        setProcess('');
                        setRemarks('');
                        onOpenChange(false);
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error adding cause of delay:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Log Cause of Delay</DialogTitle>
                        <DialogDescription>Record a new cause of delay for this application.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Delay Source - Radio */}
                        <div className="space-y-3">
                            <Label>Delay Coming From</Label>
                            <RadioGroup value={delaySource} onValueChange={setDelaySource}>
                                {DELAY_SOURCES.map((source) => (
                                    <div key={source.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={source.value} id={source.value} />
                                        <Label htmlFor={source.value} className="cursor-pointer font-normal">
                                            {source.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Process - Dropdown */}
                        <div className="space-y-2">
                            <Label htmlFor="process">
                                Process<p className="font-light text-gray-600">(in which the delay happens)</p>
                            </Label>
                            <Select value={process} onValueChange={setProcess}>
                                <SelectTrigger id="process">
                                    <SelectValue placeholder="Select process" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROCESSES.map((proc) => (
                                        <SelectItem key={proc.value} value={proc.value}>
                                            {proc.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Remarks - Textarea */}
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                placeholder="Enter any additional remarks..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" variant="outline" className="border-gray-400" disabled={!delaySource || !process || isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Log'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

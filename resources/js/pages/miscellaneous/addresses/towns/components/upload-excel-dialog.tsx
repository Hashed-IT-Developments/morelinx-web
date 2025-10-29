import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AddressesDialog from '@/pages/miscellaneous/addresses/addresses-dialog';
import { useForm } from '@inertiajs/react';
import * as React from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UploadExcelDialog({ open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, progress, reset } = useForm({
        file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return;
        post(route('addresses.towns.import'), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            reset();
        }
        onOpenChange(isOpen);
    };

    return (
        <AddressesDialog
            open={open}
            onOpenChange={handleOpenChange}
            title="Upload Towns & Barangays"
            description="Upload an .xlsx or .xls file. Must have columns: town_name, feeder, barangay_name."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="file">Excel File</Label>
                    <Input id="file" type="file" accept=".xlsx, .xls" onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)} />
                    {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
                </div>

                {progress && (
                    <div className="relative pt-1">
                        <div className="flex h-2 overflow-hidden rounded bg-blue-200 text-xs">
                            <div
                                style={{ width: `${progress.percentage}%` }}
                                className="flex flex-col justify-center bg-blue-500 text-center whitespace-nowrap text-white shadow-none"
                            ></div>
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-6">
                    <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing || !data.file}>
                        {processing ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogFooter>
            </form>
        </AddressesDialog>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FileUp } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export default function RatesUpload() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const page = usePage<SharedData>();
    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Upload Rates', href: route('rates.upload') },
    ];

    const { data, setData, post, processing, errors, progress, reset } = useForm({
        billing_month: '',
        file: null as File | null,
    });

    // Generate current year months
    const getCurrentYearMonths = () => {
        const currentYear = new Date().getFullYear();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        return months.map((month, index) => ({
            value: `${currentYear}-${(index + 1).toString().padStart(2, '0')}`,
            label: `${month} ${currentYear}`,
        }));
    };

    const monthOptions = getCurrentYearMonths();

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file || !data.billing_month) {
            toast.error('Please select both billing month and file');
            return;
        }

        post(route('rates.import'), {
            onSuccess: () => {
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    // Handle flash messages
    useEffect(() => {
        const flash = page.props.flash;
        const pageErrors = page.props.errors;

        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.info) toast.info(flash.info);
        if (pageErrors?.authorization) toast.error(pageErrors.authorization);
    }, [page.props.flash, page.props.errors]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Rates" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <FileUp className="h-8 w-8" />
                            Upload Rates
                        </h1>
                    </div>
                </div>
            </div>

            <div id="upload-form-container" className="-mt-8 flex min-h-[calc(100vh-350px)] flex-1 items-center justify-center px-6">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">Upload Rates File</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Billing Month Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="billing-month">Select Billing Month</Label>
                                <Select value={data.billing_month} onValueChange={(value) => setData('billing_month', value)}>
                                    <SelectTrigger id="billing-month">
                                        <SelectValue placeholder="Choose month and year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.billing_month && <p className="text-sm text-red-500">{errors.billing_month}</p>}
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="rate-file">Select Rate File (.xls, .xlsx)</Label>
                                <Input
                                    ref={fileInputRef}
                                    id="rate-file"
                                    type="file"
                                    accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                    className="cursor-pointer"
                                />
                                {data.file && <p className="text-sm text-muted-foreground">Selected: {data.file.name}</p>}
                                {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
                            </div>

                            {/* Progress Bar */}
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

                            {/* Submit Button */}
                            <Button type="submit" className="w-full" disabled={processing || !data.file || !data.billing_month}>
                                {processing ? 'Uploading...' : 'Upload Rates'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

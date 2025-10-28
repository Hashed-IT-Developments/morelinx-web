import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { FileUp } from 'lucide-react';
import { useState } from 'react';

export default function RatesUpload() {
    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Upload Rates', href: route('rates.upload') },
    ];

    // State management
    const [selectedBillingMonth, setSelectedBillingMonth] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="RBAC Management" />

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
                    <CardContent className="space-y-6">
                        {/* Group 1: Billing Month Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="billing-month">Select Billing Month</Label>
                            <Select value={selectedBillingMonth} onValueChange={setSelectedBillingMonth}>
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
                        </div>

                        {/* Group 2: File Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="rate-file">Select Rate File (.xls, .xlsx)</Label>
                            <Input
                                id="rate-file"
                                type="file"
                                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                            {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function RatesIndex() {
    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'All Rates', href: route('rates.index') },
    ];

    // Generate month and year options from 3 years ago to current year
    const generateMonthYearOptions = () => {
        const options = [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // Start from 3 years ago
        const startYear = currentYear - 3;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        for (let year = startYear; year <= currentYear; year++) {
            const startMonth = year === startYear ? 0 : 0;
            const endMonth = year === currentYear ? currentMonth : 11;

            for (let month = startMonth; month <= endMonth; month++) {
                options.push({
                    value: `${year}-${month.toString().padStart(2, '0')}`,
                    label: `${monthNames[month]} ${year}`,
                });
            }
        }

        return options.reverse(); // Most recent first
    };

    const [selectedBillingMonth, setSelectedBillingMonth] = useState<string>('');
    const monthYearOptions = generateMonthYearOptions();

    // Handle billing month selection
    const handleBillingMonthChange = (value: string) => {
        setSelectedBillingMonth(value);

        console.log(value);
    };

    // Tab data
    const tabs = ['BACOLOD', 'SILAY', 'TALISAY', 'MURCIA'];
    const charges = [
        'Generation',
        'Transmission',
        'System Loss',
        'Distribution System',
        'Distribution Demand',
        'Supply Retail',
        'Metering Retail',
        'Metering Supply',
        'Senior Citizen Subsidy',
    ];

    const columns = [
        'Charges',
        'Residential',
        'Residential 100KWH',
        'Commercial',
        'Commercial 100KWH',
        'Government Buildings',
        'Street Lightings',
        'Industrial',
        'Contestables',
        'Hospitals',
    ];

    // Generate random floating-point numbers between 0 and 1 exclusively for each cell (except first column)
    const generateRandomRate = () => (Math.random() * 0.999 + 0.001).toFixed(4);

    // Generate table data for each tab
    const generateTableData = () => {
        return charges.map((charge) => ({
            charge,
            rates: columns.slice(1).map(() => generateRandomRate()),
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="RBAC Management" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <DollarSign className="h-8 w-8" />
                            All Rates
                        </h1>

                        {/* Billing Month Selection Form */}
                        <div className="mt-4 max-w-md">
                            <Label htmlFor="billing-month" className="mb-2 block">
                                Select Billing Month
                            </Label>
                            <Select value={selectedBillingMonth} onValueChange={handleBillingMonthChange}>
                                <SelectTrigger id="billing-month" className="w-full">
                                    <SelectValue placeholder="Choose month and year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthYearOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Tabbed Layout for City Rates */}
                <div className="mb-6">
                    <Tabs defaultValue="BACOLOD" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            {tabs.map((tab) => (
                                <TabsTrigger key={tab} value={tab}>
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {tabs.map((tab) => (
                            <TabsContent key={tab} value={tab} className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold">{tab} - Electricity Rates</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {columns.map((column) => (
                                                            <TableHead key={column} className="text-center font-semibold">
                                                                {column}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {generateTableData().map((row, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="text-left font-medium">{row.charge}</TableCell>
                                                            {row.rates.map((rate, rateIndex) => (
                                                                <TableCell key={rateIndex} className="text-center">
                                                                    {rate}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, DollarSign } from 'lucide-react';

interface Town {
    id: number;
    name: string;
}

interface Rate {
    id: number;
    town_id: number;
    acct_label: string;
    generation: string | null;
    transmission: string | null;
    systems_loss: string | null;
    distribution: string | null;
    dist_demand: string | null;
    supply_charge: string | null;
    supply_charge_mo: string | null;
    metering_charge: string | null;
    ret_mtrg_charge: string | null;
    frsc: string | null;
    lifeline: string | null;
    senior: string | null;
    franchise: string | null;
    rpt: string | null;
    vat_gen: string | null;
    vat_trans: string | null;
    vat_sl: string | null;
    vat_dsm: string | null;
    vat_others: string | null;
    uc_sd: string | null;
    ucme: string | null;
    ucme_redci: string | null;
    fit: string | null;
    pwr_act: string | null;
    ilp_rect: string | null;
    trans_kw_charge: string | null;
    env_charge: string | null;
    average_rate: string | null;
    du_tag: string;
    billing_month: string;
}

interface Props {
    towns: Town[];
    billingMonths: string[];
    selectedBillingMonth: string;
    ratesData: Record<number, Rate[]>;
}

export default function RatesIndex({ towns, billingMonths, selectedBillingMonth, ratesData }: Props) {
    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'All Rates', href: route('rates.index') },
    ];

    const formatBillingMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    const handleBillingMonthChange = (value: string) => {
        router.get(route('rates.index'), { billing_month: value }, { preserveState: true });
    };

    const columns = [
        { key: 'acct_label', label: 'Account Label' },
        { key: 'generation', label: 'Generation' },
        { key: 'transmission', label: 'Transmission' },
        { key: 'systems_loss', label: 'System Loss' },
        { key: 'distribution', label: 'Distribution' },
        { key: 'dist_demand', label: 'Distribution Demand' },
        { key: 'supply_charge', label: 'Supply Charge' },
        { key: 'supply_charge_mo', label: 'Supply Charge MO' },
        { key: 'metering_charge', label: 'Metering Charge' },
        { key: 'ret_mtrg_charge', label: 'Retail Metering' },
        { key: 'frsc', label: 'FRSC' },
        { key: 'lifeline', label: 'Lifeline' },
        { key: 'senior', label: 'Senior' },
        { key: 'franchise', label: 'Franchise' },
        { key: 'rpt', label: 'RPT' },
        { key: 'vat_gen', label: 'VAT Gen' },
        { key: 'vat_trans', label: 'VAT Trans' },
        { key: 'vat_sl', label: 'VAT SL' },
        { key: 'vat_dsm', label: 'VAT DSM' },
        { key: 'vat_others', label: 'VAT Others' },
        { key: 'uc_sd', label: 'UC SD' },
        { key: 'ucme', label: 'UCME' },
        { key: 'ucme_redci', label: 'UCME REDCI' },
        { key: 'fit', label: 'FIT' },
        { key: 'pwr_act', label: 'Power Act' },
        { key: 'ilp_rect', label: 'ILP Rect' },
        { key: 'trans_kw_charge', label: 'Trans KW Charge' },
        { key: 'env_charge', label: 'Env Charge' },
        { key: 'average_rate', label: 'Average Rate' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Rates" />

            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
                            <DollarSign className="h-6 w-6 md:h-8 md:w-8" />
                            All Rates
                        </h1>

                        {/* Billing Month Selection Form */}
                        <div className="mt-4 max-w-full md:max-w-md">
                            <Label htmlFor="billing-month" className="mb-2 block text-sm md:text-base">
                                Select Billing Month
                            </Label>
                            <Select value={selectedBillingMonth} onValueChange={handleBillingMonthChange}>
                                <SelectTrigger id="billing-month" className="w-full">
                                    <SelectValue placeholder="Choose month and year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {billingMonths.map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {formatBillingMonth(month)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Tabbed Layout for Town Rates */}
                {towns.length > 0 ? (
                    <div className="mb-6">
                        <Tabs defaultValue={towns[0]?.id.toString()} className="w-full">
                            <div className="overflow-x-auto">
                                <TabsList className="inline-flex w-auto min-w-full">
                                    {towns.map((town) => (
                                        <TabsTrigger key={town.id} value={town.id.toString()} className="whitespace-nowrap">
                                            {town.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {towns.map((town) => (
                                <TabsContent key={town.id} value={town.id.toString()} className="mt-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg font-semibold md:text-xl">{town.name} - Electricity Rates</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 md:p-6">
                                            {ratesData[town.id] && ratesData[town.id].length > 0 ? (
                                                <>
                                                    <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 text-xs text-muted-foreground md:hidden">
                                                        <ArrowRight className="h-3 w-3" />
                                                        <span>Swipe to see more columns</span>
                                                    </div>

                                                    <div className="overflow-x-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    {columns.map((column) => (
                                                                        <TableHead
                                                                            key={column.key}
                                                                            className={
                                                                                column.key === 'acct_label'
                                                                                    ? 'sticky left-0 z-10 w-40 min-w-40 bg-background text-left text-xs font-semibold whitespace-nowrap md:w-64 md:min-w-64 md:text-sm'
                                                                                    : 'px-2 text-center text-xs font-semibold whitespace-nowrap md:px-4 md:text-sm'
                                                                            }
                                                                        >
                                                                            {column.label}
                                                                        </TableHead>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {ratesData[town.id].map((rate) => (
                                                                    <TableRow key={rate.id}>
                                                                        {columns.map((column) => (
                                                                            <TableCell
                                                                                key={column.key}
                                                                                className={
                                                                                    column.key === 'acct_label'
                                                                                        ? 'sticky left-0 z-10 w-40 min-w-40 bg-background text-left text-xs font-medium md:w-64 md:min-w-64 md:text-sm'
                                                                                        : 'px-2 text-center text-xs md:px-4 md:text-sm'
                                                                                }
                                                                            >
                                                                                {rate[column.key as keyof Rate] ?? '-'}
                                                                            </TableCell>
                                                                        ))}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="px-4 py-8 text-center text-sm text-muted-foreground md:text-base">
                                                    No rates data available for this town and billing month.
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">No rates data available.</CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

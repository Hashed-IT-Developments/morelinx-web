import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { getStatusColor } from '@/lib/status-utils';
import { formatSplitWords } from '@/lib/utils';
import { Download, FileSignature, Printer, Settings, User } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface ApplicationShowProps {
    account: Account;
}

import { useCustomerAccountMethod } from '@/hooks/useCustomerAccountMethod';

export default function ApplicationShow({ account }: ApplicationShowProps) {
    const [_contractDialogOpen, setContractDialogOpen] = useState(false);

    const { updateStatus, getStatuses } = useCustomerAccountMethod();

    const [statuses, setStatuses] = useState<string[]>([]);

    console.log(account);

    useEffect(() => {
        const fetchStatuses = async () => {
            const statuses = await getStatuses();
            console.log('Account Statuses:', statuses);
            setStatuses(statuses || []);
        };

        fetchStatuses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const breadcrumbs = [
        { title: 'Accounts', href: '/accounts' },
        { title: `${account.application.first_name} ${account.application.last_name}`, href: `/accounts/${account.id}` },
    ];

    const [status, setStatus] = useState<string>(account.account_status);

    const handleOverrideStatus = async () => {
        await updateStatus(account.id.toString(), status);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <section className="mt-4 space-y-6 px-4 pb-4">
                <section className="flex w-full flex-col items-center gap-4">
                    <div className="flex w-full justify-between p-2">
                        <Badge
                            className={getStatusColor(account.account_status)}
                            variant={account.account_status === 'active' ? 'secondary' : 'default'}
                        >
                            {formatSplitWords(account.account_status)}
                        </Badge>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" className="cursor-pointer" title="Generate Contract" onClick={() => setContractDialogOpen(true)}>
                                <FileSignature />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="cursor-pointer" title="Account Settings">
                                        <Settings />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>
                                        <Button variant="ghost" className="w-full justify-start" onClick={() => console.log('Update Account Info')}>
                                            Update Account Information
                                        </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button variant="ghost" className="w-full justify-start" onClick={() => console.log('Billing Settings')}>
                                            Billing Settings
                                        </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button variant="ghost" className="w-full justify-start" onClick={() => console.log('Connection Settings')}>
                                            Connection Settings
                                        </Button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="ghost" className="cursor-pointer" title="Download Report">
                                <Download />
                            </Button>
                            <Button variant="ghost" className="cursor-pointer" title="Print Account Details">
                                <Printer />
                            </Button>
                        </div>
                    </div>

                    <div className="flex w-full flex-col items-center sm:flex-row">
                        <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={undefined} width={80} height={80} className="h-20 w-20 object-cover" />
                                <AvatarFallback className="flex h-20 w-20 items-center justify-center text-4xl">
                                    {account.application.first_name?.charAt(0)}
                                    {account.application.last_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-center sm:items-start">
                                <h1 className="text-2xl font-bold">
                                    {account.application.first_name} {account.application.middle_name} {account.application.last_name}{' '}
                                    {account.application.suffix}
                                </h1>
                                <small className="text-muted-foreground">{account.account_number}</small>
                                <small className="text-muted-foreground">{account.account_name}</small>
                            </div>
                        </div>

                        <div className="mt-4 flex w-full flex-col space-y-1">
                            <h1>
                                <span className="font-medium">ISNAP:</span> {account.is_isnap ? 'Yes' : 'No'}
                            </h1>
                            <h1>
                                <span className="font-medium">Senior Citizen:</span> {account.is_sc ? 'Yes' : 'No'}
                            </h1>
                            <h1>
                                <span className="font-medium">Account Number:</span> {account.account_number}
                            </h1>
                            <span>
                                <span className="font-medium">Contact:</span> {account.contact_number}
                            </span>
                            <span>
                                <span className="font-medium">Email:</span> {account.email_address}
                            </span>
                            <span>
                                <span className="font-medium">House Number:</span> {account.house_number}
                            </span>

                            <div>
                                <span className="font-medium">Account Created:</span> {moment(account.created_at).format('MMMM D, YYYY h:mm A')}
                            </div>

                            {account.connection_date && (
                                <div>
                                    <span className="font-medium">Connection Date:</span> {moment(account.connection_date).format('MMMM D, YYYY')}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="flex w-full justify-end gap-2">
                    <Select onValueChange={(value) => setStatus(value)} value={status}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {formatSplitWords(status)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <AlertDialog
                        title="Override Status"
                        description="Are you sure you want to override status?"
                        onConfirm={() => {
                            handleOverrideStatus();
                        }}
                    >
                        <Button variant="destructive">Override Status</Button>
                    </AlertDialog>
                </section>

                {/* Account Details Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Connection Information */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                            <User className="h-5 w-5" />
                            Connection Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium">Status:</span> {formatSplitWords(account.account_status)}
                            </div>
                            <div>
                                <span className="font-medium">Customer Type ID:</span> {account.customer_type_id}
                            </div>
                            <div>
                                <span className="font-medium">District ID:</span> {account.district_id}
                            </div>
                            <div>
                                <span className="font-medium">Barangay ID:</span> {account.barangay_id}
                            </div>
                            {account.feeder && (
                                <div>
                                    <span className="font-medium">Feeder:</span> {account.feeder}
                                </div>
                            )}
                            {account.pole_number && (
                                <div>
                                    <span className="font-medium">Pole Number:</span> {account.pole_number}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Billing Information */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-3 text-lg font-semibold">Billing Information</h3>
                        <div className="space-y-2 text-sm">
                            {account.acct_pmt_type && (
                                <div>
                                    <span className="font-medium">Payment Type:</span> {account.acct_pmt_type}
                                </div>
                            )}
                            {account.compute_type && (
                                <div>
                                    <span className="font-medium">Compute Type:</span> {account.compute_type}
                                </div>
                            )}
                            {account.multiplier && (
                                <div>
                                    <span className="font-medium">Multiplier:</span> {account.multiplier}
                                </div>
                            )}
                            {account.evat_2_pct && (
                                <div>
                                    <span className="font-medium">EVAT 2%:</span> {account.evat_2_pct}
                                </div>
                            )}
                            {account.evat_5_pct && (
                                <div>
                                    <span className="font-medium">EVAT 5%:</span> {account.evat_5_pct}
                                </div>
                            )}
                            <div>
                                <span className="font-medium">Net Metered:</span> {account.net_metered ? 'Yes' : 'No'}
                            </div>
                        </div>
                    </div>

                    {/* Meter Information */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-3 text-lg font-semibold">Meter Information</h3>
                        <div className="space-y-2 text-sm">
                            {account.meter_loc && (
                                <div>
                                    <span className="font-medium">Meter Location:</span> {account.meter_loc}
                                </div>
                            )}
                            {account.latest_reading_date && (
                                <div>
                                    <span className="font-medium">Latest Reading:</span>
                                    {moment(account.latest_reading_date).format('MMM D, YYYY')}
                                </div>
                            )}
                            {account.core_loss && (
                                <div>
                                    <span className="font-medium">Core Loss:</span> {account.core_loss}
                                </div>
                            )}
                            <div>
                                <span className="font-medium">Contestable:</span> {account.contestable ? 'Yes' : 'No'}
                            </div>
                        </div>
                    </div>

                    {/* Special Programs */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-3 text-lg font-semibold">Special Programs</h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium">Lifeline:</span> {account['life-liner'] ? 'Yes' : 'No'}
                            </div>
                            {account.life_liner_date_applied && (
                                <div>
                                    <span className="font-medium">Lifeline Applied:</span>
                                    {moment(account.life_liner_date_applied).format('MMM D, YYYY')}
                                </div>
                            )}
                            {account.life_liner_date_expire && (
                                <div>
                                    <span className="font-medium">Lifeline Expires:</span>
                                    {moment(account.life_liner_date_expire).format('MMM D, YYYY')}
                                </div>
                            )}
                            {account.sc_date_applied && (
                                <div>
                                    <span className="font-medium">SC Applied:</span>
                                    {moment(account.sc_date_applied).format('MMM D, YYYY')}
                                </div>
                            )}
                            {account.sc_date_expired && (
                                <div>
                                    <span className="font-medium">SC Expires:</span>
                                    {moment(account.sc_date_expired).format('MMM D, YYYY')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* System Information */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-3 text-lg font-semibold">System Information</h3>
                        <div className="space-y-2 text-sm">
                            {account.old_account_no && (
                                <div>
                                    <span className="font-medium">Old Account #:</span> {account.old_account_no}
                                </div>
                            )}
                            {account.group_code && (
                                <div>
                                    <span className="font-medium">Group Code:</span> {account.group_code}
                                </div>
                            )}
                            {account.sequence_code && (
                                <div>
                                    <span className="font-medium">Sequence Code:</span> {account.sequence_code}
                                </div>
                            )}
                            {account.route_id && (
                                <div>
                                    <span className="font-medium">Route ID:</span> {account.route_id}
                                </div>
                            )}
                            <div>
                                <span className="font-medium">Migrated:</span> {account.migrated ? 'Yes' : 'No'}
                            </div>
                            <div>
                                <span className="font-medium">Last Updated:</span>
                                {moment(account.updated_at).format('MMM D, YYYY h:mm A')}
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {account.notes && (
                        <div className="rounded-lg border p-4 md:col-span-2 lg:col-span-1">
                            <h3 className="mb-3 text-lg font-semibold">Notes</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{account.notes}</p>
                        </div>
                    )}
                </div>
            </section>
        </AppLayout>
    );
}

import Button from '@/components/composables/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import {
    ClipboardCheck,
    Download,
    FileClock,
    FileCog,
    FileSignature,
    Gauge,
    Images,
    Info,
    List,
    Paperclip,
    PhilippinePeso,
    PlugZap,
    Printer,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import CustomerInformation from './components/customer-information';
import Inpections from './components/inpections';

import moment from 'moment';

import { formatSplitWords, getStatusColor } from '@/lib/utils';
import { useState } from 'react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AmendmentDialog from './amendments/amendment-dialog';
import AmendmentHistory from './amendments/amendment-history';
import AttachmentFiles from './components/attachment-files';
import ContractDialog from './contract/contract-dialog';

import AlertDialog from '@/components/composables/alert-dialog';
import { useCustomerApplicationMethod } from '@/hooks/useCustomerApplicationMethod';

interface ApplicationViewProps {
    application: CustomerApplication;
    auth: Auth;
}

export default function ApplicationView({ application, auth }: ApplicationViewProps) {
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [contractDialogOpen, setContractDialogOpen] = useState(false);

    const { updateStatus } = useCustomerApplicationMethod();

    console.log('APPLICATION:', application.status);

    const [status, setStatus] = useState(application.status);

    const breadcrumbs = [
        { title: 'Applications', href: '/applications' },
        { title: 'View Application', href: '' },
    ];

    const [dialogDetails, setDialogDetails] = useState({ title: '', fieldSet: '' });

    const showAmendment = (title: string, fieldSet: string) => {
        setAssignDialogOpen(true);
        setDialogDetails({
            title: title,
            fieldSet: fieldSet,
        });
    };

    const handleOverrideStatus = async () => {
        await updateStatus(application.id, status);
    };

    return (
        <main>
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-2 bg-white p-4 shadow">
                    <div className="flex w-full flex-col items-center gap-4">
                        <section className="flex w-full flex-col items-center gap-4">
                            <div className="flex w-full justify-between p-2">
                                <Badge
                                    className={getStatusColor(application.status)}
                                    variant={application.status === 'approved' ? 'secondary' : 'default'}
                                >
                                    {formatSplitWords(application.status)}
                                </Badge>

                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" className="cursor-pointer" title="Contract" onClick={() => setContractDialogOpen(true)}>
                                        <FileSignature />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="cursor-pointer" title="Request Amendment">
                                                <FileCog />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {Array.isArray(auth.permissions) && auth.permissions.includes('request customer info amendments') && (
                                                <DropdownMenuItem>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start"
                                                        onClick={() => showAmendment('Customer Info Amendments', 'info')}
                                                    >
                                                        Customer Info Amendments
                                                    </Button>
                                                </DropdownMenuItem>
                                            )}

                                            {Array.isArray(auth.permissions) && auth.permissions.includes('request ndog amendments') && (
                                                <DropdownMenuItem>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start"
                                                        onClick={() => showAmendment('NDOG Amendments', 'ndog')}
                                                    >
                                                        NDOG Amendments
                                                    </Button>
                                                </DropdownMenuItem>
                                            )}

                                            {Array.isArray(auth.permissions) && auth.permissions.includes('request bill info amendments') && (
                                                <DropdownMenuItem>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start"
                                                        onClick={() => showAmendment('Bill Info Amendments', 'bill')}
                                                    >
                                                        Bill Info Amendments
                                                    </Button>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button variant="ghost" className="cursor-pointer">
                                        <Download />
                                    </Button>
                                    <Button variant="ghost" className="cursor-pointer">
                                        <Printer />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex w-full flex-col items-center sm:flex-row">
                                <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={undefined} width={80} height={80} className="h-20 w-20 object-cover" />
                                        <AvatarFallback className="flex h-20 w-20 items-center justify-center text-4xl">
                                            {application.first_name?.charAt(0) + application.last_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-center sm:items-start">
                                        <h1 className="text-2xl font-bold">
                                            {application.first_name} {application.middle_name} {application.last_name} {application.suffix}
                                        </h1>
                                        <small>{application.account_number}</small>
                                        <small className="text-muted-foreground uppercase">
                                            {application.customer_type?.full_text}
                                        </small>
                                    </div>
                                </div>
                                <div className="mt-4 flex w-full flex-col">
                                    <h1>ISNAP: {application.is_isnap ? 'Yes' : 'No'}</h1>
                                    <h1>Application #: {application.account_number}</h1>
                                    <span>Contact #: {application.mobile_1}</span>
                                    <span>Email: {application.email_address}</span>

                                    <div>
                                        <span>Submitted at:</span> {moment(application.created_at).format('MMMM D, YYYY h:mm A')}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="flex w-full justify-end gap-2">
                            <Select onValueChange={(value) => setStatus(value)} value={status}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="payment_approved">Payment Approved</SelectItem>
                                    <SelectItem value="approved_for_energization">Approved for Energization</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="downloaded_by_crew">Downloaded by Crew</SelectItem>
                                    <SelectItem value="energized">Energized</SelectItem>
                                    <SelectItem value="pending_inspection_fee_payment">Pending Inspection Fee Payment</SelectItem>
                                    <SelectItem value="for_inspection">For Inspection</SelectItem>
                                    <SelectItem value="re_inspection">Re-Inspection</SelectItem>
                                    <SelectItem value="for_installation_approval">For Installation Approval</SelectItem>
                                    <SelectItem value="for_installation">For Installation</SelectItem>
                                    <SelectItem value="forwarded_to_planning">Forwarded To Planning</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
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
                    </div>

                    <section>
                        <Tabs defaultValue="information" className="w-full">
                            <TabsList className="flex h-full w-full flex-wrap gap-4">
                                <TabsTrigger value="information">
                                    <Info />
                                    Basic Information
                                </TabsTrigger>
                                <TabsTrigger value="inspection">
                                    <ClipboardCheck />
                                    Inspection
                                </TabsTrigger>
                                <TabsTrigger value="meter">
                                    <Gauge />
                                    Meter & Transformer
                                </TabsTrigger>
                                <TabsTrigger value="line">
                                    <PlugZap />
                                    Line & Metering
                                </TabsTrigger>
                                <TabsTrigger value="payment">
                                    <PhilippinePeso />
                                    Payment Order
                                </TabsTrigger>
                                <TabsTrigger value="files">
                                    <Paperclip />
                                    Files
                                </TabsTrigger>
                                <TabsTrigger value="photos">
                                    <Images />
                                    Photos
                                </TabsTrigger>
                                <TabsTrigger value="amendment-history">
                                    <FileClock />
                                    Amendment History
                                </TabsTrigger>
                                <TabsTrigger value="logs">
                                    <List />
                                    Logs
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="information">
                                <CustomerInformation application={application} />
                            </TabsContent>
                            <TabsContent value="inspection">
                                <Inpections inspections={application?.inspections} />
                            </TabsContent>
                            <TabsContent value="amendment-history">
                                <AmendmentHistory {...application} />
                            </TabsContent>
                            <TabsContent value="files">
                                <AttachmentFiles attachments={application?.attachments} />
                            </TabsContent>
                        </Tabs>
                    </section>

                    <AmendmentDialog
                        open={assignDialogOpen}
                        onOpenChange={setAssignDialogOpen}
                        dialogDetails={dialogDetails}
                        application={application}
                    ></AmendmentDialog>
                    <ContractDialog open={contractDialogOpen} onOpenChange={setContractDialogOpen} application={application} />
                </div>
            </AppLayout>
        </main>
    );
}

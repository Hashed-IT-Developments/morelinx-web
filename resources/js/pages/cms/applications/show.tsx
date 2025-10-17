import Button from '@/components/composables/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { ClipboardCheck, Download, FileClock, FileCog, Gauge, Images, Info, List, Paperclip, PhilippinePeso, PlugZap, Printer } from 'lucide-react';

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

interface ApplicationViewProps {
    application: CustomerApplication;
    auth: Auth;
}

export default function ApplicationView({ application, auth }: ApplicationViewProps) {
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const [showHistory, setShowHistory] = useState(false);

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
                                    </div>
                                </div>
                                <div className="mt-4 flex w-full flex-col">
                                    <h1>Application #:</h1>
                                    <span>Contact #:</span>
                                    <span>Email:</span>

                                    <div>
                                        <span>Submitted at:</span> {moment(application.created_at).format('MMMM D, YYYY h:mm A')}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="flex w-full justify-end gap-2">
                            <Select>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Approved</SelectItem>
                                    <SelectItem value="dark">Payment Approved</SelectItem>
                                    <SelectItem value="system">Approved for Energization</SelectItem>
                                    <SelectItem value="system">Closed</SelectItem>
                                    <SelectItem value="system">Downloaded by Crew</SelectItem>
                                    <SelectItem value="system">Energized</SelectItem>
                                    <SelectItem value="system">Pending Inspection Fee Payment</SelectItem>
                                    <SelectItem value="system">For Inspection</SelectItem>
                                    <SelectItem value="system">Re-Inspection</SelectItem>
                                    <SelectItem value="system">Forwarded To Planning</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="destructive">Override Status</Button>
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
                                <TabsTrigger value="logs">
                                    <List />
                                    Logs
                                </TabsTrigger>
                                <TabsTrigger value="amendment-history">
                                    <FileClock />
                                    Amendment History
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
                        </Tabs>
                    </section>

                    <AmendmentDialog
                        open={assignDialogOpen}
                        onOpenChange={setAssignDialogOpen}
                        dialogDetails={dialogDetails}
                        application={application}
                    ></AmendmentDialog>
                </div>
            </AppLayout>
        </main>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { Eye } from 'lucide-react';

interface RouteDetails {
    id: string;
    name: string;
    customerAccounts: AccountDetail[];
}

interface AccountDetail {
    id: string;
    account_name: string;
    account_number: string;
    account_status: 'Active' | 'Disconnected';
    previousKWH: number;
}

interface Props {
    selectedRoute: RouteDetails | null;
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
}

export default function ViewScheduleDialog({ selectedRoute, openModal, setOpenModal }: Props) {
    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogContent className="max-w-5xl min-w-5xl">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <DialogTitle className="text-xl">{selectedRoute?.name}</DialogTitle>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">List Of Accounts in this Route</p>
                    </div>
                    <DialogClose />
                </DialogHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                <TableHead>Customer Name / Account number</TableHead>
                                <TableHead className="text-center">Account Status</TableHead>
                                <TableHead className="text-center">Previous KWH</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedRoute?.customerAccounts && selectedRoute.customerAccounts.length > 0 ? (
                                selectedRoute.customerAccounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{account.account_name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{account.account_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={account.account_status === 'Active' ? 'default' : 'secondary'}
                                                className={
                                                    account.account_status === 'Active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }
                                            >
                                                {account.account_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{account.previousKWH?.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    title="View account details page"
                                                    onClick={() => router.visit('/accounts/' + account.id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                                        No accounts found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}

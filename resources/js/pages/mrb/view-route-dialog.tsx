import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import { Edit, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Route {
    id: string;
    name: string;
    reading_day_of_month: number;
    meter_reader_id: string | null;
    barangay_id: string;
    town_id: string;
    active: number;
    disconnected: number;
    total: number;
}

interface ViewRouteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    route: Route;
}

interface MeterReader {
    id: string;
    name: string;
}

interface Reading {
    id: string;
    previous_reading: number;
    current_reading: number;
    KWH: number;
}

interface CustomerAccount {
    id: string;
    account_name: string;
    account_number: string;
    account_status: string;
    previous_kwh: string;
    previous_reading: Reading;
}

interface RouteDetails {
    route: Route;
    customer_accounts: Array<CustomerAccount>;
}

export default function ViewRoute({ open, onOpenChange, route }: ViewRouteProps) {
    const [routeDetails, setRouteDetails] = useState({} as RouteDetails);

    useEffect(() => {
        axios
            .get('/mrb/routes/get-single-route-api/' + route.id)
            .then((response) => {
                setRouteDetails(response.data);
                console.log(routeDetails);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [route]);

    const cn = (account_status: string) => {
        switch (account_status) {
            case 'pending':
                return 'bg-red-400';
                break;
            case 'active':
                return 'bg-green-400';
                break;
            case 'suspended':
                return 'bg-orange-400';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] w-full md:min-w-5xl">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle>{route.name}</DialogTitle>
                            <div className="text-gray-600">List of Accounts in this Route</div>
                        </div>
                        <div className="relative">
                            <Button variant="ghost" size="sm" onClick={() => {}} className="absolute right-3" style={{ top: '-16px' }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
                <div style={{ overflow: 'scroll', maxHeight: '70vh' }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-black">Customer Name/Account #</TableHead>
                                <TableHead className="text-black">Account Status</TableHead>
                                <TableHead className="text-black">Previous KWH</TableHead>
                                <TableHead className="text-center text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {routeDetails.customer_accounts?.map((account: CustomerAccount) => (
                                <TableRow>
                                    <TableCell>
                                        <div className="bold text-lg text-black">{account.account_name}</div>
                                        <div className="text-sm text-gray-600">{account.account_number}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(account.account_status)}>{account.account_status}</Badge>
                                    </TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="sm" onClick={() => {}}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface ViewRouteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    route: Route;
}

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

export default function ViewRoute({ open, onOpenChange, route }: ViewRouteProps) {
    const [routeDetails, setRouteDetails] = useState({} as any);

    useEffect(() => {
        axios
            .get('/mrb/routes/get-single-route-api/' + route.id)
            .then((response) => {
                setRouteDetails(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [route]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:min-w-m w-full">
                <DialogHeader>
                    <DialogTitle>View Route</DialogTitle>
                </DialogHeader>
                <div>
                    <div>
                        Name: <strong>{routeDetails.name}</strong>
                    </div>
                    <div>
                        Reading Day: <strong>{route.reading_day_of_month}</strong>
                    </div>
                    <hr className="my-4" />
                    <div>
                        Town:{' '}
                        <strong>
                            {routeDetails.barangay?.town?.name} ({routeDetails.barangay?.town?.alias})
                        </strong>
                    </div>
                    <div>
                        Barangay:{' '}
                        <strong>
                            {routeDetails.barangay?.name} ({routeDetails.barangay?.alias})
                        </strong>
                    </div>
                    <hr className="my-4" />
                    <div>
                        Meter Reader: <strong>{routeDetails.meter_reader?.name}</strong>
                    </div>
                    <div>
                        Email: <strong>{routeDetails.meter_reader?.email}</strong>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getStatusColor } from '@/lib/status-utils';
import moment from 'moment';

interface ViewEnergizationProps {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    energization?: Energization | null;
}
export default function ViewEnergization({ isOpen, setIsOpen, energization }: ViewEnergizationProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Energization Details <Badge className={getStatusColor(energization?.status)}>{energization?.status}</Badge>
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                {energization && (
                    <div className="mt-4 grid grid-cols-1 gap-6">
                        <Card className="border border-gray-200 shadow-md">
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-3 border-r pr-6">
                                        <div>
                                            <span className="block font-semibold text-gray-700">Action Taken:</span>
                                            <span className="block text-gray-900">{energization.action_taken}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">Service Connection:</span>
                                            <span className="block text-gray-900">{energization.service_connection}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">Team Assigned:</span>
                                            <span className="block text-gray-900">{energization?.team_assigned?.name}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">Team Executed:</span>
                                            <span className="block text-gray-900">{energization?.team_executed?.name}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pl-6">
                                        <div>
                                            <span className="block font-semibold text-gray-700">Date Installed:</span>
                                            <span className="block text-gray-900">
                                                {moment(energization?.date_installed).format('ddd, MMM DD, YYYY')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">Time of Arrival:</span>
                                            <span className="block text-gray-900">{moment(energization?.time_of_arrival).format('hh:mm A')}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">Transformer Owned:</span>
                                            <span className="block text-gray-900">{energization?.transformer_owned}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">Transformer Rating:</span>
                                            <span className="block text-gray-900">{energization.transformer_rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-gray-200 shadow-md">
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-3 border-r pr-6">
                                        <div>
                                            <span className="block font-semibold text-gray-700">CT Brand Name:</span>
                                            <span className="block text-gray-900">{energization.ct_brand_name}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">CT Serial Number:</span>
                                            <span className="block text-gray-900">{energization.ct_serial_number}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">CT Ratio:</span>
                                            <span className="block text-gray-900">{energization.ct_ratio}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="block font-semibold text-gray-700">PT Brand Name:</span>
                                            <span className="block text-gray-900">{energization.pt_brand_name}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">PT Serial Number:</span>
                                            <span className="block text-gray-900">{energization.pt_serial_number}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-700">PT Ratio:</span>
                                            <span className="block text-gray-900">{energization.pt_ratio}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <span className="block font-semibold text-gray-700">Remarks:</span>
                                    <span className="block text-gray-900">{energization.remarks}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

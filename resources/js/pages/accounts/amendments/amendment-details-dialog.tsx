import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

interface AmendmentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    amendmentRequest: AmendmentRequest | undefined;
}

const handleAction = (amendmentRequest: AmendmentRequest, action: string) => {
    axios.put(route('amendment-request.action', { amendmentRequest: amendmentRequest.id, action: action })).then((response) => {
        if (response.status === 200 && response.data) {
            router.visit(route('amendment-requests.index'));
        }
    });
};

export default function AmendmentDetailsDialog({ open, onOpenChange, amendmentRequest }: AmendmentProps) {
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full md:min-w-2xl lg:min-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Amendment Request Details</DialogTitle>
                    </DialogHeader>
                    <DialogDescription />

                    <div className="grid grid-cols-2 gap-1">
                        <div className="flex flex-col rounded border bg-green-50 p-2">
                            <h3 className="text-lg font-bold">Account Name</h3>
                            <div>{amendmentRequest?.customer_account.account_name}</div>
                        </div>
                        <div className="flex flex-col rounded border bg-red-50 p-2">
                            <h3 className="text-lg font-bold">Customer Type</h3>
                            <div>{amendmentRequest?.customer_account.customer_type.customer_type}</div>
                        </div>
                        <div className="flex flex-col rounded border bg-orange-50 p-2">
                            <h3 className="text-lg font-bold">Rate Class</h3>
                            <div>{amendmentRequest?.customer_account.customer_type.rate_class}</div>
                        </div>
                        <div className="flex flex-col rounded border bg-blue-50 p-2">
                            <h3 className="text-lg font-bold">Requested by</h3>
                            <div>{amendmentRequest?.user?.name}</div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold">Affected Fields</h3>
                    <table className="w-full rounded-lg border">
                        <thead>
                            <tr>
                                <th className="bg-gray-200 p-2 text-start">Field</th>
                                <th className="bg-gray-200 p-2 text-start">Original Data</th>
                                <th className="bg-gray-200 p-2 text-start">New Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {amendmentRequest?.amendment_request_items.map((item) => {
                                return (
                                    <tr key={item.id} className="border even:bg-gray-100">
                                        <td className="p-2">{item.field}</td>
                                        <td className="p-2">{item.current_data}</td>
                                        <td className="p-2">{item.new_data_ref}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <DialogFooter className="mt-4">
                        {amendmentRequest?.status.toLowerCase() === 'pending' && (
                            <div className="flex w-full justify-between">
                                <Button type="button" variant="destructive" onClick={() => handleAction(amendmentRequest, 'rejected')}>
                                    <ThumbsDown />
                                    Reject Amendments
                                </Button>
                                <Button type="button" onClick={() => handleAction(amendmentRequest, 'approved')}>
                                    <ThumbsUp />
                                    Approve Amendments
                                </Button>
                            </div>
                        )}

                        {amendmentRequest?.status.toLowerCase() !== 'pending' && (
                            <h3
                                className={`rounded p-2 text-lg ${
                                    amendmentRequest?.status.toLowerCase().startsWith('approved') ? 'bg-green-200' : 'bg-red-200'
                                }`}
                            >
                                Status: {amendmentRequest?.status} <br />
                                by: {amendmentRequest?.by_user?.name}
                            </h3>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster position="top-right" />
        </>
    );
}

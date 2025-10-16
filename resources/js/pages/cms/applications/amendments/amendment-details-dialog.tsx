import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AmendmentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    amendmentRequest: AmendmentRequest;
}

const handleApprove = (amendmentRequest: AmendmentRequest) => {
    console.log(amendmentRequest)
}

export default function AmendmentDetailsDialog({ open, onOpenChange, amendmentRequest }: AmendmentProps) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full md:min-w-2xl lg:min-w-5xl">
                <DialogHeader>
                    <DialogTitle>Amendment Request Details</DialogTitle>
                </DialogHeader>
                <DialogDescription />

                <h1>Something about amendments?</h1>

                <DialogFooter className="mt-4">
                    <Button type="button" onClick={()=>handleApprove(amendmentRequest)}>
                        Approve Amendments
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

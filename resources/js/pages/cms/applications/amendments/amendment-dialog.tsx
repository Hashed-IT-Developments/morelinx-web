import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import { ReactNode } from "react"



interface AmendmentProps {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    amendmentForm: ReactNode,
    title: string,
}

export default function AmendmentDialog({open, amendmentForm, onOpenChange, title}:AmendmentProps) {


    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full md:min-w-4xl lg:min-w-7xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{title}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full px-4">
                        {amendmentForm}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )

}

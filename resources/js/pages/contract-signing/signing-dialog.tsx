import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IsSigWebInstalled, onSign, onClear, onClose } from  './SigWebTablet.js';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.js";
import axios from "axios";
import { toast } from "sonner";


interface ContractDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    application: CustomerApplication;
}

export default function SigningDialog({ open, onOpenChange, application }: ContractDialogProps) {
    const [sigWebInstalled, setSigWebInstalled] =  useState(false);
    const [signActive, setSignActive] = useState(false);

    useEffect(() => {
        // Initialize the SigWebTablet when the dialog opens
        if (open) {
            if(IsSigWebInstalled()) {
                console.log("SigWeb is installed.");
                setSigWebInstalled(true);
                setSignActive(false);
            }else {
                console.log("SigWeb is not installed.");
            }
        }else {
            onClose();
            setSignActive(false);
        }
    }, [open]);

    const activateSigning = () => {
        if (sigWebInstalled) {
            setSignActive(true);
            onSign();
        }
    }

    const clearTablet = () => {
        if (sigWebInstalled) {
            onClear();
        }
    }


    const onCapture = () => {
        if (sigWebInstalled) {
            // Capture the signature from the tablet
            const canvas = document.getElementById('cnv') as HTMLCanvasElement | null;
            if (!canvas) {
                console.warn('Canvas element not found');
                return;
            }

            const _dataUrl = canvas.toDataURL('image/png');
            /**
             * TODO:
             * From here you need to add a field into the application table for signature image data
             * Then send the dataUrl to the backend to save it against the application
             * Maybe, add a button in the list to view the contract with the signature image embedded
             */
            axios.post('/applications/contract-signing/save-signature', {
                contract_id: application?.application_contract?.id,
                signature_data: _dataUrl,
            }, { withCredentials: true }).then(response => {
                console.log('Signature saved successfully', response.data);
                toast("Signature saved", {
                    description: "The signature was saved successfully.",
                    variant: "success",
                });
                application.application_contract = response.data.application_contract;
                setSignActive(false);
                onOpenChange(false);
            }).catch(error => {
                console.error('Error saving signature', error);
                toast("Error", {
                    description: "There was an error saving the signature.",
                    variant: "destructive",
                });
            });
        }

    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full overflow-y-auto md:min-w-xl">
                <DialogHeader>
                    <DialogTitle>Contract Signing</DialogTitle>
                    <DialogDescription>
                        Capture Signature for Customer <strong>{application?.identity}</strong> <br />
                        Contract ID: &nbsp;&nbsp;<strong>{application?.application_contract?.id ?? 'N/A'}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center mt-4">
                    {sigWebInstalled && (
                        <>
                            <table width="500" className={`border ${signActive ? 'border-green-400' : 'border-gray-300'}`}>
                                <tbody>
                                    <tr>
                                        <td height="100" width="500">
                                            <canvas id="cnv" width="500" height="100"></canvas>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="mt-2 flex gap-2 justify-center">
                                <Button onClick={activateSigning}>Activate Signing</Button>
                                <Button onClick={clearTablet}>Clear</Button>
                                <Button onClick={onCapture}>Capture Signature</Button>
                            </div>
                        </>
                    )}

                    {!sigWebInstalled && (
                        <div>
                            <p>SigWeb Tablet software is not installed. Please install it to proceed with contract signing.</p>
                            <a href="https://www.topazsystems.com/software/sigweb/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                Download SigWeb Tablet Software
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

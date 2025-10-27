import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ContractFormComponent from './contract-form';
import { ApplicationContract, ContractForm, contractSchema } from './contract-types';

interface ContractDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    application: CustomerApplication & { application_contract?: ApplicationContract };
}

export default function ContractDialog({ open, onOpenChange, application }: ContractDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const customerName = `${application.first_name} ${application.middle_name || ''} ${application.last_name} ${application.suffix || ''}`.trim();

    const contract = application.application_contract;

    const form = useForm<ContractForm>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            deposit_receipt: '',
            type: '',
            entered_date: '',
            done_at: '',
            by_personnel: '',
            by_personnel_position: '',
            id_no_1: '',
            issued_by_1: '',
            valid_until_1: '',
            building_owner: '',
            id_no_2: '',
            issued_by_2: '',
            valid_until_2: '',
        },
    });

    // Auto-fill form with existing contract data when dialog opens
    useEffect(() => {
        if (open && contract) {
            form.reset({
                deposit_receipt: contract.deposit_receipt || '',
                type: contract.type || '',
                entered_date: contract.entered_date || '',
                done_at: contract.done_at || '',
                by_personnel: contract.by_personnel || '',
                by_personnel_position: contract.by_personnel_position || '',
                id_no_1: contract.id_no_1 || '',
                issued_by_1: contract.issued_by_1 || '',
                valid_until_1: contract.valid_until_1 || '',
                building_owner: contract.building_owner || '',
                id_no_2: contract.id_no_2 || '',
                issued_by_2: contract.issued_by_2 || '',
                valid_until_2: contract.valid_until_2 || '',
            });
        }
    }, [open, contract, form]);

    const onSubmit = async (data: ContractForm) => {
        setIsSubmitting(true);

        router.put(route('customer-applications.contract.update', contract?.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-full overflow-y-auto md:min-w-2xl lg:min-w-5xl">
                <DialogHeader>
                    <DialogTitle>Contract Information</DialogTitle>
                    <DialogDescription>Update the contract information for this application.</DialogDescription>
                </DialogHeader>
                <ContractFormComponent
                    form={form}
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                    customerName={customerName}
                    contractId={contract?.id}
                />
            </DialogContent>
        </Dialog>
    );
}

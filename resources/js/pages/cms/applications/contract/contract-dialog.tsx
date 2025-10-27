import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ContractFormComponent from './contract-form';
import { ApplicationContract, ContractForm, contractSchema } from './contract-types';

interface ContractDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    application: CustomerApplication & { applicationContract?: ApplicationContract };
}

export default function ContractDialog({ open, onOpenChange, application }: ContractDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const customerName = `${application.first_name} ${application.middle_name || ''} ${application.last_name} ${application.suffix || ''}`.trim();

    const hasExistingContract = !!application.applicationContract;

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

    const onSubmit = async (data: ContractForm) => {
        setIsSubmitting(true);

        router.post(
            route('customer-applications.contract.store'),
            { ...data, customer_application_id: application.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onOpenChange(false);
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-full overflow-y-auto md:min-w-2xl lg:min-w-5xl">
                <DialogHeader>
                    <DialogTitle>Contract Information</DialogTitle>
                    {hasExistingContract ? (
                        <DialogDescription className="text-yellow-600">
                            A contract already exists for this application. You cannot create another one.
                        </DialogDescription>
                    ) : (
                        <DialogDescription>Fill in the contract information for this application.</DialogDescription>
                    )}
                </DialogHeader>
                <ContractFormComponent
                    form={form}
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                    customerName={customerName}
                    hasExistingContract={hasExistingContract}
                />
            </DialogContent>
        </Dialog>
    );
}

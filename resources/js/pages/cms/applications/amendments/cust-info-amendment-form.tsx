import Button from '@/components/composables/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import React from 'react';

interface CustInfoAmendmentFormProps {
    customerApplication: CustomerApplication;
    userId: number;
}

export default function CustInfoAmendmentForm({ userId, customerApplication }: CustInfoAmendmentFormProps) {
    const { put, data, setData, errors } = useForm({
        user_id: userId,
        customer_application_id: customerApplication.id,
        last_name: '',
        first_name: '',
        middle_name: '',
        suffix: '',
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        put(route('applications.amend-customer-info', customerApplication.id));
    };

    return (
        <>
            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div className="flex flex-col p-2">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            placeholder={customerApplication.last_name ?? 'Last Name'}
                            className="p-1 rounded border border-gray-400"
                        />
                        <i className="text-red-600 text-xs italic">{errors.last_name}</i>
                    </div>

                    <div className="flex flex-col p-2">
                        <label htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            placeholder={customerApplication.first_name ?? 'First Name'}
                            className="p-1 rounded border border-gray-400"
                        />
                        <i className="text-red-600 text-xs italic">{errors.first_name}</i>
                    </div>

                    <div className="flex flex-col p-2">
                        <label htmlFor="middle_name">Middle Name</label>
                        <input
                            type="text"
                            name="middle_name"
                            id="middle_name"
                            value={data.middle_name}
                            onChange={(e) => setData('middle_name', e.target.value)}
                            placeholder={customerApplication.middle_name ?? 'Middle Name'}
                            className="p-1 rounded border border-gray-400"
                        />
                        <i className="text-red-600 text-xs italic">{errors.middle_name}</i>
                    </div>


                    <div className="flex flex-col p-2">
                        <label htmlFor="middle_name">Suffix</label>
                        <input
                            type="text"
                            name="suffix"
                            id="suffix"
                            value={data.suffix}
                            onChange={(e) => setData('suffix', e.target.value)}
                            placeholder={customerApplication.suffix ?? 'Suffix'}
                            className="p-1 rounded border border-gray-400"
                        />
                        <i className="text-red-600 text-xs italic">{errors.suffix}</i>
                    </div>

                </div>
                <DialogFooter className="mt-3">
                    <Button type="submit" disabled={isSubmitting}>
                        Submit
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
}

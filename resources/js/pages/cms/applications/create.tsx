import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ConfirmationTab, StepAccountInfo, StepAddressInfo, StepBillInfo, StepContactInfo, StepRequirements } from './form-wizard/steps';

type FormValues = {
    rate_class: string;
    customer_type: string;
    connected_load: number;
    property_ownership: string;
    last_name: string;
    first_name: string;
    middle_name: string;
    suffix: string;
    birthdate: null;
    nationality: string;
    sex: string;
    marital_status: string;
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
};

export default function WizardForm() {
    const [step, setStep] = React.useState(0);

    const form = useForm<FormValues>({
        defaultValues: {
            // Section: Type
            rate_class: 'temp', // disabled field
            customer_type: '',

            // Section: House Information
            connected_load: 0,
            property_ownership: '',

            // Section: Personal Information
            last_name: '',
            first_name: '',
            middle_name: '',
            suffix: '',
            birthdate: null, // calendar/date picker
            nationality: '',
            sex: '',
            marital_status: '',

            // Section: FormSchema fields
            name: '',
            email: '',
            address: '',
            city: '',
            zip: '',
        },
    });

    const steps = [
        {
            label: 'Account Info',
            fields: [
                'rate_class',
                'customer_type',
                'connected_load',
                'property_ownership',
                'last_name',
                'first_name',
                'middle_name',
                'suffix',
                'birthdate',
                'nationality',
                'sex',
                'marital_status',
            ],
        },
        { label: 'Address Info', fields: ['email'] },
        { label: 'Contact Info', fields: ['address'] },
        { label: 'Requirements', fields: ['city'] },
        { label: 'Bill Info', fields: ['zip'] },
        { label: 'Review', fields: [] },
    ];

    const nextStep = async () => {
        // setStep((s) => Math.min(s + 1, steps.length - 1));
        // return; // temporary bypass

        const fields = steps[step].fields as readonly (keyof FormValues)[];
        const isValid = await form.trigger(fields);
        if (isValid) {
            // 🔹 optional backend validation per step
            const validateStep = `step${step + 1}`;
            try {
                await axios.post(route('applications.wizard.step', { step: validateStep }), form.getValues());

                setStep((s) => Math.min(s + 1, steps.length - 1));
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response) {
                    console.log('Step validation error:', err.response.data);

                    if (err.response.status === 422 && err.response.data.errors) {
                        Object.entries(err.response.data.errors).forEach(([field, message]) => {
                            form.setError(field as keyof FormValues, {
                                type: 'server',
                                message: message as string,
                            });
                        });
                    }
                } else {
                    console.error('Unexpected error:', err);
                }
            }
        }
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    const onSubmit = (values: FormValues) => {
        console.log('Final submission', values);
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Applications', href: '/dashboard/applications' },
        { title: 'Create', href: '/dashboard/applications/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="m-4 sm:m-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Stepper Tabs (read-only, non-clickable) */}
                        <Tabs value={String(step)} className="w-full">
                            <TabsList className="flex w-full gap-1 overflow-x-auto rounded-md bg-muted p-1">
                                {steps.map((s, index) => (
                                    <TabsTrigger
                                        key={index}
                                        value={String(index)}
                                        disabled // 👈 disables clicking, purely an indicator
                                        className={`min-w-[80px] flex-shrink-0 truncate px-2 py-1 text-xs sm:text-sm ${
                                            step === index ? 'bg-primary' : ''
                                        }`}
                                    >
                                        {s.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <Progress value={((step + 1) / steps.length) * 100} className="mb-4 w-full" />

                            {/* Step contents */}
                            <TabsContent value="0">
                                <StepAccountInfo />
                            </TabsContent>

                            <TabsContent value="1">
                                <StepAddressInfo />
                            </TabsContent>

                            <TabsContent value="2">
                                <StepContactInfo />
                            </TabsContent>

                            <TabsContent value="3">
                                <StepRequirements />
                            </TabsContent>

                            <TabsContent value="4">
                                <StepBillInfo />
                            </TabsContent>

                            <TabsContent value="5">
                                <ConfirmationTab />
                            </TabsContent>
                        </Tabs>

                        {/* Navigation buttons */}
                        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-between">
                            <div className="flex w-full gap-2 sm:w-auto">
                                {step > 0 && (
                                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1 sm:flex-none">
                                        ← Back
                                    </Button>
                                )}
                            </div>
                            <div className="flex w-full justify-end gap-2 sm:w-auto">
                                {step < steps.length - 1 ? (
                                    <Button type="button" onClick={nextStep} className="flex-1 sm:flex-none">
                                        Next →
                                    </Button>
                                ) : (
                                    <Button type="submit" className="flex-1 sm:flex-none">
                                        Submit Application
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}

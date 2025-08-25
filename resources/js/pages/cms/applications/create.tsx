import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { StepAccountInfo, StepAddressInfo } from './form-wizard/steps';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().refine((val) => /^\S+@\S+\.\S+$/.test(val), { message: 'Invalid email address' }),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    zip: z.string().min(4, 'ZIP must be at least 4 digits'),
});

type FormValues = z.infer<typeof formSchema>;

export default function WizardForm() {
    const [step, setStep] = React.useState(0);

    const form = useForm({
        defaultValues: {
            // Section: Type
            rate_class: 'Residential', // disabled field
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
        const fields = steps[step].fields;
        const isValid = await form.trigger(fields as any);
        if (isValid) {
            // 🔹 optional backend validation per step
            const validateStep = `step${step + 1}`;
            try {
                const res = await axios.post(route('applications.wizard.step', { step: validateStep }), form.getValues());

                setStep((s) => Math.min(s + 1, steps.length - 1));
            } catch (err: any) {
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
                    <TabsList className="flex w-full overflow-x-auto gap-1 rounded-md bg-muted p-1">
                        {steps.map((s, index) => (
                            <TabsTrigger
                                key={index}
                                value={String(index)}
                                disabled // 👈 disables clicking, purely an indicator
                                className={`truncate text-xs sm:text-sm px-2 py-1 min-w-[80px] flex-shrink-0 ${
                                    step === index ? 'bg-primary' : ''
                                }`}
                            >
                                {s.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <Progress value={((step + 1) / steps.length) * 100} className="w-full" />

                    {/* Step contents */}
                    <TabsContent value="0">
                    <StepAccountInfo />
                    </TabsContent>

                    <TabsContent value="1">
                    <StepAddressInfo />
                    </TabsContent>

                    {/* Review step */}
                    <TabsContent value="5">
                    <div className="space-y-2 text-sm sm:text-base">
                        <p>
                        <strong>Name:</strong> {form.getValues('name')}
                        </p>
                        <p>
                        <strong>Email:</strong> {form.getValues('email')}
                        </p>
                        <p>
                        <strong>Address:</strong> {form.getValues('address')}
                        </p>
                        <p>
                        <strong>City:</strong> {form.getValues('city')}
                        </p>
                        <p>
                        <strong>ZIP:</strong> {form.getValues('zip')}
                        </p>
                    </div>
                    </TabsContent>
                </Tabs>

                {/* Navigation buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                    {step > 0 && (
                    <Button type="button" variant="outline" onClick={prevStep} className="w-full sm:w-auto">
                        Back
                    </Button>
                    )}

                    {step < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep} className="w-full sm:w-auto">
                        Next
                    </Button>
                    ) : (
                    <Button type="submit" className="w-full sm:w-auto">Submit</Button>
                    )}
                </div>
                </form>
            </Form>
            </div>
        </AppLayout>
    );
}

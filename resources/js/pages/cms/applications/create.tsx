import * as React from 'react';
import { useForm } from 'react-hook-form';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { ApplicationFormValues } from '@/types/application-types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ConfirmationTab, StepAccountInfo, StepAddressInfo, StepBillInfo, StepContactInfo, StepRequirements } from './form-wizard/steps';

interface WizardFormProps {
    application?: ApplicationFormValues;
    isEditing?: boolean;
}

export default function WizardForm({ application, isEditing = false }: WizardFormProps) {
    const [step, setStep] = React.useState(0);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<ApplicationFormValues>({
        defaultValues: {
            // ID for existing applications
            id: application?.id,

            // Account Info - Type Section
            rate_class: application?.rate_class || 'temp', // disabled field, default value
            customer_type: application?.customer_type || '',

            // Account Info - House Information
            connected_load: application?.connected_load || 0,
            property_ownership: application?.property_ownership || '',

            // Account Info - Personal Information
            last_name: application?.last_name || '',
            first_name: application?.first_name || '',
            middle_name: application?.middle_name || '',
            suffix: application?.suffix || '',
            birthdate: application?.birthdate || null, // calendar/date picker
            nationality: application?.nationality || '',
            sex: application?.sex || '',
            marital_status: application?.marital_status || '',

            // Address Info
            landmark: application?.landmark || '',
            unit_no: application?.unit_no || '',
            building_floor: application?.building_floor || '',
            street: application?.street || '',
            subdivision: application?.subdivision || '',
            district: application?.district || '',
            barangay: application?.barangay || '',
            sketch: application?.sketch || null,

            // Contact Info - Contact Person
            cp_lastname: application?.cp_lastname || '',
            cp_firstname: application?.cp_firstname || '',
            cp_middlename: application?.cp_middlename || '',
            relationship: application?.relationship || '',

            // Contact Info - Contact Details
            cp_email: application?.cp_email || '',
            cp_tel_no: application?.cp_tel_no || '',
            cp_tel_no_2: application?.cp_tel_no_2 || '',
            cp_mobile_no: application?.cp_mobile_no || '',
            cp_mobile_no_2: application?.cp_mobile_no_2 || '',

            // Requirements - Government ID
            id_type: application?.id_type || '',
            id_type_2: application?.id_type_2 || '',
            id_number: application?.id_number || '',
            id_number_2: application?.id_number_2 || '',

            // Requirements - Senior Citizen
            is_senior_citizen: application?.is_senior_citizen || false,
            sc_from: application?.sc_from || null,
            sc_number: application?.sc_number || '',

            // Requirements - Attachments
            attachments: application?.attachments || {},

            // Bill Info - Bill Address
            bill_district: application?.bill_district || '',
            bill_barangay: application?.bill_barangay || '',
            bill_subdivision: application?.bill_subdivision || '',
            bill_street: application?.bill_street || '',
            bill_building_floor: application?.bill_building_floor || '',
            bill_house_no: application?.bill_house_no || '',

            // Bill Info - Bill Delivery
            bill_delivery: application?.bill_delivery || '',
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
        {
            label: 'Address Info',
            fields: ['landmark', 'unit_no', 'building_floor', 'street', 'subdivision', 'district', 'barangay', 'sketch'],
        },
        {
            label: 'Contact Info',
            fields: ['lastname', 'firstname', 'middlename', 'relationship', 'email', 'tel_no', 'tel_no_2', 'mobile_no', 'mobile_no_2'],
        },
        {
            label: 'Requirements',
            fields: ['id_type', 'id_number', 'id_number_2', 'is_senior_citizen', 'sc_from', 'sc_number', 'attachments'],
        },
        {
            label: 'Bill Info',
            fields: ['bill_district', 'bill_barangay', 'bill_subdivision', 'bill_street', 'bill_building_floor', 'bill_house_no', 'bill_delivery'],
        },
        { label: 'Review', fields: [] },
    ];

    const nextStep = async () => {
        // setStep((s) => Math.min(s + 1, steps.length - 1));
        // return; // temporary bypass

        const fields = steps[step].fields as readonly (keyof ApplicationFormValues)[];
        const isValid = await form.trigger(fields);
        if (isValid) {
            // 🔹 optional backend validation per step
            const validateStep = `step${step + 1}`;
            try {
                await axios.post(route('applications.wizard.step', { step: validateStep }), form.getValues());

                setStep((s) => Math.min(s + 1, steps.length - 1));
            } catch (err: any) {
                if (axios.isAxiosError(err) && err.response) {
                    console.log('Step validation error:', err.response.data);

                    if (err.response.status === 422 && err.response.data.errors) {
                        Object.entries(err.response.data.errors).forEach(([field, message]) => {
                            form.setError(field as keyof ApplicationFormValues, {
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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const values = form.getValues();

            if (isEditing && application?.id) {
                // Update existing application
                await axios.put(route('applications.update', { application: application.id }), values);
            } else {
                // Create new application
                await axios.post(route('applications.store'), values);
            }

            // Handle successful submission
            // You could redirect here or show a success message
            // router.visit('/dashboard/applications');
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                // Handle validation errors
                if (err.response.status === 422 && err.response.data.errors) {
                    Object.entries(err.response.data.errors).forEach(([field, message]) => {
                        form.setError(field as keyof ApplicationFormValues, {
                            type: 'server',
                            message: message as string,
                        });
                    });
                }
            } else {
                console.error('Unexpected error:', err);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = (values: ApplicationFormValues) => {
        // This will be called by the form, but we'll handle submission via the alert dialog
        console.log('Form validation passed', values);
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Applications', href: '/dashboard/applications' },
        {
            title: isEditing ? 'Edit' : 'Create',
            href: isEditing ? `/dashboard/applications/${application?.id}/edit` : '/dashboard/applications/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Application' : 'Create Application'} />
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
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button type="button" className="flex-1 sm:flex-none">
                                                {isEditing ? 'Update Application' : 'Submit Application'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    {isEditing ? 'Confirm Application Update' : 'Confirm Application Submission'}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {isEditing
                                                        ? 'Are you sure you want to update this application? Please review all changes carefully.'
                                                        : 'Are you sure you want to submit this application? Please review all information carefully as this action cannot be undone.'}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                                                    {isSubmitting
                                                        ? isEditing
                                                            ? 'Updating...'
                                                            : 'Submitting...'
                                                        : isEditing
                                                          ? 'Update Application'
                                                          : 'Submit Application'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}

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
import { useFormSubmit } from '@/composables/useFormSubmit';
import AppLayout from '@/layouts/app-layout';
import { ApplicationFormValues } from '@/types/application-types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { getVisibleSteps } from './form-wizard/step-configs';

interface WizardFormProps {
    application?: ApplicationFormValues;
    isEditing?: boolean;
}

export default function WizardForm({ application, isEditing = false }: WizardFormProps) {
    const [step, setStep] = React.useState(0);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { submitForm } = useFormSubmit();

    const form = useForm<ApplicationFormValues>({
        defaultValues: {
            // ID for existing applications
            id: application?.id,

            // Account Info - Type Section
            rate_class: application?.rate_class || 'residential', // disabled field, default value
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

            // Establishment Info (if applicable)
            account_name: application?.account_name || '',
            trade_name: application?.trade_name || '',
            c_peza_registered_activity: application?.c_peza_registered_activity || '',

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

            // Requirements - Government ID (New Structure)
            id_category: application?.id_category || 'primary',
            primary_id_type: application?.primary_id_type || '',
            primary_id_number: application?.primary_id_number || '',
            primary_id_file: application?.primary_id_file || null,
            secondary_id_1_type: application?.secondary_id_1_type || '',
            secondary_id_1_number: application?.secondary_id_1_number || '',
            secondary_id_1_file: application?.secondary_id_1_file || null,
            secondary_id_2_type: application?.secondary_id_2_type || '',
            secondary_id_2_number: application?.secondary_id_2_number || '',
            secondary_id_2_file: application?.secondary_id_2_file || null,

            // Requirements - Senior Citizen
            is_senior_citizen: application?.is_senior_citizen || false,
            sc_from: application?.sc_from || null,
            sc_number: application?.sc_number || '',

            // ISNAP Member
            is_isnap: application?.is_isnap || false,

            // Requirements - Attachments
            attachments: application?.attachments || {},

            // Government Info - Company/Business Details
            cor_number: application?.cor_number || '',
            tin_number: application?.tin_number || '',
            issued_date: application?.issued_date || null,
            cg_ewt_tag: application?.cg_ewt_tag || null,
            cg_ft_tag: application?.cg_ft_tag || null,
            cg_vat_zero_tag: application?.cg_vat_zero_tag || false,

            // Bill Info - Bill Address
            bill_district: application?.bill_district || '',
            bill_barangay: application?.bill_barangay || '',
            bill_subdivision: application?.bill_subdivision || '',
            bill_street: application?.bill_street || '',
            bill_building_floor: application?.bill_building_floor || '',
            bill_house_no: application?.bill_house_no || '',
            bill_delivery: application?.bill_delivery || '',
        },
    });

    // Watch both rate_class and customer_type to filter steps dynamically
    const currentRateClass = form.watch('rate_class');
    const currentCustomerType = form.watch('customer_type');

    React.useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'rate_class') {
                form.setValue('customer_type', '');
            }

            if (name === 'rate_class' || name === 'customer_type') {
                form.clearErrors();
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);

    // Filter steps based on current rate_class and customer_type using imported function
    const visibleSteps = React.useMemo(() => {
        return getVisibleSteps(currentRateClass, currentCustomerType);
    }, [currentRateClass, currentCustomerType]);

    // Convert to legacy format for existing code compatibility
    const steps = visibleSteps.map((stepConfig) => ({
        id: stepConfig.id,
        label: stepConfig.label,
        fields: stepConfig.fields,
        component: stepConfig.component,
    }));

    // Reset step to 0 if current step becomes invalid after filtering
    React.useEffect(() => {
        if (step >= visibleSteps.length) {
            setStep(0);
        }
    }, [visibleSteps.length, step]);

    const nextStep = async () => {
        // setStep((s) => Math.min(s + 1, steps.length - 1));
        // return; // Early return to prevent validation for now
        const fields = steps[step].fields as readonly (keyof ApplicationFormValues)[];
        const isValid = await form.trigger(fields);
        if (isValid) {
            setStep((s) => Math.min(s + 1, steps.length - 1));
        }
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const values = form.getValues();

            let response;

            if (isEditing && application?.id) {
                // Update existing application
                response = await submitForm(route('applications.update', { application: application.id }), values);
                console.log('Application updated successfully', values);
            } else {
                // Create new application
                response = await submitForm(route('applications.store'), values);
                console.log('Application created successfully', values);
            }

            if (response && response.data && response.data.message === 'success') {
                // Handle successful submission
                // You could redirect here or show a success message
                // window.location.href = route('dashboard')
                router.visit(route('applications.show', response.data.id));
            }
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

                            {/* Step contents - dynamically rendered based on visible steps */}
                            {visibleSteps.map((stepConfig, index) => {
                                const StepComponent = stepConfig.component;
                                return (
                                    <TabsContent key={stepConfig.id} value={String(index)}>
                                        <StepComponent />
                                    </TabsContent>
                                );
                            })}
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

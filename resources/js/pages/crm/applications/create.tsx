import { useEffect, useMemo, useState } from 'react';
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
import { router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { getVisibleSteps } from './form-wizard/step-configs';

interface WizardFormProps {
    application?: ApplicationFormValues;
    isEditing?: boolean;
}

export default function WizardForm({ application, isEditing = false }: WizardFormProps) {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { submitForm } = useFormSubmit();

    const form = useForm<ApplicationFormValues>({
        defaultValues: {
            id: application?.id,

            rate_class: application?.rate_class || 'residential',
            customer_type: application?.customer_type || '',

            connected_load: application?.connected_load || 0,
            property_ownership: application?.property_ownership || '',

            last_name: application?.last_name || '',
            first_name: application?.first_name || '',
            middle_name: application?.middle_name || '',
            suffix: application?.suffix || '',
            birthdate: application?.birthdate || null,
            nationality: application?.nationality || 'Filipino',
            sex: application?.sex || '',
            marital_status: application?.marital_status || '',

            landmark: application?.landmark || '',
            unit_no: application?.unit_no || '',
            building_floor: application?.building_floor || '',
            street: application?.street || '',
            subdivision: application?.subdivision || '',
            district: application?.district || '',
            barangay: application?.barangay || '',
            sketch_lat_long: application?.sketch_lat_long || '',

            account_name: application?.account_name || '',
            trade_name: application?.trade_name || '',
            c_peza_registered_activity: application?.c_peza_registered_activity || '',

            cp_lastname: application?.cp_lastname || '',
            cp_firstname: application?.cp_firstname || '',
            cp_middlename: application?.cp_middlename || '',
            cp_suffix: application?.cp_suffix || '',
            relationship: application?.relationship || '',

            cp_email: application?.cp_email || '',
            cp_tel_no: application?.cp_tel_no || '',
            cp_tel_no_2: application?.cp_tel_no_2 || '',
            cp_mobile_no: application?.cp_mobile_no || '',
            cp_mobile_no_2: application?.cp_mobile_no_2 || '',

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

            is_senior_citizen: application?.is_senior_citizen || false,
            sc_from: application?.sc_from || null,
            sc_number: application?.sc_number || '',

            is_isnap: application?.is_isnap || false,

            attachments: application?.attachments || {},

            other_attachments: application?.other_attachments || [],

            cor_number: application?.cor_number || '',
            tin_number: application?.tin_number || '',
            issued_date: application?.issued_date || null,
            cg_ewt_tag: application?.cg_ewt_tag || null,
            cg_ft_tag: application?.cg_ft_tag || null,
            cg_vat_zero_tag: application?.cg_vat_zero_tag || false,

            bill_district: application?.bill_district || '',
            bill_barangay: application?.bill_barangay || '',
            bill_landmark: application?.bill_landmark || '',
            bill_subdivision: application?.bill_subdivision || '',
            bill_street: application?.bill_street || '',
            bill_building_floor: application?.bill_building_floor || '',
            bill_house_no: application?.bill_house_no || '',
            facility_district: application?.facility_district || '',
            facility_barangay: application?.facility_barangay || '',
            facility_landmark: application?.facility_landmark || '',
            facility_subdivision: application?.facility_subdivision || '',
            facility_street: application?.facility_street || '',
            facility_building_floor: application?.facility_building_floor || '',
            facility_house_no: application?.facility_house_no || '',
            bill_delivery: application?.bill_delivery || [],
        },
    });

    const currentRateClass = form.watch('rate_class');
    const currentCustomerType = form.watch('customer_type');

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            let shouldReset = false;
            let currentRateClassValue = form.getValues('rate_class');
            let currentCustomerTypeValue = form.getValues('customer_type');

            if (name === 'rate_class') {
                shouldReset = true;
                currentRateClassValue = value.rate_class || 'residential';
                currentCustomerTypeValue = '';
            }

            if (name === 'customer_type' && currentRateClassValue === 'power') {
                shouldReset = true;
                currentCustomerTypeValue = value.customer_type || '';
            }

            if (shouldReset) {
                form.reset({
                    id: application?.id,
                    rate_class: currentRateClassValue || 'residential',
                    customer_type: currentCustomerTypeValue || '',
                    connected_load: 0,
                    property_ownership: '',
                    last_name: '',
                    first_name: '',
                    middle_name: '',
                    suffix: '',
                    birthdate: null,
                    nationality: 'Filipino',
                    sex: '',
                    marital_status: '',
                    landmark: '',
                    unit_no: '',
                    building_floor: '',
                    street: '',
                    subdivision: '',
                    district: '',
                    barangay: '',
                    sketch_lat_long: '',
                    account_name: '',
                    trade_name: '',
                    c_peza_registered_activity: '',
                    cp_lastname: '',
                    cp_firstname: '',
                    cp_middlename: '',
                    cp_suffix: '',
                    relationship: '',
                    cp_email: '',
                    cp_tel_no: '',
                    cp_tel_no_2: '',
                    cp_mobile_no: '',
                    cp_mobile_no_2: '',
                    id_category: 'primary',
                    primary_id_type: '',
                    primary_id_number: '',
                    primary_id_file: null,
                    secondary_id_1_type: '',
                    secondary_id_1_number: '',
                    secondary_id_1_file: null,
                    secondary_id_2_type: '',
                    secondary_id_2_number: '',
                    secondary_id_2_file: null,
                    is_senior_citizen: false,
                    sc_from: null,
                    sc_number: '',
                    is_isnap: false,
                    attachments: {},
                    other_attachments: [],
                    cor_number: '',
                    tin_number: '',
                    issued_date: null,
                    cg_ewt_tag: null,
                    cg_ft_tag: null,
                    cg_vat_zero_tag: false,
                    bill_district: '',
                    bill_barangay: '',
                    bill_landmark: '',
                    bill_subdivision: '',
                    bill_street: '',
                    bill_building_floor: '',
                    bill_house_no: '',
                    bill_delivery: [],
                });

                form.clearErrors();
            }
        });
        return () => subscription.unsubscribe();
    }, [form, application?.id]);

    const visibleSteps = useMemo(() => {
        return getVisibleSteps(currentRateClass, currentCustomerType);
    }, [currentRateClass, currentCustomerType]);

    const steps = visibleSteps.map((stepConfig) => ({
        id: stepConfig.id,
        label: stepConfig.label,
        fields: stepConfig.fields,
        component: stepConfig.component,
    }));

    useEffect(() => {
        if (step >= visibleSteps.length && step !== 0) {
            setStep(0);
        }
    }, [visibleSteps.length, step]);

    const nextStep = async () => {
        const fields = steps[step].fields as readonly (keyof ApplicationFormValues)[];
        const isValid = await form.trigger(fields);
        if (isValid) {
            setStep((s) => Math.min(s + 1, steps.length - 1));
        } else {
            const errors = form.formState.errors;
            const firstErrorField = fields.find((field) => errors[field]);
            if (firstErrorField && errors[firstErrorField]) {
                const errorMessage = errors[firstErrorField]?.message as string;
                toast.error(errorMessage || 'Please fix the errors before continuing');
            }
        }
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        try {
            const values = form.getValues();

            let response;

            if (isEditing && application?.id) {
                response = await submitForm(route('applications.update', { application: application.id }), values);
            } else {
                response = await submitForm(route('applications.store'), values);
            }

            if (response && response.data && response.data.message === 'success') {
                toast.success(isEditing ? 'Application updated successfully!' : 'Application submitted successfully!');
                router.visit(route('applications.show', response.data.id));
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 422 && err.response.data.errors) {
                    const errors = err.response.data.errors;
                    const firstError = Object.values(errors)[0];
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    toast.error(errorMessage || 'Validation error occurred');

                    Object.entries(errors).forEach(([field, message]) => {
                        const errorMsg = Array.isArray(message) ? message[0] : message;
                        form.setError(field as keyof ApplicationFormValues, {
                            type: 'server',
                            message: errorMsg as string,
                        });
                    });
                } else {
                    toast.error('An error occurred while submitting the application');
                }
            } else {
                console.error('Unexpected error:', err);
                toast.error('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
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
        <AppLayout title={isEditing ? 'Edit Application' : 'Create Application'} breadcrumbs={breadcrumbs} loading={isSubmitting}>
            <Toaster position="top-right" />
            <div className="m-4 sm:m-8">
                <Form {...form}>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        <Tabs value={String(step)} className="w-full">
                            <TabsList className="flex w-full gap-1 overflow-x-auto rounded-md bg-muted p-1">
                                {steps.map((s, index) => (
                                    <TabsTrigger
                                        key={index}
                                        value={String(index)}
                                        disabled
                                        className={`min-w-20 shrink-0 truncate px-2 py-1 text-xs sm:text-sm ${step === index ? 'bg-primary' : ''}`}
                                    >
                                        {s.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <Progress value={((step + 1) / steps.length) * 100} className="mb-4 w-full" />

                            {visibleSteps.map((stepConfig, index) => {
                                const StepComponent = stepConfig.component;
                                return (
                                    <TabsContent key={stepConfig.id} value={String(index)}>
                                        <StepComponent />
                                    </TabsContent>
                                );
                            })}
                        </Tabs>

                        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-between">
                            <div className="flex w-full gap-2 sm:w-auto">
                                {step > 0 && (
                                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1 sm:flex-none">
                                        <ArrowLeft /> Back
                                    </Button>
                                )}
                            </div>
                            <div className="flex w-full justify-end gap-2 sm:w-auto">
                                {step < steps.length - 1 ? (
                                    <Button type="button" onClick={nextStep} className="flex-1 sm:flex-none">
                                        Next <ArrowRight />
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
                                                <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
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

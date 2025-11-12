import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Settings',
        href: '/settings/system',
    },
];

interface Setting {
    value: number | string | boolean;
    type: string;
    description: string;
}

interface Settings {
    isnap_fee: Setting;
}

export default function SystemSettings({ settings }: { settings: Settings }) {
    const [isnapFee, setIsnapFee] = useState<string>(settings.isnap_fee?.value?.toString() || '500.00');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(
            route('settings.update', 'isnap_fee'),
            {
                value: parseFloat(isnapFee),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('ISNAP fee updated successfully');
                },
                onError: (errors) => {
                    if (errors.value) {
                        toast.error(errors.value);
                    }
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="System Settings" description="Configure system-wide settings and defaults" />

                    <Card>
                        <CardHeader>
                            <CardTitle>ISNAP Settings</CardTitle>
                            <CardDescription>Configure the default fee charged to approved ISNAP members</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="isnap_fee">ISNAP Fee Amount (₱)</Label>
                                    <Input
                                        id="isnap_fee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={isnapFee}
                                        onChange={(e) => setIsnapFee(e.target.value)}
                                        placeholder="500.00"
                                        required
                                        className="max-w-xs"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        This fee will be automatically applied when approving ISNAP members
                                    </p>
                                </div>

                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

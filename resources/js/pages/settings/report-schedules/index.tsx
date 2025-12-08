import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Calendar, Clock, Mail, Send, Trash2 } from 'lucide-react';

interface ReportSettings {
    ageing_timeline: {
        schedule: {
            daily: {
                enabled: boolean;
                time: string;
            };
            weekly: {
                enabled: boolean;
                day: string;
                time: string;
            };
            monthly: {
                enabled: boolean;
                day: number;
                time: string;
            };
        };
        recipients: string[];
        thresholds: {
            critical_days: number;
            warning_days: number;
            max_critical_display: number;
        };
    };
}

interface PageProps extends Record<string, unknown> {
    settings: ReportSettings;
}

export default function ReportSchedulesIndex() {
    const { settings } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, isDirty } = useForm({
        ageing_timeline: settings.ageing_timeline,
    });

    const testForm = useForm({
        frequency: 'daily',
        recipient: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.report-schedules.update'), {
            preserveScroll: true,
        });
    };

    const handleTestSend = () => {
        testForm.data.frequency = testForm.data.frequency || 'daily';
        testForm.data.recipient = testForm.data.recipient || '';
        
        testForm.post(route('settings.report-schedules.test-send'), {
            preserveScroll: true,
            onSuccess: () => {
                testForm.reset();
            },
        });
    };

    const addRecipient = () => {
        setData('ageing_timeline', {
            ...data.ageing_timeline,
            recipients: [...data.ageing_timeline.recipients, ''],
        });
    };

    const removeRecipient = (index: number) => {
        const newRecipients = data.ageing_timeline.recipients.filter((_, i) => i !== index);
        setData('ageing_timeline', {
            ...data.ageing_timeline,
            recipients: newRecipients,
        });
    };

    const updateRecipient = (index: number, value: string) => {
        const newRecipients = [...data.ageing_timeline.recipients];
        newRecipients[index] = value;
        setData('ageing_timeline', {
            ...data.ageing_timeline,
            recipients: newRecipients,
        });
    };

    const weekDays = [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' },
    ];

    return (
        <AppLayout>
            <Head title="Report Schedules" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Report Schedules</h1>
                    <p className="text-sm text-muted-foreground">Configure automated report delivery schedules and recipients</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Recipients Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Recipients</CardTitle>
                            <CardDescription>Configure who receives the automated aging timeline reports</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.ageing_timeline.recipients.map((email, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={email}
                                            onChange={(e) => updateRecipient(index, e.target.value)}
                                            className={errors[`ageing_timeline.recipients.${index}`] ? 'border-red-500' : ''}
                                        />
                                        {errors[`ageing_timeline.recipients.${index}`] && (
                                            <p className="mt-1 text-sm text-red-500">{errors[`ageing_timeline.recipients.${index}`]}</p>
                                        )}
                                    </div>
                                    <Button type="button" variant="outline" size="icon" onClick={() => removeRecipient(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button type="button" variant="outline" onClick={addRecipient} className="w-full">
                                <Mail className="mr-2 h-4 w-4" />
                                Add Recipient
                            </Button>

                            {errors['ageing_timeline.recipients'] && (
                                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors['ageing_timeline.recipients']}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Daily Schedule */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Daily Report Schedule
                                    </CardTitle>
                                    <CardDescription>Send reports every day at a specified time</CardDescription>
                                </div>
                                <Checkbox
                                    checked={data.ageing_timeline.schedule.daily.enabled}
                                    onCheckedChange={(checked: boolean) =>
                                        setData('ageing_timeline', {
                                            ...data.ageing_timeline,
                                            schedule: {
                                                ...data.ageing_timeline.schedule,
                                                daily: { ...data.ageing_timeline.schedule.daily, enabled: checked },
                                            },
                                        })
                                    }
                                />
                            </div>
                        </CardHeader>
                        {data.ageing_timeline.schedule.daily.enabled && (
                            <CardContent>
                                <div className="grid gap-2">
                                    <Label htmlFor="daily-time">Time</Label>
                                    <Input
                                        id="daily-time"
                                        type="time"
                                        value={data.ageing_timeline.schedule.daily.time}
                                        onChange={(e) =>
                                            setData('ageing_timeline', {
                                                ...data.ageing_timeline,
                                                schedule: {
                                                    ...data.ageing_timeline.schedule,
                                                    daily: { ...data.ageing_timeline.schedule.daily, time: e.target.value },
                                                },
                                            })
                                        }
                                        className="max-w-xs"
                                    />
                                    <p className="text-sm text-muted-foreground">Report will be sent daily at {data.ageing_timeline.schedule.daily.time}</p>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Weekly Schedule */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Weekly Report Schedule
                                    </CardTitle>
                                    <CardDescription>Send reports once a week on a specific day</CardDescription>
                                </div>
                                <Checkbox
                                    checked={data.ageing_timeline.schedule.weekly.enabled}
                                    onCheckedChange={(checked: boolean) =>
                                        setData('ageing_timeline', {
                                            ...data.ageing_timeline,
                                            schedule: {
                                                ...data.ageing_timeline.schedule,
                                                weekly: { ...data.ageing_timeline.schedule.weekly, enabled: checked },
                                            },
                                        })
                                    }
                                />
                            </div>
                        </CardHeader>
                        {data.ageing_timeline.schedule.weekly.enabled && (
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="weekly-day">Day of Week</Label>
                                    <Select
                                        value={data.ageing_timeline.schedule.weekly.day}
                                        onValueChange={(value) =>
                                            setData('ageing_timeline', {
                                                ...data.ageing_timeline,
                                                schedule: {
                                                    ...data.ageing_timeline.schedule,
                                                    weekly: { ...data.ageing_timeline.schedule.weekly, day: value },
                                                },
                                            })
                                        }
                                    >
                                        <SelectTrigger className="max-w-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {weekDays.map((day) => (
                                                <SelectItem key={day.value} value={day.value}>
                                                    {day.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="weekly-time">Time</Label>
                                    <Input
                                        id="weekly-time"
                                        type="time"
                                        value={data.ageing_timeline.schedule.weekly.time}
                                        onChange={(e) =>
                                            setData('ageing_timeline', {
                                                ...data.ageing_timeline,
                                                schedule: {
                                                    ...data.ageing_timeline.schedule,
                                                    weekly: { ...data.ageing_timeline.schedule.weekly, time: e.target.value },
                                                },
                                            })
                                        }
                                        className="max-w-xs"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Report will be sent every {data.ageing_timeline.schedule.weekly.day} at {data.ageing_timeline.schedule.weekly.time}
                                    </p>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Monthly Schedule */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Monthly Report Schedule
                                    </CardTitle>
                                    <CardDescription>Send reports once a month on a specific day</CardDescription>
                                </div>
                                <Checkbox
                                    checked={data.ageing_timeline.schedule.monthly.enabled}
                                    onCheckedChange={(checked: boolean) =>
                                        setData('ageing_timeline', {
                                            ...data.ageing_timeline,
                                            schedule: {
                                                ...data.ageing_timeline.schedule,
                                                monthly: { ...data.ageing_timeline.schedule.monthly, enabled: checked },
                                            },
                                        })
                                    }
                                />
                            </div>
                        </CardHeader>
                        {data.ageing_timeline.schedule.monthly.enabled && (
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="monthly-day">Day of Month</Label>
                                    <Input
                                        id="monthly-day"
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={data.ageing_timeline.schedule.monthly.day}
                                        onChange={(e) =>
                                            setData('ageing_timeline', {
                                                ...data.ageing_timeline,
                                                schedule: {
                                                    ...data.ageing_timeline.schedule,
                                                    monthly: { ...data.ageing_timeline.schedule.monthly, day: parseInt(e.target.value) },
                                                },
                                            })
                                        }
                                        className="max-w-xs"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="monthly-time">Time</Label>
                                    <Input
                                        id="monthly-time"
                                        type="time"
                                        value={data.ageing_timeline.schedule.monthly.time}
                                        onChange={(e) =>
                                            setData('ageing_timeline', {
                                                ...data.ageing_timeline,
                                                schedule: {
                                                    ...data.ageing_timeline.schedule,
                                                    monthly: { ...data.ageing_timeline.schedule.monthly, time: e.target.value },
                                                },
                                            })
                                        }
                                        className="max-w-xs"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Report will be sent on day {data.ageing_timeline.schedule.monthly.day} of every month at{' '}
                                        {data.ageing_timeline.schedule.monthly.time}
                                    </p>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Test Send */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                Test Report
                            </CardTitle>
                            <CardDescription>Send a test report to verify your configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Select value={testForm.data.frequency} onValueChange={(value) => testForm.setData('frequency', value)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    type="email"
                                    placeholder="test@example.com"
                                    value={testForm.data.recipient}
                                    onChange={(e) => testForm.setData('recipient', e.target.value)}
                                    className="flex-1"
                                />

                                <Button type="button" onClick={handleTestSend} disabled={!testForm.data.recipient || testForm.processing}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Test
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Schedules Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Schedules</CardTitle>
                            <CardDescription>Currently enabled report schedules</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {data.ageing_timeline.schedule.daily.enabled && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">Daily</Badge>
                                        <span className="text-sm text-muted-foreground">Every day at {data.ageing_timeline.schedule.daily.time}</span>
                                    </div>
                                )}
                                {data.ageing_timeline.schedule.weekly.enabled && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">Weekly</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            Every {data.ageing_timeline.schedule.weekly.day} at {data.ageing_timeline.schedule.weekly.time}
                                        </span>
                                    </div>
                                )}
                                {data.ageing_timeline.schedule.monthly.enabled && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">Monthly</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            Day {data.ageing_timeline.schedule.monthly.day} at {data.ageing_timeline.schedule.monthly.time}
                                        </span>
                                    </div>
                                )}
                                {!data.ageing_timeline.schedule.daily.enabled &&
                                    !data.ageing_timeline.schedule.weekly.enabled &&
                                    !data.ageing_timeline.schedule.monthly.enabled && (
                                        <p className="text-sm text-muted-foreground">No schedules are currently enabled</p>
                                    )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing || !isDirty}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

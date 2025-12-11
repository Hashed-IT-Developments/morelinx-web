import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';
import BarangaySelectField from './components/barangay-select-field';
import CustomerTypeSelectField from './components/customer-type-select-field';
import DistrictSelectField from './components/district-select-field';

interface AmendmentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dialogDetails: { title: string; fieldSet: string };
    account: Account;
}

interface ItemType {
    label: string;
    field: string;
    value: string | number | boolean | undefined | null;
    inputField: ReactNode;
}

interface DataSet {
    label: string;
    field: string;
    currentData: string;
    content: string;
    display: string;
}

export default function AmendmentDialog({ dialogDetails, open, onOpenChange, account }: AmendmentProps) {
    const [fieldSetItem, setFieldSetItem] = useState<ItemType>();

    const [dataSet, setDataSet] = useState<DataSet[]>([]);

    const [selectedValue, setSelectedValue] = useState('');

    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = formData.get(fieldSetItem?.field ?? '');

        let displayData = data?.toString();

        if (
            fieldSetItem?.inputField &&
            typeof fieldSetItem.inputField === 'object' &&
            'type' in fieldSetItem.inputField &&
            typeof (fieldSetItem.inputField as React.ReactElement).type === 'function'
        ) {
            displayData = '(' + data?.toString() + ') ' + selectedValue;
        }

        const newItem: DataSet = {
            label: fieldSetItem?.label ?? ' ',
            field: fieldSetItem?.field ?? '',
            currentData: fieldSetItem?.value?.toString() ?? ' ',
            content: data?.toString() ?? '',
            display: displayData ?? '',
        };

        setDataSet((prev) => {
            const exists = prev.some((item) => item.field === newItem.field);
            if (exists) {
                alert('Field ' + fieldSetItem?.field + ' is alredy in the list.');
                return prev;
            }

            return [...prev, newItem];
        });

        e.currentTarget.reset();
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const text = e.target.options[e.target.selectedIndex].text;
        setSelectedValue(text);
    };

    const handleSubmitAll = () => {
        const formData = new FormData();
        formData.append('data', JSON.stringify(dataSet));

        if (attachmentFile) {
            formData.append('attachment', attachmentFile);
        }

        axios
            .post(route('amendment-request.store', { customerAccount: account.id }), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                params: {
                    _method: 'PUT',
                },
            })
            .then((response) => {
                if (response.status == 200) {
                    toast.success('Amendment request submitted successfully.');
                    router.visit(route('amendment-requests.index'));
                } else {
                    toast.error('Failed to submit amendment request. Please try again.');
                }
            })
            .catch((error) => {
                toast.error('Failed to submit amendment request. Please try again.');
                console.error(error);
            });
    };

    const fieldSet = {
        info: [
            {
                label: 'Account Name',
                field: 'account_name',
                value: account?.account_name,
                inputField: <input type="text" name="account_name" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Account Number',
                field: 'account_number',
                value: account.account_number,
                inputField: <input type="text" name="account_number" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'District',
                field: 'district_id',
                value: `(${account.district_id}) ${account?.district?.name}`,
                inputField: <DistrictSelectField onChange={handleSelectChange} />,
            },
            {
                label: 'Barangay',
                field: 'barangay_id',
                value: `(${account.barangay_id}) ${account?.barangay?.name}, ${account?.barangay?.town?.name}`,
                inputField: <BarangaySelectField onChange={handleSelectChange} />,
            },
            {
                label: 'Block',
                field: 'block',
                value: account.block ?? 'none',
                inputField: <input type="text" name="block" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Account Status',
                field: 'account_status',
                value: account.account_status ?? 'none',
                inputField: (
                    <select name="account_status" className="min-w-full rounded border border-gray-400 p-2">
                        {['pending', 'active', 'suspended', 'disconnected'].map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                ),
            },
            {
                label: 'Contact Number',
                field: 'contact_number',
                value: account.contact_number ?? 'none',
                inputField: <input type="text" name="contact_number" className="min-w-full rounded border border-gray-400 p-2" />,
            },

            {
                label: 'Email Address',
                field: 'email_address',
                value: account.email_address ?? 'none',
                inputField: <input type="text" name="email_address" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Customer ID Number',
                field: 'customer_id',
                value: account.customer_id ?? 'none',
                inputField: <input type="text" name="customer_id" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Pole Number',
                field: 'pole_number',
                value: account.pole_number ?? 'none',
                inputField: <input type="text" name="pole_number" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Sequence Code',
                field: 'sequence_code',
                value: account.sequence_code ?? 'none',
                inputField: <input type="text" name="sequence_code" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Feeder',
                field: 'feeder',
                value: account.feeder ?? 'none',
                inputField: <input type="text" name="feeder" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Compute Type',
                field: 'compute_type',
                value: account.compute_type ?? 'none',
                inputField: <input type="text" name="compute_type" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Organization',
                field: 'organization',
                value: account.organization ?? 'none',
                inputField: <input type="text" name="organization" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Organization Parent Account',
                field: 'org_parent_account',
                value: account.org_parent_account ?? 'none',
                inputField: <input type="text" name="org_parent_account" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Meter Location',
                field: 'meter_loc',
                value: account.meter_loc ?? 'none',
                inputField: <input type="text" name="meter_loc" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Old Account Number',
                field: 'old_account_no',
                value: account.old_account_no ?? 'none',
                inputField: <input type="text" name="old_account_no" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Group Code',
                field: 'group_code',
                value: account.group_code ?? 'none',
                inputField: <input type="text" name="group_code" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Multiplier',
                field: 'multiplier',
                value: account.multiplier ?? 'none',
                inputField: <input type="number" step="0.01" name="multiplier" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Core Loss',
                field: 'core_loss',
                value: account.core_loss ?? 'none',
                inputField: <input type="text" name="core_loss" className="min-w-full rounded border border-gray-400 p-2" />,
            },

            {
                label: 'Contestable',
                field: 'contestable',
                value: account.contestable ?? 'none',
                inputField: (
                    <div>
                        <input type="checkbox" value="true" name="contestable" id="contestable" className="rounded border border-gray-400 p-2" />
                        <label htmlFor="contestable" className="ms-2">
                            Contestable
                        </label>
                    </div>
                ),
            },
            {
                label: 'Net Metered',
                field: 'net_metered',
                value: account.net_metered ?? 'none',
                inputField: (
                    <div>
                        <input type="checkbox" value="true" name="net_metered" id="net_metered" className="rounded border border-gray-400 p-2" />
                        <label htmlFor="net_metered" className="ms-2">
                            Net Metered
                        </label>
                    </div>
                ),
            },
            {
                label: 'Life Liner',
                field: 'life_liner',
                value: account.life_liner ?? 'none',
                inputField: (
                    <div>
                        <input type="checkbox" value="true" name="life_liner" id="life_liner" className="rounded border border-gray-400 p-2" />
                        <label htmlFor="life_liner" className="ms-2">
                            Life Liner
                        </label>
                    </div>
                ),
            },
            {
                label: 'Life Liner Date Applied',
                field: 'life_liner_date_applied',
                value: account.life_liner_date_applied ?? 'none',
                inputField: <input type="date" name="life_liner_date_applied" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Life Liner Date Expire',
                field: 'life_liner_date_expire',
                value: account.life_liner_date_expire ?? 'none',
                inputField: <input type="date" name="life_liner_date_expire" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Senior Citizen',
                field: 'is_sc',
                value: account.is_sc ?? 'none',
                inputField: (
                    <div>
                        <input type="checkbox" value="true" name="is_sc" id="is_sc" className="rounded border border-gray-400 p-2" />
                        <label htmlFor="is_sc" className="ms-2">
                            Senior Citizen
                        </label>
                    </div>
                ),
            },
            {
                label: 'Senior Citizen Date Applied',
                field: 'sc_date_applied',
                value: account.sc_date_applied ?? 'none',
                inputField: <input type="date" name="sc_date_applied" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Senior Citizen Date Expire',
                field: 'sc_date_expired',
                value: account.sc_date_expired ?? 'none',
                inputField: <input type="date" name="sc_date_expired" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'House Number',
                field: 'house_number',
                value: account.house_number ?? 'none',
                inputField: <input type="text" name="house_number" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Account Label',
                field: 'acct_label',
                value: account.acct_label ?? 'none',
                inputField: (
                    <select name="acct_label" className="min-w-full rounded border border-gray-400 p-2">
                        {[
                            'Residential',
                            'Commercial LV',
                            'Commercial HV',
                            'Government LV',
                            'Government HV',
                            'Contestable',
                            'Renewable Energy Certificate',
                            'Net Metering',
                            'DCC_SMC',
                            'DCC_DMDC',
                            'Sale for Resale',
                            'ELECTRICITY OWN USE',
                            'FIRST FARMERS HOLDING CORP',
                        ].map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                ),
            },
            {
                label: 'Code',
                field: 'code',
                value: account.code ?? 'none',
                inputField: <input type="text" name="code" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Series Number',
                field: 'series_number',
                value: account.series_number ?? 'none',
                inputField: <input type="number" name="series_number" className="min-w-full rounded border border-gray-400 p-2" />,
            },
        ],
        bill: [
            {
                label: 'Barangay',
                field: 'barangay_id',
                value: `(${account.customer_application?.bill_info?.barangay_id}) ${account.customer_application?.bill_info?.barangay?.name}, ${account.customer_application?.bill_info?.barangay?.town?.name}`,
                inputField: <BarangaySelectField onChange={handleSelectChange} />,
            },
            {
                label: 'Sitio',
                field: 'sitio',
                value: account.customer_application?.bill_info?.sitio ?? 'none',
                inputField: <input type="text" name="sitio" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Unit No.',
                field: 'unit_no',
                value: account.customer_application?.bill_info?.unit_no ?? 'none',
                inputField: <input type="text" name="unit_no" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Building Floor',
                field: 'building',
                value: account.customer_application?.bill_info?.building ?? 'none',
                inputField: <input type="text" name="building" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Street',
                field: 'street',
                value: account.customer_application?.bill_info?.street ?? 'none',
                inputField: <input type="text" name="street" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Subdivision',
                field: 'subdivision',
                value: account.customer_application?.bill_info?.subdivision ?? 'none',
                inputField: <input type="text" name="subdivision" className="rounded border border-gray-400 p-2" />,
            },
        ],
        billing: [
            {
                label: 'Customer Type',
                field: 'customer_type_id',
                value: `${account.customer_type?.full_text ?? 'none'}`,
                inputField: <CustomerTypeSelectField onChange={handleSelectChange} />,
            },
            {
                label: 'EVAT 5%',
                field: 'evat_5_pct',
                value: account.evat_5_pct ?? 'none',
                inputField: (
                    <div>
                        <input type="checkbox" value="true" name="evat_5_pct" id="evat_5_pct" className="rounded border border-gray-400 p-2" />
                        <label htmlFor="evat_5_pct" className="ms-2">
                            EVAT 5%
                        </label>
                    </div>
                ),
            },
            {
                label: 'EVAT 2%',
                field: 'evat_2_pct',
                value: account.evat_2_pct ?? 'none',
                inputField: (
                    <div>
                        <input type="checkbox" value="true" name="evat_2_pct" id="evat_2_pct" className="rounded border border-gray-400 p-2" />
                        <label htmlFor="evat_2_pct" className="ms-2">
                            EVAT 2%
                        </label>
                    </div>
                ),
            },
            {
                label: 'Account Payment Type',
                field: 'acct_pmt_type',
                value: account.acct_pmt_type ?? 'none',
                inputField: <input type="text" name="acct_pmt_type" className="min-w-full rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Delivery Mode',
                field: 'delivery_mode',
                value: account.customer_application?.bill_info?.delivery_mode ?? 'none',
                inputField: (
                    <select name="delivery_mode" id="delivery_mode" className="rounded border border-gray-400 p-2" required>
                        <option value="spot_billing">Spot Billing</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="pickup">Pickup at Office</option>
                        <option value="courier">Courier Delivery</option>
                    </select>
                ),
            },
        ],
    } as const;

    type FieldSetKey = keyof typeof fieldSet;
    const set = dialogDetails.fieldSet as FieldSetKey;

    const selectedFieldSet = fieldSet[set];

    const onSelectedField = (field: string) => {
        const selectedItem = selectedFieldSet.filter((data) => data.field == field);
        setFieldSetItem(selectedItem[0]);
    };

    const removeByLabel = (label: string) => {
        setDataSet((prev) => prev.filter((item) => item.label !== label));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full md:min-w-3xl lg:min-w-5xl">
                <DialogHeader>
                    <DialogTitle>{dialogDetails.title}</DialogTitle>
                </DialogHeader>
                <DialogDescription />

                <form onSubmit={submit}>
                    <div className="flex gap-4">
                        <div className="w-[320px] rounded-lg border border-gray-300 bg-gray-50 p-6 shadow-lg">
                            <div className="mb-4 flex flex-col gap-2">
                                <label htmlFor="field" className="text-sm font-medium text-gray-700">
                                    Select Field
                                </label>
                                <select
                                    name="field"
                                    id="field"
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                    onChange={(e) => onSelectedField(e.target.value)}
                                >
                                    <option value="">Select a field</option>
                                    {selectedFieldSet?.map((item) => {
                                        return (
                                            <option value={item.field} key={item.field}>
                                                {item.label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="mb-4 flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Existing Value</label>
                                <div className="flex min-h-[42px] items-center rounded-md border border-gray-300 bg-white p-3 text-sm font-medium text-gray-800 italic">
                                    {fieldSetItem?.value || 'No field selected'}
                                </div>
                            </div>

                            <div className="mb-6 flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">New Value</label>
                                <div className="min-h-[42px]">{fieldSetItem?.inputField}</div>
                            </div>

                            <Button type="submit" className="w-full">
                                Add Amendment
                            </Button>
                        </div>
                        <div className="flex-1">
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Field</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Current Value
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                New Value
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {dataSet.map((data) => {
                                            return (
                                                <tr key={data.label} className="transition-colors hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{data.label}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{data.currentData}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{data.display}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            type="button"
                                                            onClick={() => removeByLabel(data.label)}
                                                            className="h-8 w-8 p-0 transition-colors hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </form>
                <DialogFooter className="mt-4">
                    <div className="flex w-full items-center justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="attachment" className="text-sm font-medium text-gray-700">
                                Attachment (optional)
                            </label>
                            <input
                                type="file"
                                id="attachment"
                                accept="image/*"
                                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                                className="text-sm text-gray-600 file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                            />
                            {attachmentFile && <span className="text-xs text-gray-500">Selected: {attachmentFile.name}</span>}
                        </div>
                        <Button type="button" onClick={handleSubmitAll}>
                            Submit Amendments
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import BarangaySelectField from './components/barangay-select-field';
import CustomerTypeSelectField from './components/customer-type-select-field';
import DistrictSelectField from './components/district-select-field';

interface AmendmentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dialogDetails: { title: string; fieldSet: string };
    application: CustomerApplication;
}

interface ItemType {
    label: string;
    field: string;
    value: string;
    inputField: Element;
}

interface DataSet {
    label: string;
    field: string;
    currentData: string;
    content: string;
    display: string;
}

export default function AmendmentDialog({ dialogDetails, open, onOpenChange, application }: AmendmentProps) {
    // const [loading, setLoading] = useState(false);

    const [fieldSetItem, setFieldSetItem] = useState<ItemType>();

    const [dataSet, setDataSet] = useState<DataSet[]>([]);

    const [selectedValue, setSelectedValue] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget); // 👈 built-in API
        const data = formData.get(fieldSetItem?.field ?? '');

        let displayData = data?.toString();

        if (typeof fieldSetItem?.inputField.type === 'function') {
            displayData = '(' + data?.toString() + ') ' + selectedValue;
        }

        const newItem: DataSet = {
            label: fieldSetItem?.label ?? ' ',
            field: fieldSetItem?.field ?? '',
            currentData: fieldSetItem?.value ?? ' ',
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
        axios
            .put(route('amendment-request.store', { customerApplication: application.id }), {
                data: dataSet,
            })
            .then((response) => {
                if (response.status == 200) {
                    router.visit(route('amendment-requests.index'));
                }
            });
    };

    const fieldSet = {
        info: [
            {
                label: 'Last Name',
                field: 'last_name',
                value: application.last_name,
                inputField: <input type="text" name="last_name" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'First Name',
                field: 'first_name',
                value: application.first_name,
                inputField: <input type="text" name="first_name" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Middle Name',
                field: 'middle_name',
                value: application.middle_name,
                inputField: <input type="text" name="middle_name" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Suffix',
                field: 'suffix',
                value: application.suffix ?? 'none',
                inputField: <input type="text" name="suffix" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Birth Date',
                field: 'birth_date',
                value: application.birth_date ?? 'none',
                inputField: <input type="date" name="birth_date" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Nationality',
                field: 'nationality',
                value: application.nationality ?? 'none',
                inputField: <input type="text" name="nationality" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Gender',
                field: 'gender',
                value: application.gender ?? 'none',
                inputField: (
                    <select name="gender" className="rounded border border-gray-400 p-2">
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>
                ),
            },
            {
                label: 'Marital Status',
                field: 'marital_status',
                value: application.marital_status ?? 'none',
                inputField: (
                    <select name="marital_status" className="rounded border border-gray-400 p-2">
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="widowed">Widowed</option>
                        <option value="separated">Separated</option>
                        <option value="annuled">Annuled</option>
                    </select>
                ),
            },
            {
                label: 'Barangay',
                field: 'barangay_id',
                value: `(${application.barangay_id}) ${application?.barangay?.name}, ${application?.barangay?.town?.name}`,
                inputField: <BarangaySelectField onChange={handleSelectChange} />,
            },
            {
                label: 'Landmark',
                field: 'landmark',
                value: application.landmark ?? 'none',
                inputField: <input type="text" name="landmark" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Sitio',
                field: 'sitio',
                value: application.sitio ?? 'none',
                inputField: <input type="text" name="sitio" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Unit No.',
                field: 'unit_no',
                value: application.unit_no ?? 'none',
                inputField: <input type="text" name="unit_no" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Building Floor',
                field: 'building',
                value: application.building ?? 'none',
                inputField: <input type="text" name="building" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Street',
                field: 'street',
                value: application.street ?? 'none',
                inputField: <input type="text" name="street" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Subdivision',
                field: 'subdivision',
                value: application.subdivision ?? 'none',
                inputField: <input type="text" name="subdivision" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'District',
                field: 'district_id',
                value: `(${application.district_id}) ${application.district?.name}`,
                inputField: <DistrictSelectField onChange={handleSelectChange} />,
            },
            {
                label: 'Block',
                field: 'block',
                value: application.block ?? 'none',
                inputField: <input type="text" name="block" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Route',
                field: 'route',
                value: application.route ?? 'none',
                inputField: <input type="text" name="route" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Customer Type',
                field: 'customer_type_id',
                value: application.customer_type_id ?? 'none',
                inputField: <CustomerTypeSelectField onChange={handleSelectChange} />,
            },
            {
                label: 'Connected Load',
                field: 'connected_load',
                value: application.connected_load ?? 'none',
                inputField: <input type="text" name="connected_load" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'ID Type 1',
                field: 'id_type_1',
                value: application.id_type_1 ?? 'none',
                inputField: <input type="text" name="id_type_1" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'ID Number 1',
                field: 'id_number_1',
                value: application.id_number_1 ?? 'none',
                inputField: <input type="text" name="id_number_1" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'ID Type 2',
                field: 'id_type_2',
                value: application.id_type_2 ?? 'none',
                inputField: <input type="text" name="id_type_2" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'ID Number 2',
                field: 'id_number_2',
                value: application.id_number_2 ?? 'none',
                inputField: <input type="text" name="id_number_2" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Senior Citizen',
                field: 'is_sc',
                value: application.is_sc ?? 'none',
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
                label: 'Senior Citizen From',
                field: 'sc_from',
                value: application.sc_from ?? 'none',
                inputField: <input type="date" name="sc_from" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Senior Citizen Number',
                field: 'sc_number',
                value: application.sc_number ?? 'none',
                inputField: <input type="text" name="sc_number" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Property Ownership',
                field: 'property_ownership',
                value: application.property_ownership ?? 'none',
                inputField: (
                    <select name="property_ownership" id="property_ownership" className="rounded border border-gray-400 p-2" required>
                        <option value="">Select ownership</option>
                        <option value="owned">Owned</option>
                        <option value="rented">Rented</option>
                        <option value="others">Others</option>
                    </select>
                ),
            },
            {
                label: 'Contact Persion Last Name',
                field: 'cp_last_name',
                value: application.cp_last_name ?? 'none',
                inputField: <input type="text" name="cp_last_name" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Contact Persion First Name',
                field: 'cp_first_name',
                value: application.cp_first_name ?? 'none',
                inputField: <input type="text" name="cp_first_name" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Contact Persion Middle Name',
                field: 'cp_middle_name',
                value: application.cp_middle_name ?? 'none',
                inputField: <input type="text" name="cp_middle_name" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Contact Persion Relationship',
                field: 'cp_relation',
                value: application.cp_relation ?? 'none',
                inputField: (
                    <select name="cp_relation" id="cp_relation" className="rounded border border-gray-400 p-2">
                        <option value="parent">Parent</option>
                        <option value="spouse">Spouse</option>
                        <option value="sibling">Sibling</option>
                        <option value="child">Child</option>
                        <option value="relative">Relative</option>
                        <option value="friend">Friend</option>
                        <option value="guardian">Guardian</option>
                        <option value="other">Other</option>
                    </select>
                ),
            },
            {
                label: 'Email Address',
                field: 'email_address',
                value: application.email_address ?? 'none',
                inputField: <input type="text" name="email_address" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Telephone Number 1',
                field: 'tel_no_1',
                value: application.tel_no_1 ?? 'none',
                inputField: <input type="text" name="tel_no_1" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Telephone Number 2',
                field: 'tel_no_2',
                value: application.tel_no_2 ?? 'none',
                inputField: <input type="text" name="tel_no_2" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Mobile Number 1',
                field: 'mobile_1',
                value: application.mobile_1 ?? 'none',
                inputField: <input type="text" name="mobile_1" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Mobile Number 2',
                field: 'mobile_2',
                value: application.mobile_2 ?? 'none',
                inputField: <input type="text" name="mobile_2" className="rounded border border-gray-400 p-2" />,
            },
            {
                label: 'Sketch Location',
                field: 'sketch_lat_long',
                value: application.sketch_lat_long ?? 'none',
                inputField: <input type="text" name="sketch_lat_long" className="rounded border border-gray-400 p-2" />,
            },
        ],
        // ndog: [
        //     { label: 'Customer Type', field: 'customer_type', value: application.customer_type.id, inputField: <></> },
        //     { label: 'Connected Load', field: 'connected_load', value: application.connected_load },
        // ],
        bill: [
            {
                label: 'Barangay',
                field: 'barangay_id',
                value: application.billInfo?.barangay_id,
                inputField: <BarangaySelectField onChange={handleSelectChange} />
            },
        ],
    } as const;

    type FieldSetKey = keyof typeof fieldSet;
    const set: FieldSetKey = dialogDetails.fieldSet;

    const selectedFieldSet = fieldSet[set];

    const onSelectedField = (field: string) => {
        const selectedItem = selectedFieldSet.filter((data) => data.field == field);
        setFieldSetItem(selectedItem[0]);
    };

    const removeByLabel = (label: string) => {
        setDataSet((prev) => prev.filter((item) => item.label !== label));
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full md:min-w-2xl lg:min-w-5xl">
                    <DialogHeader>
                        <DialogTitle>{dialogDetails.title}</DialogTitle>
                    </DialogHeader>
                    <DialogDescription />

                    <form onSubmit={submit}>
                        <div className="flex gap-2">
                            <div className="w-[300px] rounded-lg border border-green-200 bg-green-100 p-4 shadow-lg">
                                <div className="mb-3 flex flex-col gap-2">
                                    <label htmlFor="field">Select Field</label>
                                    <select
                                        name="field"
                                        id="field"
                                        className="border border-gray-400 p-2"
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

                                <div className="mb-3 flex flex-col gap-2">
                                    <div>Existing Value</div>
                                    <div className="rounded border border-gray-400 p-1 font-bold italic">{fieldSetItem?.value}</div>
                                </div>

                                <div className="mb-3 flex flex-col gap-2">
                                    <div>New Value</div>
                                    {fieldSetItem?.inputField}
                                </div>

                                <Button type="submit">Add Amendment</Button>
                            </div>
                            <div className="flex-1">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-green-500">
                                            <th className="border border-green-800 text-start">Field</th>
                                            <th className="border border-green-800 text-start">Current Value</th>
                                            <th className="border border-green-800 text-start">New Value</th>
                                            <th className="border border-green-800 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataSet.map((data) => {
                                            return (
                                                <tr key={data.label}>
                                                    <td className="border border-gray-400">{data.label}</td>
                                                    <td className="border border-gray-400">{data.currentData}</td>
                                                    <td className="border border-gray-400">{data.display}</td>
                                                    <td className="border border-gray-400 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            type="button"
                                                            onClick={() => removeByLabel(data.label)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Trash2 className="text-red-600" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </form>
                    <DialogFooter className="mt-4">
                        <Button type="button" onClick={handleSubmitAll}>
                            Submit Amendments
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

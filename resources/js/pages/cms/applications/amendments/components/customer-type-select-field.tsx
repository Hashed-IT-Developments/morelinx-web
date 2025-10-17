import axios from 'axios';
import { useEffect, useState } from 'react';

interface CustomerType {
    id: number;
    name: string;
}

export default function CustomerTypeSelectField({ onChange }: { onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
    const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);

    useEffect(() => {
        axios.get(route('api.customer-types')).then((response) => {
            if (response.status == 200 && response.data) {
                setCustomerTypes(response.data);
            }
        });
    }, []);

    return (
        <select name="customer_type_id" id="customer_type_id" onChange={onChange} className="rounded border border-gray-400 p-2" required>
            <option value="">Select a customer type</option>
            {customerTypes.map((c) => {
                return (
                    <option value={c.id} key={c.id}>
                        {c.name}
                    </option>
                );
            })}
        </select>
    );
}

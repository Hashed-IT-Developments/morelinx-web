import axios from 'axios';
import { useEffect, useState } from 'react';

interface Barangay {
    id: number;
    name: string;
}

export default function BarangaySelectField({ onChange }: { onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
    const [barangays, setBarangays] = useState<Barangay[]>([]);

    useEffect(() => {
        axios.get(route('api.barangays-with-town')).then((response) => {
            if (response.status == 200 && response.data) {
                setBarangays(response.data);
            }
        });
    }, []);

    return (
        <select name="barangay_id" id="barangay_id" onChange={onChange} className="w-full rounded border border-gray-400 p-2" required>
            <option value="">Select Barangay</option>
            {barangays.map((b) => {
                return (
                    <option value={b.id} key={b.id}>
                        {b.name}
                    </option>
                );
            })}
        </select>
    );
}

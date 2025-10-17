import axios from 'axios';
import { useEffect, useState } from 'react';

interface District {
    id: number;
    name: string;
}

export default function DistrictSelectField({ onChange }: { onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
    const [districts, setDistricts] = useState<District[]>([]);

    useEffect(() => {
        axios.get(route('api.districts')).then((response) => {
            if (response.status == 200 && response.data) {
                setDistricts(response.data);
            }
        });
    }, []);

    return (
        <select name="district_id" id="district_id" onChange={onChange} className="rounded border border-gray-400 p-2" required>
            <option value="">Select District</option>
            {districts.map((d) => {
                return (
                    <option value={d.id} key={d.id}>
                        {d.name}
                    </option>
                );
            })}
        </select>
    );
}

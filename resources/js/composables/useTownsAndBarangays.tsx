import axios from 'axios';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

export interface Town {
    id: number;
    name: string;
}

export interface Barangay {
    id: number;
    name: string;
    town_id: number;
}

interface UseTownsAndBarangaysResult {
    towns: Town[];
    barangays: Barangay[];
    setTowns: React.Dispatch<React.SetStateAction<Town[]>>;
    setBarangays: React.Dispatch<React.SetStateAction<Barangay[]>>;
}

export function useTownsAndBarangays(selectedTown?: number | string): UseTownsAndBarangaysResult {
    const [towns, setTowns] = useState<Town[]>([]);
    const [barangays, setBarangays] = useState<Barangay[]>([]);

    useEffect(() => {
        axios
            .get(route('web-api.towns'))
            .then((res) => {
                const data: Town[] = Array.isArray(res.data)
                    ? res.data
                    : Object.entries(res.data).map(([id, name]) => ({
                          id: Number(id),
                          name: String(name),
                      }));
                setTowns(data);
            })
            .catch(() => setTowns([]));
    }, []);

    useEffect(() => {
        if (selectedTown) {
            axios
                .get(route('web-api.barangays', { town: selectedTown }))
                .then((res) => {
                    const data: Barangay[] = Array.isArray(res.data) ? res.data : [];
                    setBarangays(data);
                })
                .catch(() => setBarangays([]));
        } else {
            setBarangays([]);
        }
    }, [selectedTown]);

    return { towns, barangays, setTowns, setBarangays };
}

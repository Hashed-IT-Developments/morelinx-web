import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props {
    account: Account;
}

export default function AmendmentHistory({ account }: Props) {
    const [amendments, setAmendments] = useState<AmendmentRequest[]>([]);

    useEffect(() => {
        axios.get(route('customer-accounts.amendment-history', account.id)).then((response) => {
            if (response.status === 200 && response.data) {
                setAmendments(response.data);
                console.log(response.data);
            }
        });
    }, [account.id]);

    const getVariant = (item: AmendmentRequest): 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined => {
        const status = String(item.status ?? '').toLowerCase();

        if (status.startsWith('approve')) return 'default';
        if (status.startsWith('rejected')) return 'destructive';
        if (status.startsWith('pending')) return 'outline';

        return 'default';
    };

    const getCardBG = (item: AmendmentRequest): string => {
        const status = String(item.status ?? '').toLowerCase();

        if (status.startsWith('approve')) return 'bg-green-200';
        if (status.startsWith('rejected')) return 'bg-red-200';
        if (status.startsWith('pending')) return 'bg-gray-200';

        return 'default';
    };

    return (
        <main>
            <section className="max-h-[60vh] overflow-y-auto">
                <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {amendments.map((item) => {
                        return (
                            <div className={`rounded-lg border p-4 ${getCardBG(item)} shadow`} key={item.id}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div>
                                            Requested by <strong>{item.user.name}</strong>
                                        </div>
                                        <div className="text-sm text-gray-500 italic">
                                            On
                                            {(() => {
                                                const d = new Date(item.created_at);
                                                const month = d.toLocaleString('en-US', { month: 'short' });
                                                const day = String(d.getDate()).padStart(2, '0');
                                                const year = d.getFullYear();
                                                let hour = d.getHours() % 12;
                                                if (hour === 0) hour = 12;
                                                const minute = String(d.getMinutes()).padStart(2, '0');
                                                const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
                                                return ` ${month} ${day} ${year} ${hour}:${minute}${ampm}`;
                                            })()}
                                        </div>
                                    </div>
                                    <div>
                                        <Badge variant={getVariant(item)} className="flex flex-col items-center text-center">
                                            <div>{item.status}</div>
                                            {item.by_user && <div>by: {item.by_user.name}</div>}
                                        </Badge>
                                    </div>
                                </div>

                                <h4 className="py-2 text-lg">Amendment Details</h4>

                                <div className="mt-2 overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr>
                                                <th className="bg-green-300 px-2 py-2 text-start">Field</th>
                                                <th className="bg-green-300 px-2 py-2 text-start">Original Data</th>
                                                <th className="bg-green-300 px-2 py-2 text-start">New Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.amendment_request_items.map((r, idx) => (
                                                <tr key={r.id ?? idx} className="border-t odd:bg-white even:bg-gray-200">
                                                    <td className="px-2 py-1 align-top">{r.field}</td>
                                                    <td className="px-2 py-1 align-top">{r.current_data}</td>
                                                    <td className="px-2 py-1 align-top">{r.new_data_ref}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}

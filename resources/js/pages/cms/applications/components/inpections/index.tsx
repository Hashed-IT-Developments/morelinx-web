import { Badge } from '@/components/ui/badge';

interface InpectionsProps {
    inspections: Inspection[];
}

export default function Inpections({ inspections }: InpectionsProps) {
    console.log(inspections);
    return (
        <main>
            <section className="rounded-xl border border-gray-100 p-2">
                <h1>Inspection Details</h1>

                {inspections.map((inspection) => (
                    <div key={inspection.id}>
                        <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <h1>Status:</h1>
                            <Badge
                                className={
                                    inspection.status === 'accepted'
                                        ? 'bg-green-100 text-green-800'
                                        : inspection.status === 'rejected'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-800'
                                }
                            >
                                {inspection.status}
                            </Badge>
                        </div>
                        <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <h1>House Location:</h1> <span>{inspection.house_loc}</span>
                        </div>
                        <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <h1>Meter Location:</h1> <span>{inspection.meter_loc}</span>
                        </div>
                        <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <h1>Bill Deposit:</h1> <span>{inspection.bill_deposit}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pb-2">
                            <h1>Notes & Remarks:</h1> <span>{inspection.remarks}</span>
                        </div>

                        <iframe
                            width="100%"
                            height="450"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${inspection.house_loc}&z=12&output=embed`}
                        />
                    </div>
                ))}
            </section>
        </main>
    );
}

import { LoaderCircle } from 'lucide-react';

interface FullPageLoaderProps {
    message?: string;
}
export default function FullPageLoader({ message }: FullPageLoaderProps) {
    return (
        <main className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
            <section>
                <LoaderCircle className="animate-spin text-white" size={30} />
                {message}
            </section>
        </main>
    );
}

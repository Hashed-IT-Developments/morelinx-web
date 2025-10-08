import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function SearchInput() {
    return (
        <main>
            <Search />
            <Input placeholder="Search applications" />
        </main>
    );
}

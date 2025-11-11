import Input from '@/components/composables/input';
import { Search } from 'lucide-react';

import { useUserMethod } from '@/hooks/useUserMethod';
import { ChangeEvent, useEffect, useState } from 'react';

import Button from '@/components/composables/button';
import { useDebounce } from '@/lib/utils';

interface SearchuserProps {
    onUserSelect: (userId: string | number) => void;
    label?: string;
}

export default function SearchUsers({ onUserSelect, label }: SearchuserProps) {
    const { getUsers } = useUserMethod();
    const [user, setUser] = useState<User | null>(null);
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (!debouncedSearch.trim()) {
                setUsers([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await getUsers({ search: debouncedSearch, limit: 10 });
                setUsers(response.data || []);
            } catch (error) {
                console.error('Error searching users:', error);
                setUsers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleSelectUser = (user: User) => {
        onUserSelect(user.id);
        setUser(user);
        setSearch('');
        setUsers([]);
    };

    return (
        <main>
            <Input icon={<Search size={12} />} label={label} placeholder="Search Users" value={search} onChange={handleInputChange} />
            {search && (
                <div className="mt-2 flex flex-col border-gray-200 bg-white shadow-sm">
                    {isLoading ? (
                        <span className="p-2 text-sm text-gray-400">Searching...</span>
                    ) : users.length === 0 ? (
                        <span className="p-2 text-sm text-gray-400">{search.trim() ? 'No users found.' : 'Start typing to search users.'}</span>
                    ) : (
                        users.map((user: User) => (
                            <Button
                                variant="ghost"
                                shape="square"
                                onClick={() => {
                                    handleSelectUser(user);
                                }}
                                key={user.id}
                                className="justify-start border-b"
                            >
                                <div className="font-medium">{user.name}</div>
                                <div className="truncate text-xs text-gray-500">{user.email}</div>
                            </Button>
                        ))
                    )}
                </div>
            )}

            {user && (
                <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold">Selected User:</h4>
                    <p className="text-sm">Name: {user.name}</p>
                    <p className="text-sm">Email: {user.email}</p>
                </div>
            )}
        </main>
    );
}

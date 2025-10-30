import Input from '@/components/composables/input';
import { Search } from 'lucide-react';

import { useRoleMethod } from '@/hooks/useRoleMethod';
import { ChangeEvent, useEffect, useState } from 'react';

import { useDebounce } from '@/lib/utils';

interface SearchRolesProps {
    onRoleSelect: (roleId: string | number) => void;
}

export default function SearchRoles({ onRoleSelect }: SearchRolesProps) {
    const { getRoles } = useRoleMethod();
    const [role, setRole] = useState<Role | null>(null);
    const [search, setSearch] = useState('');
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    useEffect(() => {
        const fetchRoles = async () => {
            if (!debouncedSearch.trim()) {
                setRoles([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await getRoles({ search: debouncedSearch });
                setRoles(response.data || []);
            } catch (error) {
                console.error('Error searching roles:', error);
                setRoles([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleSelectRole = (role: Role) => {
        onRoleSelect(role.id);
        setRole(role);
        setSearch('');
        setRoles([]);
    };

    return (
        <main>
            <Input icon={<Search size={12} />} placeholder="Search Roles" value={search} onChange={handleInputChange} />
            {search && (
                <ul className="mt-2 rounded border border-gray-200 bg-white shadow-sm">
                    {isLoading ? (
                        <li className="p-2 text-sm text-gray-400">Searching...</li>
                    ) : roles.length === 0 ? (
                        <li className="p-2 text-sm text-gray-400">{search.trim() ? 'No roles found.' : 'Start typing to search roles.'}</li>
                    ) : (
                        roles.map((role: Role) => (
                            <li
                                onClick={() => {
                                    handleSelectRole(role);
                                }}
                                key={role.id}
                                className="cursor-pointer border-b p-2 last:border-b-0 hover:bg-gray-100"
                            >
                                <div className="font-medium">{role.name}</div>
                            </li>
                        ))
                    )}
                </ul>
            )}

            {role && (
                <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold">Selected Role:</h4>
                    <p className="text-sm">Name: {role.name}</p>
                </div>
            )}
        </main>
    );
}

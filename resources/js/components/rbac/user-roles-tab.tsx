import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PaginatedTable, { ColumnDefinition, PaginationData } from '@/components/ui/paginated-table';
import { User } from '@/types/index';
import { Permission, Role } from '@/types/rbac';
import { router } from '@inertiajs/react';
import { Edit, Search, UserCheck, UserPlus, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// --- Interfaces ---
interface UserWithRoles extends User {
    roles?: Role[];
    permissions?: Permission[];
}

interface UserRolesTabProps {
    roles: Role[];
    permissions: Permission[];
    users?: PaginationData;
}

export default function UserRolesTab({ roles, permissions, users }: UserRolesTabProps) {
    // State for dialogs and forms
    const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
    const [assignPermissionDialogOpen, setAssignPermissionDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Search state
    const [search, setSearch] = useState('');

    // Use server-side pagination data directly
    const paginationData = users || {
        data: [],
        current_page: 1,
        from: null,
        last_page: 1,
        per_page: 10,
        to: null,
        total: 0,
        links: [],
    };

    // Open assign roles dialog
    const openAssignRolesDialog = (user: UserWithRoles) => {
        setSelectedUser(user);
        setSelectedRoles(user.roles?.map((role) => role.id) || []);
        setAssignRoleDialogOpen(true);
    };

    // Close assign roles dialog
    const closeAssignRolesDialog = () => {
        setAssignRoleDialogOpen(false);
        setSelectedUser(null);
        setSelectedRoles([]);
    };

    // Open assign permissions dialog
    const openAssignPermissionsDialog = (user: UserWithRoles) => {
        setSelectedUser(user);
        setSelectedPermissions(user.permissions?.map((permission) => permission.id) || []);
        setAssignPermissionDialogOpen(true);
    };

    // Close assign permissions dialog
    const closeAssignPermissionsDialog = () => {
        setAssignPermissionDialogOpen(false);
        setSelectedUser(null);
        setSelectedPermissions([]);
    };

    // Handle role assignment
    const handleAssignRoles = async () => {
        if (!selectedUser) return;

        setIsProcessing(true);
        try {
            router.post(
                route('rbac.assign-roles'),
                {
                    user_id: selectedUser.id,
                    role_ids: selectedRoles,
                },
                {
                    onSuccess: () => {
                        toast.success('Roles assigned successfully');
                        closeAssignRolesDialog();
                    },
                    onError: (errors) => {
                        toast.error('Failed to assign roles');
                        console.error(errors);
                    },
                },
            );
        } catch {
            toast.error('An error occurred while assigning roles');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle permission assignment
    const handleAssignPermissions = async () => {
        if (!selectedUser) return;

        setIsProcessing(true);
        try {
            router.post(
                route('rbac.assign-permissions'),
                {
                    user_id: selectedUser.id,
                    permission_ids: selectedPermissions,
                },
                {
                    onSuccess: () => {
                        toast.success('Permissions assigned successfully');
                        closeAssignPermissionsDialog();
                    },
                    onError: (errors) => {
                        toast.error('Failed to assign permissions');
                        console.error(errors);
                    },
                },
            );
        } catch {
            toast.error('An error occurred while assigning permissions');
        } finally {
            setIsProcessing(false);
        }
    };

    // Toggle role selection
    const toggleRole = (roleId: number) => {
        setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]));
    };

    // Toggle permission selection
    const togglePermission = (permissionId: number) => {
        setSelectedPermissions((prev) => (prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]));
    };

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            className: 'w-16',
            render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">#{String(value)}</span>,
        },
        {
            key: 'name',
            header: 'User',
            sortable: true,
            render: (_, row) => {
                const user = row as UserWithRoles;
                return (
                    <div className="flex items-center gap-3">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                <span className="text-sm font-medium text-white">{(user.name || '').charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'roles',
            header: 'Roles',
            render: (_, row) => {
                const user = row as UserWithRoles;
                return (
                    <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                                <Badge key={role.id} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    {role.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400">No roles assigned</span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'permissions',
            header: 'Direct Permissions',
            hiddenOnTablet: true,
            render: (_, row) => {
                const user = row as UserWithRoles;
                const directPermissions = user.permissions || [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {directPermissions.length > 0 ? (
                            directPermissions.slice(0, 2).map((permission) => (
                                <Badge
                                    key={permission.id}
                                    variant="outline"
                                    className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                                >
                                    {permission.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400">None</span>
                        )}
                        {directPermissions.length > 2 && (
                            <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600">
                                +{directPermissions.length - 2} more
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'created_at',
            header: 'Created',
            sortable: true,
            hiddenOnMobile: true,
            render: (value) => (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <UserPlus className="h-3 w-3" />
                    {value
                        ? new Date(value as string).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                          })
                        : 'N/A'}
                </div>
            ),
        },
    ];

    // Actions for each row
    const renderActions = (row: Record<string, unknown>) => {
        const user = row as UserWithRoles;
        return (
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAssignRolesDialog(user)}
                    className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                    <Edit className="h-3 w-3" />
                    <span className="hidden sm:inline">Roles</span>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAssignPermissionsDialog(user)}
                    className="gap-1 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                >
                    <UserCheck className="h-3 w-3" />
                    <span className="hidden sm:inline">Permissions</span>
                </Button>
            </div>
        );
    }; // Debounced search and navigation
    const debouncedSearch = useCallback((searchTerm: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;

        router.get(route('rbac.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(search);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, debouncedSearch]);

    // Handle page changes
    const handlePageChange = (url: string) => {
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const page = parseInt(urlParams.get('page') || '1');

        const params: Record<string, string> = {};
        if (search) params.search = search;
        params.page = page.toString();

        router.get(route('rbac.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Mobile card render for responsive design
    const renderMobileCard = (row: Record<string, unknown>) => {
        const user = row as UserWithRoles;
        return (
            <div className="space-y-3 p-4">
                <div className="flex items-center gap-3 border-b pb-2">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                    )}
                    <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                </div>

                <div>
                    <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Current Roles</div>
                    <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                                <Badge key={role.id} variant="secondary" className="text-xs">
                                    {role.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-muted-foreground">No roles assigned</span>
                        )}
                    </div>
                </div>

                <div>
                    <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Direct Permissions</div>
                    <div className="flex flex-wrap gap-1">
                        {user.permissions && user.permissions.length > 0 ? (
                            user.permissions.map((permission) => (
                                <Badge
                                    key={permission.id}
                                    variant="outline"
                                    className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                                >
                                    {permission.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400">No direct permissions</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAssignRolesDialog(user)}
                        className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                        <Edit className="h-3 w-3" />
                        Roles
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAssignPermissionsDialog(user)}
                        className="gap-1 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                    >
                        <UserCheck className="h-3 w-3" />
                        Permissions
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        User Role Assignment
                    </CardTitle>
                    <CardDescription>
                        Search for users and assign roles or direct permissions to them. Manage user access through role assignments and individual
                        permission grants.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Filters Section */}
            <Card>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 pr-10 pl-10"
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-3 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                                    onClick={() => setSearch('')}
                                    aria-label="Clear search"
                                >
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <PaginatedTable
                data={paginationData}
                columns={columns}
                title="Users"
                actions={renderActions}
                mobileCardRender={renderMobileCard}
                onPageChange={handlePageChange}
                emptyMessage="No users found"
            />

            {/* Assign Roles Dialog */}
            <Dialog open={assignRoleDialogOpen} onOpenChange={setAssignRoleDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Assign Roles
                        </DialogTitle>
                        <DialogDescription>Select roles to assign to {selectedUser?.name}.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {roles.map((role) => (
                            <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`role-${role.id}`}
                                    checked={selectedRoles.includes(role.id)}
                                    onCheckedChange={() => toggleRole(role.id)}
                                />
                                <Label htmlFor={`role-${role.id}`} className="flex-1">
                                    <div className="font-medium">{role.name}</div>
                                    <div className="text-sm text-muted-foreground">{role.permissions.length} permission(s)</div>
                                </Label>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeAssignRolesDialog} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignRoles} disabled={isProcessing}>
                            {isProcessing ? 'Assigning...' : 'Assign Roles'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Permissions Dialog */}
            <Dialog open={assignPermissionDialogOpen} onOpenChange={setAssignPermissionDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Permissions to {selectedUser?.name}</DialogTitle>
                        <DialogDescription>
                            Select direct permissions for this user. These are independent of role-based permissions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-96 space-y-4 overflow-y-auto">
                        {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <Label
                                    htmlFor={`permission-${permission.id}`}
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {permission.name}
                                </Label>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeAssignPermissionsDialog} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignPermissions} disabled={isProcessing}>
                            {isProcessing ? 'Assigning...' : 'Assign Permissions'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

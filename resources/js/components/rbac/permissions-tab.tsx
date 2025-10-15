import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Permission, Role } from '@/types/rbac';
import { Key, Search, Shield } from 'lucide-react';
import * as React from 'react';

interface PermissionsTabProps {
    roles: Role[];
    permissions: Permission[];
}

export default function PermissionsTab({ roles, permissions }: PermissionsTabProps) {
    // Search state
    const [searchTerm, setSearchTerm] = React.useState('');

    // Filter and sort permissions
    const filteredAndSortedPermissions = React.useMemo(() => {
        return permissions
            .filter((permission) => {
                const assignedRoles = roles.filter((role) => role.permissions.some((p) => p.id === permission.id));
                return (
                    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    assignedRoles.some((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [permissions, roles, searchTerm]);

    // Get roles that have a specific permission
    const getRolesForPermission = (permission: Permission) => {
        return roles.filter((role) => role.permissions.some((p) => p.id === permission.id));
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        System Permissions
                    </CardTitle>
                    <CardDescription>
                        View seeded permissions and their role assignments. Permissions cannot be created, modified, or deleted.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                placeholder="Search permissions or roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Badge variant="secondary" className="whitespace-nowrap">
                            {filteredAndSortedPermissions.length} permission(s)
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Permission Overview</CardTitle>
                    <CardDescription>View all system permissions and the roles they are assigned to.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Permission Name</TableHead>
                                <TableHead>Assigned Roles</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedPermissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                        {searchTerm ? 'No permissions found matching your search.' : 'No permissions available.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedPermissions.map((permission) => {
                                    const assignedRoles = getRolesForPermission(permission);

                                    return (
                                        <TableRow key={permission.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-green-500" />
                                                    <span className="font-medium">{permission.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {assignedRoles.length === 0 ? (
                                                        <Badge variant="outline" className="text-muted-foreground">
                                                            Not assigned
                                                        </Badge>
                                                    ) : (
                                                        assignedRoles.slice(0, 3).map((role) => (
                                                            <Badge key={role.id} variant="secondary" className="text-xs">
                                                                {role.name}
                                                            </Badge>
                                                        ))
                                                    )}
                                                    {assignedRoles.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{assignedRoles.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                    System Permission
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Permission, Role } from '@/types/rbac';
import { router } from '@inertiajs/react';
import { Search, Shield, UserCheck, Users } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

interface RolesTabProps {
    roles: Role[];
    permissions: Permission[];
}

export default function RolesTab({ roles, permissions }: RolesTabProps) {
    // State for permission assignment dialog
    const [permissionDialogOpen, setPermissionDialogOpen] = React.useState(false);
    const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
    const [selectedPermissions, setSelectedPermissions] = React.useState<number[]>([]);
    const [isProcessing, setIsProcessing] = React.useState(false);

    // Search state
    const [searchTerm, setSearchTerm] = React.useState('');

    // Filter and sort roles
    const filteredAndSortedRoles = React.useMemo(() => {
        return roles
            .filter(
                (role) =>
                    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    role.permissions.some((permission) => permission.name.toLowerCase().includes(searchTerm.toLowerCase())),
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [roles, searchTerm]);

    // Handle permission assignment
    const handleAssignPermissions = (role: Role) => {
        setSelectedRole(role);
        setSelectedPermissions(role.permissions.map((p) => p.id));
        setPermissionDialogOpen(true);
    };

    const handlePermissionAssignmentSubmit = async () => {
        if (!selectedRole) return;

        setIsProcessing(true);
        try {
            await router.put(route('rbac.sync-role-permissions', selectedRole.id), {
                permissions: selectedPermissions,
            });
            toast.success('Permissions updated successfully');
            setPermissionDialogOpen(false);
        } catch (error) {
            console.error('Error updating permissions:', error);
            toast.error('Failed to update permissions');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        setSelectedPermissions((prev) => (checked ? [...prev, permissionId] : prev.filter((id) => id !== permissionId)));
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        System Roles
                    </CardTitle>
                    <CardDescription>
                        View seeded roles and manage their permission assignments. Roles cannot be created, modified, or deleted.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                placeholder="Search roles or permissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Badge variant="secondary" className="whitespace-nowrap">
                            {filteredAndSortedRoles.length} role(s)
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Roles Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Management</CardTitle>
                    <CardDescription>Assign permissions to roles to control access throughout the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role Name</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedRoles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                        {searchTerm ? 'No roles found matching your search.' : 'No roles available.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedRoles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium">{role.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.length === 0 ? (
                                                    <Badge variant="outline" className="text-muted-foreground">
                                                        No permissions
                                                    </Badge>
                                                ) : (
                                                    role.permissions.slice(0, 3).map((permission) => (
                                                        <Badge key={permission.id} variant="secondary" className="text-xs">
                                                            {permission.name}
                                                        </Badge>
                                                    ))
                                                )}
                                                {role.permissions.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{role.permissions.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                System Role
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleAssignPermissions(role)}>
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Manage Permissions
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Permission Assignment Dialog */}
            <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Permissions to "{selectedRole?.name}"</DialogTitle>
                        <DialogDescription>Select the permissions you want to assign to this role.</DialogDescription>
                    </DialogHeader>

                    <div className="max-h-96 space-y-4 overflow-y-auto">
                        {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
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
                        <Button variant="outline" onClick={() => setPermissionDialogOpen(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button onClick={handlePermissionAssignmentSubmit} disabled={isProcessing}>
                            {isProcessing ? 'Updating...' : 'Update Permissions'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

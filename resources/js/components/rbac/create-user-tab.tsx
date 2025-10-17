import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Permission, Role } from '@/types/rbac';
import { router } from '@inertiajs/react';
import { Mail, Plus, Shield, User, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreateUserTabProps {
    roles: Role[];
    permissions: Permission[];
}

interface CreateUserForm {
    name: string;
    email: string;
    role_ids: number[];
    permission_ids: number[];
}

export default function CreateUserTab({ roles, permissions }: CreateUserTabProps) {
    const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<CreateUserForm>({
        name: '',
        email: '',
        role_ids: [],
        permission_ids: [],
    });

    // Reset form
    const resetForm = () => {
        setForm({
            name: '',
            email: '',
            role_ids: [],
            permission_ids: [],
        });
    };

    // Open create user dialog
    const openCreateUserDialog = () => {
        resetForm();
        setCreateUserDialogOpen(true);
    };

    // Close create user dialog
    const closeCreateUserDialog = () => {
        setCreateUserDialogOpen(false);
        resetForm();
    };

    // Handle form input changes
    const handleInputChange = (field: keyof CreateUserForm, value: string | number | number[]) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle role selection
    const handleRoleToggle = (roleId: number, checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            role_ids: checked ? [...prev.role_ids, roleId] : prev.role_ids.filter((id) => id !== roleId),
        }));
    };

    // Handle permission selection
    const handlePermissionToggle = (permissionId: number, checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            permission_ids: checked ? [...prev.permission_ids, permissionId] : prev.permission_ids.filter((id) => id !== permissionId),
        }));
    };

    // Handle user creation
    const handleCreateUser = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            toast.error('Name and email are required');
            return;
        }

        setIsCreating(true);
        try {
            router.post(
                route('rbac.create-user'),
                {
                    name: form.name,
                    email: form.email,
                    role_ids: form.role_ids,
                    permission_ids: form.permission_ids,
                },
                {
                    onSuccess: () => {
                        toast.success('User created successfully! Password setup email has been sent.');
                        closeCreateUserDialog();
                    },
                    onError: (errors) => {
                        toast.error('Failed to create user');
                        console.error(errors);
                    },
                    onFinish: () => {
                        setIsCreating(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error creating user:', error);
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-semibold">
                        <User className="h-6 w-6" />
                        Create New User
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create new users and assign roles or direct permissions. Users will receive an email to set up their password.
                    </p>
                </div>
                <Button onClick={openCreateUserDialog} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create User
                </Button>
            </div>

            {/* Information Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Email Setup Process
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                1
                            </div>
                            <div>
                                <p className="font-medium">User Creation</p>
                                <p className="text-sm text-muted-foreground">Enter user details and assign roles/permissions</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                2
                            </div>
                            <div>
                                <p className="font-medium">Email Sent</p>
                                <p className="text-sm text-muted-foreground">Password setup link is automatically sent to user's email</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                3
                            </div>
                            <div>
                                <p className="font-medium">User Activation</p>
                                <p className="text-sm text-muted-foreground">User clicks link and sets their password to activate account</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Permission Assignment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="font-medium">Role-based Permissions</p>
                            <p className="text-sm text-muted-foreground">Assign predefined roles that include multiple permissions</p>
                        </div>
                        <div>
                            <p className="font-medium">Direct Permissions</p>
                            <p className="text-sm text-muted-foreground">Grant specific permissions directly to the user</p>
                        </div>
                        <div>
                            <p className="font-medium">Combined Approach</p>
                            <p className="text-sm text-muted-foreground">Users can have both role-based and direct permissions</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create User Dialog */}
            <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
                <DialogContent className="max-h-[90vh] w-[95vw] max-w-[1400px] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create New User
                        </DialogTitle>
                        <DialogDescription>
                            Create a new user account and assign roles or permissions. The user will receive an email with instructions to set up
                            their password.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8 py-4">
                        {/* User Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">User Details</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter full name"
                                        value={form.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        value={form.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Role Assignment */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <Users className="h-5 w-5" />
                                    Assign Roles
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Select roles to assign to this user. Each role includes a set of permissions.
                                </p>
                            </div>
                            {roles.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="flex min-h-[120px] items-start space-x-4 rounded-lg border p-5 transition-colors hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={form.role_ids.includes(role.id)}
                                                onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                                                className="mt-0.5 flex-shrink-0"
                                            />
                                            <div className="min-w-0 flex-1 space-y-3 overflow-hidden">
                                                <Label htmlFor={`role-${role.id}`} className="block cursor-pointer text-sm leading-none font-medium">
                                                    {role.name}
                                                </Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {role.permissions.slice(0, 3).map((permission) => (
                                                        <Badge
                                                            key={permission.id}
                                                            variant="secondary"
                                                            className="px-3 py-1 text-xs whitespace-nowrap"
                                                            title={permission.name}
                                                        >
                                                            {permission.name.length > 25 ? `${permission.name.substring(0, 25)}...` : permission.name}
                                                        </Badge>
                                                    ))}
                                                    {role.permissions.length > 3 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="flex-shrink-0 px-3 py-1 text-xs whitespace-nowrap"
                                                            title={`View all ${role.permissions.length} permissions: ${role.permissions.map((p) => p.name).join(', ')}`}
                                                        >
                                                            +{role.permissions.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No roles available</p>
                            )}
                        </div>

                        <Separator />

                        {/* Direct Permissions */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <Shield className="h-5 w-5" />
                                    Direct Permissions
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Grant specific permissions directly to this user (in addition to role permissions).
                                </p>
                            </div>
                            {permissions.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-border bg-card">
                                        <div className="border-b border-border p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-semibold">Available Permissions</h4>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        Select individual permissions to grant directly to this user
                                                    </p>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {form.permission_ids.length} of {permissions.length} selected
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-3 gap-2">
                                                {permissions.map((permission) => (
                                                    <label
                                                        key={permission.id}
                                                        htmlFor={`permission-${permission.id}`}
                                                        className="group flex cursor-pointer items-center space-x-3 rounded-md border border-transparent p-3 transition-colors hover:border-border/50 hover:bg-muted/50"
                                                    >
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={form.permission_ids.includes(permission.id)}
                                                            onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                                                            className="flex-shrink-0"
                                                        />
                                                        <span className="min-w-0 flex-1 text-sm leading-snug transition-colors group-hover:text-foreground">
                                                            {permission.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No permissions available</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-6">
                        <Button variant="outline" onClick={closeCreateUserDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateUser} disabled={isCreating || !form.name.trim() || !form.email.trim()} className="min-w-[160px]">
                            {isCreating ? 'Creating...' : 'Create User & Send Email'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

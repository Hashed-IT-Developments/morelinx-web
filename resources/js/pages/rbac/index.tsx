import CreateUserTab from '@/components/rbac/create-user-tab';
import PermissionsTab from '@/components/rbac/permissions-tab';
import RolesTab from '@/components/rbac/roles-tab';
import UserRolesTab from '@/components/rbac/user-roles-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { RbacProps } from '@/types/rbac';
import { Head } from '@inertiajs/react';
import { Key, Shield, UserCheck, UserPlus, Users } from 'lucide-react';

export default function RbacIndex({ roles, permissions, users }: RbacProps) {
    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'RBAC Management', href: route('rbac.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="RBAC Management" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Shield className="h-8 w-8" />
                            RBAC Management
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage user role assignments and permission attachments. Roles and permissions are seeded and cannot be modified.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="user-roles" className="space-y-6">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4">
                        <TabsTrigger value="user-roles" className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            User Roles
                        </TabsTrigger>
                        <TabsTrigger value="create-user" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Create User
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Roles
                        </TabsTrigger>
                        <TabsTrigger value="permissions" className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Permissions
                        </TabsTrigger>
                    </TabsList>

                    {/* User Roles Tab - Primary focus */}
                    <TabsContent value="user-roles" className="space-y-6">
                        <UserRolesTab roles={roles} permissions={permissions} users={users} />
                    </TabsContent>

                    {/* Create User Tab - New user creation */}
                    <TabsContent value="create-user" className="space-y-6">
                        <CreateUserTab roles={roles} permissions={permissions} />
                    </TabsContent>

                    {/* Roles Tab - View only with permission assignment */}
                    <TabsContent value="roles" className="space-y-6">
                        <RolesTab roles={roles} permissions={permissions} />
                    </TabsContent>

                    {/* Permissions Tab - View only */}
                    <TabsContent value="permissions" className="space-y-6">
                        <PermissionsTab roles={roles} permissions={permissions} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

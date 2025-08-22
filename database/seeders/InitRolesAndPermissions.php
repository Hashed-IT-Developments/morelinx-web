<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InitRolesAndPermissions extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /**
         * Initialization of roles and permissions
         * - Roles: superadmin, admin, user (for now)
         * - Permissions: manage users, manage roles, manage permissions
         */

        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        \Spatie\Permission\Models\Permission::create(['name' => 'manage users']);
        \Spatie\Permission\Models\Permission::create(['name' => 'manage roles']);
        \Spatie\Permission\Models\Permission::create(['name' => 'manage permissions']);

        // create roles and assign existing permissions
        $role = \Spatie\Permission\Models\Role::create(['name' => 'superadmin']);
        $role->givePermissionTo('manage users');
        $role->givePermissionTo('manage roles');
        $role->givePermissionTo('manage permissions');

        $role = \Spatie\Permission\Models\Role::create(['name' => 'admin']);
        $role->givePermissionTo('manage users');

        \Spatie\Permission\Models\Role::create(['name' => 'user']);

    }
}

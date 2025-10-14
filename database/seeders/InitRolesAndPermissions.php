<?php

namespace Database\Seeders;

use App\Enums\RolesEnum;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

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
         *
         * Note: More roles and permissions can be added later as needed.
         */

        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'manage roles']);
        Permission::create(['name' => 'manage permissions']);

        Permission::create(['name' => 'manage payments']);



        // create roles and assign existing permissions
        $sadmin = Role::create(['name' => RolesEnum::SUPERADMIN]);
        $sadmin->givePermissionTo('manage users');
        $sadmin->givePermissionTo('manage roles');
        $sadmin->givePermissionTo('manage permissions');

        $admin = Role::create(['name' => RolesEnum::ADMIN]);
        $admin->givePermissionTo('manage users');

        Role::create(['name' => RolesEnum::USER]);

        $trStaff = Role::create(['name'=>RolesEnum::TREASURY_STAFF]);
        $trStaff->givePermissionTo('manage payments');

        //Create Super Admin User

        $spadmin = User::create([
            'name' => 'super admin user',
            'email' => 'spadmin@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $admin = User::create([
            'name' => 'admin user',
            'email' => 'admin@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $dev = User::create([
            'name' => 'super dev user',
            'email' => 'test@test.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $regularUser = User::create([
            'name' => 'regular user',
            'email' => 'user@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $dev->assignRole(RolesEnum::SUPERADMIN);
        $spadmin->assignRole(RolesEnum::SUPERADMIN);
        $admin->assignRole(RolesEnum::ADMIN);
        $regularUser->assignRole(RolesEnum::USER);

        $this->call(CustApplnRolesAndPermissions::class);

        $spadmin->givePermissionTo(Permission::all());
    }
}

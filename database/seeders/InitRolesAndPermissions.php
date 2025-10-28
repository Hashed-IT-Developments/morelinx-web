<?php

namespace Database\Seeders;

use App\Enums\PermissionsEnum;
use App\Enums\RolesEnum;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class InitRolesAndPermissions extends Seeder
{
   
    public function run(): void
    {
    
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        Permission::create(['name' => PermissionsEnum::MANAGE_USERS]);
        Permission::create(['name' => PermissionsEnum::MANAGE_ROLES]);
        Permission::create(['name' => PermissionsEnum::MANAGE_PERMISSIONS]);
        Permission::create(['name' => PermissionsEnum::MANAGE_PAYMENTS]);



        // create roles and assign existing permissions
        $sadmin = Role::create(['name' => RolesEnum::SUPERADMIN]);
        $sadmin->givePermissionTo(PermissionsEnum::MANAGE_USERS);
        $sadmin->givePermissionTo(PermissionsEnum::MANAGE_ROLES);
        $sadmin->givePermissionTo(PermissionsEnum::MANAGE_PERMISSIONS);

        $admin = Role::create(['name' => RolesEnum::ADMIN]);
        $admin->givePermissionTo(PermissionsEnum::MANAGE_USERS);

        Role::create(['name' => RolesEnum::USER]);

        $trStaff = Role::create(['name'=>RolesEnum::TREASURY_STAFF]);
        $trStaff->givePermissionTo(PermissionsEnum::MANAGE_PAYMENTS);

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

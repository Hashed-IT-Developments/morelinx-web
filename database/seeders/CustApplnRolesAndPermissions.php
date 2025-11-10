<?php

namespace Database\Seeders;

use App\Enums\PermissionsEnum;
use App\Enums\RolesEnum;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class CustApplnRolesAndPermissions extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Permission::create(['name' => PermissionsEnum::CREATE_CUSTOMER_APPLICATIONS]);
        Permission::create(['name' => PermissionsEnum::REQUEST_CUSTOMER_INFO_AMENDMENTS]);
        Permission::create(['name' => PermissionsEnum::REQUEST_BILL_INFO_AMENDMENTS]);
        Permission::create(['name' => PermissionsEnum::APPROVE_CUSTOMER_INFO_AMENDMENTS]);
        Permission::create(['name' => PermissionsEnum::APPROVE_BILL_INFO_AMENDMENTS]);

        Permission::create(['name' => PermissionsEnum::APPROVE_INSPECTION]);
        Permission::create(['name' => PermissionsEnum::DISAPPROVE_INSPECTION]);
        Permission::create(['name' => PermissionsEnum::ASSIGN_INSPECTOR]);
        Permission::create(['name' => PermissionsEnum::VIEW_INSPECTIONS]);
        Permission::create(['name' => PermissionsEnum::VERIFY_INSPECTION_APPROVAL]);

        Permission::create(['name' => PermissionsEnum::VIEW_TRANSACTIONS]);
        Permission::create(['name' => PermissionsEnum::MANAGE_PAYMENTS]);

        $ccdStaff = Role::create(['name' => RolesEnum::CCD_STAFF]);
        $ccdStaff->givePermissionTo(PermissionsEnum::CREATE_CUSTOMER_APPLICATIONS);
        $ccdStaff->givePermissionTo(PermissionsEnum::REQUEST_CUSTOMER_INFO_AMENDMENTS);
        $ccdStaff->givePermissionTo(PermissionsEnum::REQUEST_BILL_INFO_AMENDMENTS);

        $ccdSup = Role::create(['name' => RolesEnum::CCD_SUPERVISOR]);
        $ccdSup->givePermissionTo(PermissionsEnum::APPROVE_CUSTOMER_INFO_AMENDMENTS);
        $ccdSup->givePermissionTo(PermissionsEnum::APPROVE_BILL_INFO_AMENDMENTS);

        $inspector = Role::create(['name' => RolesEnum::INSPECTOR]);
        $inspector->givePermissionTo(PermissionsEnum::VIEW_INSPECTIONS);
        $inspector->givePermissionTo(PermissionsEnum::APPROVE_INSPECTION);
        $inspector->givePermissionTo(PermissionsEnum::DISAPPROVE_INSPECTION);

        $ndogSup = Role::create(['name' => RolesEnum::NDOG_SUPERVISOR]);
        $ndogSup->givePermissionTo(PermissionsEnum::VIEW_INSPECTIONS);
        $ndogSup->givePermissionTo(PermissionsEnum::DISAPPROVE_INSPECTION);
        $ndogSup->givePermissionTo(PermissionsEnum::VERIFY_INSPECTION_APPROVAL);
        $ndogSup->givePermissionTo(PermissionsEnum::ASSIGN_INSPECTOR);
        
        $trStaff = Role::create(['name'=>RolesEnum::TREASURY_STAFF]);
        $trStaff->givePermissionTo(PermissionsEnum::MANAGE_PAYMENTS);
        $trStaff->givePermissionTo(PermissionsEnum::VIEW_TRANSACTIONS);

        $userInspector = User::create([
            'name' => 'Inspector Esyot',
            'email' => 'inspector@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $userInspector->assignRole(RolesEnum::INSPECTOR);

        $userInspector2 = User::create([
            'name' => 'Inspector Rodriguez',
            'email' => 'inspector2@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $userInspector2->assignRole(RolesEnum::INSPECTOR);

        $userInspector3 = User::create([
            'name' => 'Inspector Santos',
            'email' => 'inspector3@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $userInspector3->assignRole(RolesEnum::INSPECTOR);

        $userInspector4 = User::create([
            'name' => 'Inspector Dela Cruz',
            'email' => 'inspector4@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $userInspector4->assignRole(RolesEnum::INSPECTOR);

        $userCCDStaff = User::create([
            'name' => 'CCD Staff User',
            'email' => 'ccd_staff@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $userCCDStaff->assignRole(RolesEnum::CCD_STAFF);

        $userCCDSup = User::create([
            'name' => 'CCD Supervisor User',
            'email' => 'ccd_supervisor@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $userCCDSup->assignRole(RolesEnum::CCD_SUPERVISOR);

        $userNDOGSup = User::create([
            'name' => 'NDOG Supervisor User',
            'email' => 'ndog_supervisor@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $userNDOGSup->assignRole(RolesEnum::NDOG_SUPERVISOR);

        $treasuryStaff1 = User::create([
            'name' => 'treasury staff 1',
            'email' => 'treasury1@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $treasuryStaff2 = User::create([
            'name' => 'treasury staff 2',
            'email' => 'treasury2@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $treasuryStaff3 = User::create([
            'name' => 'treasury staff 3',
            'email' => 'treasury3@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);


        $treasuryStaff1->assignRole(RolesEnum::TREASURY_STAFF);
        $treasuryStaff2->assignRole(RolesEnum::TREASURY_STAFF);
        $treasuryStaff3->assignRole(RolesEnum::TREASURY_STAFF);

    }
}

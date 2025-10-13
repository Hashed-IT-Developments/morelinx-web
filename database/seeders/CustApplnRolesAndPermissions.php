<?php

namespace Database\Seeders;

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
        Permission::create(['name' => 'create customer applications']);
        Permission::create(['name' => 'request customer info amendments']);
        Permission::create(['name' => 'approve customer info amendments']);
        Permission::create(['name' => 'request ndog amendments']);
        Permission::create(['name' => 'approve ndog amendments']);

        Permission::create(['name' => 'view inspections']);
        Permission::create(['name' => 'approve inspection']);
        Permission::create(['name' => 'disapprove inspection']);
        Permission::create(['name' => 'assign inspector']);

        Permission::create(['name' => 'verify inspection approval']);

        $ccdStaff = Role::create(['name' => RolesEnum::CCD_STAFF]);
        $ccdStaff->givePermissionTo('create customer applications');
        $ccdStaff->givePermissionTo('request customer info amendments');
        $ccdStaff->givePermissionTo('request ndog amendments');

        $ccdSup = Role::create(['name' => RolesEnum::CCD_SUPERVISOR]);
        $ccdSup->givePermissionTo('approve customer info amendments');

        $inspector = Role::create(['name' => RolesEnum::INSPECTOR]);
        $inspector->givePermissionTo('view inspections');
        $inspector->givePermissionTo('approve inspection');
        $inspector->givePermissionTo('disapprove inspection');

        $ndogSup = Role::create(['name' => RolesEnum::NDOG_SUPERVISOR]);
        $ndogSup->givePermissionTo('view inspections');
        $ndogSup->givePermissionTo('disapprove inspection');
        $ndogSup->givePermissionTo('verify inspection approval');
        $ndogSup->givePermissionTo('assign inspector');
        $ndogSup->givePermissionTo('approve ndog amendments');

        $userInspector = User::create([
            'name' => 'Inspector Esyot',
            'email' => 'inspector@morelinx.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $userInspector->assignRole(RolesEnum::INSPECTOR);

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

    }
}

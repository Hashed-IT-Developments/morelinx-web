<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RbacController extends Controller
{
    public function index() {
        $roles = Role::orderBy('name')
            ->with('permissions')->get();

        $permissions = Permission::orderBy('name');

        return inertia('rbac/Index', compact('roles','permissions'));
    }

    public function createRole(Request $request) {
        $request->validate([
            'name' => 'string|required'
        ]);

        Role::create(['name'=>$request->name]);

        return back()->with('success',"$request->name role has been created.");
    }

    public function updateRole(Role $role, Request $request) {
        $request->validate([
            'name' => 'string|required'
        ]);

        $oldName = $role->name;

        $role->update($request->only('name'));

        return back()->with('success',"Role '$oldName' has been updated to $request->name.");
    }

    public function deleteRole(Role $role) {
        $roleName = $role->name;
        $role->delete();

        return back()->with('success',"Role '$roleName' has been deleted.");
    }

    public function createPermission(Request $request) {
        $request->validate(['name'=>'string|required']);

        Permission::create(['name'=>$request->name]);

        return back()->with('success',"Permission '$request->name' has been created.");
    }

    public function updatePermission(Permission $permission, Request $request) {
        $request->validate(['name'=>'string|required']);
        $oldName = $permission->name;
        $permission->update(['name'=>$request->name]);
        return back()->with('success',"The permission $oldName has been updated to $request->name.");
    }

    public function deletePermission(Permission $permission) {
        $permissionName = $permission->name;
        $permission->delete();

        return back()->with('success',"Permission '$permissionName' has been deleted.");
    }

    public function addPermissionToRole(Role $role, Permission $permission) {
        $role->givePermissionTo($permission);
        return back()->with('success',"'$permission->name' permission has been added to '$role->name' role.");
    }
}

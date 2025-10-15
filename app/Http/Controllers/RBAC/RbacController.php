<?php

namespace App\Http\Controllers\RBAC;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\RoutePermission;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;

class RbacController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::orderBy('name')
            ->with('permissions')->get();

        $permissions = Permission::orderBy('name')->get();
        
        // Get paginated users with their roles and direct permissions
        $perPage = $request->get('per_page', 5);
        $search = $request->get('search');
        
        $query = User::with(['roles', 'permissions'])
            ->orderBy('name');
            
        // Apply search filter if provided
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }
        
        $users = $query->paginate($perPage);
        
        return inertia('rbac/index', compact('roles', 'permissions', 'users'));
    }
    public function addPermissionToRole(Role $role, Permission $permission)
    {
        if ($role->hasPermissionTo($permission)) {
            return back()->with('error', "Role '{$role->name}' already has permission '{$permission->name}'.");
        }

        $role->givePermissionTo($permission);
        
        return back()->with('success', "Permission '{$permission->name}' has been added to role '{$role->name}'.");
    }

    public function removePermissionFromRole(Role $role, Permission $permission)
    {
        if (!$role->hasPermissionTo($permission)) {
            return back()->with('error', "Role '{$role->name}' does not have permission '{$permission->name}'.");
        }

        $role->revokePermissionTo($permission);
        
        return back()->with('success', "Permission '{$permission->name}' has been removed from role '{$role->name}'.");
    }

    public function syncRolePermissions(Role $role, Request $request)
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        $permissions = Permission::whereIn('id', $request->permissions ?? [])->get();
        $role->syncPermissions($permissions);

        return back()->with('success', "Permissions for role '{$role->name}' have been updated.");
    }

    /**
     * Assign roles to a user
     */
    public function assignRoles(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_ids' => 'array',
            'role_ids.*' => 'exists:roles,id'
        ]);

        $user = User::findOrFail($request->user_id);
        $roles = Role::whereIn('id', $request->role_ids ?? [])->get();
        
        // Sync the roles (this will remove old roles and add new ones)
        $user->syncRoles($roles);

        $roleNames = $roles->pluck('name')->join(', ');
        $message = $roles->count() > 0 
            ? "Roles [{$roleNames}] have been assigned to {$user->name}."
            : "All roles have been removed from {$user->name}.";

        return back()->with('success', $message);
    }

    /**
     * Assign permissions directly to a user
     */
    public function assignPermissions(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'permission_ids' => 'array',
            'permission_ids.*' => 'exists:permissions,id'
        ]);

        $user = User::findOrFail($request->user_id);
        $permissions = Permission::whereIn('id', $request->permission_ids ?? [])->get();
        
        // Sync the permissions (this will remove old direct permissions and add new ones)
        $user->syncPermissions($permissions);

        $permissionNames = $permissions->pluck('name')->join(', ');
        $message = $permissions->count() > 0 
            ? "Permissions [{$permissionNames}] have been assigned directly to {$user->name}."
            : "All direct permissions have been removed from {$user->name}.";

        return back()->with('success', $message);
    }

    /**
     * Search users by name or email
     */
    public function searchUsers(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $search = $request->get('search', '');
        $perPage = $request->get('per_page', 10);

        $query = User::with(['roles', 'permissions'])->orderBy('name');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Assign route to role or permission
     */
    public function assignRouteProtection(Request $request)
    {
        $request->validate([
            'route_name' => 'required|string',
            'route_uri' => 'required|string',
            'route_method' => 'required|string',
            'protection_type' => 'required|in:role,permission',
            'protection_value' => 'required|string',
            'route_description' => 'nullable|string|max:255',
        ]);

        // Validate that the role or permission exists
        if ($request->protection_type === 'role') {
            $exists = Role::where('name', $request->protection_value)->exists();
            if (!$exists) {
                return back()->with('error', "Role '{$request->protection_value}' does not exist.");
            }
        } else {
            $exists = Permission::where('name', $request->protection_value)->exists();
            if (!$exists) {
                return back()->with('error', "Permission '{$request->protection_value}' does not exist.");
            }
        }

        // Create or update route permission
        RoutePermission::updateOrCreate(
            [
                'route_name' => $request->route_name,
                'protection_type' => $request->protection_type,
                'protection_value' => $request->protection_value,
            ],
            [
                'route_uri' => $request->route_uri,
                'route_method' => $request->route_method,
                'route_description' => $request->route_description,
                'is_active' => true,
            ]
        );

        // Clear cache
        Cache::forget("route_protections_{$request->route_name}");

        return back()->with('success', "Route '{$request->route_name}' has been assigned to {$request->protection_type} '{$request->protection_value}'.");
    }

    /**
     * Remove route protection
     */
    public function removeRouteProtection(RoutePermission $routePermission)
    {
        $routeName = $routePermission->route_name;
        $routePermission->delete();

        // Clear cache
        Cache::forget("route_protections_{$routeName}");

        return back()->with('success', "Route protection has been removed.");
    }

    /**
     * Toggle route protection status
     */
    public function toggleRouteProtection(RoutePermission $routePermission)
    {
        $routePermission->update(['is_active' => !$routePermission->is_active]);

        // Clear cache
        Cache::forget("route_protections_{$routePermission->route_name}");

        $status = $routePermission->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Route protection has been {$status}.");
    }

    /**
     * Get route assignments data for a specific route
     */
    public function getRouteAssignments(Request $request)
    {
        $routeName = $request->get('route_name');
        
        if (!$routeName) {
            return response()->json(['error' => 'Route name is required'], 400);
        }

        $assignments = RoutePermission::where('route_name', $routeName)
            ->orderBy('protection_type')
            ->orderBy('protection_value')
            ->get();

        return response()->json(['assignments' => $assignments]);
    }
}

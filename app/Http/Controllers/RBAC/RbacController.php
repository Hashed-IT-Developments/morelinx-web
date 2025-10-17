<?php

namespace App\Http\Controllers\RBAC;

use App\Http\Controllers\Controller;
use App\Http\Requests\RBAC\CreateUserRequest;
use App\Models\User;
use App\Notifications\UserPasswordSetupNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

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
     * Create a new user with roles and permissions
     */
    public function createUser(CreateUserRequest $request)
    {
        // Create user without password (they'll set it via email link)
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt(Str::random(32)), // Temporary random password
            'password_setup_email_sent_at' => now(),
        ]);

        // Assign roles if provided
        if ($request->role_ids && count($request->role_ids) > 0) {
            $roles = Role::whereIn('id', $request->role_ids)->get();
            $user->assignRole($roles);
        }

        // Assign direct permissions if provided
        if ($request->permission_ids && count($request->permission_ids) > 0) {
            $permissions = Permission::whereIn('id', $request->permission_ids)->get();
            $user->givePermissionTo($permissions);
        }

        // Send password setup email
        $user->notify(new UserPasswordSetupNotification());

        return back()->with('success', "User '{$user->name}' has been created successfully. A password setup email has been sent to {$user->email}.");
    }

    /**
     * Resend password setup email for unverified users or send password reset email for verified users
     */
    public function resendPasswordSetupEmail(User $user)
    {
        // Check if user can send email (5 minute cooldown for both verified and unverified users)
        if (!$user->canSendEmail()) {
            $minutesRemaining = $user->getEmailCooldownMinutes();
            return back()->with('error', "Please wait {$minutesRemaining} more minute(s) before sending another email.");
        }

        // Update the timestamp for cooldown tracking
        $user->update(['password_setup_email_sent_at' => now()]);

        if ($user->hasVerifiedEmail()) {
            // For verified users, send password reset email using Laravel's built-in system
            Password::sendResetLink(['email' => $user->email]);
            
            return back()->with('success', "Password reset link has been sent to {$user->email}.");
        } else {
            // For unverified users, send password setup email
            $user->notify(new UserPasswordSetupNotification());
            
            return back()->with('success', "Password setup email has been resent to {$user->email}.");
        }
    }
}

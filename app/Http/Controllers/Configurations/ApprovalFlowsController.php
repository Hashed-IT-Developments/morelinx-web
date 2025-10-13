<?php

namespace App\Http\Controllers\Configurations;

use App\Http\Controllers\Controller;
use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Enums\ModuleName;
use App\Enums\RolesEnum;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Models\User;

class ApprovalFlowsController extends Controller
{
    public function index()
    {
        $approvalFlows = ApprovalFlow::with(['steps.role', 'steps.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('configurations/approval-flows/index', [
            'approvalFlows' => $approvalFlows,
        ]);
    }

    public function create()
    {
        $modules = collect(ModuleName::getValues())->map(function ($module) {
            return [
                'value' => $module,
                'label' => ucwords(str_replace('_', ' ', $module)),
            ];
        });

        $roles = Role::all(['id', 'name']);
        $users = User::all(['id', 'name']);

        return inertia('configurations/approval-flows/create-update', [
            'modules' => $modules,
            'roles' => $roles,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        // Check if user is superadmin
        if (!$request->user()->hasRole(RolesEnum::SUPERADMIN)) {
            return back()->withErrors([
                'authorization' => 'Unauthorized. Only superadmin users can create approval flows.'
            ]);
        }

        $validated = $request->validate([
            'module' => 'required|string',
            'department_id' => 'nullable|exists:departments,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'steps' => 'required|array|min:1',
            'steps.*.order' => 'required|integer|min:1',
            'steps.*.role_id' => 'nullable|exists:roles,id',
            'steps.*.user_id' => 'nullable|exists:users,id',
        ]);

        // Check for duplicate module/department combination
        $departmentId = $validated['department_id'] ?? null;
        $existingFlow = ApprovalFlow::where('module', $validated['module'])
            ->where('department_id', $departmentId)
            ->first();

        if ($existingFlow) {
            return back()->withErrors([
                'module' => 'An approval flow for this module' . 
                    ($departmentId ? ' and department' : '') . 
                    ' already exists.'
            ]);
        }

        // Additional validation: each step must have either role_id or user_id
        foreach ($validated['steps'] as $index => $step) {
            if (empty($step['role_id']) && empty($step['user_id'])) {
                return back()->withErrors([
                    "steps.{$index}" => 'Each step must have either a role or user assigned.'
                ]);
            }
        }

        $flow = ApprovalFlow::create([
            'module' => $validated['module'],
            'department_id' => $validated['department_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        foreach ($validated['steps'] as $stepData) {
            $flow->steps()->create([
                'order' => $stepData['order'],
                'role_id' => $stepData['role_id'] ?? null,
                'user_id' => $stepData['user_id'] ?? null,
            ]);
        }

        return redirect()->route('approval-flows.index')
            ->with('success', 'Approval flow saved successfully.');
    }

    public function edit(ApprovalFlow $approvalFlow)
    {
        $modules = collect(ModuleName::getValues())->map(function ($module) {
            return [
                'value' => $module,
                'label' => ucwords(str_replace('_', ' ', $module)),
            ];
        });

        $roles = Role::all(['id', 'name']);
        $users = User::all(['id', 'name']);

        $approvalFlow->load(['steps.role', 'steps.user']);

        return inertia('configurations/approval-flows/create-update', [
            'modules' => $modules,
            'roles' => $roles,
            'users' => $users,
            'approvalFlow' => $approvalFlow,
        ]);
    }

    public function update(Request $request, ApprovalFlow $approvalFlow)
    {
        // Check if user is superadmin
        if (!$request->user()->hasRole(RolesEnum::SUPERADMIN)) {
            return back()->withErrors([
                'authorization' => 'Unauthorized. Only superadmin users can update approval flows.'
            ]);
        }

        $validated = $request->validate([
            'module' => 'required|string',
            'department_id' => 'nullable|exists:departments,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'steps' => 'required|array|min:1',
            'steps.*.order' => 'required|integer|min:1',
            'steps.*.role_id' => 'nullable|exists:roles,id',
            'steps.*.user_id' => 'nullable|exists:users,id',
        ]);

        // Additional validation: each step must have either role_id or user_id
        foreach ($validated['steps'] as $index => $step) {
            if (empty($step['role_id']) && empty($step['user_id'])) {
                return back()->withErrors([
                    "steps.{$index}" => 'Each step must have either a role or user assigned.'
                ]);
            }
        }

        $approvalFlow->update([
            'module' => $validated['module'],
            'department_id' => $validated['department_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        // Delete existing steps and create new ones
        $approvalFlow->steps()->delete();

        foreach ($validated['steps'] as $stepData) {
            $approvalFlow->steps()->create([
                'order' => $stepData['order'],
                'role_id' => $stepData['role_id'] ?? null,
                'user_id' => $stepData['user_id'] ?? null,
            ]);
        }

        return redirect()->route('approval-flows.index')
            ->with('success', 'Approval flow updated successfully.');
    }

    public function destroy(Request $request, ApprovalFlow $approvalFlow)
    {
        // Check if user is superadmin
        if (!$request->user()->hasRole(RolesEnum::SUPERADMIN)) {
            return redirect()->route('approval-flows.index')
                ->with('error', 'Unauthorized. Only superadmin users can delete approval flows.');
        }

        $approvalFlow->steps()->delete();
        $approvalFlow->delete();

        return redirect()->route('approval-flows.index')
            ->with('success', 'Approval flow deleted successfully.');
    }

}

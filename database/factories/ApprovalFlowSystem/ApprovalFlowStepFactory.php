<?php

namespace Database\Factories\ApprovalFlowSystem;

use App\Models\ApprovalFlowSystem\ApprovalFlowStep;
use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Spatie\Permission\Models\Role;
use Database\Factories\RoleFactory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApprovalFlowSystem\ApprovalFlowStep>
 */
class ApprovalFlowStepFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ApprovalFlowStep::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'approval_flow_id' => ApprovalFlow::factory(),
            'order' => $this->faker->numberBetween(1, 10),
            'role_id' => null,
            'user_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the step is assigned to a role.
     */
    public function assignedToRole(Role $role = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => $role?->id ?? \Database\Factories\RoleFactory::new()->create()->id,
            'user_id' => null,
        ]);
    }

    /**
     * Indicate that the step is assigned to a user.
     */
    public function assignedToUser(User $user = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => null,
            'user_id' => $user?->id ?? User::factory()->create()->id,
        ]);
    }

    /**
     * Set the order of the step.
     */
    public function order(int $order): static
    {
        return $this->state(fn (array $attributes) => [
            'order' => $order,
        ]);
    }

    /**
     * Indicate that the step belongs to a specific approval flow.
     */
    public function forApprovalFlow(ApprovalFlow $approvalFlow): static
    {
        return $this->state(fn (array $attributes) => [
            'approval_flow_id' => $approvalFlow->id,
        ]);
    }
}
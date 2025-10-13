<?php

namespace Database\Factories\ApprovalFlowSystem;

use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Models\User;
use App\Enums\ModuleName;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApprovalFlowSystem\ApprovalFlow>
 */
class ApprovalFlowFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ApprovalFlow::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(3),
            'module' => $this->faker->randomElement(ModuleName::getValues()),
            'description' => $this->faker->paragraph(),
            'department_id' => null, // Default to null, can be overridden
            'created_by' => User::factory()->create()->id,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the approval flow is for customer application module.
     */
    public function customerApplication(): static
    {
        return $this->state(fn (array $attributes) => [
            'module' => ModuleName::CUSTOMER_APPLICATION,
        ]);
    }

    /**
     * Indicate that the approval flow is for inspection approval module.
     */
    public function inspectionApproval(): static
    {
        return $this->state(fn (array $attributes) => [
            'module' => ModuleName::FOR_INSPECTION_APPROVAL,
        ]);
    }

    /**
     * Indicate that the approval flow has a specific department.
     */
    public function withDepartment(int $departmentId): static
    {
        return $this->state(fn (array $attributes) => [
            'department_id' => $departmentId,
        ]);
    }

    /**
     * Indicate that the approval flow was created by a specific user.
     */
    public function createdBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by' => $user->id,
        ]);
    }

    /**
     * Create approval flow with steps.
     */
    public function withSteps(int $stepCount = 2): static
    {
        return $this->afterCreating(function (ApprovalFlow $approvalFlow) use ($stepCount) {
            \App\Models\ApprovalFlowSystem\ApprovalFlowStep::factory($stepCount)
                ->forApprovalFlow($approvalFlow)
                ->sequence(fn ($sequence) => ['order' => $sequence->index + 1])
                ->create();
        });
    }
}
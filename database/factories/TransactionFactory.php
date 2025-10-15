<?php

namespace Database\Factories;

use App\Enums\ApplicationStatusEnum;
use App\Enums\TransactionStatusEnum;
use App\Models\CustomerApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
        /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'transactionable_type' => $this->faker->optional(0.7)->randomElement([CustomerApplication::class]),
            'transactionable_id' => function (array $attributes) {
                return $attributes['transactionable_type'] ? CustomerApplication::factory() : null;
            },
            'or_number' => 'OR-' . $this->faker->unique()->randomNumber(6, true),
            'or_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'total_amount' => $this->faker->randomFloat(2, 100, 50000),
            'description' => $this->faker->optional()->sentence(),
            'cashier' => $this->faker->optional()->name(),
            'account_number' => $this->faker->optional()->numerify('####-####-####'),
            'account_name' => $this->faker->optional()->name(),
            'meter_number' => $this->faker->optional()->numerify('MTR-########'),
            'meter_status' => $this->faker->optional()->randomElement(['Active', 'Inactive', 'Disconnected']),
            'address' => $this->faker->optional()->address(),
            'ewt' => $this->faker->randomFloat(2, 0, 1000),
            'ft' => $this->faker->randomFloat(2, 0, 500),
            'quantity' => $this->faker->optional()->randomFloat(2, 1, 1000),
            'payment_mode' => $this->faker->randomElement(['Cash', 'Installment', 'Full Payment']),
            'payment_area' => $this->faker->randomElement(['Office', 'Field', 'Online']),
            'status' => $this->faker->optional()->randomElement(TransactionStatusEnum::getValues()),
        ];
    }

    /**
     * Create a transaction specifically for CustomerApplication
     */
    public function forCustomerApplication(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'transactionable_type' => CustomerApplication::class,
                'description' => 'Customer application transaction',
                'payment_mode' => 'Full Payment',
            ];
        });
    }

    /**
     * Create a transaction for CustomerApplication with FOR_COLLECTION status
     */
    public function forCollection(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'transactionable_type' => CustomerApplication::class,
                'transactionable_id' => CustomerApplication::factory()->state([
                    'status' => ApplicationStatusEnum::FOR_COLLECTION
                ]),
                'description' => 'Collection transaction for approved application',
                'payment_mode' => 'Full Payment',
                'status' => TransactionStatusEnum::COMPLETED,
            ];
        });
    }

    /**
     * Create a standalone transaction without any transactionable relationship
     */
    public function standalone(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'transactionable_type' => null,
                'transactionable_id' => null,
                'description' => 'Standalone transaction (miscellaneous payment)',
                'payment_mode' => $this->faker->randomElement(['Cash', 'Check', 'Online Banking']),
                'status' => TransactionStatusEnum::COMPLETED,
            ];
        });
    }
}

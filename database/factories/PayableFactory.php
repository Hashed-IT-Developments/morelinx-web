<?php

namespace Database\Factories;

use App\Models\CustomerApplication;
use App\Models\Payable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payable>
 */
class PayableFactory extends Factory
{
    protected $model = Payable::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalAmountDue = $this->faker->randomFloat(2, 100, 10000);
        $amountPaid = $this->faker->randomFloat(2, 0, $totalAmountDue);
        $balance = $totalAmountDue - $amountPaid;

        return [
            'customer_application_id' => CustomerApplication::exists() 
                ? CustomerApplication::inRandomOrder()->first()->id 
                : CustomerApplication::factory(),
            'customer_payable' => $this->faker->randomElement([
                'Connection Fee',
                'Service Fee',
                'Meter Deposit',
                'Installation Fee',
                'Monthly Bill',
                'Reconnection Fee',
                'Late Payment Fee'
            ]),
            'total_amount_due' => $totalAmountDue,
            'status' => $this->faker->randomElement(['paid', 'unpaid', 'partially_paid', 'overdue']),
            'amount_paid' => $amountPaid,
            'balance' => $balance,
        ];
    }

    /**
     * Create a paid payable state
     */
    public function paid(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'paid',
                'amount_paid' => $attributes['total_amount_due'],
                'balance' => 0,
            ];
        });
    }

    /**
     * Create an unpaid payable state
     */
    public function unpaid(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'unpaid',
                'amount_paid' => 0,
                'balance' => $attributes['total_amount_due'],
            ];
        });
    }

    /**
     * Create a partially paid payable state
     */
    public function partiallyPaid(): static
    {
        return $this->state(function (array $attributes) {
            $amountPaid = $this->faker->randomFloat(2, 1, $attributes['total_amount_due'] - 1);
            return [
                'status' => 'partially_paid',
                'amount_paid' => $amountPaid,
                'balance' => $attributes['total_amount_due'] - $amountPaid,
            ];
        });
    }
}
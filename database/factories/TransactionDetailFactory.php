<?php

namespace Database\Factories;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TransactionDetail>
 */
class TransactionDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 10, 5000);
        $quantity = $this->faker->randomFloat(2, 1, 100);
        
        return [
            'transaction_id' => Transaction::factory(),
            'transaction' => $this->faker->randomElement([
                'Service Connection Fee',
                'Monthly Bill',
                'Reconnection Fee',
                'Meter Deposit',
                'Application Fee',
                'Installation Fee',
                'Late Payment Charge'
            ]),
            'amount' => $amount,
            'unit' => $this->faker->optional()->randomElement(['kWh', 'pcs', 'month', 'day']),
            'quantity' => $this->faker->optional($weight = 0.8)->passthrough($quantity),
            'total_amount' => $amount * ($quantity ?? 1),
            'gl_code' => $this->faker->optional()->numerify('GL-####'),
            'transaction_code' => $this->faker->optional()->numerify('TXN-####'),
            'bill_month' => $this->faker->optional()->date('Y-m'),
        ];
    }
}

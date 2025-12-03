<?php

namespace Database\Factories;

use App\Models\Payable;
use App\Models\PayablesDefinition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PayablesDefinition>
 */
class PayablesDefinitionFactory extends Factory
{
    protected $model = PayablesDefinition::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $transactionTypes = [
            ['name' => 'Connection Fee', 'code' => 'CONN'],
            ['name' => 'Service Drop Installation', 'code' => 'SDI'],
            ['name' => 'Meter Installation', 'code' => 'MI'],
            ['name' => 'Transformer Installation', 'code' => 'TI'],
            ['name' => 'Line Extension', 'code' => 'LE'],
            ['name' => 'Pole Installation', 'code' => 'PI'],
            ['name' => 'Inspection Fee', 'code' => 'IF'],
            ['name' => 'Processing Fee', 'code' => 'PF'],
            ['name' => 'Meter Deposit', 'code' => 'MD'],
            ['name' => 'Reconnection Fee', 'code' => 'RF'],
        ];

        $transaction = $this->faker->randomElement($transactionTypes);
        $quantity = $this->faker->numberBetween(1, 10);
        $amount = $this->faker->randomFloat(2, 50, 2000);
        $totalAmount = $quantity * $amount;

        return [
            'payable_id' => Payable::exists() 
                ? Payable::inRandomOrder()->first()->id 
                : Payable::factory(),
            'transaction_name' => $transaction['name'],
            'transaction_code' => $transaction['code'],
            'billing_month' => $this->faker->dateTimeBetween('-12 months', '+1 month')->format('Y-m-d'),
            'quantity' => $quantity,
            'unit' => $this->faker->randomElement(['piece', 'meter', 'set', 'lot', 'each', 'unit']),
            'amount' => $amount,
            'total_amount' => $totalAmount,
        ];
    }

    /**
     * Create a connection fee definition
     */
    public function connectionFee(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'transaction_name' => 'Connection Fee',
                'transaction_code' => 'CONN',
                'quantity' => 1,
                'unit' => 'set',
                'amount' => $this->faker->randomFloat(2, 500, 2000),
            ];
        });
    }

    /**
     * Create a meter installation definition
     */
    public function meterInstallation(): static
    {
        return $this->state(function (array $attributes) {
            $amount = $this->faker->randomFloat(2, 300, 800);
            return [
                'transaction_name' => 'Meter Installation',
                'transaction_code' => 'MI',
                'quantity' => 1,
                'unit' => 'piece',
                'amount' => $amount,
                'total_amount' => $amount,
            ];
        });
    }

    /**
     * Create a service drop installation definition
     */
    public function serviceDropInstallation(): static
    {
        return $this->state(function (array $attributes) {
            $quantity = $this->faker->numberBetween(10, 50);
            $amount = $this->faker->randomFloat(2, 25, 75);
            return [
                'transaction_name' => 'Service Drop Installation',
                'transaction_code' => 'SDI',
                'quantity' => $quantity,
                'unit' => 'meter',
                'amount' => $amount,
                'total_amount' => $quantity * $amount,
            ];
        });
    }
}
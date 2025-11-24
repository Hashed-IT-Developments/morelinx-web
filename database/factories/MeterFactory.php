<?php

namespace Database\Factories;

use App\Models\CustomerAccount;
use App\Models\CustomerApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Meter>
 */
class MeterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_application_id' => CustomerApplication::factory(),
            'meter_serial_number' => $this->faker->unique()->numerify('MTR-######'),
            'meter_brand' => $this->faker->randomElement(['Siemens', 'Schneider', 'ABB', 'GE']),
            'seal_number' => $this->faker->unique()->numerify('SEAL-######'),
            'erc_seal' => $this->faker->unique()->numerify('ERC-######'),
            'more_seal' => $this->faker->optional()->numerify('MORE-######'),
            'multiplier' => $this->faker->randomElement([1, 10, 20, 40, 80, 160]),
            'voltage' => $this->faker->randomFloat(2, 110, 600),
            'initial_reading' => $this->faker->randomFloat(2, 0, 99999),
            'type' => $this->faker->randomElement(['Digital', 'Analog', 'Smart']),
        ];
    }
}

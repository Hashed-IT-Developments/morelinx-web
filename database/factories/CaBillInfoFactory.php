<?php

namespace Database\Factories;

use App\Models\Barangay;
use App\Models\CustomerApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CaBillInfo>
 */
class CaBillInfoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_application_id' => CustomerApplication::inRandomOrder()->value('id') ?? CustomerApplication::factory(),
            'barangay_id' => Barangay::inRandomOrder()->value('id') ?? Barangay::factory(),
            'subdivision' => $this->faker->word(),
            'street' => $this->faker->streetName(),
            'unit_no' => $this->faker->buildingNumber(),
            'building' => $this->faker->company(),
            'delivery_mode' => $this->faker->randomElement(['Email', 'Postal', 'Pickup', 'SMS']),
        ];
    }
}

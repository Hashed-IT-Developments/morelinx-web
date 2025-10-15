<?php

namespace Database\Factories;

use App\Enums\InspectionStatusEnum;
use App\Models\CustomerApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustApplnInspection>
 */
class CustApplnInspectionFactory extends Factory
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
            'status' => InspectionStatusEnum::FOR_INSPECTION,
            'house_loc' => $this->faker->optional()->latitude() . ',' . $this->faker->optional()->longitude(),
            'meter_loc' => $this->faker->optional()->latitude() . ',' . $this->faker->optional()->longitude(),
            'bill_deposit' => $this->faker->randomFloat(2, 100, 2000),
            'remarks' => $this->faker->optional()->sentence(),
        ];
    }
}

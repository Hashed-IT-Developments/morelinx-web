<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Barangay>
 */
class BarangayFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->streetName;
        
        return [
            'name' => $name,
            'town_id' => \App\Models\Town::factory(),
            'alias' => strtoupper(fake()->unique()->lexify('???')),
        ];
    }
}

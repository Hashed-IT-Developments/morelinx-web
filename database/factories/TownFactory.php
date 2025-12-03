<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Town>
 */
class TownFactory extends Factory
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
            'district' => fake()->numberBetween(1, 20),
            'feeder' =>  fake()->citySuffix,
            'du_tag' => \App\Enums\DUEnum::getRandomValue(),
            'alias' => strtoupper(fake()->unique()->lexify('???')),
        ];
    }
}

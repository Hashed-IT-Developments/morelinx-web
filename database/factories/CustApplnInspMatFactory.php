<?php

namespace Database\Factories;

use App\Models\CustApplnInspection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustApplnInspMat>
 */
class CustApplnInspMatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $materials = [
            ['name' => 'Wire', 'unit' => 'meters'],
            ['name' => 'Pipe', 'unit' => 'pieces'],
            ['name' => 'Cable', 'unit' => 'meters'],
            ['name' => 'Connector', 'unit' => 'pieces'],
            ['name' => 'Socket', 'unit' => 'pieces'],
            ['name' => 'Switch', 'unit' => 'pieces'],
            ['name' => 'Breaker', 'unit' => 'pieces'],
            ['name' => 'Conduit', 'unit' => 'meters'],
        ];

        $material = $this->faker->randomElement($materials);

        return [
            'cust_appln_inspection_id' => CustApplnInspection::inRandomOrder()->value('id') ?? CustApplnInspection::factory(),
            'material_name' => $material['name'],
            'quantity' => $this->faker->numberBetween(1, 50),
            'unit' => $material['unit'],
            'amount' => $this->faker->randomFloat(2, 50, 500),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\CaContactInfo;
use App\Models\CustomerApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

class CaContactInfoFactory extends Factory
{
    protected $model = CaContactInfo::class;

    public function definition(): array
    {
        return [
            'customer_application_id' => CustomerApplication::inRandomOrder()->value('id') ?? CustomerApplication::factory(),
            'last_name' => $this->faker->lastName(),
            'first_name' => $this->faker->firstName(),
            'middle_name' => $this->faker->firstName(),
            'relation' => $this->faker->randomElement([
                'Spouse',
                'Parent',
                'Sibling',
                'Child',
            ]),
        ];
    }
}

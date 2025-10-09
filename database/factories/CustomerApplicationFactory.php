<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerApplication>
 */
class CustomerApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'account_number' => $this->faker->unique()->numerify('ACC#######'),
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'middle_name' => $this->faker->optional()->firstName,
            'suffix' => $this->faker->optional()->suffix,
            'birth_date' => $this->faker->date('Y-m-d', '-18 years'),
            'nationality' => $this->faker->country,
            'gender' => $this->faker->randomElement(['male', 'female']),
            'marital_status' => $this->faker->randomElement(['single', 'married', 'widowed', 'divorced']),
            'barangay_id' => \App\Models\Barangay::factory(),
            'sitio' => $this->faker->optional()->word,
            'unit_no' => $this->faker->optional()->buildingNumber,
            'building' => $this->faker->optional()->company,
            'street' => $this->faker->optional()->streetName,
            'subdivision' => $this->faker->optional()->word,
            'district' => $this->faker->numberBetween(1, 10),
            'block' => $this->faker->optional()->word,
            'route' => $this->faker->optional()->word,
            'id_type_1' => $this->faker->randomElement(['National ID (PhilSys)', "Driver's License", 'Passport']),
            'id_number_1' => $this->faker->bothify('ID#######'),
            'customer_type_id' => \App\Models\CustomerType::factory(),
            'connected_load' => $this->faker->randomFloat(2, 1, 100),
            'email_address' => $this->faker->optional()->safeEmail,
            'contact_numbers' => $this->faker->optional()->phoneNumber,
            'telephone_numbers' => $this->faker->optional()->phoneNumber,
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
        ];
    }
}

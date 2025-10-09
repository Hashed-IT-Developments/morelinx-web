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
        $idTypes = ['National ID (PhilSys)', "Driver's License", 'Passport', 'SSS', 'TIN', 'Voter ID'];
        $primaryIdType = $this->faker->randomElement(array_slice($idTypes, 0, 3));
        $secondaryIdType = $this->faker->optional(0.7)->randomElement(array_slice($idTypes, 3));

        return [
            'account_number' => $this->faker->unique()->numerify('ACC#######'),
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'middle_name' => $this->faker->optional(0.8)->firstName,
            'suffix' => $this->faker->optional(0.1)->suffix,
            'birth_date' => $this->faker->date('Y-m-d', '-18 years'),
            'nationality' => $this->faker->country,
            'gender' => $this->faker->randomElement(['male', 'female']),
            'marital_status' => $this->faker->randomElement(['single', 'married', 'widowed', 'divorced']),
            'barangay_id' => null, // Will be set by the command
            'sitio' => $this->faker->optional(0.6)->word,
            'unit_no' => $this->faker->optional(0.3)->buildingNumber,
            'building' => $this->faker->optional(0.2)->company,
            'street' => $this->faker->optional(0.7)->streetName,
            'subdivision' => $this->faker->optional(0.4)->word,
            'district' => $this->faker->numberBetween(1, 10),
            'block' => $this->faker->optional(0.3)->word,
            'route' => $this->faker->optional(0.3)->word,
            'id_type_1' => $primaryIdType,
            'id_number_1' => strtoupper($this->faker->bothify('ID###??')),
            'id_type_2' => $secondaryIdType,
            'id_number_2' => $secondaryIdType ? $this->faker->bothify('ID###??') : null,
            'customer_type_id' => null, // Will be set by the command
            'connected_load' => $this->faker->randomFloat(2, 1, 100),
            'email_address' => $this->faker->optional(0.8)->safeEmail(),
            'tel_no_1' => $this->faker->optional(0.4)->phoneNumber(),
            'mobile_1' => $this->faker->phoneNumber(),
            'is_sc' => $this->faker->boolean(10),
            'sc_from' => $this->faker->optional(0.1)->date(),
            'sc_number' => $this->faker->optional(0.1)->bothify('SC####'),
            'property_ownership' => $this->faker->randomElement(['owned', 'rented']),
            'sketch_lat_long' => $this->faker->optional(0.5)->latitude() . ',' . $this->faker->optional(0.5)->longitude(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'inactive']),
        ];
    }
}

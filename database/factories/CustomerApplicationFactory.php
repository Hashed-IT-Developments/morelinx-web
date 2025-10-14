<?php

namespace Database\Factories;

use App\Enums\ApplicationStatusEnum;
use App\Models\Barangay;
use App\Models\CustomerType;
use Database\Seeders\CustomerTypeSeeder;
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
        $customerTypeIds = CustomerType::pluck('id')->toArray();

        if(empty($customerTypeIds)) {
            (new CustomerTypeSeeder())->run();
            $customerTypeIds = CustomerType::pluck('id')->toArray();
        }

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
            'barangay_id' => Barangay::exists() ? Barangay::inRandomOrder()->first()->id : Barangay::factory(),
            'sitio' => $this->faker->optional(0.6)->word,
            'unit_no' => $this->faker->optional(0.3)->buildingNumber,
            'building' => $this->faker->optional(0.2)->company,
            'street' => $this->faker->optional(0.7)->streetName,
            'subdivision' => $this->faker->optional(0.4)->word,
            'district_id' => \App\Models\District::inRandomOrder()->value('id'),
            'block' => $this->faker->optional(0.3)->word,
            'route' => $this->faker->optional(0.3)->word,
            'id_type_1' => $primaryIdType,
            'id_number_1' => strtoupper($this->faker->bothify('ID###??')),
            'id_type_2' => $secondaryIdType,
            'id_number_2' => $secondaryIdType ? $this->faker->bothify('ID###??') : null,
            'customer_type_id' => $this->faker->randomElement($customerTypeIds),
            'connected_load' => $this->faker->randomFloat(2, 1, 100),
            'email_address' => $this->faker->optional(0.8)->safeEmail(),
            'tel_no_1' => $this->faker->optional(0.4)->phoneNumber(),
            'mobile_1' => $this->faker->phoneNumber(),
            'is_sc' => $this->faker->boolean(10),
            'sc_from' => $this->faker->optional(0.1)->date(),
            'sc_number' => $this->faker->optional(0.1)->bothify('SC####'),
            'cp_last_name'=> $this->faker->lastName,
            'cp_first_name'=> $this->faker->firstName,
            'cp_middle_name'=> $this->faker->lastName,
            'cp_relation'=>$this->faker->randomElement([
                'Spouse',
                'Parent',
                'Sibling',
                'Child',
            ]),
            'property_ownership' => $this->faker->randomElement(['owned', 'rented']),
            'sketch_lat_long' => $this->faker->optional(0.5)->latitude() . ',' . $this->faker->optional(0.5)->longitude(),
            'status' => $this->faker->randomElement(ApplicationStatusEnum::getValues()),
        ];
    }
}

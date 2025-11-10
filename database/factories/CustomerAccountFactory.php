<?php

namespace Database\Factories;

use App\Models\Barangay;
use App\Models\CustomerType;
use App\Models\CustomerApplication;
use App\Models\District;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerAccount>
 */
class CustomerAccountFactory extends Factory
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
            'account_number' => $this->faker->unique()->numerify('ACC#######'),
            'account_name' => $this->faker->name(),
            'barangay_id' => Barangay::exists() ? Barangay::inRandomOrder()->first()->id : Barangay::factory(),
            'district_id' => District::exists() ? District::inRandomOrder()->first()->id : District::factory(),
            'route_id' => null,
            'block' => $this->faker->optional(0.3)->word,
            'customer_type_id' => CustomerType::exists() ? CustomerType::inRandomOrder()->first()->id : CustomerType::factory(),
            'account_status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
            'contact_number' => $this->faker->phoneNumber(),
            'email_address' => $this->faker->optional(0.6)->safeEmail(),
            'user_id' => User::exists() ? User::inRandomOrder()->first()->id : null,
            'is_sc' => $this->faker->boolean(10), // 10% chance of senior citizen
            'is_isnap' => $this->faker->boolean(5), // 5% chance of ISNAP
            'sc_date_applied' => $this->faker->optional(0.1)->date(),
            'house_number' => $this->faker->optional(0.7)->buildingNumber(),
            'meter_loc' => $this->faker->optional(0.5)->word(),
        ];
    }
}

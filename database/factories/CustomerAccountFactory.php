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
        // Build a code from Town alias + Barangay alias when possible
        $barangay = Barangay::exists() ? Barangay::inRandomOrder()->with('town')->first() : null;
        $townAlias = $barangay?->town?->alias ?? '';
        $barangayAlias = $barangay?->alias ?? '';
        $code = strtoupper($townAlias . $barangayAlias);

        // Use the model helper to get a next series number (gap-filling). If no DB available, fallback to random >=10000
        $series = null;
        try {
            $series = \App\Models\CustomerAccount::getNextSeriesNumber();
        } catch (\Throwable $e) {
            $series = 10000 + $this->faker->unique()->numberBetween(0, 99999);
        }

        return [
            'customer_application_id' => CustomerApplication::factory(),
            'code' => $code ?: null,
            'series_number' => $series,
            'account_number' => ($code ? $code : '') . $series,
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

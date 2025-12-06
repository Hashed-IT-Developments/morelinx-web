<?php

namespace Database\Factories;

use App\Enums\AccountStatusEnum;
use App\Models\Barangay;
use App\Models\CustomerAccount;
use App\Models\CustomerType;
use App\Models\CustomerApplication;
use App\Models\District;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;


class CustomerAccountFactory extends Factory
{
       public function definition(): array
    {
        $statuses = AccountStatusEnum::getValues();
       
        $barangay = Barangay::exists() ? Barangay::inRandomOrder()->with('town')->first() : null;
        $townAlias = $barangay?->town?->alias ?? '';
        $barangayAlias = $barangay?->alias ?? '';
        $code = strtoupper($townAlias . $barangayAlias);

       
        try {
            $series = CustomerAccount::getNextSeriesNumber();
        } catch (\Throwable $e) {
            $series = 10000 + $this->faker->unique()->numberBetween(0, 99999);
        }

        return [
            'customer_application_id' => CustomerApplication::factory(),
            'code' => $code ?: null,
            'series_number' => $series,
            'account_number' => ($code ? $code : '') . $series,
            'account_name' => function (array $attributes) {
                $application = CustomerApplication::find($attributes['customer_application_id']);
                return $application ? $application->name : $this->faker->name();
            },
            'barangay_id' => function (array $attributes) {
                $application = CustomerApplication::find($attributes['customer_application_id']);
                return $application->barangay_id;
            },
            'district_id' => function (array $attributes) {
                $application = CustomerApplication::find($attributes['customer_application_id']);
                return $application->district_id;
            },
            'route_id' => null,
            'block' => $this->faker->optional(0.3)->word,
            'customer_type_id' => CustomerType::exists() ? CustomerType::inRandomOrder()->first()->id : CustomerType::factory(),
            'account_status' => $this->faker->randomElement($statuses),
            'contact_number' => $this->faker->phoneNumber(),
            'email_address' => $this->faker->optional(0.6)->safeEmail(),
            'user_id' => User::exists() ? User::inRandomOrder()->first()->id : null,
            'is_sc' => $this->faker->boolean(10),
            'is_isnap' => $this->faker->boolean(5), 
            'sc_date_applied' => $this->faker->optional(0.1)->date(),
            'house_number' => $this->faker->optional(0.7)->buildingNumber(),
            'meter_loc' => $this->faker->optional(0.5)->word(),
        ];
    }
}

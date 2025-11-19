<?php

namespace Database\Factories;

use App\Models\CustomerApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerEnergization>
 */
class CustomerEnergizationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_application_id'   => CustomerApplication::factory(),
            'status'                    => $this->faker->randomElement(['pending', 'completed', 'in_progress', 'cancelled']),
            'team_assigned'             => User::factory(),
            'service_connection'        => $this->faker->randomElement(['Temporary', 'Permanent', 'Emergency', 'Reconnection']),
            'action_taken'              => $this->faker->randomElement(['Installation', 'Repair', 'Inspection', 'Replacement', 'Maintenance']),
            'remarks'                   => $this->faker->optional()->sentence(),
            'time_of_arrival'           => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
            'date_installed'            => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
            'transformer_owned'         => $this->faker->randomElement(['Company Owned', 'Customer Owned', 'Rental', 'Shared']),
            'transformer_rating'        => $this->faker->randomElement(['15 kVA', '25 kVA', '50 kVA', '100 kVA', '250 kVA']),
            'ct_serial_number'          => 'CT' . $this->faker->unique()->numerify('######'),
            'ct_brand_name'             => $this->faker->randomElement(['Siemens', 'Schneider Electric', 'ABB', 'GE', 'Eaton']),
            'ct_ratio'                  => $this->faker->randomElement(['100:5', '200:5', '300:5', '400:5', '500:5']),
            'pt_serial_number'          => 'PT' . $this->faker->unique()->numerify('######'),
            'pt_brand_name'             => $this->faker->randomElement(['Siemens', 'Schneider Electric', 'ABB', 'GE', 'Eaton']),
            'pt_ratio'                  => $this->faker->randomElement(['10:1', '20:1', '30:1', '40:1', '50:1']),
            'team_executed'             => User::factory(),
            'archive'                   => $this->faker->boolean(10),
        ];
    }
}

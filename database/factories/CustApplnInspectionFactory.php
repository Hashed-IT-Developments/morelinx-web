<?php

namespace Database\Factories;

use App\Enums\InspectionStatusEnum;
use App\Enums\RolesEnum;
use App\Models\CustomerApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustApplnInspection>
 */
class CustApplnInspectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = array_diff(InspectionStatusEnum::getValues(), [
            InspectionStatusEnum::REJECTED,
            InspectionStatusEnum::DISAPPROVED
        ]);


        // schedule_date: Faker optional may return null; handle it safely
        $schedule = $this->faker->optional()->dateTimeBetween('now', '+30 days');
        $scheduleDate = $schedule ? $schedule->format('Y-m-d') : null;

        // house and meter coordinates: only include when both lat & lng exist
        $houseLat = $this->faker->optional()->latitude();
        $houseLng = $this->faker->optional()->longitude();
        $houseLoc = ($houseLat !== null && $houseLng !== null) ? "{$houseLat},{$houseLng}" : null;

        $meterLat = $this->faker->optional()->latitude();
        $meterLng = $this->faker->optional()->longitude();
        $meterLoc = ($meterLat !== null && $meterLng !== null) ? "{$meterLat},{$meterLng}" : null;

        return [
            'customer_application_id'   => CustomerApplication::inRandomOrder()->value('id') ?? CustomerApplication::factory(),
            'inspector_id'              => null,
            'status'                    => $this->faker->randomElement($statuses),
            'house_loc'                 => $houseLoc,
            'meter_loc'                 => $meterLoc,
            'schedule_date'             => $scheduleDate,
            'sketch_loc'                => $this->faker->optional()->url(),
            'near_meter_serial_1'       => $this->faker->optional()->bothify('MTR-#####-??'),
            'near_meter_serial_2'       => $this->faker->optional()->bothify('MTR-#####-??'),
            'user_id'                   => User::inRandomOrder()->value('id'),
            'inspection_time'           => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
            'bill_deposit'              => $this->faker->randomFloat(2, 100, 5000),
            'labor_cost'                => $this->faker->randomFloat(2, 50, 2000),
            'feeder'                    => $this->faker->optional()->randomElement(['Main Feeder A', 'Secondary Feeder B', 'Primary Feeder C', 'Rural Feeder D']),
            'meter_type'                => $this->faker->optional()->randomElement(['Digital', 'Analog', 'Smart Meter']),
            'service_drop_size'         => $this->faker->optional()->randomElement(['40A', '60A', '100A', '200A']),
            'protection'                => $this->faker->optional()->randomElement(['Circuit Breaker', 'Fuse', 'Surge Protector']),
            'meter_class'               => $this->faker->optional()->randomElement(['Class 0.5', 'Class 1', 'Class 2']),
            'connected_load'            => $this->faker->optional()->randomElement(['5 kW', '8 kW', '15 kW', '25 kW']),
            'transformer_size'          => $this->faker->optional()->randomElement(['10 kVA', '15 kVA', '25 kVA', '50 kVA']),
            'remarks'                   => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the inspection is for inspection (no inspector assigned yet).
     *
     * @return static
     */
    public function forInspection(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InspectionStatusEnum::FOR_INSPECTION,
            'inspector_id' => null,
            'inspection_time' => null,
        ]);
    }

    /**
     * Indicate that the inspection is for inspection approval (inspector assigned).
     *
     * @return static
     */
    public function forInspectionApproval(): static
    {
        return $this->state(function (array $attributes) {
            // Get a user with the inspector role
            $inspector = User::role(RolesEnum::INSPECTOR)->inRandomOrder()->first();
            
            // Schedule date: now or 2-3 days ago
            $scheduleDateTime = $this->faker->dateTimeBetween('-3 days', 'now');
            $scheduleDate = $scheduleDateTime->format('Y-m-d');
            
            return [
                'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
                'inspector_id' => $inspector?->id ?? User::factory()->create()->assignRole(RolesEnum::INSPECTOR)->id,
                'schedule_date' => $scheduleDate,
                'inspection_time' => $this->faker->dateTimeBetween('-30 days', 'now'),
            ];
        });
    }
}

<?php

namespace Database\Factories;

use App\Models\Route;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReadingSchedule>
 */
class ReadingScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'route_id'              => Route::factory(),
            'reading_date'          => fake()->dayOfMonth(),
            'active_accounts'       => fake()->numberBetween(0, 500),
            'disconnected_accounts' => fake()->numberBetween(0, 50),
            'total_accounts'        => fake()->numberBetween(0, 550),
            'meter_reader_id'       => User::factory(),
            'billing_month'         => now()->format('Y-m'),
        ];
    }
}

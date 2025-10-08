<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerType>
 */
class CustomerTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $rateClasses = ['Residential', 'Commercial', 'Industrial', 'Government'];
        $customerTypes = [
            'Residential' => ['Single Family', 'Apartment', 'Condominium'],
            'Commercial' => ['Retail', 'Office', 'Restaurant', 'Shopping Mall'],
            'Industrial' => ['Manufacturing', 'Warehouse', 'Factory'],
            'Government' => ['Municipal', 'Provincial', 'National']
        ];

        $rateClass = $this->faker->randomElement($rateClasses);
        $customerType = $this->faker->randomElement($customerTypes[$rateClass]);

        return [
            'rate_class' => $rateClass,
            'customer_type' => $customerType,
        ];
    }
}
<?php

namespace Database\Factories;

use App\Enums\PaymentTypeEnum;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaymentType>
 */
class PaymentTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $paymentType = $this->faker->randomElement(PaymentTypeEnum::getValues());
        
        return [
            'transaction_id' => Transaction::factory(),
            'payment_type' => $paymentType,
            'amount' => $this->faker->randomFloat(2, 100, 10000),
            'bank' => $this->shouldHaveBank($paymentType) ? $this->faker->company() . ' Bank' : null,
            'check_number' => $paymentType === PaymentTypeEnum::CHECK ? $this->faker->numerify('CHK-######') : null,
            'check_issue_date' => $paymentType === PaymentTypeEnum::CHECK ? $this->faker->dateTimeBetween('now', '+1 year') : null,
            'bank_transaction_number' => $this->shouldHaveBankTxn($paymentType) ? $this->faker->numerify('BNK-############') : null,
        ];
    }

    /**
     * Determine if payment type should have bank information
     */
    private function shouldHaveBank(string $paymentType): bool
    {
        return in_array($paymentType, [
            PaymentTypeEnum::CHECK,
            PaymentTypeEnum::BANK_TRANSFER,
            PaymentTypeEnum::ONLINE_BANKING,
            PaymentTypeEnum::BANK_DRAFT
        ]);
    }

    /**
     * Determine if payment type should have bank transaction number
     */
    private function shouldHaveBankTxn(string $paymentType): bool
    {
        return in_array($paymentType, [
            PaymentTypeEnum::BANK_TRANSFER,
            PaymentTypeEnum::ONLINE_BANKING,
            PaymentTypeEnum::CREDIT_CARD,
            PaymentTypeEnum::DEBIT_CARD,
            PaymentTypeEnum::GCASH,
            PaymentTypeEnum::PAYMAYA,
            PaymentTypeEnum::PAYPAL
        ]);
    }
}

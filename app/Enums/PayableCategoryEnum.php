<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * Payable Category Enum - Categorizes payables by business context
 * 
 * This helps distinguish payables based on their purpose:
 * - ENERGIZATION: Initial connection payables (Bill Deposit, Material Cost, Labor Cost)
 * - MONTHLY_BILLING: Regular monthly consumption bills
 * - RECONNECTION: Fees related to service reconnection
 * - ISNAP: ISNAP-related payables
 * - OTHER: Miscellaneous payables
 * 
 * @method static static ENERGIZATION()
 * @method static static MONTHLY_BILLING()
 * @method static static RECONNECTION()
 * @method static static ISNAP()
 * @method static static OTHER()
 */
final class PayableCategoryEnum extends Enum
{
    const ENERGIZATION = 'energization';
    const MONTHLY_BILLING = 'monthly_billing';
    const RECONNECTION = 'reconnection';
    const ISNAP = 'isnap';
    const OTHER = 'other';

    /**
     * Get display label for this category
     */
    public function getLabel(): string
    {
        $labels = [
            self::ENERGIZATION => 'Energization',
            self::MONTHLY_BILLING => 'Monthly Billing',
            self::RECONNECTION => 'Reconnection',
            self::ISNAP => 'ISNAP',
            self::OTHER => 'Other',
        ];

        return $labels[$this->value] ?? ucwords(str_replace('_', ' ', $this->value));
    }

    /**
     * Get detailed description for this category
     */
    public function getDetailedDescription(): string
    {
        $descriptions = [
            self::ENERGIZATION => 'Initial connection payables (Bill Deposit, Material Cost, Labor Cost)',
            self::MONTHLY_BILLING => 'Regular monthly consumption bills',
            self::RECONNECTION => 'Service reconnection related fees',
            self::ISNAP => 'ISNAP program related payables',
            self::OTHER => 'Miscellaneous payables',
        ];

        return $descriptions[$this->value] ?? '';
    }
}

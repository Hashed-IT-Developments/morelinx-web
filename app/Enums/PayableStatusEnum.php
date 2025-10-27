<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * Payable Status Enum - Represents the payment status of a payable
 * 
 * @method static static UNPAID()
 * @method static static PARTIALLY_PAID()
 * @method static static PAID()
 * @method static static CANCELLED()
 * @method static static REFUNDED()
 */
final class PayableStatusEnum extends Enum
{
    const UNPAID = 'unpaid';
    const PARTIALLY_PAID = 'partially_paid';
    const PAID = 'paid';
    const CANCELLED = 'cancelled';
    const REFUNDED = 'refunded';

    /**
     * Get a friendly description for each status
     */
    public static function getDescription($value): string
    {
        return match($value) {
            self::UNPAID => 'Unpaid - No payment has been made',
            self::PARTIALLY_PAID => 'Partially Paid - Some payment has been made, but not the full amount',
            self::PAID => 'Paid - Fully paid',
            self::CANCELLED => 'Cancelled - Payment obligation has been cancelled',
            self::REFUNDED => 'Refunded - Payment was refunded',
            default => parent::getDescription($value),
        };
    }

    /**
     * Get color code for UI display
     */
    public static function getColor($value): string
    {
        return match($value) {
            self::UNPAID => 'red',
            self::PARTIALLY_PAID => 'yellow',
            self::PAID => 'green',
            self::CANCELLED => 'gray',
            self::REFUNDED => 'blue',
            default => 'gray',
        };
    }
}

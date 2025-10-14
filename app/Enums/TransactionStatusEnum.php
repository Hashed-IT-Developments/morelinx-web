<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static PENDING()
 * @method static static COMPLETED()
 * @method static static CANCELLED()
 * @method static static PROCESSING()
 * @method static static FAILED()
 * @method static static REFUNDED()
 * @method static static PARTIALLY_PAID()
 */
final class TransactionStatusEnum extends Enum
{
    const PENDING = 'pending';
    const COMPLETED = 'completed';
    const CANCELLED = 'cancelled';
    const PROCESSING = 'processing';
    const FAILED = 'failed';
    const REFUNDED = 'refunded';
    const PARTIALLY_PAID = 'partially_paid';
}
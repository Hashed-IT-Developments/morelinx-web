<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static PENDING()
 * @method static static ONGOING()
 * @method static static EXECUTED()
 * @method static static NOT_EXECUTED()
 * @method static static COMPLETED()
 * @method static static CANCELLED()
 */
final class TicketStatusEnum extends Enum
{
    const PENDING       = 'pending';
    const ONGOING       = 'ongoing';
    const EXECUTED      = 'executed';
    const NOT_EXECUTED  = 'not_executed';
    const COMPLETED     = 'completed';
    const CANCELLED     = 'cancelled';

}

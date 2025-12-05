<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static PENDING()
 * @method static static ONGOING()
 * @method static static RESOLVED()
 * @method static static UNRESOLVED()
 * @method static static COMPLETED()
 * @method static static CANCELLED()
 */
final class TicketStatusEnum extends Enum
{
    const PENDING       = 'pending';
    const ONGOING       = 'ongoing';
    const RESOLVED      = 'resolved';
    const UNRESOLVED    = 'unresolved';
    const COMPLETED     = 'completed';
    const CANCELLED     = 'cancelled';

}

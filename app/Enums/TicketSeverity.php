<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static RESIDENTIAL()
 * @method static static COMMERCIAL()
 * @method static static GOVERNMENT()
 * @method static static STREETLIGHT()
 */
final class TicketSeverity extends Enum
{
    const LOW = 'low';
    const MEDIUM = 'medium';
    const HIGH = 'high';
    const CRITICAL = 'critical';
    
}

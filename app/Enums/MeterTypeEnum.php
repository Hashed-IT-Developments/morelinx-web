<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static CL1()
 * @method static static LINE_SYNC()
 * @method static static THREE_PHASE()
 */
final class MeterTypeEnum extends Enum
{
    const CL1 = "CL1";
    const LINE_SYNC = "Line-Sync";
    const THREE_PHASE = "3-Phase";
}

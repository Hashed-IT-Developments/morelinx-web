<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static SINGLE()
 * @method static static THREE()
 */
final class MeterClassEnum extends Enum
{
    const SINGLE = "Single-Phase";
    const THREE = "Three-Phase";
}

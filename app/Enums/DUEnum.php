<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static BLCI()
 * @method static static NEPC()
 * @method static static MEPC()
 */
final class DUEnum extends Enum
{
    const BLCI = 'blci';
    const NEPC = 'nepc';
    const MEPC = 'mepc';
}

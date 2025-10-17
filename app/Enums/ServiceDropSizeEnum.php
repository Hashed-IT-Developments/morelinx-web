<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static TWO()
 * @method static static FOUR()
 * @method static static SIX()
 * @method static static TEN()
 * @method static static FOURTEEN()
 * @method static static TWENTY()
 */
final class ServiceDropSizeEnum extends Enum
{
    const TWO = 2;
    const FOUR = 4;
    const SIX = 6;
    const TEN = 10;
    const FOURTEEN = 14;
    const TWENTY = 20;
}

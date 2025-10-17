<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static TEN()
 * @method static static FIFTEEN()
 * @method static static TWENTY()
 * @method static static THIRTY()
 * @method static static FORTY()
 * @method static static FIFTY()
 * @method static static SIXTY()
 * @method static static ONE_HUNDRED()
 */
final class ProtectionEnum extends Enum
{
    const TEN = "10A";
    const FIFTEEN = "15A";
    const TWENTY = "20A";
    const THIRTY = "30A";
    const FORTY = "40A";
    const FIFTY = "50A";
    const SIXTY = "60A";
    const ONE_HUNDRED = "100A";
}

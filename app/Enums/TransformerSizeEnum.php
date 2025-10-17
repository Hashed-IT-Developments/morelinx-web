<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static FIVE()
 * @method static static TEN()
 * @method static static FIFTEEN()
 * @method static static TWENTY()
 * @method static static TWENTY_FIVE()
 * @method static static THIRTY_SEVEN_POINT_FIVE()
 * @method static static SEVENTY_FIVE()
 * @method static static ONE_HUNDRED()
 */
final class TransformerSizeEnum extends Enum
{
    const FIVE = "5kva";
    const TEN = "10kva";
    const FIFTEEN = "15kva";
    const TWENTY = "20kva";
    const TWENTY_FIVE = "25kva";
    const THIRTY_SEVEN_POINT_FIVE = "37.5kva";
    const SEVENTY_FIVE = "75kva";
    const ONE_HUNDRED = "100kva";
}

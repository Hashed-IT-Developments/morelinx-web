<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static RESIDENTIAL()
 * @method static static COMMERCIAL()
 * @method static static GOVERNMENT()
 * @method static static STREETLIGHT()
 */
final class RateClass extends Enum
{
    const RESIDENTIAL = 'residential';
    const COMMERCIAL = 'commercial';
    const GOVERNMENT = 'government';
    const STREETLIGHT = 'streetlight';
}

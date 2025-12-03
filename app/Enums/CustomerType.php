<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static RESIDENTIAL()
 * @method static static COMMERCIAL()
 * @method static static POWER()
 * @method static static CITY_OFFICES()
 * @method static static CITY_STREETLIGHTS()
 * @method static static OTHER_GOVERNMENT()
 */
final class CustomerType extends Enum
{
    const RESIDENTIAL = 'residential';
    const COMMERCIAL = 'commercial';
    const POWER = 'power';
    const CITY_OFFICES = 'city_offices';
    const CITY_STREETLIGHTS = 'city_streetlights';
    const OTHER_GOVERNMENT = 'other_government';
}

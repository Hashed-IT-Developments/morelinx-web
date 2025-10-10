<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;
/**
 * @method static static RESIDENTIAL()
 * @method static static COMMERCIAL()
 * @method static static GOVERNMENT()
 * @method static static STREETLIGHT()
 */
final class RolesEnum extends Enum
{
    const SUPERADMIN = 'superadmin';
    const ADMIN = 'admin';
    const USER = 'user';
    const INSPECTOR = 'inspector';
}

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
    const CCD_STAFF = 'ccd staff';
    const CCD_SUPERVISOR = 'ccd supervisor';
    const NDOG_SUPERVISOR = 'ndog supervisor';
    const TREASURY_STAFF = 'treasury staff';

}

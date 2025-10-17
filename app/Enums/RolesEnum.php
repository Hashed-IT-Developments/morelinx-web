<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;
/**
 * @method static static SUPERADMIN()
 * @method static static ADMIN()
 * @method static static USER()
 * @method static static INSPECTOR()
 * @method static static CCD_STAFF()
 * @method static static CCD_SUPERVISOR()
 * @method static static NDOG_SUPERVISOR()
 * @method static static TREASURY_STAFF()
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

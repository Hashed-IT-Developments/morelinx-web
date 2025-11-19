<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static IN_PROCESS()
 * @method static static FOR_CCD_APPROVAL()
 * @method static static FOR_INSPECTION()
 * @method static static VERIFIED()
 * @method static static FOR_COLLECTION()
 * @method static static FOR_SIGNING()
 * @method static static FOR_INSTALLATION_APPROVAL()
 * @method static static ACTIVE()
 */
final class AccountStatusEnum extends Enum
{

    const PENDING = 'pending';
   
    const ACTIVE = 'active';

    const SUSPENDED = 'suspended';

}

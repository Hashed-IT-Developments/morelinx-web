<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static IN_PROCESS()
 * @method static static FOR_CCD_APPROVAL()
 * @method static static FOR_INSPECTION()
 * @method static static FOR_VERIFICATION()
 * @method static static FOR_COLLECTION()
 * @method static static FOR_SIGNING()
 * @method static static FOR_INSTALLATION_APPROVAL()
 * @method static static ACTIVE()
 */
final class ApplicationStatusEnum extends Enum
{

    const PENDING = 'pending';
    const IN_PROCESS = 'in_process';
    const FOR_CCD_APPROVAL = 'for_ccd_approval';
    const FOR_INSPECTION = 'for_inspection';
    const COMPLETED = 'completed';
    const FOR_VERIFICATION = 'for_verification';
    const FOR_COLLECTION = 'for_collection';
    const FOR_SIGNING = 'for_signing';
    const FOR_INSTALLATION_APPROVAL = 'for_installation_approval';
    const FOR_INSTALLATION = 'for_installation';
    const CANCELLED = 'cancelled';
    const ISNAP_PENDING = 'isnap_pending';
    const ISNAP_FOR_COLLECTION = 'isnap_for_collection';
    const TRASH = 'trash';
}
